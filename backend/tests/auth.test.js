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
  await mongoose.connect(process.env.MONGODB_URI);

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