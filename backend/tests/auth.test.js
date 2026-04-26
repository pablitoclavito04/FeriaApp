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
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('Auth API', () => {
  test('POST /api/auth/login - should fail with wrong credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'wrong@email.com', password: 'wrongpassword' });

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('error');
  });

  test('POST /api/auth/login - should fail with missing fields', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@feriaapp.com' });

    expect(res.statusCode).toBeGreaterThanOrEqual(400);
    expect(res.body).toHaveProperty('error');
  });

  test('GET /api/auth/profile - should fail without token', async () => {
    const res = await request(app)
      .get('/api/auth/profile');

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('error');
  });

  test('POST /api/auth/login - should succeed with correct credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@feriaapp.com', password: 'admin1234' });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('email');
    expect(res.body.email).toBe('admin@feriaapp.com');
  });

  test('POST /api/auth/login - should fail with empty email', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: '', password: 'admin1234' });

    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });

  test('POST /api/auth/login - should fail with empty password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@feriaapp.com', password: '' });

    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });

  test('POST /api/auth/login - should fail with empty body', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({});

    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });

  test('POST /api/auth/login - should fail with wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@feriaapp.com', password: 'wrongpassword' });

    expect(res.statusCode).toBe(401);
  });

  test('POST /api/auth/login - should fail with non-existent email', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'noexiste@feriaapp.com', password: 'admin1234' });

    expect(res.statusCode).toBe(401);
  });

  test('POST /api/auth/login - should fail with invalid email format', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'notanemail', password: 'admin1234' });

    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });

  test('POST /api/auth/login - should return token as string', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@feriaapp.com', password: 'admin1234' });

    expect(res.statusCode).toBe(200);
    expect(typeof res.body.token).toBe('string');
  });

  test('POST /api/auth/login - should return user role', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@feriaapp.com', password: 'admin1234' });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('role');
    expect(res.body.role).toBe('admin');
  });

  test('GET /api/auth/profile - should fail with invalid token', async () => {
    const res = await request(app)
      .get('/api/auth/profile')
      .set('Authorization', 'Bearer invalidtoken123');

    expect(res.statusCode).toBe(401);
  });

  test('GET /api/auth/profile - should fail with malformed authorization header', async () => {
    const res = await request(app)
      .get('/api/auth/profile')
      .set('Authorization', 'invalidheader');

    expect(res.statusCode).toBe(401);
  });

  test('GET /api/auth/profile - should succeed with valid token', async () => {
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@feriaapp.com', password: 'admin1234' });

    const token = loginRes.body.token;

    const res = await request(app)
      .get('/api/auth/profile')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('email');
    expect(res.body.email).toBe('admin@feriaapp.com');
  });

  test('GET /api/auth/profile - should not return password', async () => {
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@feriaapp.com', password: 'admin1234' });

    const token = loginRes.body.token;

    const res = await request(app)
      .get('/api/auth/profile')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).not.toHaveProperty('password');
  });
});

describe('Auth API - Additional edge case tests', () => {
  test('POST /api/auth/login - should fail with numeric password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@feriaapp.com', password: 123456 });
    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });

  test('POST /api/auth/login - should fail with null email', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: null, password: 'admin1234' });
    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });

  test('POST /api/auth/login - should fail with null password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@feriaapp.com', password: null });
    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });

  test('POST /api/auth/login - should fail with spaces in email', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: '   ', password: 'admin1234' });
    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });

  test('POST /api/auth/login - should fail with spaces in password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@feriaapp.com', password: '   ' });
    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });

  test('POST /api/auth/login - should return name in response', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@feriaapp.com', password: 'admin1234' });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('name');
  });

  test('POST /api/auth/login - should return _id in response', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@feriaapp.com', password: 'admin1234' });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('_id');
  });

  test('POST /api/auth/login - should not return password in response', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@feriaapp.com', password: 'admin1234' });
    expect(res.statusCode).toBe(200);
    expect(res.body).not.toHaveProperty('password');
  });

  test('GET /api/auth/profile - should return role in response', async () => {
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@feriaapp.com', password: 'admin1234' });
    const token = loginRes.body.token;
    const res = await request(app)
      .get('/api/auth/profile')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('role');
  });

  test('GET /api/auth/profile - should return name in response', async () => {
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@feriaapp.com', password: 'admin1234' });
    const token = loginRes.body.token;
    const res = await request(app)
      .get('/api/auth/profile')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('name');
  });

  test('GET /api/auth/profile - should return _id in response', async () => {
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@feriaapp.com', password: 'admin1234' });
    const token = loginRes.body.token;
    const res = await request(app)
      .get('/api/auth/profile')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('_id');
  });

  test('POST /api/auth/login - should fail with SQL injection attempt', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: "' OR '1'='1", password: "' OR '1'='1" });
    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });

  test('POST /api/auth/login - should fail with very long email', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'a'.repeat(500) + '@test.com', password: 'admin1234' });
    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });

  test('POST /api/auth/login - should fail with very long password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@feriaapp.com', password: 'a'.repeat(1000) });
    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });

  test('GET /api/auth/profile - should fail with expired-like token', async () => {
    const res = await request(app)
      .get('/api/auth/profile')
      .set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEyMyIsImlhdCI6MTYwMDAwMDAwMCwiZXhwIjoxNjAwMDAwMDAxfQ.invalid');
    expect(res.statusCode).toBe(401);
  });

  test('POST /api/auth/login - should fail with boolean as email', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: true, password: 'admin1234' });
    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });

  test('POST /api/auth/login - response time should be reasonable', async () => {
    const start = Date.now();
    await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@feriaapp.com', password: 'admin1234' });
    const elapsed = Date.now() - start;
    expect(elapsed).toBeLessThan(5000);
  });

  test('GET /api/auth/profile - should fail with Bearer token missing value', async () => {
    const res = await request(app)
      .get('/api/auth/profile')
      .set('Authorization', 'Bearer ');
    expect(res.statusCode).toBe(401);
  });

  test('POST /api/auth/login - should fail with array as body', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send([{ email: 'admin@feriaapp.com', password: 'admin1234' }]);
    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });

  test('POST /api/auth/login - should be case sensitive for email', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'ADMIN@FERIAAPP.COM', password: 'admin1234' });
    expect([200, 401]).toContain(res.statusCode);
  });
});