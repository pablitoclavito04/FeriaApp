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

let editorToken;
let viewerToken;
let fairId;
let casetaId;
let menuId;
let concertId;

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
  const res = await request(app)
    .post('/api/auth/login')
    .send({ email, password: 'test1234' });
  return res.body.token;
};

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_TEST_URI || process.env.MONGODB_URI);

  // Seed admin and obtain token to set up fixture data
  await seedUser('admin-roles@feriaapp.com', 'admin');
  await seedUser('editor-roles@feriaapp.com', 'editor');
  await seedUser('viewer-roles@feriaapp.com', 'viewer');

  const adminToken = await login('admin-roles@feriaapp.com');
  editorToken = await login('editor-roles@feriaapp.com');
  viewerToken = await login('viewer-roles@feriaapp.com');

  await mongoose.connection.collection('fairs').deleteMany({ name: /^Roles Fixture/ });
  await mongoose.connection.collection('casetas').deleteMany({ name: /^Roles Fixture/ });
  await mongoose.connection.collection('menus').deleteMany({ name: /^Roles Fixture/ });
  await mongoose.connection.collection('concerts').deleteMany({ artist: /^Roles Fixture/ });

  const fairRes = await request(app)
    .post('/api/fairs')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      name: 'Roles Fixture Fair',
      description: 'Fixture',
      startDate: '2026-05-06',
      endDate: '2026-05-11',
      location: 'Jerez',
      active: true,
    });
  fairId = fairRes.body._id;

  const casetaRes = await request(app)
    .post('/api/casetas')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ name: 'Roles Fixture Caseta', number: 999, fair: fairId });
  casetaId = casetaRes.body._id;

  const menuRes = await request(app)
    .post('/api/menus')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ name: 'Roles Fixture Dish', price: 5, caseta: casetaId });
  menuId = menuRes.body._id;

  const concertRes = await request(app)
    .post('/api/concerts')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ artist: 'Roles Fixture Artist', date: '2026-05-10', time: '22:00', caseta: casetaId });
  concertId = concertRes.body._id;
});

afterAll(async () => {
  await mongoose.connection.collection('fairs').deleteMany({ name: /^Roles Fixture/ });
  await mongoose.connection.collection('casetas').deleteMany({ name: /^Roles Fixture/ });
  await mongoose.connection.collection('menus').deleteMany({ name: /^Roles Fixture/ });
  await mongoose.connection.collection('concerts').deleteMany({ artist: /^Roles Fixture/ });
  await mongoose.connection.collection('users').deleteMany({ email: /-roles@feriaapp\.com$/ });
  await mongoose.connection.close();
});

describe('Authorization - editor role is forbidden on write routes', () => {
  test('POST /api/fairs returns 403 for editor', async () => {
    const res = await request(app)
      .post('/api/fairs')
      .set('Authorization', `Bearer ${editorToken}`)
      .send({ name: 'X', startDate: '2026-05-06', endDate: '2026-05-11' });
    expect(res.statusCode).toBe(403);
    expect(res.body.code).toBe('FORBIDDEN');
  });

  test('PUT /api/fairs/:id returns 403 for editor', async () => {
    const res = await request(app)
      .put(`/api/fairs/${fairId}`)
      .set('Authorization', `Bearer ${editorToken}`)
      .send({ name: 'X' });
    expect(res.statusCode).toBe(403);
    expect(res.body.code).toBe('FORBIDDEN');
  });

  test('DELETE /api/fairs/:id returns 403 for editor', async () => {
    const res = await request(app)
      .delete(`/api/fairs/${fairId}`)
      .set('Authorization', `Bearer ${editorToken}`);
    expect(res.statusCode).toBe(403);
    expect(res.body.code).toBe('FORBIDDEN');
  });

  test('POST /api/casetas returns 403 for editor', async () => {
    const res = await request(app)
      .post('/api/casetas')
      .set('Authorization', `Bearer ${editorToken}`)
      .send({ name: 'X', number: 1, fair: fairId });
    expect(res.statusCode).toBe(403);
    expect(res.body.code).toBe('FORBIDDEN');
  });

  test('PUT /api/casetas/:id returns 403 for editor', async () => {
    const res = await request(app)
      .put(`/api/casetas/${casetaId}`)
      .set('Authorization', `Bearer ${editorToken}`)
      .send({ name: 'X' });
    expect(res.statusCode).toBe(403);
    expect(res.body.code).toBe('FORBIDDEN');
  });

  test('DELETE /api/casetas/:id returns 403 for editor', async () => {
    const res = await request(app)
      .delete(`/api/casetas/${casetaId}`)
      .set('Authorization', `Bearer ${editorToken}`);
    expect(res.statusCode).toBe(403);
    expect(res.body.code).toBe('FORBIDDEN');
  });

  test('POST /api/menus returns 403 for editor', async () => {
    const res = await request(app)
      .post('/api/menus')
      .set('Authorization', `Bearer ${editorToken}`)
      .send({ name: 'X', price: 5, caseta: casetaId });
    expect(res.statusCode).toBe(403);
    expect(res.body.code).toBe('FORBIDDEN');
  });

  test('POST /api/menus/bulk returns 403 for editor', async () => {
    const res = await request(app)
      .post('/api/menus/bulk')
      .set('Authorization', `Bearer ${editorToken}`)
      .send({ caseta: casetaId, items: [{ name: 'X', price: 5 }] });
    expect(res.statusCode).toBe(403);
    expect(res.body.code).toBe('FORBIDDEN');
  });

  test('PUT /api/menus/:id returns 403 for editor', async () => {
    const res = await request(app)
      .put(`/api/menus/${menuId}`)
      .set('Authorization', `Bearer ${editorToken}`)
      .send({ name: 'X' });
    expect(res.statusCode).toBe(403);
    expect(res.body.code).toBe('FORBIDDEN');
  });

  test('DELETE /api/menus/:id returns 403 for editor', async () => {
    const res = await request(app)
      .delete(`/api/menus/${menuId}`)
      .set('Authorization', `Bearer ${editorToken}`);
    expect(res.statusCode).toBe(403);
    expect(res.body.code).toBe('FORBIDDEN');
  });

  test('POST /api/concerts returns 403 for editor', async () => {
    const res = await request(app)
      .post('/api/concerts')
      .set('Authorization', `Bearer ${editorToken}`)
      .send({ artist: 'X', date: '2026-05-10', time: '22:00', caseta: casetaId });
    expect(res.statusCode).toBe(403);
    expect(res.body.code).toBe('FORBIDDEN');
  });

  test('PUT /api/concerts/:id returns 403 for editor', async () => {
    const res = await request(app)
      .put(`/api/concerts/${concertId}`)
      .set('Authorization', `Bearer ${editorToken}`)
      .send({ artist: 'X' });
    expect(res.statusCode).toBe(403);
    expect(res.body.code).toBe('FORBIDDEN');
  });

  test('DELETE /api/concerts/:id returns 403 for editor', async () => {
    const res = await request(app)
      .delete(`/api/concerts/${concertId}`)
      .set('Authorization', `Bearer ${editorToken}`);
    expect(res.statusCode).toBe(403);
    expect(res.body.code).toBe('FORBIDDEN');
  });

  test('POST /api/publish returns 403 for editor', async () => {
    const res = await request(app)
      .post('/api/publish')
      .set('Authorization', `Bearer ${editorToken}`);
    expect(res.statusCode).toBe(403);
    expect(res.body.code).toBe('FORBIDDEN');
  });
});

