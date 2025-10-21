import { describe, test, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const API_BASE = process.env.TEST_API_URL || 'http://localhost:3000/api';

describe('Authentication API', () => {
  let testUser: any;
  let authToken: string;

  beforeAll(async () => {
    // Clean up any existing test data
    await prisma.user.deleteMany({
      where: { email: { contains: 'test' } }
    });
  });

  afterAll(async () => {
    // Clean up test data
    if (testUser) {
      await prisma.user.delete({ where: { id: testUser.id } });
    }
    await prisma.$disconnect();
  });

  describe('POST /auth/register', () => {
    test('should register a new user successfully', async () => {
      const userData = {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        password: 'TestPassword123!',
        role: 'BUYER'
      };

      const response = await request(API_BASE)
        .post('/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('email', userData.email);
      expect(response.body.user).not.toHaveProperty('password');
      expect(response.body).toHaveProperty('token');

      testUser = response.body.user;
      authToken = response.body.token;
    });

    test('should fail with invalid email format', async () => {
      const userData = {
        firstName: 'Test',
        lastName: 'User',
        email: 'invalid-email',
        password: 'TestPassword123!',
        role: 'BUYER'
      };

      const response = await request(API_BASE)
        .post('/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Invalid email');
    });

    test('should fail with weak password', async () => {
      const userData = {
        firstName: 'Test',
        lastName: 'User',
        email: 'test2@example.com',
        password: '123', // Too weak
        role: 'BUYER'
      };

      const response = await request(API_BASE)
        .post('/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Password must');
    });

    test('should fail with duplicate email', async () => {
      const userData = {
        firstName: 'Test',
        lastName: 'User2',
        email: 'test@example.com', // Same email as first test
        password: 'TestPassword123!',
        role: 'BUYER'
      };

      const response = await request(API_BASE)
        .post('/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('already exists');
    });
  });

  describe('POST /auth/login', () => {
    test('should login successfully with valid credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'TestPassword123!'
      };

      const response = await request(API_BASE)
        .post('/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toHaveProperty('email', loginData.email);
    });

    test('should fail with invalid email', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'TestPassword123!'
      };

      const response = await request(API_BASE)
        .post('/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Invalid credentials');
    });

    test('should fail with invalid password', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      const response = await request(API_BASE)
        .post('/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Invalid credentials');
    });

    test('should apply rate limiting after multiple failed attempts', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      // Make multiple failed attempts
      for (let i = 0; i < 6; i++) {
        await request(API_BASE)
          .post('/auth/login')
          .send(loginData);
      }

      const response = await request(API_BASE)
        .post('/auth/login')
        .send(loginData)
        .expect(429);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Too many');
    });
  });

  describe('GET /auth/me', () => {
    test('should return user info when authenticated', async () => {
      const response = await request(API_BASE)
        .get('/auth/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('email', 'test@example.com');
      expect(response.body.user).not.toHaveProperty('password');
    });

    test('should fail without authentication token', async () => {
      const response = await request(API_BASE)
        .get('/auth/me')
        .expect(401);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Unauthorized');
    });

    test('should fail with invalid token', async () => {
      const response = await request(API_BASE)
        .get('/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Invalid token');
    });
  });

  describe('POST /auth/forgot-password', () => {
    test('should send password reset email for valid user', async () => {
      const response = await request(API_BASE)
        .post('/auth/forgot-password')
        .send({ email: 'test@example.com' })
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Password reset');
    });

    test('should not reveal if email does not exist', async () => {
      const response = await request(API_BASE)
        .post('/auth/forgot-password')
        .send({ email: 'nonexistent@example.com' })
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Password reset');
    });

    test('should apply rate limiting', async () => {
      // Make multiple requests
      for (let i = 0; i < 4; i++) {
        await request(API_BASE)
          .post('/auth/forgot-password')
          .send({ email: 'test@example.com' });
      }

      const response = await request(API_BASE)
        .post('/auth/forgot-password')
        .send({ email: 'test@example.com' })
        .expect(429);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Too many');
    });
  });

  describe('POST /auth/refresh', () => {
    test('should refresh token successfully', async () => {
      const response = await request(API_BASE)
        .post('/auth/refresh')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('expiresAt');
    });

    test('should fail without token', async () => {
      const response = await request(API_BASE)
        .post('/auth/refresh')
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /auth/logout', () => {
    test('should logout successfully', async () => {
      const response = await request(API_BASE)
        .post('/auth/logout')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });

    test('should handle logout without token gracefully', async () => {
      const response = await request(API_BASE)
        .post('/auth/logout')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });
  });
});