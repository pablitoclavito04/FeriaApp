const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Cropping the published map to a region selected by the admin. The fair map
// uses the project's Leaflet CRS.Simple convention, where a caseta location is
// stored as { x, y } with:
//   x = imageHeight - pixelY   (vertical, flipped: 0 at the bottom)
//   y = pixelX                 (horizontal: 0 at the left)
// So to convert a stored location back to top-left pixel coordinates on an
// image of height H:
//   pixelX = location.y
//   pixelY = H - location.x
//
// When we crop to the rectangle [cropX, cropY, cropW, cropH] (top-left pixel
// origin), every kept caseta must be re-expressed against the new, smaller
// image of height cropH:
//   newPixelX = pixelX - cropX
//   newPixelY = pixelY - cropY
//   location.x = cropH - newPixelY
//   location.y = newPixelX
// Casetas whose center falls outside the crop rectangle are dropped.

/**
 * Recompute a caseta location for a crop region.
 * @param {{x:number,y:number}} location Stored location on the original image.
 * @param {number} originalHeight Height (px) of the original image.
 * @param {{x:number,y:number,width:number,height:number}} crop Crop rectangle in original pixels.
 * @returns {{x:number,y:number}|null} New location, or null if outside the crop.
 */
const remapLocation = (location, originalHeight, crop) => {
  const pixelX = location.y;
  const pixelY = originalHeight - location.x;
  const newPixelX = pixelX - crop.x;
  const newPixelY = pixelY - crop.y;
  if (newPixelX < 0 || newPixelY < 0 || newPixelX > crop.width || newPixelY > crop.height) {
    return null;
  }
  return {
    x: Math.round((crop.height - newPixelY) * 10) / 10,
    y: Math.round(newPixelX * 10) / 10,
  };
};

/**
 * Validate and clamp a crop rectangle to the image bounds. Returns null when
 * the rectangle is unusable (zero area or fully outside).
 */
const sanitizeCrop = (crop, imageWidth, imageHeight) => {
  if (!crop) return null;
  const x = Math.max(0, Math.round(crop.x));
  const y = Math.max(0, Math.round(crop.y));
  const right = Math.min(imageWidth, Math.round(crop.x + crop.width));
  const bottom = Math.min(imageHeight, Math.round(crop.y + crop.height));
  const width = right - x;
  const height = bottom - y;
  if (width <= 0 || height <= 0) return null;
  return { x, y, width, height };
};

/**
 * Crop the image file on disk to `crop` and write a new file next to it.
 * @returns {Promise<{filename:string, width:number, height:number}>}
 */
const cropImageFile = async (uploadsDir, filename, crop) => {
  const srcPath = path.join(uploadsDir, filename);
  const ext = path.extname(filename);
  const base = path.basename(filename, ext);
  const outName = `${base}-cropped${ext}`;
  const outPath = path.join(uploadsDir, outName);
  await sharp(srcPath)
    .extract({ left: crop.x, top: crop.y, width: crop.width, height: crop.height })
    .toFile(outPath);
  return { filename: outName, width: crop.width, height: crop.height };
};

module.exports = { remapLocation, sanitizeCrop, cropImageFile };
