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

jest.setTimeout(30000);

const request = require('supertest');
const connectTestDb = require('./testDb');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const app = require('../server');

let adminToken;
let editorToken;

const seedUser = async (email, role) => {
  const hash = await bcrypt.hash('test1234', 10);
  await mongoose.connection.collection('users').updateOne(
    { email },
    {
      $set: { name: role, email, password: hash, role, updatedAt: new Date() },
      $setOnInsert: { createdAt: new Date() },
    },
    { upsert: true }
  );
};

const login = async (email) => {
  const res = await request(app).post('/api/auth/login').send({ email, password: 'test1234' });
  return res.body.token;
};

beforeAll(async () => {
  await connectTestDb();
  await mongoose.connection.collection('users').deleteMany({ email: /-users@feriaapp\.com$/ });

  await seedUser('admin-users@feriaapp.com', 'admin');
  await seedUser('editor-users@feriaapp.com', 'editor');
  adminToken = await login('admin-users@feriaapp.com');
  editorToken = await login('editor-users@feriaapp.com');
});

afterAll(async () => {
  await mongoose.connection.collection('users').deleteMany({
    email: { $in: [/-users@feriaapp\.com$/, /^register-/] },
  });
  await mongoose.connection.close();
});

describe('POST /api/auth/register', () => {
  test('registers a new user as viewer', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'New Person', email: 'register-1@feriaapp.com', password: 'secret123' });

    expect(res.statusCode).toBe(201);
    expect(res.body.role).toBe('viewer');
    expect(res.body).toHaveProperty('token');
  });

  test('never grants admin even if role is sent in the body', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Sneaky', email: 'register-2@feriaapp.com', password: 'secret123', role: 'admin' });

    expect(res.statusCode).toBe(201);
    expect(res.body.role).toBe('viewer');
  });

  test('rejects a duplicate email', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ name: 'First', email: 'register-dup@feriaapp.com', password: 'secret123' });
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Second', email: 'register-dup@feriaapp.com', password: 'secret123' });

    expect(res.statusCode).toBe(409);
    expect(res.body.code).toBe('EMAIL_IN_USE');
  });

  test('validates input (short password)', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Bad', email: 'register-bad@feriaapp.com', password: '123' });

    expect(res.statusCode).toBe(422);
  });
});

describe('GET /api/users', () => {
  test('admin lists users and does NOT see their own account', async () => {
    const res = await request(app).get('/api/users').set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    const emails = res.body.map((u) => u.email);
    expect(emails).not.toContain('admin-users@feriaapp.com');
  });

  test('editor cannot list users (403)', async () => {
    const res = await request(app).get('/api/users').set('Authorization', `Bearer ${editorToken}`);
    expect(res.statusCode).toBe(403);
  });

  test('requires auth (401)', async () => {
    const res = await request(app).get('/api/users');
    expect(res.statusCode).toBe(401);
  });
});

describe('PUT /api/users/:id/role', () => {
  test('admin promotes a viewer to editor', async () => {
    const reg = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Promote Me', email: 'register-promote@feriaapp.com', password: 'secret123' });
    const id = reg.body._id;

    const res = await request(app)
      .put(`/api/users/${id}/role`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ role: 'editor' });

    expect(res.statusCode).toBe(200);
    expect(res.body.role).toBe('editor');
  });

  test('rejects an invalid role (422)', async () => {
    const reg = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Bad Role', email: 'register-badrole@feriaapp.com', password: 'secret123' });

    const res = await request(app)
      .put(`/api/users/${reg.body._id}/role`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ role: 'superuser' });

    expect(res.statusCode).toBe(422);
  });

  test('admin cannot change their own role (403)', async () => {
    const me = await mongoose.connection.collection('users').findOne({ email: 'admin-users@feriaapp.com' });
    const res = await request(app)
      .put(`/api/users/${me._id}/role`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ role: 'viewer' });

    expect(res.statusCode).toBe(403);
  });

  test('editor cannot change roles (403)', async () => {
    const reg = await request(app)
      .post('/api/auth/register')
      .send({ name: 'X', email: 'register-x@feriaapp.com', password: 'secret123' });
    const res = await request(app)
      .put(`/api/users/${reg.body._id}/role`)
      .set('Authorization', `Bearer ${editorToken}`)
      .send({ role: 'admin' });

    expect(res.statusCode).toBe(403);
  });
});

describe('DELETE /api/users/:id', () => {
  test('admin deletes a user', async () => {
    const reg = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Delete Me', email: 'register-delete@feriaapp.com', password: 'secret123' });

    const res = await request(app)
      .delete(`/api/users/${reg.body._id}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(204);
  });

  test('admin cannot delete their own account (403)', async () => {
    const me = await mongoose.connection.collection('users').findOne({ email: 'admin-users@feriaapp.com' });
    const res = await request(app)
      .delete(`/api/users/${me._id}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(403);
  });
});
