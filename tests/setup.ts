import { PrismaClient } from '@prisma/client';
import { beforeAll, afterAll, beforeEach } from '@jest/globals';

// Test database instance
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL_TEST || process.env.DATABASE_URL || 'mysql://localhost:3306/marketplace_test'
    }
  }
});

// Global test setup
beforeAll(async () => {
  console.log('🧪 Setting up test environment...');
  
  // Set test environment variables
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret-key';
  process.env.BCRYPT_ROUNDS = '4'; // Faster hashing for tests
  
  // Connect to test database
  await prisma.$connect();
  
  // Run database migrations if needed
  try {
    await prisma.$executeRaw`SELECT 1`;
    console.log('✅ Test database connected successfully');
  } catch (error) {
    console.error('❌ Failed to connect to test database:', error);
    throw error;
  }
});

// Global test teardown
afterAll(async () => {
  console.log('🧹 Cleaning up test environment...');
  
  // Clean up test data
  await cleanupTestData();
  
  // Disconnect from database
  await prisma.$disconnect();
  
  console.log('✅ Test cleanup completed');
});

// Clean database before each test suite
beforeEach(async () => {
  // Clean up test data between test suites
  await cleanupTestData();
});

// Helper function to clean up test data
async function cleanupTestData() {
  const tables = [
    'ChatMessage',
    'Notification',
    'AdminAuditLog',
    'PropertyViewing',
    'Property',
    'Shipment',
    'DeliveryAgent',
    'Realtor',
    'WithdrawalRequest',
    'Commission',
    'OrderItem',
    'Order',
    'Product',
    'Seller',
    'User'
  ];

  // Delete in reverse order to handle foreign key constraints
  for (const table of tables) {
    try {
      await prisma.$executeRawUnsafe(`DELETE FROM ${table} WHERE email LIKE '%test%' OR email LIKE '%@example.com'`);
    } catch (error) {
      // Ignore errors for tables that might not exist or have different constraints
      console.warn(`Warning: Could not clean table ${table}:`, error);
    }
  }
}

// Helper function to create test user
export async function createTestUser(role: string = 'BUYER', email?: string) {
  const userData = {
    firstName: 'Test',
    lastName: role,
    email: email || `test-${role.toLowerCase()}-${Date.now()}@example.com`,
    password: '$2a$04$rOHKEKW5RUCbGVhWl.vC.eJKf8Y0qGYC4ZKcFY1jYYt7mAOV4XNq2', // 'TestPassword123!' hashed with 4 rounds
    role: role as any
  };

  return await prisma.user.create({
    data: userData
  });
}

// Helper function to create test product
export async function createTestProduct(sellerId: string) {
  const productData = {
    name: `Test Product ${Date.now()}`,
    description: 'Test product description for automated testing',
    price: 99.99,
    category: 'Electronics',
    status: 'ACTIVE' as any,
    sellerId,
    inventory: {
      create: {
        quantity: 10,
        trackQuantity: true,
        allowBackorders: false
      }
    }
  };

  return await prisma.product.create({
    data: productData,
    include: {
      inventory: true,
      seller: true
    }
  });
}

// Helper function to create test order
export async function createTestOrder(buyerId: string, sellerId: string) {
  // First create a product
  const product = await createTestProduct(sellerId);
  
  const orderData = {
    buyerId,
    status: 'PENDING' as any,
    totalAmount: product.price * 2,
    shippingAddress: JSON.stringify({
      street: '123 Test Street',
      city: 'Test City',
      state: 'Test State',
      zipCode: '12345',
      country: 'Test Country'
    }),
    orderItems: {
      create: [
        {
          productId: product.id,
          quantity: 2,
          price: product.price,
          subtotal: product.price * 2
        }
      ]
    }
  };

  return await prisma.order.create({
    data: orderData,
    include: {
      orderItems: {
        include: {
          product: true
        }
      },
      buyer: true
    }
  });
}

// Helper function to create test property
export async function createTestProperty(realtorId: string) {
  const propertyData = {
    title: `Test Property ${Date.now()}`,
    description: 'Test property description for automated testing',
    type: 'FOR_SALE' as any,
    propertyType: 'HOUSE' as any,
    price: 250000,
    location: 'Test City, Test State',
    address: JSON.stringify({
      street: '123 Test Street',
      city: 'Test City',
      state: 'Test State',
      zipCode: '12345',
      country: 'Test Country'
    }),
    features: JSON.stringify({
      bedrooms: 3,
      bathrooms: 2,
      area: 1500,
      yearBuilt: 2020,
      parking: 2
    }),
    images: JSON.stringify(['/test-image-1.jpg', '/test-image-2.jpg']),
    status: 'AVAILABLE' as any,
    realtorId
  };

  return await prisma.property.create({
    data: propertyData
  });
}

// Mock implementations for external services
export const mockEmailService = {
  sendEmail: jest.fn().mockResolvedValue({ success: true }),
  sendPasswordResetEmail: jest.fn().mockResolvedValue({ success: true }),
  sendOrderConfirmation: jest.fn().mockResolvedValue({ success: true })
};

export const mockPaymentService = {
  processPayment: jest.fn().mockResolvedValue({
    success: true,
    transactionId: 'test_transaction_123',
    amount: 99.99
  }),
  refundPayment: jest.fn().mockResolvedValue({
    success: true,
    refundId: 'test_refund_123'
  })
};

export const mockStorageService = {
  uploadFile: jest.fn().mockResolvedValue({
    url: 'https://test-bucket.s3.amazonaws.com/test-file.jpg',
    key: 'test-file.jpg'
  }),
  deleteFile: jest.fn().mockResolvedValue({ success: true })
};

// Set up global mocks
global.mockEmailService = mockEmailService;
global.mockPaymentService = mockPaymentService;
global.mockStorageService = mockStorageService;

// Export prisma instance for tests
export { prisma };

// Extend Jest global types
declare global {
  var mockEmailService: typeof mockEmailService;
  var mockPaymentService: typeof mockPaymentService;
  var mockStorageService: typeof mockStorageService;
}

// Set longer timeout for database operations
jest.setTimeout(30000);

console.log('🔧 Test setup configuration loaded');