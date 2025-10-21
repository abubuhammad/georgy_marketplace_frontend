import { z } from 'zod';
import DOMPurify from 'isomorphic-dompurify';
import { NextApiRequest } from 'next';

// HTML Sanitization
export const sanitizeHtml = (html: string): string => {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'ul', 'ol', 'li', 'blockquote', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
    ALLOWED_ATTR: []
  });
};

// SQL Injection Prevention
export const sanitizeForDb = (input: string): string => {
  return input
    .replace(/'/g, "''")  // Escape single quotes
    .replace(/;/g, '\\;') // Escape semicolons
    .replace(/--/g, '\\--') // Escape SQL comments
    .replace(/\/\*/g, '\\/\\*') // Escape block comments
    .replace(/\*\//g, '\\*\\/');
};

// XSS Prevention
export const sanitizeString = (input: string): string => {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

// File name sanitization
export const sanitizeFileName = (fileName: string): string => {
  return fileName
    .replace(/[^a-zA-Z0-9.-]/g, '_') // Replace invalid chars with underscore
    .replace(/_{2,}/g, '_') // Replace multiple underscores with single
    .replace(/^_|_$/g, '') // Remove leading/trailing underscores
    .toLowerCase();
};

// Common Validation Schemas
export const emailSchema = z.string().email('Invalid email address');
export const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 'Password must contain uppercase, lowercase, number, and special character');

export const phoneSchema = z.string()
  .regex(/^\+?[\d\s\-\(\)]{10,}$/, 'Invalid phone number format');

export const urlSchema = z.string().url('Invalid URL format');

export const mongoIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID format');

// User Registration Validation
export const userRegistrationSchema = z.object({
  firstName: z.string()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must not exceed 50 characters')
    .regex(/^[a-zA-Z\s]+$/, 'First name can only contain letters and spaces'),
  
  lastName: z.string()
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must not exceed 50 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Last name can only contain letters and spaces'),
  
  email: emailSchema,
  password: passwordSchema,
  phone: phoneSchema.optional(),
  role: z.enum(['BUYER', 'SELLER', 'DELIVERY_AGENT', 'REALTOR']).default('BUYER'),
  
  // Address fields
  address: z.object({
    street: z.string().min(1, 'Street address is required').max(200),
    city: z.string().min(1, 'City is required').max(100),
    state: z.string().min(1, 'State is required').max(100),
    zipCode: z.string().min(5, 'ZIP code must be at least 5 characters').max(10),
    country: z.string().min(1, 'Country is required').max(100)
  }).optional()
});

// Product Validation
export const productSchema = z.object({
  name: z.string()
    .min(2, 'Product name must be at least 2 characters')
    .max(200, 'Product name must not exceed 200 characters'),
  
  description: z.string()
    .min(10, 'Description must be at least 10 characters')
    .max(5000, 'Description must not exceed 5000 characters'),
  
  price: z.number()
    .positive('Price must be positive')
    .max(1000000, 'Price too high')
    .multipleOf(0.01, 'Price must have at most 2 decimal places'),
  
  compareAtPrice: z.number()
    .positive('Compare at price must be positive')
    .optional(),
  
  category: z.string().min(1, 'Category is required'),
  subcategory: z.string().optional(),
  
  tags: z.array(z.string().min(1).max(50)).max(20, 'Too many tags'),
  
  inventory: z.object({
    quantity: z.number().int().min(0, 'Quantity must be non-negative'),
    trackQuantity: z.boolean().default(true),
    allowBackorders: z.boolean().default(false)
  }),
  
  dimensions: z.object({
    length: z.number().positive().optional(),
    width: z.number().positive().optional(),
    height: z.number().positive().optional(),
    weight: z.number().positive().optional()
  }).optional(),
  
  seo: z.object({
    title: z.string().max(60).optional(),
    description: z.string().max(160).optional(),
    keywords: z.array(z.string().max(50)).max(10).optional()
  }).optional()
});

// Order Validation
export const orderSchema = z.object({
  items: z.array(z.object({
    productId: mongoIdSchema,
    quantity: z.number().int().positive('Quantity must be positive'),
    price: z.number().positive('Price must be positive')
  })).min(1, 'Order must contain at least one item'),
  
  shippingAddress: z.object({
    street: z.string().min(1, 'Street address is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    zipCode: z.string().min(5, 'ZIP code is required'),
    country: z.string().min(1, 'Country is required'),
    phone: phoneSchema.optional()
  }),
  
  billingAddress: z.object({
    street: z.string().min(1, 'Street address is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    zipCode: z.string().min(5, 'ZIP code is required'),
    country: z.string().min(1, 'Country is required')
  }).optional(),
  
  paymentMethod: z.enum(['CARD', 'BANK_TRANSFER', 'WALLET', 'PAY_ON_DELIVERY']),
  notes: z.string().max(500).optional()
});

// Property Validation (for realtors)
export const propertySchema = z.object({
  title: z.string()
    .min(5, 'Title must be at least 5 characters')
    .max(200, 'Title must not exceed 200 characters'),
  
  description: z.string()
    .min(20, 'Description must be at least 20 characters')
    .max(5000, 'Description must not exceed 5000 characters'),
  
  type: z.enum(['FOR_SALE', 'FOR_RENT']),
  propertyType: z.enum(['HOUSE', 'APARTMENT', 'CONDO', 'LAND', 'COMMERCIAL']),
  
  price: z.number().positive('Price must be positive'),
  
  address: z.object({
    street: z.string().min(1, 'Street address is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    zipCode: z.string().min(5, 'ZIP code is required'),
    country: z.string().min(1, 'Country is required'),
    coordinates: z.object({
      lat: z.number().min(-90).max(90),
      lng: z.number().min(-180).max(180)
    }).optional()
  }),
  
  features: z.object({
    bedrooms: z.number().int().min(0).optional(),
    bathrooms: z.number().min(0).optional(),
    area: z.number().positive().optional(),
    yearBuilt: z.number().int().min(1800).max(new Date().getFullYear()).optional(),
    parking: z.number().int().min(0).optional(),
    furnished: z.boolean().optional()
  }).optional(),
  
  amenities: z.array(z.string().max(100)).max(50).optional()
});

// File Upload Validation
export const fileUploadSchema = z.object({
  filename: z.string().min(1, 'Filename is required'),
  mimetype: z.string().refine(
    (type) => ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'].includes(type),
    'Unsupported file type'
  ),
  size: z.number().max(10 * 1024 * 1024, 'File too large (max 10MB)')
});

// Search and Filter Validation
export const searchSchema = z.object({
  query: z.string().max(200).optional(),
  category: z.string().optional(),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional(),
  location: z.string().max(100).optional(),
  sortBy: z.enum(['price_asc', 'price_desc', 'date_asc', 'date_desc', 'relevance']).optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20)
});

// Validation Middleware
export class ValidationError extends Error {
  public errors: z.ZodError['errors'];
  
  constructor(zodError: z.ZodError) {
    const message = zodError.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
    super(message);
    this.name = 'ValidationError';
    this.errors = zodError.errors;
  }
}

export function validateRequest<T>(schema: z.ZodSchema<T>) {
  return (req: NextApiRequest, res: any, next: () => void) => {
    try {
      const validated = schema.parse(req.body);
      (req as any).validatedData = validated;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = new ValidationError(error);
        return res.status(400).json({
          error: 'Validation failed',
          details: validationError.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        });
      }
      throw error;
    }
  };
}

// Sanitization Middleware
export function sanitizeRequest() {
  return (req: NextApiRequest, res: any, next: () => void) => {
    if (req.body && typeof req.body === 'object') {
      req.body = sanitizeObject(req.body);
    }
    
    if (req.query && typeof req.query === 'object') {
      req.query = sanitizeObject(req.query);
    }
    
    next();
  };
}

function sanitizeObject(obj: any): any {
  if (typeof obj === 'string') {
    return sanitizeString(obj);
  }
  
  if (typeof obj === 'object' && obj !== null) {
    if (Array.isArray(obj)) {
      return obj.map(item => sanitizeObject(item));
    }
    
    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      sanitized[sanitizeString(key)] = sanitizeObject(value);
    }
    return sanitized;
  }
  
  return obj;
}

// Request Size Validation
export function validateRequestSize(maxSize: number = 1024 * 1024) { // Default 1MB
  return (req: NextApiRequest, res: any, next: () => void) => {
    const contentLength = req.headers['content-length'];
    
    if (contentLength && parseInt(contentLength) > maxSize) {
      return res.status(413).json({
        error: 'Request too large',
        maxSize: `${maxSize / 1024 / 1024}MB`
      });
    }
    
    next();
  };
}

// Content Type Validation
export function validateContentType(allowedTypes: string[] = ['application/json']) {
  return (req: NextApiRequest, res: any, next: () => void) => {
    const contentType = req.headers['content-type'];
    
    if (!contentType || !allowedTypes.some(type => contentType.includes(type))) {
      return res.status(415).json({
        error: 'Unsupported media type',
        allowed: allowedTypes
      });
    }
    
    next();
  };
}

// CSRF Protection
export function csrfProtection() {
  return (req: NextApiRequest, res: any, next: () => void) => {
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method!)) {
      const token = req.headers['x-csrf-token'] || req.body.csrfToken;
      const sessionToken = req.headers.cookie?.includes('csrf-token');
      
      if (!token || !sessionToken) {
        return res.status(403).json({
          error: 'CSRF token missing or invalid'
        });
      }
    }
    
    next();
  };
}

// Advanced validation utilities
export const createCustomValidator = <T>(
  schema: z.ZodSchema<T>,
  customRules?: (data: T) => string[]
) => {
  return (data: unknown): { success: boolean; data?: T; errors?: string[] } => {
    try {
      const validated = schema.parse(data);
      
      if (customRules) {
        const customErrors = customRules(validated);
        if (customErrors.length > 0) {
          return { success: false, errors: customErrors };
        }
      }
      
      return { success: true, data: validated };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
        return { success: false, errors };
      }
      return { success: false, errors: ['Validation failed'] };
    }
  };
};

export default {
  sanitizeHtml,
  sanitizeString,
  sanitizeFileName,
  validateRequest,
  sanitizeRequest,
  validateRequestSize,
  validateContentType,
  csrfProtection,
  ValidationError
};