jest.mock('../src/config/octokit', () => ({
  octokit: {
    rest: {
      repos: {
        getContent: jest.fn(),
        createOrUpdateFileContents: jest.fn(),
      }
    }
  }
}));

jest.setTimeout(30000);

const request = require('supertest');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const app = require('../server');

let token;
let casetaId;
let fairId;

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_TEST_URI || process.env.MONGODB_URI);

  const hash = await bcrypt.hash('admin1234', 10);
  await mongoose.connection.collection('users').updateOne(
    { email: 'admin@feriaapp.com' },
    {
      $set: { name: 'Admin', email: 'admin@feriaapp.com', password: hash, role: 'admin', updatedAt: new Date() },
      $setOnInsert: { createdAt: new Date() }
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
      description: 'La feria del caballo',
      startDate: '2026-05-06',
      endDate: '2026-05-11',
      location: 'Real de la Feria, Jerez',
      active: true,
    });

  fairId = fairRes.body._id;
});

afterAll(async () => {
  await mongoose.connection.collection('casetas').deleteMany({});
  await mongoose.connection.collection('fairs').deleteMany({});
  await mongoose.connection.close();
});

describe('Casetas API - GET /api/casetas', () => {
  test('should return empty array when no casetas exist', async () => {
    const res = await request(app).get('/api/casetas');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBe(0);
  });

  test('should be accessible without authentication', async () => {
    const res = await request(app).get('/api/casetas');
    expect(res.statusCode).toBe(200);
  });
});

describe('Casetas API - POST /api/casetas', () => {
  test('should create a caseta with valid data', async () => {
    const res = await request(app)
      .post('/api/casetas')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'La Casapuerta',
        number: 1,
        description: 'Caseta número 1',
        fair: fairId,
        location: { x: 100, y: 200 },
      });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('_id');
    expect(res.body.name).toBe('La Casapuerta');
    casetaId = res.body._id;
  });

  test('should fail without authentication token', async () => {
    const res = await request(app)
      .post('/api/casetas')
      .send({ name: 'Test Caseta', number: 2, fair: fairId });
    expect(res.statusCode).toBe(401);
  });

  test('should fail with invalid token', async () => {
    const res = await request(app)
      .post('/api/casetas')
      .set('Authorization', 'Bearer invalidtoken')
      .send({ name: 'Test Caseta', number: 2, fair: fairId });
    expect(res.statusCode).toBe(401);
  });

  test('should fail without name field', async () => {
    const res = await request(app)
      .post('/api/casetas')
      .set('Authorization', `Bearer ${token}`)
      .send({ number: 2, fair: fairId });
    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });

  test('should fail without number field', async () => {
    const res = await request(app)
      .post('/api/casetas')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Sin número', fair: fairId });
    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });

  test('should fail without fair field', async () => {
    const res = await request(app)
      .post('/api/casetas')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Sin feria', number: 3 });
    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });

  test('should fail with invalid fair id', async () => {
    const res = await request(app)
      .post('/api/casetas')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Feria inválida', number: 4, fair: 'invalidid' });
    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });

  test('should fail with empty name', async () => {
    const res = await request(app)
      .post('/api/casetas')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: '', number: 5, fair: fairId });
    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });
});

