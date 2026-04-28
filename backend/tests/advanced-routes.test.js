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
      $setOnInsert: { createdAt: new Date() }
    },
    { upsert: true }
  );

  const res = await request(app).post('/api/auth/login').send({ email: 'admin@feriaapp.com', password: 'admin1234' });
  token = res.body.token;

  await mongoose.connection.collection('fairs').deleteMany({ name: /^Advanced/ });
  await mongoose.connection.collection('casetas').deleteMany({ name: /^Advanced/ });
  await mongoose.connection.collection('menus').deleteMany({ name: /^Advanced/ });
  await mongoose.connection.collection('concerts').deleteMany({ artist: /^Advanced/ });

  const fairRes = await request(app).post('/api/fairs').set('Authorization', `Bearer ${token}`)
    .send({ name: 'Advanced Fair', description: 'Test', startDate: '2026-05-06', endDate: '2026-05-11', location: 'Jerez', active: true });
  fairId = fairRes.body._id;

  const casetaRes = await request(app).post('/api/casetas').set('Authorization', `Bearer ${token}`)
    .send({ name: 'Advanced Caseta', number: 88, fair: fairId });
  casetaId = casetaRes.body._id;

  const menuRes = await request(app).post('/api/menus').set('Authorization', `Bearer ${token}`)
    .send({ name: 'Advanced Menu', price: 8, caseta: casetaId });
  menuId = menuRes.body._id;

  const concertRes = await request(app).post('/api/concerts').set('Authorization', `Bearer ${token}`)
    .send({ artist: 'Advanced Artist', genre: 'Flamenco', date: '2026-05-10', time: '22:00', caseta: casetaId });
  concertId = concertRes.body._id;
});

afterAll(async () => {
  await mongoose.connection.collection('fairs').deleteMany({ name: /^Advanced/ });
  await mongoose.connection.collection('casetas').deleteMany({ name: /^Advanced/ });
  await mongoose.connection.collection('menus').deleteMany({ name: /^Advanced/ });
  await mongoose.connection.collection('concerts').deleteMany({ artist: /^Advanced/ });
  await mongoose.connection.close();
});

