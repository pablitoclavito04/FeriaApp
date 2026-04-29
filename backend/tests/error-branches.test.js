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
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const app = require('../server');

let token;
let fairId;
let casetaId;
let menuId;
let concertId;

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_TEST_URI || process.env.MONGODB_URI);

  const hash = await bcrypt.hash('admin1234', 10);
  await mongoose.connection.collection('users').updateOne(
    { email: 'admin@feriaapp.com' },
    {
      $set: { name: 'Admin', email: 'admin@feriaapp.com', password: hash, role: 'admin', updatedAt: new Date() },
      $setOnInsert: { createdAt: new Date() },
    },
    { upsert: true }
  );

  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({ email: 'admin@feriaapp.com', password: 'admin1234' });
  token = loginRes.body.token;

  await mongoose.connection.collection('fairs').deleteMany({ name: /^ErrBranch/ });
  await mongoose.connection.collection('casetas').deleteMany({ name: /^ErrBranch/ });
  await mongoose.connection.collection('menus').deleteMany({ name: /^ErrBranch/ });
  await mongoose.connection.collection('concerts').deleteMany({ artist: /^ErrBranch/ });

  const fairRes = await request(app)
    .post('/api/fairs')
    .set('Authorization', `Bearer ${token}`)
    .send({
      name: 'ErrBranch Fair',
      description: 'Fixture for error branches',
      startDate: '2026-05-06',
      endDate: '2026-05-11',
      location: 'Jerez',
      active: true,
    });
  fairId = fairRes.body._id;

  const casetaRes = await request(app)
    .post('/api/casetas')
    .set('Authorization', `Bearer ${token}`)
    .send({ name: 'ErrBranch Caseta', number: 1, fair: fairId });
  casetaId = casetaRes.body._id;

  const menuRes = await request(app)
    .post('/api/menus')
    .set('Authorization', `Bearer ${token}`)
    .send({ name: 'ErrBranch Dish', price: 10, caseta: casetaId });
  menuId = menuRes.body._id;

  const concertRes = await request(app)
    .post('/api/concerts')
    .set('Authorization', `Bearer ${token}`)
    .send({ artist: 'ErrBranch Artist', date: '2026-05-10', time: '22:00', caseta: casetaId });
  concertId = concertRes.body._id;
});

afterAll(async () => {
  await mongoose.connection.collection('fairs').deleteMany({ name: /^ErrBranch/ });
  await mongoose.connection.collection('casetas').deleteMany({ name: /^ErrBranch/ });
  await mongoose.connection.collection('menus').deleteMany({ name: /^ErrBranch/ });
  await mongoose.connection.collection('concerts').deleteMany({ artist: /^ErrBranch/ });
  await mongoose.connection.close();
});

