// Mock Prisma client for frontend development
// In production, frontend should use API calls instead of direct database access

interface MockPrismaClient {
  category: {
    findMany: (args?: any) => Promise<any[]>;
    findUnique: (args: any) => Promise<any>;
    create: (args: any) => Promise<any>;
    update: (args: any) => Promise<any>;
    delete: (args: any) => Promise<any>;
  };
  listing: {
    findMany: (args?: any) => Promise<any[]>;
    findUnique: (args: any) => Promise<any>;
    create: (args: any) => Promise<any>;
    update: (args: any) => Promise<any>;
    delete: (args: any) => Promise<any>;
  };
  user: {
    findMany: (args?: any) => Promise<any[]>;
    findUnique: (args: any) => Promise<any>;
    create: (args: any) => Promise<any>;
    update: (args: any) => Promise<any>;
    delete: (args: any) => Promise<any>;
  };
  product: {
    findMany: (args?: any) => Promise<any[]>;
    findUnique: (args: any) => Promise<any>;
    create: (args: any) => Promise<any>;
    update: (args: any) => Promise<any>;
    delete: (args: any) => Promise<any>;
  };
}

// Mock Prisma client for development
const mockPrisma: MockPrismaClient = {
  category: {
    findMany: async (args?: any) => {
      console.warn('Frontend should use API calls instead of direct Prisma access');
      return [];
    },
    findUnique: async (args: any) => {
      console.warn('Frontend should use API calls instead of direct Prisma access');
      return null;
    },
    create: async (args: any) => {
      console.warn('Frontend should use API calls instead of direct Prisma access');
      return {};
    },
    update: async (args: any) => {
      console.warn('Frontend should use API calls instead of direct Prisma access');
      return {};
    },
    delete: async (args: any) => {
      console.warn('Frontend should use API calls instead of direct Prisma access');
      return {};
    }
  },
  listing: {
    findMany: async (args?: any) => {
      console.warn('Frontend should use API calls instead of direct Prisma access');
      return [];
    },
    findUnique: async (args: any) => {
      console.warn('Frontend should use API calls instead of direct Prisma access');
      return null;
    },
    create: async (args: any) => {
      console.warn('Frontend should use API calls instead of direct Prisma access');
      return {};
    },
    update: async (args: any) => {
      console.warn('Frontend should use API calls instead of direct Prisma access');
      return {};
    },
    delete: async (args: any) => {
      console.warn('Frontend should use API calls instead of direct Prisma access');
      return {};
    }
  },
  user: {
    findMany: async (args?: any) => {
      console.warn('Frontend should use API calls instead of direct Prisma access');
      return [];
    },
    findUnique: async (args: any) => {
      console.warn('Frontend should use API calls instead of direct Prisma access');
      return null;
    },
    create: async (args: any) => {
      console.warn('Frontend should use API calls instead of direct Prisma access');
      return {};
    },
    update: async (args: any) => {
      console.warn('Frontend should use API calls instead of direct Prisma access');
      return {};
    },
    delete: async (args: any) => {
      console.warn('Frontend should use API calls instead of direct Prisma access');
      return {};
    }
  },
  product: {
    findMany: async (args?: any) => {
      console.warn('Frontend should use API calls instead of direct Prisma access');
      return [];
    },
    findUnique: async (args: any) => {
      console.warn('Frontend should use API calls instead of direct Prisma access');
      return null;
    },
    create: async (args: any) => {
      console.warn('Frontend should use API calls instead of direct Prisma access');
      return {};
    },
    update: async (args: any) => {
      console.warn('Frontend should use API calls instead of direct Prisma access');
      return {};
    },
    delete: async (args: any) => {
      console.warn('Frontend should use API calls instead of direct Prisma access');
      return {};
    }
  }
};

// Export the mock prisma client
// Note: In a proper architecture, frontend should not access database directly
// This is a temporary solution to fix import errors
export const prisma = mockPrisma;

export default mockPrisma;
