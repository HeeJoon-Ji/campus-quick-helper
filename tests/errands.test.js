const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { app } = require('../app');
const Errand = require('../models/Errand');
const jwt = require('jsonwebtoken');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('GET /api/errands', () => {
  it('should return 200 OK and a list of errands', async () => {
    // 1. Mock User for requesterId
    const mockUserId = new mongoose.Types.ObjectId();
    
    // 2. Generate a valid JWT for the mock user
    const token = jwt.sign({ id: mockUserId }, process.env.JWT_SECRET || 'your_jwt_secret');

    // 3. Seed Mock Data
    await Errand.create([
      {
        requesterId: mockUserId,
        title: 'Test Errand 1',
        description: 'First test errand',
        category: 'Delivery',
        reward: 5000,
        expiredAt: new Date(Date.now() + 3600000)
      },
      {
        requesterId: mockUserId,
        title: 'Test Errand 2',
        description: 'Second test errand',
        category: 'Shopping',
        reward: 3000,
        expiredAt: new Date(Date.now() + 3600000)
      }
    ]);

    // 4. Request
    const res = await request(app)
      .get('/api/errands')
      .set('Authorization', `Bearer ${token}`);

    // 5. Assertions
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBeTruthy();
    expect(res.body.length).toBe(2);
    expect(res.body[0]).toHaveProperty('title');
  });

  it('should return 401 if no token is provided', async () => {
    const res = await request(app).get('/api/errands');
    expect(res.statusCode).toEqual(401);
  });
});
