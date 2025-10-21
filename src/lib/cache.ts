import { Redis } from 'ioredis';
import NodeCache from 'node-cache';

// Redis client for distributed caching
let redis: Redis | null = null;

// Initialize Redis if available
if (process.env.REDIS_URL) {
  redis = new Redis(process.env.REDIS_URL, {
    retryDelayOnFailover: 100,
    maxRetriesPerRequest: 3,
    lazyConnect: true,
  });

  redis.on('connect', () => {
    console.log('Connected to Redis cache');
  });

  redis.on('error', (error) => {
    console.error('Redis cache error:', error);
  });
}

// In-memory cache as fallback
const memoryCache = new NodeCache({
  stdTTL: 600, // 10 minutes default
  checkperiod: 120, // Check for expired keys every 2 minutes
  useClones: false
});

export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  namespace?: string; // Cache key namespace
  compress?: boolean; // Compress large values
  serialize?: boolean; // Serialize complex objects
}

export class CacheManager {
  private defaultOptions: Required<CacheOptions>;

  constructor(options: CacheOptions = {}) {
    this.defaultOptions = {
      ttl: 600, // 10 minutes
      namespace: 'app',
      compress: false,
      serialize: true,
      ...options
    };
  }

  private buildKey(key: string, namespace?: string): string {
    const ns = namespace || this.defaultOptions.namespace;
    return `${ns}:${key}`;
  }

  private async serializeValue(value: any): Promise<string> {
    if (this.defaultOptions.serialize) {
      return JSON.stringify(value);
    }
    return String(value);
  }

  private async deserializeValue(value: string): Promise<any> {
    if (this.defaultOptions.serialize) {
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    }
    return value;
  }

  async get<T = any>(key: string, options: Partial<CacheOptions> = {}): Promise<T | null> {
    const fullKey = this.buildKey(key, options.namespace);

    try {
      if (redis) {
        const value = await redis.get(fullKey);
        if (value !== null) {
          return this.deserializeValue(value);
        }
      } else {
        const value = memoryCache.get<string>(fullKey);
        if (value !== undefined) {
          return this.deserializeValue(value);
        }
      }
    } catch (error) {
      console.error('Cache get error:', error);
    }

    return null;
  }

  async set(
    key: string, 
    value: any, 
    options: Partial<CacheOptions> = {}
  ): Promise<boolean> {
    const fullKey = this.buildKey(key, options.namespace);
    const ttl = options.ttl || this.defaultOptions.ttl;
    const serialized = await this.serializeValue(value);

    try {
      if (redis) {
        const result = await redis.setex(fullKey, ttl, serialized);
        return result === 'OK';
      } else {
        return memoryCache.set(fullKey, serialized, ttl);
      }
    } catch (error) {
      console.error('Cache set error:', error);
      return false;
    }
  }

  async del(key: string, options: Partial<CacheOptions> = {}): Promise<boolean> {
    const fullKey = this.buildKey(key, options.namespace);

    try {
      if (redis) {
        const result = await redis.del(fullKey);
        return result > 0;
      } else {
        return memoryCache.del(fullKey) > 0;
      }
    } catch (error) {
      console.error('Cache delete error:', error);
      return false;
    }
  }

  async has(key: string, options: Partial<CacheOptions> = {}): Promise<boolean> {
    const fullKey = this.buildKey(key, options.namespace);

    try {
      if (redis) {
        const result = await redis.exists(fullKey);
        return result > 0;
      } else {
        return memoryCache.has(fullKey);
      }
    } catch (error) {
      console.error('Cache has error:', error);
      return false;
    }
  }

  async clear(namespace?: string): Promise<boolean> {
    const ns = namespace || this.defaultOptions.namespace;

    try {
      if (redis) {
        const keys = await redis.keys(`${ns}:*`);
        if (keys.length > 0) {
          await redis.del(...keys);
        }
        return true;
      } else {
        const keys = memoryCache.keys().filter(key => key.startsWith(`${ns}:`));
        keys.forEach(key => memoryCache.del(key));
        return true;
      }
    } catch (error) {
      console.error('Cache clear error:', error);
      return false;
    }
  }

  async getOrSet<T = any>(
    key: string,
    factory: () => Promise<T>,
    options: Partial<CacheOptions> = {}
  ): Promise<T | null> {
    const cached = await this.get<T>(key, options);
    
    if (cached !== null) {
      return cached;
    }

    try {
      const value = await factory();
      await this.set(key, value, options);
      return value;
    } catch (error) {
      console.error('Cache factory error:', error);
      return null;
    }
  }

  async mget<T = any>(keys: string[], options: Partial<CacheOptions> = {}): Promise<(T | null)[]> {
    const fullKeys = keys.map(key => this.buildKey(key, options.namespace));

    try {
      if (redis) {
        const values = await redis.mget(...fullKeys);
        return Promise.all(
          values.map(value => value ? this.deserializeValue(value) : null)
        );
      } else {
        return fullKeys.map(key => {
          const value = memoryCache.get<string>(key);
          return value !== undefined ? JSON.parse(value) : null;
        });
      }
    } catch (error) {
      console.error('Cache mget error:', error);
      return keys.map(() => null);
    }
  }

  async mset(
    entries: Array<{ key: string; value: any }>,
    options: Partial<CacheOptions> = {}
  ): Promise<boolean> {
    const ttl = options.ttl || this.defaultOptions.ttl;

    try {
      if (redis) {
        const pipeline = redis.pipeline();
        
        for (const entry of entries) {
          const fullKey = this.buildKey(entry.key, options.namespace);
          const serialized = await this.serializeValue(entry.value);
          pipeline.setex(fullKey, ttl, serialized);
        }
        
        await pipeline.exec();
        return true;
      } else {
        for (const entry of entries) {
          const fullKey = this.buildKey(entry.key, options.namespace);
          const serialized = await this.serializeValue(entry.value);
          memoryCache.set(fullKey, serialized, ttl);
        }
        return true;
      }
    } catch (error) {
      console.error('Cache mset error:', error);
      return false;
    }
  }