describe('Authorization - viewer role is forbidden on write routes', () => {
  test('POST /api/fairs returns 403 for viewer', async () => {
    const res = await request(app)
      .post('/api/fairs')
      .set('Authorization', `Bearer ${viewerToken}`)
      .send({ name: 'X', startDate: '2026-05-06', endDate: '2026-05-11' });
    expect(res.statusCode).toBe(403);
    expect(res.body.code).toBe('FORBIDDEN');
  });

  test('POST /api/casetas returns 403 for viewer', async () => {
    const res = await request(app)
      .post('/api/casetas')
      .set('Authorization', `Bearer ${viewerToken}`)
      .send({ name: 'X', number: 1, fair: fairId });
    expect(res.statusCode).toBe(403);
    expect(res.body.code).toBe('FORBIDDEN');
  });

  test('POST /api/menus returns 403 for viewer', async () => {
    const res = await request(app)
      .post('/api/menus')
      .set('Authorization', `Bearer ${viewerToken}`)
      .send({ name: 'X', price: 5, caseta: casetaId });
    expect(res.statusCode).toBe(403);
    expect(res.body.code).toBe('FORBIDDEN');
  });

  test('POST /api/concerts returns 403 for viewer', async () => {
    const res = await request(app)
      .post('/api/concerts')
      .set('Authorization', `Bearer ${viewerToken}`)
      .send({ artist: 'X', date: '2026-05-10', time: '22:00', caseta: casetaId });
    expect(res.statusCode).toBe(403);
    expect(res.body.code).toBe('FORBIDDEN');
  });

  test('POST /api/publish returns 403 for viewer', async () => {
    const res = await request(app)
      .post('/api/publish')
      .set('Authorization', `Bearer ${viewerToken}`);
    expect(res.statusCode).toBe(403);
    expect(res.body.code).toBe('FORBIDDEN');
  });
});

describe('Authorization - GET routes are accessible to all authenticated roles', () => {
  test('GET /api/fairs is accessible to editor', async () => {
    const res = await request(app)
      .get('/api/fairs')
      .set('Authorization', `Bearer ${editorToken}`);
    expect(res.statusCode).toBe(200);
  });

  test('GET /api/fairs is accessible to viewer', async () => {
    const res = await request(app)
      .get('/api/fairs')
      .set('Authorization', `Bearer ${viewerToken}`);
    expect(res.statusCode).toBe(200);
  });

  test('GET /api/casetas is accessible to viewer', async () => {
    const res = await request(app)
      .get('/api/casetas')
      .set('Authorization', `Bearer ${viewerToken}`);
    expect(res.statusCode).toBe(200);
  });

  test('GET /api/menus is accessible to viewer', async () => {
    const res = await request(app)
      .get('/api/menus')
      .set('Authorization', `Bearer ${viewerToken}`);
    expect(res.statusCode).toBe(200);
  });

  test('GET /api/concerts is accessible to viewer', async () => {
    const res = await request(app)
      .get('/api/concerts')
      .set('Authorization', `Bearer ${viewerToken}`);
    expect(res.statusCode).toBe(200);
  });
});