// CastError → 400 INVALID_ID
describe('CastError handling - invalid Mongo ObjectId returns 400', () => {
  test('GET /api/fairs/invalidid returns 400', async () => {
    const res = await request(app).get('/api/fairs/invalidid');
    expect(res.statusCode).toBe(400);
    expect(res.body.code).toBe('INVALID_ID');
  });

  test('GET /api/casetas/invalidid returns 400', async () => {
    const res = await request(app).get('/api/casetas/invalidid');
    expect(res.statusCode).toBe(400);
    expect(res.body.code).toBe('INVALID_ID');
  });

  test('GET /api/menus/caseta/invalidid returns 400', async () => {
    const res = await request(app).get('/api/menus/caseta/invalidid');
    expect(res.statusCode).toBe(400);
    expect(res.body.code).toBe('INVALID_ID');
  });

  test('PUT /api/fairs/invalidid returns 400', async () => {
    const res = await request(app)
      .put('/api/fairs/invalidid')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Valid Name' });
    expect(res.statusCode).toBe(400);
    expect(res.body.code).toBe('INVALID_ID');
  });

  test('PUT /api/casetas/invalidid returns 400', async () => {
    const res = await request(app)
      .put('/api/casetas/invalidid')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Valid Name' });
    expect(res.statusCode).toBe(400);
    expect(res.body.code).toBe('INVALID_ID');
  });

  test('PUT /api/menus/invalidid returns 400', async () => {
    const res = await request(app)
      .put('/api/menus/invalidid')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Valid Name' });
    expect(res.statusCode).toBe(400);
    expect(res.body.code).toBe('INVALID_ID');
  });

  test('PUT /api/concerts/invalidid returns 400', async () => {
    const res = await request(app)
      .put('/api/concerts/invalidid')
      .set('Authorization', `Bearer ${token}`)
      .send({ artist: 'Valid Artist' });
    expect(res.statusCode).toBe(400);
    expect(res.body.code).toBe('INVALID_ID');
  });

  test('DELETE /api/fairs/invalidid returns 400', async () => {
    const res = await request(app)
      .delete('/api/fairs/invalidid')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(400);
    expect(res.body.code).toBe('INVALID_ID');
  });

  test('DELETE /api/casetas/invalidid returns 400', async () => {
    const res = await request(app)
      .delete('/api/casetas/invalidid')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(400);
    expect(res.body.code).toBe('INVALID_ID');
  });

  test('DELETE /api/menus/invalidid returns 400', async () => {
    const res = await request(app)
      .delete('/api/menus/invalidid')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(400);
    expect(res.body.code).toBe('INVALID_ID');
  });

  test('DELETE /api/concerts/invalidid returns 400', async () => {
    const res = await request(app)
      .delete('/api/concerts/invalidid')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(400);
    expect(res.body.code).toBe('INVALID_ID');
  });

  test('GET /api/casetas/invalidid/full returns 400', async () => {
    const res = await request(app).get('/api/casetas/invalidid/full');
    expect(res.statusCode).toBe(400);
    expect(res.body.code).toBe('INVALID_ID');
  });

  test('GET /api/menus/invalidid/caseta returns 400', async () => {
    const res = await request(app).get('/api/menus/invalidid/caseta');
    expect(res.statusCode).toBe(400);
    expect(res.body.code).toBe('INVALID_ID');
  });

  test('GET /api/concerts/invalidid/caseta returns 400', async () => {
    const res = await request(app).get('/api/concerts/invalidid/caseta');
    expect(res.statusCode).toBe(400);
    expect(res.body.code).toBe('INVALID_ID');
  });

  test('GET /api/fairs/invalidid/full returns 400', async () => {
    const res = await request(app).get('/api/fairs/invalidid/full');
    expect(res.statusCode).toBe(400);
    expect(res.body.code).toBe('INVALID_ID');
  });
});