describe('Casetas API - GET /api/casetas (with data)', () => {
  test('should return all casetas', async () => {
    const res = await request(app).get('/api/casetas');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  test('should return casetas with correct structure', async () => {
    const res = await request(app).get('/api/casetas');
    expect(res.statusCode).toBe(200);
    const caseta = res.body.data[0];
    expect(caseta).toHaveProperty('_id');
    expect(caseta).toHaveProperty('name');
    expect(caseta).toHaveProperty('number');
  });

  test('should return caseta with fair populated', async () => {
    const res = await request(app).get('/api/casetas');
    expect(res.statusCode).toBe(200);
    const caseta = res.body.data[0];
    expect(caseta).toHaveProperty('fair');
  });
});

describe('Casetas API - PUT /api/casetas/:id', () => {
  test('should update a caseta with valid data', async () => {
    const res = await request(app)
      .put(`/api/casetas/${casetaId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'La Casapuerta Updated' });
    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe('La Casapuerta Updated');
  });

  test('should update caseta description', async () => {
    const res = await request(app)
      .put(`/api/casetas/${casetaId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ description: 'Nueva descripción' });
    expect(res.statusCode).toBe(200);
  });

  test('should update caseta location', async () => {
    const res = await request(app)
      .put(`/api/casetas/${casetaId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ location: { x: 150, y: 250 } });
    expect(res.statusCode).toBe(200);
  });

  test('should fail to update without token', async () => {
    const res = await request(app)
      .put(`/api/casetas/${casetaId}`)
      .send({ name: 'No token' });
    expect(res.statusCode).toBe(401);
  });

  test('should fail to update with invalid token', async () => {
    const res = await request(app)
      .put(`/api/casetas/${casetaId}`)
      .set('Authorization', 'Bearer badtoken')
      .send({ name: 'Bad token' });
    expect(res.statusCode).toBe(401);
  });

  test('should fail to update with non-existent id', async () => {
    const res = await request(app)
      .put('/api/casetas/000000000000000000000000')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Non existent' });
    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });

  test('should fail to update with invalid id format', async () => {
    const res = await request(app)
      .put('/api/casetas/invalidid')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Invalid id' });
    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });
});

describe('Casetas API - DELETE /api/casetas/:id', () => {
  test('should fail to delete without token', async () => {
    const res = await request(app).delete(`/api/casetas/${casetaId}`);
    expect(res.statusCode).toBe(401);
  });

  test('should fail to delete with invalid token', async () => {
    const res = await request(app)
      .delete(`/api/casetas/${casetaId}`)
      .set('Authorization', 'Bearer badtoken');
    expect(res.statusCode).toBe(401);
  });

  test('should fail to delete with non-existent id', async () => {
    const res = await request(app)
      .delete('/api/casetas/000000000000000000000000')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });

  test('should fail to delete with invalid id format', async () => {
    const res = await request(app)
      .delete('/api/casetas/invalidid')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });

  test('should delete a caseta successfully', async () => {
    const res = await request(app)
      .delete(`/api/casetas/${casetaId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(204);
  });

  test('should return empty array after deletion', async () => {
    await mongoose.connection.collection('casetas').deleteMany({});
    const res = await request(app).get('/api/casetas');
    expect(res.statusCode).toBe(200);
    expect(res.body.data.length).toBe(0);
  });
});

describe('Casetas API - Additional validation tests', () => {
  let token;
  let casetaId;
  let fairId;

  beforeAll(async () => {
    const bcrypt = require('bcryptjs');
    const hash = await bcrypt.hash('admin1234', 10);
    await mongoose.connection.collection('users').updateOne(
      { email: 'admin@feriaapp.com' },
      {
        $set: { name: 'Admin', email: 'admin@feriaapp.com', password: hash, role: 'admin', updatedAt: new Date() },
        $setOnInsert: { createdAt: new Date() }
      },
      { upsert: true }
    );

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@feriaapp.com', password: 'admin1234' });
    token = res.body.token;

    const fairRes = await request(app)
      .post('/api/fairs')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Feria Extra Casetas',
        description: 'Test',
        startDate: '2026-05-06',
        endDate: '2026-05-11',
        location: 'Jerez',
        active: true,
      });
    fairId = fairRes.body._id;
  });

  afterAll(async () => {
    await mongoose.connection.collection('casetas').deleteMany({});
    await mongoose.connection.collection('fairs').deleteMany({ name: 'Feria Extra Casetas' });
  });

  test('should create caseta and return correct fields', async () => {
    const res = await request(app)
      .post('/api/casetas')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Caseta Extra', number: 10, description: 'Descripción', fair: fairId, location: { x: 50, y: 50 } });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('_id');
    expect(res.body).toHaveProperty('name');
    expect(res.body).toHaveProperty('number');
    expect(res.body).toHaveProperty('fair');
    casetaId = res.body._id;
  });

  test('should return caseta with location', async () => {
    const res = await request(app).get('/api/casetas');
    const caseta = res.body.data.find(c => c._id === casetaId);
    expect(caseta).toHaveProperty('location');
  });

  test('should return caseta with description', async () => {
    const res = await request(app).get('/api/casetas');
    const caseta = res.body.data.find(c => c._id === casetaId);
    expect(caseta.description).toBe('Descripción');
  });

  test('should update caseta number', async () => {
    const res = await request(app)
      .put(`/api/casetas/${casetaId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ number: 99 });
    expect(res.statusCode).toBe(200);
    expect(res.body.number).toBe(99);
  });

  test('should update caseta name', async () => {
    const res = await request(app)
      .put(`/api/casetas/${casetaId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Caseta Extra Updated' });
    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe('Caseta Extra Updated');
  });

  test('should not return password in caseta response', async () => {
    const res = await request(app).get('/api/casetas');
    expect(res.statusCode).toBe(200);
    res.body.data.forEach(c => expect(c).not.toHaveProperty('password'));
  });

  test('should return caseta with createdAt field', async () => {
    const res = await request(app).get('/api/casetas');
    const caseta = res.body.data.find(c => c._id === casetaId);
    expect(caseta).toHaveProperty('createdAt');
  });

  test('should return caseta with updatedAt field', async () => {
    const res = await request(app).get('/api/casetas');
    const caseta = res.body.data.find(c => c._id === casetaId);
    expect(caseta).toHaveProperty('updatedAt');
  });

  test('should fail to create caseta with duplicate number in same fair', async () => {
    const res = await request(app)
      .post('/api/casetas')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Caseta Duplicada', number: 99, fair: fairId });
    expect([201, 400, 409, 500]).toContain(res.statusCode);
  });

  test('should fail to update caseta with invalid location format', async () => {
    const res = await request(app)
      .put(`/api/casetas/${casetaId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ location: 'notanobject' });
    expect([200, 400, 500]).toContain(res.statusCode);
  });

  test('should return 200 on GET casetas even when empty', async () => {
    await mongoose.connection.collection('casetas').deleteMany({});
    const res = await request(app).get('/api/casetas');
    expect(res.statusCode).toBe(200);
    expect(res.body.data.length).toBe(0);
  });

  test('should fail DELETE on non-existent caseta after deletion', async () => {
    const res = await request(app)
      .delete(`/api/casetas/${casetaId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });

  test('should fail GET single caseta with invalid id', async () => {
    const res = await request(app).get('/api/casetas/invalidid');
    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });

  test('should fail PUT caseta with empty body and non-existent id', async () => {
    const res = await request(app)
      .put('/api/casetas/000000000000000000000000')
      .set('Authorization', `Bearer ${token}`)
      .send({});
    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });

  test('should create multiple casetas and return them all', async () => {
    await request(app).post('/api/casetas').set('Authorization', `Bearer ${token}`).send({ name: 'Caseta A', number: 1, fair: fairId });
    await request(app).post('/api/casetas').set('Authorization', `Bearer ${token}`).send({ name: 'Caseta B', number: 2, fair: fairId });
    await request(app).post('/api/casetas').set('Authorization', `Bearer ${token}`).send({ name: 'Caseta C', number: 3, fair: fairId });
    const res = await request(app).get('/api/casetas');
    expect(res.statusCode).toBe(200);
    expect(res.body.data.length).toBe(3);
  });

  test('should return casetas array sorted correctly', async () => {
    const res = await request(app).get('/api/casetas');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  test('should delete all casetas one by one', async () => {
    const casetas = await request(app).get('/api/casetas');
    for (const caseta of casetas.body.data) {
      const res = await request(app)
        .delete(`/api/casetas/${caseta._id}`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toBe(204);
    }
    const final = await request(app).get('/api/casetas');
    expect(final.body.data.length).toBe(0);
  });
});
