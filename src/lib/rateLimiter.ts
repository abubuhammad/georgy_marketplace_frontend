import { NextApiRequest, NextApiResponse } from 'next';
import { Redis } from 'ioredis';

// Redis client for rate limiting storage
let redis: Redis | null = null;

// Initialize Redis if available, fallback to in-memory storage
if (process.env.REDIS_URL) {
  redis = new Redis(process.env.REDIS_URL);
}

// In-memory store as fallback
const memoryStore = new Map<string, { count: number; resetTime: number }>();

interface RateLimitOptions {
  windowMs: number;      // Time window in milliseconds
  maxRequests: number;   // Maximum number of requests per window
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  keyGenerator?: (req: NextApiRequest) => string;
  onLimitReached?: (req: NextApiRequest, res: NextApiResponse) => void;
  message?: string;
}

interface RateLimitResult {
  allowed: boolean;
  resetTime: Date;
  remaining: number;
  total: number;
}

export class RateLimiter {
  private options: Required<RateLimitOptions>;

  constructor(options: RateLimitOptions) {
    this.options = {
      skipSuccessfulRequests: false,
      skipFailedRequests: false,
      keyGenerator: (req) => this.getClientIdentifier(req),
      onLimitReached: () => {},
      message: 'Too many requests',
      ...options
    };
  }

  private getClientIdentifier(req: NextApiRequest): string {
    // Try to get real IP from various headers (for proxy/load balancer setups)
    const forwarded = req.headers['x-forwarded-for'];
    const realIp = req.headers['x-real-ip'];
    const cfConnectingIp = req.headers['cf-connecting-ip'];
    
    let ip = (
      (Array.isArray(forwarded) ? forwarded[0] : forwarded?.split(',')[0]) ||
      (Array.isArray(realIp) ? realIp[0] : realIp) ||
      (Array.isArray(cfConnectingIp) ? cfConnectingIp[0] : cfConnectingIp) ||
      req.socket.remoteAddress ||
      'unknown'
    ).trim();

    // For authenticated requests, include user ID for more accurate limiting
    const userId = (req as any).user?.id;
    return userId ? `user:${userId}:${ip}` : `ip:${ip}`;
  }

  async checkRateLimit(req: NextApiRequest): Promise<RateLimitResult> {
    const key = this.options.keyGenerator(req);
    const now = Date.now();
    const windowStart = now - this.options.windowMs;

    if (redis) {
      return this.checkRedisRateLimit(key, now, windowStart);
    } else {
      return this.checkMemoryRateLimit(key, now, windowStart);
    }
  }

  private async checkRedisRateLimit(
    key: string, 
    now: number, 
    windowStart: number
  ): Promise<RateLimitResult> {
    const multi = redis!.multi();
    
    // Remove expired entries
    multi.zremrangebyscore(key, '-inf', windowStart);
    
    // Count current requests in window
    multi.zcard(key);
    
    // Add current request
    multi.zadd(key, now, now);
    
    // Set expiry for the key
    multi.expire(key, Math.ceil(this.options.windowMs / 1000));
    
    const results = await multi.exec();
    
    if (!results) {
      throw new Error('Redis transaction failed');
    }
    
    const currentCount = (results[1][1] as number) || 0;
    const allowed = currentCount < this.options.maxRequests;
    
    if (!allowed) {
      // Remove the request we just added since it's not allowed
      await redis!.zrem(key, now);
    }
    
    const resetTime = new Date(now + this.options.windowMs);
    const remaining = Math.max(0, this.options.maxRequests - currentCount - (allowed ? 1 : 0));
    
    return {
      allowed,
      resetTime,
      remaining,
      total: this.options.maxRequests
    };
  }

  private checkMemoryRateLimit(
    key: string, 
    now: number, 
    windowStart: number
  ): RateLimitResult {
    const stored = memoryStore.get(key);
    
    if (!stored || stored.resetTime <= now) {
      // First request or window expired
      const resetTime = now + this.options.windowMs;
      memoryStore.set(key, { count: 1, resetTime });
      
      return {
        allowed: true,
        resetTime: new Date(resetTime),
        remaining: this.options.maxRequests - 1,
        total: this.options.maxRequests
      };
    }
    
    const allowed = stored.count < this.options.maxRequests;
    
    if (allowed) {
      stored.count++;
    }
    
    return {
      allowed,
      resetTime: new Date(stored.resetTime),
      remaining: Math.max(0, this.options.maxRequests - stored.count),
      total: this.options.maxRequests
    };
  }

