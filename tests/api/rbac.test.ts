import { describe, test, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const API_BASE = process.env.TEST_API_URL || 'http://localhost:3000/api';

describe('Role-Based Access Control (RBAC)', () => {
  let tokens: Record<string, string> = {};
  let testUsers: Record<string, any> = {};

  beforeAll(async () => {
    // Create test users for each role
    const roles = ['BUYER', 'SELLER', 'ADMIN', 'DELIVERY_AGENT', 'REALTOR'];
    
    for (const role of roles) {
      const userData = {
        firstName: 'Test',
        lastName: role,
        email: `test-${role.toLowerCase()}@example.com`,
        password: 'TestPassword123!',
        role: role
      };

      const response = await request(API_BASE)
        .post('/auth/register')
        .send(userData);

      if (response.status === 201) {
        testUsers[role] = response.body.user;
        tokens[role] = response.body.token;
      }
    }
  });

  afterAll(async () => {
    // Clean up test users
    for (const role in testUsers) {
      if (testUsers[role]) {
        await prisma.user.delete({
          where: { id: testUsers[role].id }
        }).catch(() => {}); // Ignore errors if user doesn't exist
      }
    }
    await prisma.$disconnect();
  });

  describe('Admin Routes Access Control', () => {
    test('ADMIN should access admin dashboard', async () => {
      const response = await request(API_BASE)
        .get('/admin/dashboard/stats')
        .set('Authorization', `Bearer ${tokens.ADMIN}`)
        .expect(200);

      expect(response.body).toHaveProperty('stats');
    });

    test('SELLER should NOT access admin dashboard', async () => {
      const response = await request(API_BASE)
        .get('/admin/dashboard/stats')
        .set('Authorization', `Bearer ${tokens.SELLER}`)
        .expect(403);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Insufficient permissions');
    });

    test('BUYER should NOT access admin dashboard', async () => {
      const response = await request(API_BASE)
        .get('/admin/dashboard/stats')
        .set('Authorization', `Bearer ${tokens.BUYER}`)
        .expect(403);

      expect(response.body).toHaveProperty('error');
    });

    test('ADMIN should manage users', async () => {
      const response = await request(API_BASE)
        .get('/admin/users')
        .set('Authorization', `Bearer ${tokens.ADMIN}`)
        .expect(200);

      expect(response.body).toHaveProperty('users');
      expect(Array.isArray(response.body.users)).toBe(true);
    });

    test('Non-ADMIN should NOT manage users', async () => {
      const response = await request(API_BASE)
        .get('/admin/users')
        .set('Authorization', `Bearer ${tokens.SELLER}`)
        .expect(403);
    });
  });

  describe('Seller Routes Access Control', () => {
    test('SELLER should access seller dashboard', async () => {
      const response = await request(API_BASE)
        .get('/seller/dashboard/stats')
        .set('Authorization', `Bearer ${tokens.SELLER}`)
        .expect(200);

      expect(response.body).toHaveProperty('stats');
    });

    test('BUYER should NOT access seller dashboard', async () => {
      const response = await request(API_BASE)
        .get('/seller/dashboard/stats')
        .set('Authorization', `Bearer ${tokens.BUYER}`)
        .expect(403);
    });

    test('SELLER should manage own products', async () => {
      const response = await request(API_BASE)
        .get('/seller/products')
        .set('Authorization', `Bearer ${tokens.SELLER}`)
        .expect(200);

      expect(response.body).toHaveProperty('products');
    });

    test('ADMIN should access seller routes (oversight)', async () => {
      const response = await request(API_BASE)
        .get('/seller/products')
        .set('Authorization', `Bearer ${tokens.ADMIN}`)
        .expect(200);
    });
  });

  describe('Delivery Agent Routes Access Control', () => {
    test('DELIVERY_AGENT should access delivery dashboard', async () => {
      const response = await request(API_BASE)
        .get('/delivery-agent/dashboard/stats')
        .set('Authorization', `Bearer ${tokens.DELIVERY_AGENT}`)
        .expect(200);

      expect(response.body).toHaveProperty('stats');
    });

    test('BUYER should NOT access delivery dashboard', async () => {
      const response = await request(API_BASE)
        .get('/delivery-agent/dashboard/stats')
        .set('Authorization', `Bearer ${tokens.BUYER}`)
        .expect(403);
    });

    test('DELIVERY_AGENT should manage shipments', async () => {
      const response = await request(API_BASE)
        .get('/delivery-agent/shipments')
        .set('Authorization', `Bearer ${tokens.DELIVERY_AGENT}`)
        .expect(200);

      expect(response.body).toHaveProperty('shipments');
    });
  });

  describe('Realtor Routes Access Control', () => {
    test('REALTOR should access realtor dashboard', async () => {
      const response = await request(API_BASE)
        .get('/realtor/dashboard/stats')
        .set('Authorization', `Bearer ${tokens.REALTOR}`)
        .expect(200);

      expect(response.body).toHaveProperty('stats');
    });

    test('SELLER should NOT access realtor dashboard', async () => {
      const response = await request(API_BASE)
        .get('/realtor/dashboard/stats')
        .set('Authorization', `Bearer ${tokens.SELLER}`)
        .expect(403);
    });

    test('REALTOR should manage properties', async () => {
      const response = await request(API_BASE)
        .get('/realtor/properties')
        .set('Authorization', `Bearer ${tokens.REALTOR}`)
        .expect(200);

      expect(response.body).toHaveProperty('properties');
    });
  });

  describe('Cross-Role Data Access', () => {
    let testProduct: any;
    let testOrder: any;
    let testProperty: any;

    beforeAll(async () => {
      // Create test product by seller
      const productData = {
        name: 'Test Product',
        description: 'Test product description for RBAC testing',
        price: 99.99,
        category: 'Electronics',
        inventory: { quantity: 10, trackQuantity: true }
      };

      const productResponse = await request(API_BASE)
        .post('/seller/products')
        .set('Authorization', `Bearer ${tokens.SELLER}`)
        .send(productData);

      if (productResponse.status === 201) {
        testProduct = productResponse.body.product;
      }

      // Create test property by realtor
      const propertyData = {
        title: 'Test Property',
        description: 'Test property description for RBAC testing',
        type: 'FOR_SALE',
        propertyType: 'HOUSE',
        price: 250000,
        address: {
          street: '123 Test Street',
          city: 'Test City',
          state: 'Test State',
          zipCode: '12345',
          country: 'Test Country'
        }
      };

      const propertyResponse = await request(API_BASE)
        .post('/realtor/properties')
        .set('Authorization', `Bearer ${tokens.REALTOR}`)
        .send(propertyData);

      if (propertyResponse.status === 201) {
        testProperty = propertyResponse.body.property;
      }
    });

    test('SELLER should only see own products', async () => {
      const response = await request(API_BASE)
        .get(`/seller/products/${testProduct.id}`)
        .set('Authorization', `Bearer ${tokens.SELLER}`)
        .expect(200);

      expect(response.body.product.sellerId).toBe(testUsers.SELLER.seller?.id);
    });

    test('Different SELLER should NOT access other seller products', async () => {
      // Create another seller
      const anotherSellerData = {
        firstName: 'Another',
        lastName: 'Seller',
        email: 'another-seller@example.com',
        password: 'TestPassword123!',
        role: 'SELLER'
      };

      const sellerResponse = await request(API_BASE)
        .post('/auth/register')
        .send(anotherSellerData);

      if (sellerResponse.status === 201) {
        const anotherSellerToken = sellerResponse.body.token;

        const response = await request(API_BASE)
          .get(`/seller/products/${testProduct.id}`)
          .set('Authorization', `Bearer ${anotherSellerToken}`)
          .expect(403);

        expect(response.body).toHaveProperty('error');
      }
    });

    test('ADMIN should access any seller products', async () => {
      const response = await request(API_BASE)
        .get(`/seller/products/${testProduct.id}`)
        .set('Authorization', `Bearer ${tokens.ADMIN}`)
        .expect(200);

      expect(response.body).toHaveProperty('product');
    });

    test('REALTOR should only access own properties', async () => {
      const response = await request(API_BASE)
        .get(`/realtor/properties/${testProperty.id}`)
        .set('Authorization', `Bearer ${tokens.REALTOR}`)
        .expect(200);

      expect(response.body.property.realtorId).toBeDefined();
    });
  });

  describe('Public vs Protected Routes', () => {
    test('Public product listing should be accessible without auth', async () => {
      const response = await request(API_BASE)
        .get('/products')
        .expect(200);

      expect(response.body).toHaveProperty('products');
    });

    test('Public property listing should be accessible without auth', async () => {
      const response = await request(API_BASE)
        .get('/properties')
        .expect(200);

      expect(response.body).toHaveProperty('properties');
    });

    test('Protected user profile should require auth', async () => {
      const response = await request(API_BASE)
        .get('/user/profile')
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });

    test('Authenticated user should access own profile', async () => {
      const response = await request(API_BASE)
        .get('/user/profile')
        .set('Authorization', `Bearer ${tokens.BUYER}`)
        .expect(200);

      expect(response.body).toHaveProperty('user');
    });
  });

  describe('Rate Limiting by Role', () => {
    test('ADMIN should have higher rate limits', async () => {
      // Make multiple requests rapidly
      const requests = Array(20).fill(null).map(() =>
        request(API_BASE)
          .get('/admin/users')
          .set('Authorization', `Bearer ${tokens.ADMIN}`)
      );

      const responses = await Promise.all(requests);
      const successCount = responses.filter(r => r.status === 200).length;
      
      // Admin should have higher success rate
      expect(successCount).toBeGreaterThan(15);
    });

    test('BUYER should have standard rate limits', async () => {
      // Make many requests rapidly
      const requests = Array(20).fill(null).map(() =>
        request(API_BASE)
          .get('/products')
          .set('Authorization', `Bearer ${tokens.BUYER}`)
      );

      const responses = await Promise.all(requests);
      const rateLimitedCount = responses.filter(r => r.status === 429).length;
      
      // Should hit rate limit faster than admin
      expect(rateLimitedCount).toBeGreaterThan(0);
    });
  });

  describe('Middleware Security', () => {
    test('Should reject requests with manipulated token claims', async () => {
      // Create a token with manipulated role
      const fakeToken = jwt.sign(
        { userId: testUsers.BUYER.id, role: 'ADMIN' },
        'wrong-secret'
      );

      const response = await request(API_BASE)
        .get('/admin/users')
        .set('Authorization', `Bearer ${fakeToken}`)
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });

    test('Should validate token expiration', async () => {
      // Create an expired token
      const expiredToken = jwt.sign(
        { userId: testUsers.BUYER.id, role: 'BUYER' },
        process.env.JWT_SECRET!,
        { expiresIn: '-1h' }
      );

      const response = await request(API_BASE)
        .get('/user/profile')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(401);

      expect(response.body.error).toContain('expired');
    });

    test('Should validate user existence in token', async () => {
      // Create token with non-existent user ID
      const invalidToken = jwt.sign(
        { userId: 'non-existent-id', role: 'BUYER' },
        process.env.JWT_SECRET!
      );

      const response = await request(API_BASE)
        .get('/user/profile')
        .set('Authorization', `Bearer ${invalidToken}`)
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });
  });
});