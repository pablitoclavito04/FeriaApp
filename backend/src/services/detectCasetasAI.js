const fs = require('fs');
const path = require('path');
const Anthropic = require('@anthropic-ai/sdk');

// Vision-based caseta detection: Claude looks at ANY fair map and returns each
// booth with a number and an approximate position. Positions are approximate
// (the admin fine-tunes them by dragging in the review map), and it adapts to
// any map — not tied to a specific fair plan.

const MODEL = 'claude-opus-4-8';
const DETECT_TIMEOUT_MS = Number(process.env.AI_DETECT_TIMEOUT_MS) || 180000;

// Read image width/height from the file header — no image library needed.
// Supports PNG and JPEG (the formats multer accepts here).
const readImageSize = (buf) => {
  // PNG: 8-byte signature, then IHDR with width/height as big-endian uint32.
  if (buf.length >= 24 && buf.toString('ascii', 1, 4) === 'PNG') {
    return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
  }
  // JPEG: scan for a Start-Of-Frame marker (0xFFC0..0xFFCF, excluding C4/C8/CC).
  if (buf.length >= 2 && buf[0] === 0xff && buf[1] === 0xd8) {
    let offset = 2;
    while (offset < buf.length) {
      if (buf[offset] !== 0xff) {
        offset += 1;
        continue;
      }
      const marker = buf[offset + 1];
      if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
        return { height: buf.readUInt16BE(offset + 5), width: buf.readUInt16BE(offset + 7) };
      }
      const segmentLength = buf.readUInt16BE(offset + 2);
      offset += 2 + segmentLength;
    }
  }
  return null;
};

const mediaTypeFor = (ext) => {
  const e = ext.toLowerCase();
  if (e === '.png') return 'image/png';
  if (e === '.jpg' || e === '.jpeg') return 'image/jpeg';
  if (e === '.webp') return 'image/webp';
  return 'image/png';
};

const SYSTEM_PROMPT =
  'You are a precise computer-vision assistant that analyzes fair (feria) maps. ' +
  'A fair map shows numbered booths ("casetas"), usually drawn as small rectangles ' +
  'arranged in rows along streets. Your job is to locate every booth and read its number. ' +
  'Report positions as RELATIVE coordinates in the range 0 to 1, where rx=0 is the left edge, ' +
  'rx=1 the right edge, ry=0 the top edge and ry=1 the bottom edge of the image. ' +
  'Place each point at the visual center of the booth. If you cannot read a number, set it to null ' +
  'but still report the position. Be thorough: report every booth you can see.';

const OUTPUT_SCHEMA = {
  type: 'object',
  properties: {
    casetas: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          number: { type: ['integer', 'null'], description: 'The booth number, or null if unreadable' },
          rx: { type: 'number', description: 'Relative X position, 0 (left) to 1 (right)' },
          ry: { type: 'number', description: 'Relative Y position, 0 (top) to 1 (bottom)' },
          confidence: { type: 'number', description: 'Confidence 0 to 1 in the number reading' },
        },
        required: ['number', 'rx', 'ry', 'confidence'],
        additionalProperties: false,
      },
    },
  },
  required: ['casetas'],
  additionalProperties: false,
};

/**
 * Run AI vision detection on a fair map image.
 * @param {string} imageAbsPath Absolute path to the uploaded map image.
 * @returns {Promise<{width:number, height:number, casetas:Array}>}
 * Rejects with an Error whose `.code` is AI_NO_KEY | AI_TIMEOUT | AI_FAILED.
 */
const runAIDetection = async (imageAbsPath) => {
  if (!process.env.ANTHROPIC_API_KEY) {
    const e = new Error('ANTHROPIC_API_KEY is not configured');
    e.code = 'AI_NO_KEY';
    throw e;
  }

  const buf = fs.readFileSync(imageAbsPath);
  const size = readImageSize(buf);
  // Fall back to the published map size if the header can't be parsed; the
  // frontend renders markers on the same image, so relative coords still align.
  const width = size?.width || 1514;
  const height = size?.height || 1052;

  const client = new Anthropic();

  let response;
  try {
    response = await client.messages.create(
      {
        model: MODEL,
        max_tokens: 16000,
        system: [
          { type: 'text', text: SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } },
        ],
        output_config: { format: { type: 'json_schema', schema: OUTPUT_SCHEMA } },
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: mediaTypeFor(path.extname(imageAbsPath)),
                  data: buf.toString('base64'),
                },
              },
              {
                type: 'text',
                text: 'Detect every caseta (booth) on this fair map. Return its number and relative position.',
              },
            ],
          },
        ],
      },
      { timeout: DETECT_TIMEOUT_MS }
    );
  } catch (err) {
    if (err instanceof Anthropic.APITimeoutError) {
      const e = new Error('AI detection timed out');
      e.code = 'AI_TIMEOUT';
      throw e;
    }
    const e = new Error(`AI detection failed: ${err.message}`);
    e.code = 'AI_FAILED';
    throw e;
  }

  // output_config.format guarantees the first text block is valid JSON.
  const textBlock = response.content.find((b) => b.type === 'text');
  let parsed;
  try {
    parsed = JSON.parse(textBlock.text);
  } catch {
    const e = new Error('AI returned malformed output');
    e.code = 'AI_FAILED';
    throw e;
  }

  // Scale relative coords to pixels, then convert to the app's Leaflet
  // convention (same as detect.py): location.x = lat (vertical, flipped),
  // location.y = lng (horizontal).
  const casetas = (parsed.casetas || []).map((c) => {
    const px = Math.max(0, Math.min(1, c.rx)) * width;
    const py = Math.max(0, Math.min(1, c.ry)) * height;
    const number = typeof c.number === 'number' ? c.number : null;
    const confidence = typeof c.confidence === 'number' ? c.confidence : 0;
    return {
      number,
      confidence: Math.round(confidence * 1000) / 1000,
      location: { x: Math.round((height - py) * 10) / 10, y: Math.round(px * 10) / 10 },
      review: number == null || confidence < 0.7,
    };
  });

  return { width, height, casetas };
};

module.exports = { runAIDetection, readImageSize };
