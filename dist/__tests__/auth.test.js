"use strict";
// import request from 'supertest';
// import { app } from '../app';
// import prisma from '../lib/prisma';  // Fix import statement
// import bcrypt from 'bcryptjs';
// import jwt from 'jsonwebtoken';
// // No need to load dotenv here as it's already loaded in jest.setup.ts
// describe('Authentication Endpoints', () => {
//   // Clean up database before all tests
//   beforeAll(async () => {
//     await prisma.comment.deleteMany();
//     await prisma.post.deleteMany();
//     await prisma.user.deleteMany();
//   });
//   // Clean up database after all tests
//   afterAll(async () => {
//     await prisma.$disconnect();
//   });
//   const testUser = {
//     email: 'test@example.com',
//     password: 'password123',
//     displayName: 'Test User',
//     avatar: 'https://example.com/avatar.jpg',
//   };
//   describe('POST /api/auth/register', () => {
//     it('should register a new user', async () => {
//       const response = await request(app)
//         .post('/api/auth/register')
//         .send(testUser);
//       expect(response.status).toBe(201);
//       expect(response.body).toHaveProperty('user');
//       expect(response.body).toHaveProperty('token');
//       expect(response.body.user).toHaveProperty('id');
//       expect(response.body.user.email).toBe(testUser.email);
//       expect(response.body.user.displayName).toBe(testUser.displayName);
//       expect(response.body.user).toHaveProperty('avatar');
//     });
//     it('should not register user with existing email', async () => {
//       // First registration
//       await prisma.user.create({
//         data: testUser,
//       });
//       // Attempt duplicate registration
//       const response = await request(app)
//         .post('/api/auth/register')
//         .send(testUser);
//       expect(response.status).toBe(400);
//       expect(response.body).toHaveProperty('error', 'Email already registered');
//     });
//   });
//   describe('POST /api/auth/login', () => {
//     beforeEach(async () => {
//       // Clean up before each login test
//       await prisma.comment.deleteMany();
//       await prisma.post.deleteMany();
//       await prisma.user.deleteMany();
//       // Create a test user before each login test
//       const hashedPassword = await bcrypt.hash(testUser.password, 10);
//       await prisma.user.create({
//         data: {
//           email: testUser.email,
//           password: hashedPassword,
//           displayName: testUser.displayName,
//           avatar: testUser.avatar,
//         },
//       });
//     });
//     it('should login with valid credentials', async () => {
//       const response = await request(app)
//         .post('/api/auth/login')
//         .send({
//           email: testUser.email,
//           password: testUser.password,
//         });
//       expect(response.status).toBe(200);
//       expect(response.body).toHaveProperty('user');
//       expect(response.body).toHaveProperty('token');
//       expect(response.body.user.email).toBe(testUser.email);
//     });
//     it('should not login with invalid password', async () => {
//       const response = await request(app)
//         .post('/api/auth/login')
//         .send({
//           email: testUser.email,
//           password: 'wrongpassword',
//         });
//       expect(response.status).toBe(401);
//       expect(response.body).toHaveProperty('error', 'Invalid credentials');
//     });
//     it('should not login with non-existent email', async () => {
//       const response = await request(app)
//         .post('/api/auth/login')
//         .send({
//           email: 'nonexistent@example.com',
//           password: 'password123',
//         });
//       expect(response.status).toBe(401);
//       expect(response.body).toHaveProperty('error', 'Invalid credentials');
//     });
//   });
//   describe('GET /api/auth/me', () => {
//     let authToken: string;
//     beforeEach(async () => {
//       // Clean up before each getCurrentUser test
//       await prisma.comment.deleteMany();
//       await prisma.post.deleteMany();
//       await prisma.user.deleteMany();
//       // Create a test user and get their token
//       const hashedPassword = await bcrypt.hash(testUser.password, 10);
//       const user = await prisma.user.create({
//         data: {
//           email: testUser.email,
//           password: hashedPassword,
//           displayName: testUser.displayName,
//           avatar: testUser.avatar,
//         },
//       });
//       authToken = jwt.sign(
//         { id: user.id, email: user.email },
//         process.env.JWT_SECRET!,
//         { expiresIn: '24h' }
//       );
//     });
//     it('should get current user with valid token', async () => {
//       const response = await request(app)
//         .get('/api/auth/me')
//         .set('Authorization', `Bearer ${authToken}`);
//       expect(response.status).toBe(200);
//       expect(response.body).toHaveProperty('id');
//       expect(response.body.email).toBe(testUser.email);
//     });
//     it('should not get user without token', async () => {
//       const response = await request(app).get('/api/auth/me');
//       expect(response.status).toBe(401);
//       expect(response.body).toHaveProperty('error', 'No token provided');
//     });
//     it('should not get user with invalid token', async () => {
//       const response = await request(app)
//         .get('/api/auth/me')
//         .set('Authorization', 'Bearer invalid-token');
//       expect(response.status).toBe(401);
//       expect(response.body).toHaveProperty('error', 'Invalid token');
//     });
//   });
// });