  async increment(key: string, by: number = 1, options: Partial<CacheOptions> = {}): Promise<number> {
    const fullKey = this.buildKey(key, options.namespace);

    try {
      if (redis) {
        return await redis.incrby(fullKey, by);
      } else {
        const current = memoryCache.get<number>(fullKey) || 0;
        const newValue = current + by;
        memoryCache.set(fullKey, newValue);
        return newValue;
      }
    } catch (error) {
      console.error('Cache increment error:', error);
      return 0;
    }
  }

  async expire(key: string, ttl: number, options: Partial<CacheOptions> = {}): Promise<boolean> {
    const fullKey = this.buildKey(key, options.namespace);

    try {
      if (redis) {
        const result = await redis.expire(fullKey, ttl);
        return result === 1;
      } else {
        const value = memoryCache.get(fullKey);
        if (value !== undefined) {
          memoryCache.set(fullKey, value, ttl);
          return true;
        }
        return false;
      }
    } catch (error) {
      console.error('Cache expire error:', error);
      return false;
    }
  }

  async ttl(key: string, options: Partial<CacheOptions> = {}): Promise<number> {
    const fullKey = this.buildKey(key, options.namespace);

    try {
      if (redis) {
        return await redis.ttl(fullKey);
      } else {
        return memoryCache.getTtl(fullKey) || -1;
      }
    } catch (error) {
      console.error('Cache ttl error:', error);
      return -1;
    }
  }
}

// Predefined cache instances for different use cases
export const caches = {
  // General application cache
  app: new CacheManager({ namespace: 'app', ttl: 600 }),
  
  // Session cache
  session: new CacheManager({ namespace: 'session', ttl: 1800 }),
  
  // Database query cache
  db: new CacheManager({ namespace: 'db', ttl: 300 }),
  
  // API response cache
  api: new CacheManager({ namespace: 'api', ttl: 120 }),
  
  // User data cache
  user: new CacheManager({ namespace: 'user', ttl: 900 }),
  
  // Product catalog cache
  product: new CacheManager({ namespace: 'product', ttl: 1800 }),
  
  // Search results cache
  search: new CacheManager({ namespace: 'search', ttl: 60 }),
  
  // Rate limiting cache
  rateLimit: new CacheManager({ namespace: 'rate_limit', ttl: 3600 })
};

// Cache decorators and utilities
export function cached<T extends (...args: any[]) => Promise<any>>(
  cacheKey: string | ((...args: Parameters<T>) => string),
  options: Partial<CacheOptions> & { cache?: CacheManager } = {}
) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    const cache = options.cache || caches.app;

    descriptor.value = async function (...args: Parameters<T>) {
      const key = typeof cacheKey === 'function' ? cacheKey(...args) : cacheKey;
      
      const cached = await cache.get(key, options);
      if (cached !== null) {
        return cached;
      }

      const result = await originalMethod.apply(this, args);
      await cache.set(key, result, options);
      
      return result;
    };

    return descriptor;
  };
}

// Utility functions
export const cacheKey = {
  user: (id: string) => `user:${id}`,
  product: (id: string) => `product:${id}`,
  order: (id: string) => `order:${id}`,
  seller: (id: string) => `seller:${id}`,
  search: (query: string, filters: any) => 
    `search:${query}:${Buffer.from(JSON.stringify(filters)).toString('base64')}`,
  analytics: (type: string, period: string) => `analytics:${type}:${period}`,
  property: (id: string) => `property:${id}`,
  delivery: (agentId: string, date: string) => `delivery:${agentId}:${date}`
};

// Cache invalidation helpers
export const invalidateCache = {
  user: async (id: string) => {
    await Promise.all([
      caches.user.del(cacheKey.user(id)),
      caches.session.clear(`user_${id}`)
    ]);
  },
  
  product: async (id: string) => {
    await Promise.all([
      caches.product.del(cacheKey.product(id)),
      caches.search.clear(),
      caches.api.clear('products')
    ]);
  },
  
  order: async (id: string) => {
    await Promise.all([
      caches.db.del(cacheKey.order(id)),
      caches.api.clear('orders')
    ]);
  },
  
  seller: async (id: string) => {
    await Promise.all([
      caches.user.del(cacheKey.seller(id)),
      caches.api.clear(`seller_${id}`)
    ]);
  }
};

// Cache warming utilities
export const warmCache = {
  popularProducts: async () => {
    // Implementation for warming popular products cache
    console.log('Warming popular products cache...');
  },
  
  userSessions: async () => {
    // Implementation for warming active user sessions
    console.log('Warming user sessions cache...');
  },
  
  searchTerms: async () => {
    // Implementation for warming popular search terms
    console.log('Warming search terms cache...');
  }
};

// Cache monitoring and stats
export const cacheStats = {
  async getRedisInfo() {
    if (!redis) return null;
    
    try {
      const info = await redis.info('memory');
      return {
        connected: redis.status === 'ready',
        memory: info,
        keyspace: await redis.info('keyspace')
      };
    } catch (error) {
      console.error('Redis stats error:', error);
      return null;
    }
  },
  
  getMemoryStats() {
    return {
      keys: memoryCache.keys().length,
      stats: memoryCache.getStats()
    };
  }
};

export default CacheManager;