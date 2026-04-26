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
});