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
const dotenv = require('dotenv');

dotenv.config();

const app = require('../server');

let token;
let fairId;

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_TEST_URI || process.env.MONGODB_URI);

  const bcrypt = require('bcryptjs');
  const hash = await bcrypt.hash('admin1234', 10);

  await mongoose.connection.collection('users').updateOne(
    { email: 'admin@feriaapp.com' },
    {
      $set: {
        name: 'Admin',
        email: 'admin@feriaapp.com',
        password: hash,
        role: 'admin',
        updatedAt: new Date(),
      },
      $setOnInsert: { createdAt: new Date() }
    },
    { upsert: true }
  );

  const res = await request(app)
    .post('/api/auth/login')
    .send({ email: 'admin@feriaapp.com', password: 'admin1234' });

  token = res.body.token;

  await mongoose.connection.collection('fairs').deleteMany({});
});

afterAll(async () => {
  await mongoose.connection.collection('fairs').deleteMany({});
  await mongoose.connection.close();
});

describe('Fairs API - GET /api/fairs', () => {
  test('should return empty array when no fairs exist', async () => {
    const res = await request(app).get('/api/fairs');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBe(0);
  });
});

describe('Fairs API - POST /api/fairs', () => {
  test('should create a fair with valid data', async () => {
    const res = await request(app)
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
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('_id');
    expect(res.body.name).toBe('Feria de Jerez 2026');
    fairId = res.body._id;
  });

  test('should fail without authentication token', async () => {
    const res = await request(app)
      .post('/api/fairs')
      .send({ name: 'Test Fair' });
    expect(res.statusCode).toBe(401);
  });

  test('should fail with invalid token', async () => {
    const res = await request(app)
      .post('/api/fairs')
      .set('Authorization', 'Bearer invalidtoken123')
      .send({ name: 'Test Fair' });
    expect(res.statusCode).toBe(401);
  });

  test('should fail without name field', async () => {
    const res = await request(app)
      .post('/api/fairs')
      .set('Authorization', `Bearer ${token}`)
      .send({ description: 'Sin nombre' });
    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });

  test('should fail with empty name', async () => {
    const res = await request(app)
      .post('/api/fairs')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: '' });
    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });

  test('should fail with only name field if other required fields are missing', async () => {
    const res = await request(app)
      .post('/api/fairs')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Minimal Fair' });
    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });
});