  middleware() {
    return async (req: NextApiRequest, res: NextApiResponse, next: () => void) => {
      try {
        const result = await this.checkRateLimit(req);
        
        // Add rate limit headers
        res.setHeader('X-RateLimit-Limit', result.total.toString());
        res.setHeader('X-RateLimit-Remaining', result.remaining.toString());
        res.setHeader('X-RateLimit-Reset', result.resetTime.getTime().toString());
        
        if (!result.allowed) {
          this.options.onLimitReached(req, res);
          return res.status(429).json({
            error: this.options.message,
            retryAfter: result.resetTime
          });
        }
        
        next();
      } catch (error) {
        console.error('Rate limiting error:', error);
        // Continue if rate limiting fails (fail open)
        next();
      }
    };
  }
}

// Predefined rate limiters for different use cases
export const createRateLimiter = {
  // General API requests
  general: () => new RateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 1000,
    message: 'Too many requests from this IP, please try again later.'
  }),

  // Authentication endpoints
  auth: () => new RateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5, // Very strict for login attempts
    message: 'Too many login attempts, please try again later.'
  }),

  // Password reset
  passwordReset: () => new RateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 3,
    message: 'Too many password reset requests, please try again later.'
  }),

  // Email sending
  email: () => new RateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 5,
    message: 'Too many email requests, please try again later.'
  }),

  // File uploads
  upload: () => new RateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10,
    message: 'Too many upload attempts, please try again later.'
  }),

  // Search requests
  search: () => new RateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 50,
    message: 'Too many search requests, please slow down.'
  }),

  // Admin operations
  admin: () => new RateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100, // Higher limit for admin users
    message: 'Admin operation rate limit exceeded.'
  }),

  // Webhook endpoints
  webhook: () => new RateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 200, // Higher limit for webhooks
    keyGenerator: (req) => {
      // Use webhook source for keying
      const source = req.headers['user-agent'] || req.headers['x-webhook-source'] || 'unknown';
      return `webhook:${source}`;
    },
    message: 'Webhook rate limit exceeded.'
  }),

  // Per-user operations
  perUser: (windowMs: number, maxRequests: number) => new RateLimiter({
    windowMs,
    maxRequests,
    keyGenerator: (req) => {
      const userId = (req as any).user?.id;
      return userId ? `user:${userId}` : `ip:${req.socket.remoteAddress}`;
    }
  })
};

// Advanced rate limiting with different tiers based on user role
export class TieredRateLimiter {
  private limiters: Map<string, RateLimiter>;

  constructor() {
    this.limiters = new Map();
    
    // Define limits for different user roles
    this.limiters.set('ADMIN', new RateLimiter({
      windowMs: 15 * 60 * 1000,
      maxRequests: 5000 // Admins get higher limits
    }));
    
    this.limiters.set('SELLER', new RateLimiter({
      windowMs: 15 * 60 * 1000,
      maxRequests: 2000 // Sellers get moderate limits
    }));
    
    this.limiters.set('DELIVERY_AGENT', new RateLimiter({
      windowMs: 15 * 60 * 1000,
      maxRequests: 1500 // Delivery agents need frequent updates
    }));
    
    this.limiters.set('REALTOR', new RateLimiter({
      windowMs: 15 * 60 * 1000,
      maxRequests: 1500 // Realtors need moderate limits
    }));
    
    this.limiters.set('BUYER', new RateLimiter({
      windowMs: 15 * 60 * 1000,
      maxRequests: 1000 // Regular users
    }));
    
    this.limiters.set('USER', new RateLimiter({
      windowMs: 15 * 60 * 1000,
      maxRequests: 1000 // Regular users
    }));
    
    // Default for unauthenticated users
    this.limiters.set('ANONYMOUS', new RateLimiter({
      windowMs: 15 * 60 * 1000,
      maxRequests: 100 // Strict limits for anonymous users
    }));
  }

  middleware() {
    return async (req: NextApiRequest, res: NextApiResponse, next: () => void) => {
      const userRole = (req as any).user?.role || 'ANONYMOUS';
      const limiter = this.limiters.get(userRole) || this.limiters.get('ANONYMOUS')!;
      
      return limiter.middleware()(req, res, next);
    };
  }
}

// Utility function to apply rate limiting to API routes
export function withRateLimit(
  limiter: RateLimiter,
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const rateLimitMiddleware = limiter.middleware();
    
    return new Promise<void>((resolve, reject) => {
      rateLimitMiddleware(req, res, async () => {
        try {
          await handler(req, res);
          resolve();
        } catch (error) {
          reject(error);
        }
      });
    });
  };
}

export default RateLimiter;