describe('Advanced Fair Routes', () => {
  test('GET /api/fairs/active returns 200', async () => {
    const res = await request(app).get('/api/fairs/active');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('GET /api/fairs/latest returns 200', async () => {
    const res = await request(app).get('/api/fairs/latest');
    expect(res.statusCode).toBe(200);
  });

  test('GET /api/fairs/range returns 200', async () => {
    const res = await request(app).get('/api/fairs/range?startDate=2026-01-01&endDate=2026-12-31');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('GET /api/fairs/count/status returns 200', async () => {
    const res = await request(app).get('/api/fairs/count/status');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('active');
    expect(res.body).toHaveProperty('inactive');
  });

  test('GET /api/fairs/sorted/enddate returns 200', async () => {
    const res = await request(app).get('/api/fairs/sorted/enddate');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('GET /api/fairs/search/:name returns 200', async () => {
    const res = await request(app).get('/api/fairs/search/Advanced');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('GET /api/fairs/:id/casetas returns 200', async () => {
    const res = await request(app).get(`/api/fairs/${fairId}/casetas`);
    expect(res.statusCode).toBe(200);
  });

  test('GET /api/fairs/:id/casetas/count returns 200', async () => {
    const res = await request(app).get(`/api/fairs/${fairId}/casetas/count`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('total');
  });

  test('GET /api/fairs/:id/casetas/withimage returns 200', async () => {
    const res = await request(app).get(`/api/fairs/${fairId}/casetas/withimage`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('GET /api/fairs/:id/casetas/search/:name returns 200', async () => {
    const res = await request(app).get(`/api/fairs/${fairId}/casetas/search/Advanced`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('GET /api/fairs/:id/menus returns 200', async () => {
    const res = await request(app).get(`/api/fairs/${fairId}/menus`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('GET /api/fairs/:id/concerts returns 200', async () => {
    const res = await request(app).get(`/api/fairs/${fairId}/concerts`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('GET /api/fairs/:id/stats returns 200', async () => {
    const res = await request(app).get(`/api/fairs/${fairId}/stats`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('totalCasetas');
  });

  test('GET /api/fairs/:id/full returns 200', async () => {
    const res = await request(app).get(`/api/fairs/${fairId}/full`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('casetas');
  });
});

describe('Advanced Caseta Routes', () => {
  test('GET /api/casetas/sorted/desc returns 200', async () => {
    const res = await request(app).get('/api/casetas/sorted/desc');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('GET /api/casetas/filter/withimage returns 200', async () => {
    const res = await request(app).get('/api/casetas/filter/withimage');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('GET /api/casetas/filter/noimage returns 200', async () => {
    const res = await request(app).get('/api/casetas/filter/noimage');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('GET /api/casetas/filter/highest returns 200', async () => {
    const res = await request(app).get('/api/casetas/filter/highest');
    expect(res.statusCode).toBe(200);
  });

  test('GET /api/casetas/filter/withlocation returns 200', async () => {
    const res = await request(app).get('/api/casetas/filter/withlocation');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('GET /api/casetas/count/byfair returns 200', async () => {
    const res = await request(app).get('/api/casetas/count/byfair');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('GET /api/casetas/search/:name returns 200', async () => {
    const res = await request(app).get('/api/casetas/search/Advanced');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('GET /api/casetas/:id/full returns 200', async () => {
    const res = await request(app).get(`/api/casetas/${casetaId}/full`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('menus');
    expect(res.body).toHaveProperty('concerts');
  });

  test('GET /api/casetas/:id/menus/cheapest returns 200', async () => {
    const res = await request(app).get(`/api/casetas/${casetaId}/menus/cheapest`);
    expect(res.statusCode).toBe(200);
  });

  test('GET /api/casetas/:id/menus/mostexpensive returns 200', async () => {
    const res = await request(app).get(`/api/casetas/${casetaId}/menus/mostexpensive`);
    expect(res.statusCode).toBe(200);
  });

  test('GET /api/casetas/:id/menus/sorted/price returns 200', async () => {
    const res = await request(app).get(`/api/casetas/${casetaId}/menus/sorted/price`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('GET /api/casetas/:id/menus/count returns 200', async () => {
    const res = await request(app).get(`/api/casetas/${casetaId}/menus/count`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('total');
  });

  test('GET /api/casetas/:id/concerts/upcoming returns 200', async () => {
    const res = await request(app).get(`/api/casetas/${casetaId}/concerts/upcoming`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('GET /api/casetas/:id/concerts/genre/:genre returns 200', async () => {
    const res = await request(app).get(`/api/casetas/${casetaId}/concerts/genre/Flamenco`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('GET /api/casetas/:id/concerts/sorted/desc returns 200', async () => {
    const res = await request(app).get(`/api/casetas/${casetaId}/concerts/sorted/desc`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('GET /api/casetas/:id/concerts/count returns 200', async () => {
    const res = await request(app).get(`/api/casetas/${casetaId}/concerts/count`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('total');
  });

  test('GET /api/casetas/:id/stats returns 200', async () => {
    const res = await request(app).get(`/api/casetas/${casetaId}/stats`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('totalMenus');
    expect(res.body).toHaveProperty('totalConcerts');
  });
});

describe('Advanced Menu Routes', () => {
  test('GET /api/menus/sorted/price returns 200', async () => {
    const res = await request(app).get('/api/menus/sorted/price');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('GET /api/menus/filter/price returns 200', async () => {
    const res = await request(app).get('/api/menus/filter/price?min=5&max=15');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('GET /api/menus/filter/mostexpensive returns 200', async () => {
    const res = await request(app).get('/api/menus/filter/mostexpensive');
    expect(res.statusCode).toBe(200);
  });

  test('GET /api/menus/filter/cheapest returns 200', async () => {
    const res = await request(app).get('/api/menus/filter/cheapest');
    expect(res.statusCode).toBe(200);
  });

  test('GET /api/menus/filter/nodescription returns 200', async () => {
    const res = await request(app).get('/api/menus/filter/nodescription');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('GET /api/menus/filter/full returns 200', async () => {
    const res = await request(app).get('/api/menus/filter/full');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('GET /api/menus/count/bycaseta returns 200', async () => {
    const res = await request(app).get('/api/menus/count/bycaseta');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('GET /api/menus/search/:name returns 200', async () => {
    const res = await request(app).get('/api/menus/search/Advanced');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('GET /api/menus/:id/caseta returns 200', async () => {
    const res = await request(app).get(`/api/menus/${menuId}/caseta`);
    expect(res.statusCode).toBe(200);
  });

  test('GET /api/menus/:id/similar returns 200', async () => {
    const res = await request(app).get(`/api/menus/${menuId}/similar`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('GET /api/menus/:id/caseta/concerts returns 200', async () => {
    const res = await request(app).get(`/api/menus/${menuId}/caseta/concerts`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

describe('Advanced Concert Routes', () => {
  test('GET /api/concerts/sorted/desc returns 200', async () => {
    const res = await request(app).get('/api/concerts/sorted/desc');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('GET /api/concerts/filter/daterange returns 200', async () => {
    const res = await request(app).get('/api/concerts/filter/daterange?startDate=2026-01-01&endDate=2026-12-31');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('GET /api/concerts/filter/upcoming returns 200', async () => {
    const res = await request(app).get('/api/concerts/filter/upcoming');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('GET /api/concerts/filter/nogenre returns 200', async () => {
    const res = await request(app).get('/api/concerts/filter/nogenre');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('GET /api/concerts/filter/full returns 200', async () => {
    const res = await request(app).get('/api/concerts/filter/full');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('GET /api/concerts/count/bycaseta returns 200', async () => {
    const res = await request(app).get('/api/concerts/count/bycaseta');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('GET /api/concerts/filter/genre/:genre returns 200', async () => {
    const res = await request(app).get('/api/concerts/filter/genre/Flamenco');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('GET /api/concerts/search/:artist returns 200', async () => {
    const res = await request(app).get('/api/concerts/search/Advanced');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('GET /api/concerts/:id/caseta returns 200', async () => {
    const res = await request(app).get(`/api/concerts/${concertId}/caseta`);
    expect(res.statusCode).toBe(200);
  });

  test('GET /api/concerts/:id/sameday returns 200', async () => {
    const res = await request(app).get(`/api/concerts/${concertId}/sameday`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('GET /api/concerts/:id/samegenre returns 200', async () => {
    const res = await request(app).get(`/api/concerts/${concertId}/samegenre`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('GET /api/concerts/:id/caseta/menus returns 200', async () => {
    const res = await request(app).get(`/api/concerts/${concertId}/caseta/menus`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

describe('Stats endpoint', () => {
  test('GET /api/stats returns 200', async () => {
    const res = await request(app).get('/api/stats');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('totals');
    expect(res.body).toHaveProperty('menusByCaseta');
    expect(res.body).toHaveProperty('concertsByCaseta');
  });
});