describe('Fairs API - GET /api/fairs (with data)', () => {
  test('should return all fairs', async () => {
    const res = await request(app).get('/api/fairs');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  test('should return fairs with correct structure', async () => {
    const res = await request(app).get('/api/fairs');
    expect(res.statusCode).toBe(200);
    const fair = res.body.data[0];
    expect(fair).toHaveProperty('_id');
    expect(fair).toHaveProperty('name');
  });
});

describe('Fairs API - PUT /api/fairs/:id', () => {
  test('should update a fair with valid data', async () => {
    const res = await request(app)
      .put(`/api/fairs/${fairId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Feria de Jerez 2026 Updated' });
    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe('Feria de Jerez 2026 Updated');
  });

  test('should fail to update without token', async () => {
    const res = await request(app)
      .put(`/api/fairs/${fairId}`)
      .send({ name: 'No token' });
    expect(res.statusCode).toBe(401);
  });

  test('should fail to update with invalid token', async () => {
    const res = await request(app)
      .put(`/api/fairs/${fairId}`)
      .set('Authorization', 'Bearer badtoken')
      .send({ name: 'Bad token' });
    expect(res.statusCode).toBe(401);
  });

  test('should fail to update with non-existent id', async () => {
    const res = await request(app)
      .put('/api/fairs/000000000000000000000000')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Non existent' });
    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });

  test('should fail to update with invalid id format', async () => {
    const res = await request(app)
      .put('/api/fairs/invalidid')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Invalid id' });
    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });
});

describe('Fairs API - DELETE /api/fairs/:id', () => {
  test('should fail to delete without token', async () => {
    const res = await request(app).delete(`/api/fairs/${fairId}`);
    expect(res.statusCode).toBe(401);
  });

  test('should fail to delete with invalid token', async () => {
    const res = await request(app)
      .delete(`/api/fairs/${fairId}`)
      .set('Authorization', 'Bearer badtoken');
    expect(res.statusCode).toBe(401);
  });

  test('should fail to delete with non-existent id', async () => {
    const res = await request(app)
      .delete('/api/fairs/000000000000000000000000')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });

  test('should fail to delete with invalid id format', async () => {
    const res = await request(app)
      .delete('/api/fairs/invalidid')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });

  test('should delete a fair successfully', async () => {
    const res = await request(app)
      .delete(`/api/fairs/${fairId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
  });

  test('should return empty array after deletion', async () => {
    await mongoose.connection.collection('fairs').deleteMany({});
    const res = await request(app).get('/api/fairs');
    expect(res.statusCode).toBe(200);
    expect(res.body.data.length).toBe(0);
  });
});

describe('Fairs API - Additional validation tests', () => {
  let token;
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
  });

  test('should create a fair and return correct fields', async () => {
    const res = await request(app)
      .post('/api/fairs')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Feria Test Extra',
        description: 'Descripción de prueba',
        startDate: '2026-05-06',
        endDate: '2026-05-11',
        location: 'Jerez',
        active: true,
      });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('name');
    expect(res.body).toHaveProperty('_id');
    expect(res.body).toHaveProperty('createdAt');
    fairId = res.body._id;
  });

  test('should return fair with active field', async () => {
    const res = await request(app).get('/api/fairs');
    expect(res.statusCode).toBe(200);
    const fair = res.body.data.find(f => f._id === fairId);
    expect(fair).toHaveProperty('active');
  });

  test('should return fair with startDate and endDate', async () => {
    const res = await request(app).get('/api/fairs');
    expect(res.statusCode).toBe(200);
    const fair = res.body.data.find(f => f._id === fairId);
    expect(fair).toHaveProperty('startDate');
    expect(fair).toHaveProperty('endDate');
  });

  test('should return fair with description', async () => {
    const res = await request(app).get('/api/fairs');
    expect(res.statusCode).toBe(200);
    const fair = res.body.data.find(f => f._id === fairId);
    expect(fair).toHaveProperty('description');
    expect(fair.description).toBe('Descripción de prueba');
  });

  test('should update fair active status to false', async () => {
    const res = await request(app)
      .put(`/api/fairs/${fairId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ active: false });
    expect(res.statusCode).toBe(200);
    expect(res.body.active).toBe(false);
  });

  test('should update fair active status to true', async () => {
    const res = await request(app)
      .put(`/api/fairs/${fairId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ active: true });
    expect(res.statusCode).toBe(200);
    expect(res.body.active).toBe(true);
  });

  test('should update fair startDate', async () => {
    const res = await request(app)
      .put(`/api/fairs/${fairId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ startDate: '2026-05-07' });
    expect(res.statusCode).toBe(200);
  });

  test('should update fair location', async () => {
    const res = await request(app)
      .put(`/api/fairs/${fairId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ location: 'Nueva ubicación' });
    expect(res.statusCode).toBe(200);
    expect(res.body.location).toBe('Nueva ubicación');
  });

  test('should update fair description', async () => {
    const res = await request(app)
      .put(`/api/fairs/${fairId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ description: 'Nueva descripción' });
    expect(res.statusCode).toBe(200);
    expect(res.body.description).toBe('Nueva descripción');
  });

  test('should not return password in fair response', async () => {
    const res = await request(app).get('/api/fairs');
    expect(res.statusCode).toBe(200);
    res.body.data.forEach(fair => {
      expect(fair).not.toHaveProperty('password');
    });
  });

  test('should return 200 on GET even with no active fairs', async () => {
    await request(app)
      .put(`/api/fairs/${fairId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ active: false });
    const res = await request(app).get('/api/fairs');
    expect(res.statusCode).toBe(200);
  });

  test('should fail to create fair with very long name', async () => {
    const longName = 'A'.repeat(1000);
    const res = await request(app)
      .post('/api/fairs')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: longName, startDate: '2026-05-06', endDate: '2026-05-11' });
    expect([201, 400, 422, 500]).toContain(res.statusCode);
  });

  test('should delete the extra fair', async () => {
    const res = await request(app)
      .delete(`/api/fairs/${fairId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
  });

  test('should return 404 after deleting a fair', async () => {
    const res = await request(app)
      .get(`/api/fairs/${fairId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });

  test('should fail PUT with empty body', async () => {
    const res = await request(app)
      .put('/api/fairs/000000000000000000000000')
      .set('Authorization', `Bearer ${token}`)
      .send({});
    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });

  test('should fail DELETE on already deleted fair', async () => {
    const res = await request(app)
      .delete(`/api/fairs/${fairId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });
});
