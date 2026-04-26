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
let concertId;
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

  await mongoose.connection.collection('concerts').deleteMany({});
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

  const casetaRes = await request(app)
    .post('/api/casetas')
    .set('Authorization', `Bearer ${token}`)
    .send({
      name: 'La Casapuerta',
      number: 1,
      description: 'Caseta número 1',
      fair: fairId,
      location: { x: 100, y: 200 },
    });

  casetaId = casetaRes.body._id;
});

afterAll(async () => {
  await mongoose.connection.collection('concerts').deleteMany({});
  await mongoose.connection.collection('casetas').deleteMany({});
  await mongoose.connection.collection('fairs').deleteMany({});
  await mongoose.connection.close();
});

describe('Concerts API - GET /api/concerts', () => {
  test('should return empty array when no concerts exist', async () => {
    const res = await request(app).get('/api/concerts');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(0);
  });

  test('should be accessible without authentication', async () => {
    const res = await request(app).get('/api/concerts');
    expect(res.statusCode).toBe(200);
  });
});

describe('Concerts API - POST /api/concerts', () => {
  test('should create a concert with valid data', async () => {
    const res = await request(app)
      .post('/api/concerts')
      .set('Authorization', `Bearer ${token}`)
      .send({
        artist: 'Manuel de los Santos',
        genre: 'Flamenco',
        date: '2026-05-10',
        time: '22:00',
        caseta: casetaId,
      });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('_id');
    expect(res.body.artist).toBe('Manuel de los Santos');
    concertId = res.body._id;
  });

  test('should create a concert without genre', async () => {
    const res = await request(app)
      .post('/api/concerts')
      .set('Authorization', `Bearer ${token}`)
      .send({
        artist: 'Diego Carrasco',
        date: '2026-05-11',
        time: '23:00',
        caseta: casetaId,
      });
    expect(res.statusCode).toBe(201);
    expect(res.body.artist).toBe('Diego Carrasco');
  });

  test('should fail without authentication token', async () => {
    const res = await request(app)
      .post('/api/concerts')
      .send({ artist: 'Test Artist', date: '2026-05-10', time: '22:00', caseta: casetaId });
    expect(res.statusCode).toBe(401);
  });

  test('should fail with invalid token', async () => {
    const res = await request(app)
      .post('/api/concerts')
      .set('Authorization', 'Bearer invalidtoken')
      .send({ artist: 'Test Artist', date: '2026-05-10', time: '22:00', caseta: casetaId });
    expect(res.statusCode).toBe(401);
  });

  test('should fail without artist field', async () => {
    const res = await request(app)
      .post('/api/concerts')
      .set('Authorization', `Bearer ${token}`)
      .send({ date: '2026-05-10', time: '22:00', caseta: casetaId });
    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });

  test('should fail without date field', async () => {
    const res = await request(app)
      .post('/api/concerts')
      .set('Authorization', `Bearer ${token}`)
      .send({ artist: 'Test Artist', time: '22:00', caseta: casetaId });
    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });

  test('should fail without time field', async () => {
    const res = await request(app)
      .post('/api/concerts')
      .set('Authorization', `Bearer ${token}`)
      .send({ artist: 'Test Artist', date: '2026-05-10', caseta: casetaId });
    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });

  test('should fail without caseta field', async () => {
    const res = await request(app)
      .post('/api/concerts')
      .set('Authorization', `Bearer ${token}`)
      .send({ artist: 'Test Artist', date: '2026-05-10', time: '22:00' });
    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });

  test('should fail with empty artist', async () => {
    const res = await request(app)
      .post('/api/concerts')
      .set('Authorization', `Bearer ${token}`)
      .send({ artist: '', date: '2026-05-10', time: '22:00', caseta: casetaId });
    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });

  test('should fail with invalid caseta id', async () => {
    const res = await request(app)
      .post('/api/concerts')
      .set('Authorization', `Bearer ${token}`)
      .send({ artist: 'Test Artist', date: '2026-05-10', time: '22:00', caseta: 'invalidid' });
    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });

  test('should fail with invalid date format', async () => {
    const res = await request(app)
      .post('/api/concerts')
      .set('Authorization', `Bearer ${token}`)
      .send({ artist: 'Test Artist', date: 'notadate', time: '22:00', caseta: casetaId });
    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });
});

