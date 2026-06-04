jest.mock('../src/config/octokit', () => ({
  octokit: {
    rest: {
      repos: {
        getContent: jest.fn(),
        createOrUpdateFileContents: jest.fn(),
      },
    },
  },
}));

// Mock the AI detection service so tests never call the Anthropic API (no key,
// no cost).
jest.mock('../src/services/detectCasetasAI', () => ({
  runAIDetection: jest.fn(),
}));

jest.setTimeout(30000);

const request = require('supertest');
const connectTestDb = require('./testDb');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const app = require('../server');
const { runAIDetection } = require('../src/services/detectCasetasAI');

let token;
let fairId;

beforeAll(async () => {
  await connectTestDb();

  const hash = await bcrypt.hash('admin1234', 10);
  await mongoose.connection.collection('users').updateOne(
    { email: 'admin@feriaapp.com' },
    {
      $set: { name: 'Admin', email: 'admin@feriaapp.com', password: hash, role: 'admin', updatedAt: new Date() },
      $setOnInsert: { createdAt: new Date() },
    },
    { upsert: true }
  );

  const res = await request(app)
    .post('/api/auth/login')
    .send({ email: 'admin@feriaapp.com', password: 'admin1234' });
  token = res.body.token;

  await mongoose.connection.collection('casetas').deleteMany({});
  await mongoose.connection.collection('fairs').deleteMany({});

  const fairRes = await request(app)
    .post('/api/fairs')
    .set('Authorization', `Bearer ${token}`)
    .send({
      name: 'Feria de Jerez 2026',
      startDate: '2026-05-06',
      endDate: '2026-05-11',
      active: true,
    });
  fairId = fairRes.body._id;
});

afterEach(() => {
  jest.clearAllMocks();
});

afterAll(async () => {
  await mongoose.connection.collection('casetas').deleteMany({});
  await mongoose.connection.collection('fairs').deleteMany({});
  await mongoose.connection.close();
});

describe('POST /api/casetas/bulk', () => {
  test('imports casetas into the active fair (number defaults a name)', async () => {
    const res = await request(app)
      .post('/api/casetas/bulk')
      .set('Authorization', `Bearer ${token}`)
      .send({
        fair: fairId,
        mapImage: '/uploads/test-map.png',
        mapBounds: { width: 1514, height: 1052 },
        casetas: [
          { number: 1, location: { x: 10, y: 20 } },
          { number: 2, location: { x: 30, y: 40 } },
        ],
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.total).toBe(2);
    expect(res.body.created).toBe(2);

    // Fair now carries the map.
    const fair = await mongoose.connection.collection('fairs').findOne({ _id: new mongoose.Types.ObjectId(fairId) });
    expect(fair.mapImage).toBe('/uploads/test-map.png');
    expect(fair.mapBounds.width).toBe(1514);

    // Caseta got a default name.
    const c1 = await mongoose.connection.collection('casetas').findOne({ number: 1 });
    expect(c1.name).toBe('Caseta 1');
  });

  test('re-importing updates positions instead of duplicating', async () => {
    const res = await request(app)
      .post('/api/casetas/bulk')
      .set('Authorization', `Bearer ${token}`)
      .send({
        fair: fairId,
        casetas: [{ number: 1, location: { x: 99, y: 99 } }],
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.updated).toBe(1);

    const c1 = await mongoose.connection.collection('casetas').findOne({ number: 1 });
    expect(c1.location.x).toBe(99);
  });

  test('rejects duplicate numbers in the payload', async () => {
    const res = await request(app)
      .post('/api/casetas/bulk')
      .set('Authorization', `Bearer ${token}`)
      .send({
        fair: fairId,
        casetas: [
          { number: 5, location: { x: 1, y: 1 } },
          { number: 5, location: { x: 2, y: 2 } },
        ],
      });

    expect(res.statusCode).toBe(422);
    expect(res.body.code).toBe('VALIDATION_ERROR');
  });

  test('rejects empty caseta list (validator)', async () => {
    const res = await request(app)
      .post('/api/casetas/bulk')
      .set('Authorization', `Bearer ${token}`)
      .send({ fair: fairId, casetas: [] });

    expect(res.statusCode).toBe(422);
  });

  test('requires admin auth', async () => {
    const res = await request(app)
      .post('/api/casetas/bulk')
      .send({ casetas: [{ number: 1, location: { x: 1, y: 1 } }] });

    expect(res.statusCode).toBe(401);
  });
});

describe('POST /api/casetas/detect', () => {
  test('returns 400 when no image is attached', async () => {
    const res = await request(app)
      .post('/api/casetas/detect')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(400);
    expect(res.body.code).toBe('VALIDATION_ERROR');
  });

  test('returns detected casetas from the AI engine', async () => {
    runAIDetection.mockResolvedValue({
      width: 800,
      height: 600,
      casetas: [{ number: 5, confidence: 0.9, location: { x: 100, y: 200 }, review: false }],
    });

    const res = await request(app)
      .post('/api/casetas/detect')
      .set('Authorization', `Bearer ${token}`)
      .attach('image', Buffer.from('fake'), 'map.png');

    expect(res.statusCode).toBe(200);
    expect(res.body.imageSize).toEqual({ width: 800, height: 600 });
    expect(res.body.bounds).toEqual([[0, 0], [600, 800]]);
    expect(res.body.casetas.length).toBe(1);
  });

  test('maps AI_NO_KEY to 503', async () => {
    const err = new Error('no key');
    err.code = 'AI_NO_KEY';
    runAIDetection.mockRejectedValue(err);

    const res = await request(app)
      .post('/api/casetas/detect')
      .set('Authorization', `Bearer ${token}`)
      .attach('image', Buffer.from('fake'), 'map.png');

    expect(res.statusCode).toBe(503);
    expect(res.body.code).toBe('AI_NO_KEY');
  });

  test('maps AI_FAILED to 500', async () => {
    const err = new Error('api error');
    err.code = 'AI_FAILED';
    runAIDetection.mockRejectedValue(err);

    const res = await request(app)
      .post('/api/casetas/detect')
      .set('Authorization', `Bearer ${token}`)
      .attach('image', Buffer.from('fake'), 'map.png');

    expect(res.statusCode).toBe(500);
    expect(res.body.code).toBe('AI_FAILED');
  });
});
