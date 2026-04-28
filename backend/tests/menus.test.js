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
let menuId;
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

  await mongoose.connection.collection('menus').deleteMany({});
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
  await mongoose.connection.collection('menus').deleteMany({});
  await mongoose.connection.collection('casetas').deleteMany({});
  await mongoose.connection.collection('fairs').deleteMany({});
  await mongoose.connection.close();
});

describe('Menus API - GET /api/menus', () => {
  test('should return empty array when no menus exist', async () => {
    const res = await request(app).get('/api/menus');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBe(0);
  });

  test('should be accessible without authentication', async () => {
    const res = await request(app).get('/api/menus');
    expect(res.statusCode).toBe(200);
  });
});

describe('Menus API - POST /api/menus', () => {
  test('should create a menu item with valid data', async () => {
    const res = await request(app)
      .post('/api/menus')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Jamón ibérico',
        price: 12,
        description: 'Delicioso jamón ibérico de bellota',
        caseta: casetaId,
      });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('_id');
    expect(res.body.name).toBe('Jamón ibérico');
    menuId = res.body._id;
  });

  test('should create a menu item without description', async () => {
    const res = await request(app)
      .post('/api/menus')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Pescaíto frito',
        price: 9,
        caseta: casetaId,
      });
    expect(res.statusCode).toBe(201);
    expect(res.body.name).toBe('Pescaíto frito');
  });

  test('should fail without authentication token', async () => {
    const res = await request(app)
      .post('/api/menus')
      .send({ name: 'Test Menu', price: 5, caseta: casetaId });
    expect(res.statusCode).toBe(401);
  });

  test('should fail with invalid token', async () => {
    const res = await request(app)
      .post('/api/menus')
      .set('Authorization', 'Bearer invalidtoken')
      .send({ name: 'Test Menu', price: 5, caseta: casetaId });
    expect(res.statusCode).toBe(401);
  });

  test('should fail without name field', async () => {
    const res = await request(app)
      .post('/api/menus')
      .set('Authorization', `Bearer ${token}`)
      .send({ price: 5, caseta: casetaId });
    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });

  test('should fail without price field', async () => {
    const res = await request(app)
      .post('/api/menus')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Sin precio', caseta: casetaId });
    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });

  test('should fail without caseta field', async () => {
    const res = await request(app)
      .post('/api/menus')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Sin caseta', price: 5 });
    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });

  test('should fail with empty name', async () => {
    const res = await request(app)
      .post('/api/menus')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: '', price: 5, caseta: casetaId });
    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });

  test('should fail with invalid caseta id', async () => {
    const res = await request(app)
      .post('/api/menus')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Caseta inválida', price: 5, caseta: 'invalidid' });
    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });
});

describe('Menus API - POST /api/menus/bulk', () => {
  test('should create multiple menu items at once', async () => {
    const res = await request(app)
      .post('/api/menus/bulk')
      .set('Authorization', `Bearer ${token}`)
      .send({
        caseta: casetaId,
        items: [
          { name: 'Tortilla de patatas', price: 6 },
          { name: 'Croquetas caseras', price: 7 },
          { name: 'Gambas al ajillo', price: 11 },
        ],
      });
    expect(res.statusCode).toBe(201);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(3);
  });

  test('should fail bulk without authentication', async () => {
    const res = await request(app)
      .post('/api/menus/bulk')
      .send({ caseta: casetaId, items: [{ name: 'Test', price: 5 }] });
    expect(res.statusCode).toBe(401);
  });

  test('should fail bulk without caseta', async () => {
    const res = await request(app)
      .post('/api/menus/bulk')
      .set('Authorization', `Bearer ${token}`)
      .send({ items: [{ name: 'Test', price: 5 }] });
    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });

  test('should fail bulk without items', async () => {
    const res = await request(app)
      .post('/api/menus/bulk')
      .set('Authorization', `Bearer ${token}`)
      .send({ caseta: casetaId, items: [] });
    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });
});