describe('Concerts API - GET /api/concerts (with data)', () => {
  test('should return all concerts', async () => {
    const res = await request(app).get('/api/concerts');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  test('should return concerts with correct structure', async () => {
    const res = await request(app).get('/api/concerts');
    expect(res.statusCode).toBe(200);
    const concert = res.body[0];
    expect(concert).toHaveProperty('_id');
    expect(concert).toHaveProperty('artist');
    expect(concert).toHaveProperty('date');
    expect(concert).toHaveProperty('time');
    expect(concert).toHaveProperty('caseta');
  });

  test('should return concerts with caseta populated', async () => {
    const res = await request(app).get('/api/concerts');
    expect(res.statusCode).toBe(200);
    const concert = res.body[0];
    expect(concert.caseta).toHaveProperty('name');
  });
});

describe('Concerts API - PUT /api/concerts/:id', () => {
  test('should update a concert with valid data', async () => {
    const res = await request(app)
      .put(`/api/concerts/${concertId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ artist: 'Manuel de los Santos Updated' });
    expect(res.statusCode).toBe(200);
    expect(res.body.artist).toBe('Manuel de los Santos Updated');
  });

  test('should update concert genre', async () => {
    const res = await request(app)
      .put(`/api/concerts/${concertId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ genre: 'Flamenco Fusión' });
    expect(res.statusCode).toBe(200);
    expect(res.body.genre).toBe('Flamenco Fusión');
  });

  test('should update concert time', async () => {
    const res = await request(app)
      .put(`/api/concerts/${concertId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ time: '23:30' });
    expect(res.statusCode).toBe(200);
    expect(res.body.time).toBe('23:30');
  });

  test('should fail to update without token', async () => {
    const res = await request(app)
      .put(`/api/concerts/${concertId}`)
      .send({ artist: 'No token' });
    expect(res.statusCode).toBe(401);
  });

  test('should fail to update with invalid token', async () => {
    const res = await request(app)
      .put(`/api/concerts/${concertId}`)
      .set('Authorization', 'Bearer badtoken')
      .send({ artist: 'Bad token' });
    expect(res.statusCode).toBe(401);
  });

  test('should fail to update with non-existent id', async () => {
    const res = await request(app)
      .put('/api/concerts/000000000000000000000000')
      .set('Authorization', `Bearer ${token}`)
      .send({ artist: 'Non existent' });
    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });

  test('should fail to update with invalid id format', async () => {
    const res = await request(app)
      .put('/api/concerts/invalidid')
      .set('Authorization', `Bearer ${token}`)
      .send({ artist: 'Invalid id' });
    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });
});

describe('Concerts API - DELETE /api/concerts/:id', () => {
  test('should fail to delete without token', async () => {
    const res = await request(app).delete(`/api/concerts/${concertId}`);
    expect(res.statusCode).toBe(401);
  });

  test('should fail to delete with invalid token', async () => {
    const res = await request(app)
      .delete(`/api/concerts/${concertId}`)
      .set('Authorization', 'Bearer badtoken');
    expect(res.statusCode).toBe(401);
  });

  test('should fail to delete with non-existent id', async () => {
    const res = await request(app)
      .delete('/api/concerts/000000000000000000000000')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });

  test('should fail to delete with invalid id format', async () => {
    const res = await request(app)
      .delete('/api/concerts/invalidid')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });

  test('should delete a concert successfully', async () => {
    const res = await request(app)
      .delete(`/api/concerts/${concertId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
  });

  test('should return empty array after all deletions', async () => {
    await mongoose.connection.collection('concerts').deleteMany({});
    const res = await request(app).get('/api/concerts');
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(0);
  });
});

describe('Concerts API - Additional validation tests', () => {
  let token;
  let casetaId;
  let fairId;
  let concertId;

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
      .send({ name: 'Feria Extra Concerts', description: 'Test', startDate: '2026-05-06', endDate: '2026-05-11', location: 'Jerez', active: true });
    fairId = fairRes.body._id;

    const casetaRes = await request(app)
      .post('/api/casetas')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Caseta Extra Concerts', number: 60, fair: fairId });
    casetaId = casetaRes.body._id;
  });

  afterAll(async () => {
    await mongoose.connection.collection('concerts').deleteMany({});
    await mongoose.connection.collection('casetas').deleteMany({ name: 'Caseta Extra Concerts' });
    await mongoose.connection.collection('fairs').deleteMany({ name: 'Feria Extra Concerts' });
  });

  test('should create concert and return correct fields', async () => {
    const res = await request(app)
      .post('/api/concerts')
      .set('Authorization', `Bearer ${token}`)
      .send({ artist: 'Artista Extra', genre: 'Flamenco', date: '2026-05-10', time: '22:00', caseta: casetaId });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('_id');
    expect(res.body).toHaveProperty('artist');
    expect(res.body).toHaveProperty('date');
    expect(res.body).toHaveProperty('time');
    expect(res.body).toHaveProperty('caseta');
    concertId = res.body._id;
  });

  test('should return concert with createdAt field', async () => {
    const res = await request(app).get('/api/concerts');
    const concert = res.body.find(c => c._id === concertId);
    expect(concert).toHaveProperty('createdAt');
  });

  test('should return concert with updatedAt field', async () => {
    const res = await request(app).get('/api/concerts');
    const concert = res.body.find(c => c._id === concertId);
    expect(concert).toHaveProperty('updatedAt');
  });

  test('should return concert with genre', async () => {
    const res = await request(app).get('/api/concerts');
    const concert = res.body.find(c => c._id === concertId);
    expect(concert.genre).toBe('Flamenco');
  });

  test('should update concert artist to special characters', async () => {
    const res = await request(app)
      .put(`/api/concerts/${concertId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ artist: 'Artista con ñ y acentos: á é í ó ú' });
    expect(res.statusCode).toBe(200);
  });

  test('should update concert date', async () => {
    const res = await request(app)
      .put(`/api/concerts/${concertId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ date: '2026-05-12' });
    expect(res.statusCode).toBe(200);
  });

  test('should create multiple concerts and return them all', async () => {
    await request(app).post('/api/concerts').set('Authorization', `Bearer ${token}`).send({ artist: 'Artista 1', date: '2026-05-09', time: '21:00', caseta: casetaId });
    await request(app).post('/api/concerts').set('Authorization', `Bearer ${token}`).send({ artist: 'Artista 2', date: '2026-05-10', time: '22:00', caseta: casetaId });
    await request(app).post('/api/concerts').set('Authorization', `Bearer ${token}`).send({ artist: 'Artista 3', date: '2026-05-11', time: '23:00', caseta: casetaId });
    const res = await request(app).get('/api/concerts');
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBeGreaterThan(1);
  });

  test('should return concerts with caseta populated', async () => {
    const res = await request(app).get('/api/concerts');
    expect(res.statusCode).toBe(200);
    res.body.forEach(concert => {
      expect(concert).toHaveProperty('caseta');
    });
  });

  test('should not return password in concert response', async () => {
    const res = await request(app).get('/api/concerts');
    expect(res.statusCode).toBe(200);
    res.body.forEach(concert => {
      expect(concert).not.toHaveProperty('password');
    });
  });

  test('should return 200 on GET concerts when empty after cleanup', async () => {
    await mongoose.connection.collection('concerts').deleteMany({});
    const res = await request(app).get('/api/concerts');
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(0);
  });

  test('should fail DELETE on already deleted concert', async () => {
    const res = await request(app)
      .delete(`/api/concerts/${concertId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });

  test('should fail GET single concert with invalid id', async () => {
    const res = await request(app).get('/api/concerts/invalidid');
    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });

  test('should fail PUT concert with empty body and non-existent id', async () => {
    const res = await request(app)
      .put('/api/concerts/000000000000000000000000')
      .set('Authorization', `Bearer ${token}`)
      .send({});
    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });

  test('should create concert with midnight time', async () => {
    const res = await request(app)
      .post('/api/concerts')
      .set('Authorization', `Bearer ${token}`)
      .send({ artist: 'Artista Medianoche', date: '2026-05-10', time: '00:00', caseta: casetaId });
    expect(res.statusCode).toBe(201);
  });

  test('should create concert with early morning time', async () => {
    const res = await request(app)
      .post('/api/concerts')
      .set('Authorization', `Bearer ${token}`)
      .send({ artist: 'Artista Madrugada', date: '2026-05-10', time: '03:30', caseta: casetaId });
    expect(res.statusCode).toBe(201);
  });

  test('should return correct number of concerts after creation', async () => {
    const res = await request(app).get('/api/concerts');
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
  });

  test('should delete all concerts one by one', async () => {
    const concerts = await request(app).get('/api/concerts');
    for (const concert of concerts.body) {
      const res = await request(app)
        .delete(`/api/concerts/${concert._id}`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toBe(200);
    }
    const final = await request(app).get('/api/concerts');
    expect(final.body.length).toBe(0);
  });
});