// 404 on valid-but-nonexistent ObjectId for routes that explicitly check
describe('404 handling - valid ObjectId but resource does not exist', () => {
  const fakeId = '000000000000000000000000';

  test('GET /api/fairs/:id returns 404 for nonexistent', async () => {
    const res = await request(app).get(`/api/fairs/${fakeId}`);
    expect(res.statusCode).toBe(404);
    expect(res.body.code).toBe('FAIR_NOT_FOUND');
  });

  test('GET /api/casetas/:id returns 404 for nonexistent', async () => {
    const res = await request(app).get(`/api/casetas/${fakeId}`);
    expect(res.statusCode).toBe(404);
    expect(res.body.code).toBe('CASETA_NOT_FOUND');
  });

  test('GET /api/fairs/:id/casetas returns 404 for nonexistent fair', async () => {
    const res = await request(app).get(`/api/fairs/${fakeId}/casetas`);
    expect(res.statusCode).toBe(404);
    expect(res.body.code).toBe('FAIR_NOT_FOUND');
  });

  test('GET /api/fairs/:id/full returns 404 for nonexistent fair', async () => {
    const res = await request(app).get(`/api/fairs/${fakeId}/full`);
    expect(res.statusCode).toBe(404);
    expect(res.body.code).toBe('FAIR_NOT_FOUND');
  });

  test('GET /api/fairs/:id/stats returns 404 for nonexistent fair', async () => {
    const res = await request(app).get(`/api/fairs/${fakeId}/stats`);
    expect(res.statusCode).toBe(404);
    expect(res.body.code).toBe('FAIR_NOT_FOUND');
  });

  test('GET /api/casetas/:id/full returns 404 for nonexistent caseta', async () => {
    const res = await request(app).get(`/api/casetas/${fakeId}/full`);
    expect(res.statusCode).toBe(404);
    expect(res.body.code).toBe('CASETA_NOT_FOUND');
  });

  test('GET /api/casetas/:id/stats returns 404 for nonexistent caseta', async () => {
    const res = await request(app).get(`/api/casetas/${fakeId}/stats`);
    expect(res.statusCode).toBe(404);
    expect(res.body.code).toBe('CASETA_NOT_FOUND');
  });

  test('GET /api/menus/:id/caseta returns 404 for nonexistent menu', async () => {
    const res = await request(app).get(`/api/menus/${fakeId}/caseta`);
    expect(res.statusCode).toBe(404);
    expect(res.body.code).toBe('MENU_NOT_FOUND');
  });

  test('GET /api/menus/:id/similar returns 404 for nonexistent menu', async () => {
    const res = await request(app).get(`/api/menus/${fakeId}/similar`);
    expect(res.statusCode).toBe(404);
    expect(res.body.code).toBe('MENU_NOT_FOUND');
  });

  test('GET /api/menus/:id/caseta/concerts returns 404 for nonexistent menu', async () => {
    const res = await request(app).get(`/api/menus/${fakeId}/caseta/concerts`);
    expect(res.statusCode).toBe(404);
    expect(res.body.code).toBe('MENU_NOT_FOUND');
  });

  test('GET /api/concerts/:id/caseta returns 404 for nonexistent concert', async () => {
    const res = await request(app).get(`/api/concerts/${fakeId}/caseta`);
    expect(res.statusCode).toBe(404);
    expect(res.body.code).toBe('CONCERT_NOT_FOUND');
  });

  test('GET /api/concerts/:id/sameday returns 404 for nonexistent concert', async () => {
    const res = await request(app).get(`/api/concerts/${fakeId}/sameday`);
    expect(res.statusCode).toBe(404);
    expect(res.body.code).toBe('CONCERT_NOT_FOUND');
  });

  test('GET /api/concerts/:id/samegenre returns 404 for nonexistent concert', async () => {
    const res = await request(app).get(`/api/concerts/${fakeId}/samegenre`);
    expect(res.statusCode).toBe(404);
    expect(res.body.code).toBe('CONCERT_NOT_FOUND');
  });

  test('GET /api/concerts/:id/caseta/menus returns 404 for nonexistent concert', async () => {
    const res = await request(app).get(`/api/concerts/${fakeId}/caseta/menus`);
    expect(res.statusCode).toBe(404);
    expect(res.body.code).toBe('CONCERT_NOT_FOUND');
  });
});

// Special "latest"/"highest"/"cheapest"/"mostexpensive" with empty collection paths
describe('Empty collection edge cases', () => {
  test('GET /api/casetas/:id/menus/cheapest returns 404 when no menus', async () => {
    // Create an isolated caseta with no menus
    const isolatedFair = await request(app)
      .post('/api/fairs')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'ErrBranch Empty Fair',
        startDate: '2026-05-06',
        endDate: '2026-05-11',
      });
    const isolatedCaseta = await request(app)
      .post('/api/casetas')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'ErrBranch Empty Caseta', number: 999, fair: isolatedFair.body._id });

    const res = await request(app).get(`/api/casetas/${isolatedCaseta.body._id}/menus/cheapest`);
    expect(res.statusCode).toBe(404);
    expect(res.body.code).toBe('MENU_NOT_FOUND');
  });

  test('GET /api/casetas/:id/menus/mostexpensive returns 404 when no menus', async () => {
    const fair = await request(app)
      .post('/api/fairs')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'ErrBranch Empty Fair 2',
        startDate: '2026-05-06',
        endDate: '2026-05-11',
      });
    const caseta = await request(app)
      .post('/api/casetas')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'ErrBranch Empty Caseta 2', number: 998, fair: fair.body._id });

    const res = await request(app).get(`/api/casetas/${caseta.body._id}/menus/mostexpensive`);
    expect(res.statusCode).toBe(404);
    expect(res.body.code).toBe('MENU_NOT_FOUND');
  });
});