describe('Menus API - GET /api/menus/caseta/:casetaId', () => {
  test('should return menus for a specific caseta', async () => {
    const res = await request(app).get(`/api/menus/caseta/${casetaId}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  test('should return empty array for caseta with no menus', async () => {
    const res = await request(app).get('/api/menus/caseta/000000000000000000000000');
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(0);
  });

  test('should fail with invalid caseta id format', async () => {
    const res = await request(app).get('/api/menus/caseta/invalidid');
    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });
});

describe('Menus API - GET /api/menus (with data)', () => {
  test('should return all menus', async () => {
    const res = await request(app).get('/api/menus');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  test('should return menus with correct structure', async () => {
    const res = await request(app).get('/api/menus');
    expect(res.statusCode).toBe(200);
    const menu = res.body.data[0];
    expect(menu).toHaveProperty('_id');
    expect(menu).toHaveProperty('name');
    expect(menu).toHaveProperty('price');
    expect(menu).toHaveProperty('caseta');
  });
});

describe('Menus API - PUT /api/menus/:id', () => {
  test('should update a menu item with valid data', async () => {
    const res = await request(app)
      .put(`/api/menus/${menuId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Jamón ibérico Updated' });
    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe('Jamón ibérico Updated');
  });

  test('should update menu price', async () => {
    const res = await request(app)
      .put(`/api/menus/${menuId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ price: 15 });
    expect(res.statusCode).toBe(200);
    expect(res.body.price).toBe(15);
  });

  test('should update menu description', async () => {
    const res = await request(app)
      .put(`/api/menus/${menuId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ description: 'Nueva descripción' });
    expect(res.statusCode).toBe(200);
  });

  test('should fail to update without token', async () => {
    const res = await request(app)
      .put(`/api/menus/${menuId}`)
      .send({ name: 'No token' });
    expect(res.statusCode).toBe(401);
  });

  test('should fail to update with invalid token', async () => {
    const res = await request(app)
      .put(`/api/menus/${menuId}`)
      .set('Authorization', 'Bearer badtoken')
      .send({ name: 'Bad token' });
    expect(res.statusCode).toBe(401);
  });

  test('should fail to update with non-existent id', async () => {
    const res = await request(app)
      .put('/api/menus/000000000000000000000000')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Non existent' });
    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });

  test('should fail to update with invalid id format', async () => {
    const res = await request(app)
      .put('/api/menus/invalidid')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Invalid id' });
    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });
});

describe('Menus API - DELETE /api/menus/:id', () => {
  test('should fail to delete without token', async () => {
    const res = await request(app).delete(`/api/menus/${menuId}`);
    expect(res.statusCode).toBe(401);
  });

  test('should fail to delete with invalid token', async () => {
    const res = await request(app)
      .delete(`/api/menus/${menuId}`)
      .set('Authorization', 'Bearer badtoken');
    expect(res.statusCode).toBe(401);
  });

  test('should fail to delete with non-existent id', async () => {
    const res = await request(app)
      .delete('/api/menus/000000000000000000000000')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });

  test('should fail to delete with invalid id format', async () => {
    const res = await request(app)
      .delete('/api/menus/invalidid')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });

  test('should delete a menu item successfully', async () => {
    const res = await request(app)
      .delete(`/api/menus/${menuId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(204);
  });
});

describe('Menus API - Additional validation tests', () => {
  let token;
  let casetaId;
  let fairId;
  let menuId;

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
      .send({ name: 'Feria Extra Menus', description: 'Test', startDate: '2026-05-06', endDate: '2026-05-11', location: 'Jerez', active: true });
    fairId = fairRes.body._id;

    const casetaRes = await request(app)
      .post('/api/casetas')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Caseta Extra Menus', number: 50, fair: fairId });
    casetaId = casetaRes.body._id;
  });

  afterAll(async () => {
    await mongoose.connection.collection('menus').deleteMany({});
    await mongoose.connection.collection('casetas').deleteMany({ name: 'Caseta Extra Menus' });
    await mongoose.connection.collection('fairs').deleteMany({ name: 'Feria Extra Menus' });
  });

  test('should create menu and return correct fields', async () => {
    const res = await request(app)
      .post('/api/menus')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Plato Extra', price: 8, description: 'Descripción extra', caseta: casetaId });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('_id');
    expect(res.body).toHaveProperty('name');
    expect(res.body).toHaveProperty('price');
    expect(res.body).toHaveProperty('caseta');
    menuId = res.body._id;
  });

  test('should return menu with createdAt field', async () => {
    const res = await request(app).get('/api/menus');
    const menu = res.body.data.find(m => m._id === menuId);
    expect(menu).toHaveProperty('createdAt');
  });

  test('should return menu with updatedAt field', async () => {
    const res = await request(app).get('/api/menus');
    const menu = res.body.data.find(m => m._id === menuId);
    expect(menu).toHaveProperty('updatedAt');
  });

  test('should return menu with description', async () => {
    const res = await request(app).get('/api/menus');
    const menu = res.body.data.find(m => m._id === menuId);
    expect(menu.description).toBe('Descripción extra');
  });

  test('should update menu price to 0', async () => {
    const res = await request(app)
      .put(`/api/menus/${menuId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ price: 0 });
    expect(res.statusCode).toBe(200);
  });

  test('should update menu name to special characters', async () => {
    const res = await request(app)
      .put(`/api/menus/${menuId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Plato con ñ y acentos: á é í ó ú' });
    expect(res.statusCode).toBe(200);
  });

  test('should create bulk menus and verify count', async () => {
    const res = await request(app)
      .post('/api/menus/bulk')
      .set('Authorization', `Bearer ${token}`)
      .send({
        caseta: casetaId,
        items: [
          { name: 'Plato bulk 1', price: 5 },
          { name: 'Plato bulk 2', price: 6 },
          { name: 'Plato bulk 3', price: 7 },
          { name: 'Plato bulk 4', price: 8 },
          { name: 'Plato bulk 5', price: 9 },
        ],
      });
    expect(res.statusCode).toBe(201);
    expect(res.body.length).toBe(5);
  });

  test('should return correct count after bulk creation', async () => {
    const res = await request(app).get(`/api/menus/caseta/${casetaId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBeGreaterThan(1);
  });

  test('should return menus with caseta populated', async () => {
    const res = await request(app).get('/api/menus');
    expect(res.statusCode).toBe(200);
    res.body.data.forEach(menu => {
      expect(menu).toHaveProperty('caseta');
    });
  });

  test('should not return password in menu response', async () => {
    const res = await request(app).get('/api/menus');
    expect(res.statusCode).toBe(200);
    res.body.data.forEach(menu => {
      expect(menu).not.toHaveProperty('password');
    });
  });

  test('should fail bulk with invalid item missing price', async () => {
    const res = await request(app)
      .post('/api/menus/bulk')
      .set('Authorization', `Bearer ${token}`)
      .send({ caseta: casetaId, items: [{ name: 'Sin precio' }] });
    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });

  test('should fail bulk with invalid item missing name', async () => {
    const res = await request(app)
      .post('/api/menus/bulk')
      .set('Authorization', `Bearer ${token}`)
      .send({ caseta: casetaId, items: [{ price: 5 }] });
    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });

  test('should delete all menus for caseta', async () => {
    const menus = await request(app).get(`/api/menus/caseta/${casetaId}`);
    for (const menu of menus.body) {
      const res = await request(app)
        .delete(`/api/menus/${menu._id}`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toBe(204);
    }
    const final = await request(app).get(`/api/menus/caseta/${casetaId}`);
    expect(final.body.length).toBe(0);
  });

  test('should return 200 on GET menus when empty', async () => {
    const res = await request(app).get('/api/menus');
    expect(res.statusCode).toBe(200);
  });

  test('should fail DELETE on already deleted menu', async () => {
    const res = await request(app)
      .delete(`/api/menus/${menuId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });
});
