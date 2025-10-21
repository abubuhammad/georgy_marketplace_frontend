# Multi-Vendor Marketplace API Documentation

## Overview

This API documentation covers the complete multi-vendor marketplace platform supporting various user roles including buyers, sellers, admins, delivery agents, and realtors. The platform handles product management, order processing, property listings, delivery tracking, and comprehensive role-based access control.

## Base URL

```
Production: https://your-domain.com/api
Development: http://localhost:3000/api
```

## Authentication

The API uses JWT (JSON Web Token) based authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Token Format
```json
{
  "userId": "string",
  "role": "BUYER | SELLER | ADMIN | DELIVERY_AGENT | REALTOR",
  "iat": "number",
  "exp": "number"
}
```

## Rate Limiting

Rate limits are applied based on user roles:

- **Anonymous Users**: 100 requests per 15 minutes
- **Buyers/Users**: 1,000 requests per 15 minutes  
- **Sellers**: 2,000 requests per 15 minutes
- **Delivery Agents**: 1,500 requests per 15 minutes
- **Realtors**: 1,500 requests per 15 minutes
- **Admins**: 5,000 requests per 15 minutes

Rate limit headers are included in responses:
- `X-RateLimit-Limit`: Request limit per window
- `X-RateLimit-Remaining`: Remaining requests in current window
- `X-RateLimit-Reset`: Window reset time (Unix timestamp)

## Error Responses

All endpoints return consistent error responses:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {
    "field": "Specific field error details"
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Common HTTP Status Codes

- `200 OK`: Successful request
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Authentication required or invalid token
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `409 Conflict`: Resource conflict (e.g., duplicate email)
- `422 Unprocessable Entity`: Validation errors
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error

---

## Authentication Endpoints

### Register User

**POST** `/auth/register`

Register a new user account.

#### Request Body
```json
{
  "firstName": "string (required, 2-50 chars)",
  "lastName": "string (required, 2-50 chars)",
  "email": "string (required, valid email)",
  "password": "string (required, min 8 chars, must contain uppercase, lowercase, number, special char)",
  "phone": "string (optional, valid phone format)",
  "role": "BUYER | SELLER | DELIVERY_AGENT | REALTOR (default: BUYER)",
  "address": {
    "street": "string (required)",
    "city": "string (required)",
    "state": "string (required)",
    "zipCode": "string (required, 5-10 chars)",
    "country": "string (required)"
  }
}
```

#### Response (201 Created)
```json
{
  "success": true,
  "user": {
    "id": "string",
    "firstName": "string",
    "lastName": "string",
    "email": "string",
    "role": "string",
    "createdAt": "ISO date"
  },
  "token": "JWT string",
  "expiresAt": "ISO date"
}
```

---

### Login User

**POST** `/auth/login`

Authenticate user and receive access token.

#### Request Body
```json
{
  "email": "string (required)",
  "password": "string (required)"
}
```

#### Response (200 OK)
```json
{
  "success": true,
  "user": {
    "id": "string",
    "firstName": "string",
    "lastName": "string",
    "email": "string",
    "role": "string"
  },
  "token": "JWT string",
  "expiresAt": "ISO date"
}
```

---

### Get Current User

**GET** `/auth/me`

Get current authenticated user information.

#### Headers
```
Authorization: Bearer <token>
```

#### Response (200 OK)
```json
{
  "user": {
    "id": "string",
    "firstName": "string",
    "lastName": "string",
    "email": "string",
    "role": "string",
    "profile": "object",
    "createdAt": "ISO date"
  }
}
```

---

## Seller Management Endpoints

### Seller Dashboard Stats

**GET** `/seller/dashboard/stats`

Get comprehensive dashboard statistics for sellers.

**Required Role**: `SELLER` or `ADMIN`

#### Response (200 OK)
```json
{
  "stats": {
    "totalProducts": "number",
    "activeProducts": "number",
    "totalOrders": "number",
    "pendingOrders": "number",
    "totalRevenue": "number",
    "monthlyRevenue": "number",
    "totalEarnings": "number",
    "pendingEarnings": "number",
    "conversionRate": "number",
    "averageOrderValue": "number"
  },
  "recentOrders": "array",
  "topProducts": "array",
  "monthlyStats": "array"
}
```

---

### Get Seller Products

**GET** `/seller/products`

Get paginated list of seller's products.

**Required Role**: `SELLER` or `ADMIN`

#### Query Parameters
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)
- `search`: Search term
- `category`: Filter by category
- `status`: Filter by status (`ACTIVE`, `DRAFT`, `ARCHIVED`)
- `sortBy`: Sort by field (`createdAt`, `name`, `price`, `sales`)
- `sortOrder`: Sort direction (`asc`, `desc`)

#### Response (200 OK)
```json
{
  "products": [
    {
      "id": "string",
      "name": "string",
      "description": "string",
      "price": "number",
      "compareAtPrice": "number",
      "category": "string",
      "status": "string",
      "inventory": {
        "quantity": "number",
        "trackQuantity": "boolean"
      },
      "images": "array",
      "createdAt": "ISO date"
    }
  ],
  "pagination": {
    "page": "number",
    "limit": "number",
    "total": "number",
    "pages": "number"
  }
}
```

---

### Create Product

**POST** `/seller/products`

Create a new product.

**Required Role**: `SELLER`

#### Request Body
```json
{
  "name": "string (required, 2-200 chars)",
  "description": "string (required, 10-5000 chars)",
  "price": "number (required, positive, max 2 decimal places)",
  "compareAtPrice": "number (optional, positive)",
  "category": "string (required)",
  "subcategory": "string (optional)",
  "tags": "array of strings (optional, max 20 items)",
  "inventory": {
    "quantity": "number (required, non-negative)",
    "trackQuantity": "boolean (default: true)",
    "allowBackorders": "boolean (default: false)"
  },
  "dimensions": {
    "length": "number (optional, positive)",
    "width": "number (optional, positive)",
    "height": "number (optional, positive)",
    "weight": "number (optional, positive)"
  },
  "seo": {
    "title": "string (optional, max 60 chars)",
    "description": "string (optional, max 160 chars)",
    "keywords": "array of strings (optional, max 10 items)"
  }
}
```

#### Response (201 Created)
```json
{
  "success": true,
  "product": {
    "id": "string",
    "name": "string",
    "description": "string",
    "price": "number",
    "status": "DRAFT",
    "sellerId": "string",
    "createdAt": "ISO date"
  }
}
```

---

## Admin Management Endpoints

### Admin Dashboard Stats

**GET** `/admin/dashboard/stats`

Get comprehensive platform statistics for admins.

**Required Role**: `ADMIN`

#### Response (200 OK)
```json
{
  "stats": {
    "totalUsers": "number",
    "totalSellers": "number",
    "totalProducts": "number",
    "totalOrders": "number",
    "totalRevenue": "number",
    "platformCommission": "number",
    "activeDeliveryAgents": "number",
    "totalProperties": "number"
  },
  "recentActivity": "array",
  "revenueChart": "array",
  "userGrowth": "array"
}
```

---

### Manage Users

**GET** `/admin/users`

Get paginated list of all platform users.

**Required Role**: `ADMIN`

#### Query Parameters
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)
- `search`: Search by name or email
- `role`: Filter by user role
- `status`: Filter by account status
- `sortBy`: Sort field
- `sortOrder`: Sort direction

#### Response (200 OK)
```json
{
  "users": [
    {
      "id": "string",
      "firstName": "string",
      "lastName": "string",
      "email": "string",
      "role": "string",
      "status": "string",
      "createdAt": "ISO date",
      "lastLoginAt": "ISO date"
    }
  ],
  "pagination": "object"
}
```

---

## Delivery Agent Endpoints

### Delivery Dashboard Stats

**GET** `/delivery-agent/dashboard/stats`

Get delivery agent dashboard statistics.

**Required Role**: `DELIVERY_AGENT` or `ADMIN`

#### Response (200 OK)
```json
{
  "stats": {
    "totalShipments": "number",
    "completedDeliveries": "number",
    "pendingPickups": "number",
    "todayDeliveries": "number",
    "totalEarnings": "number",
    "monthlyEarnings": "number",
    "averageDeliveryTime": "number",
    "successRate": "number"
  },
  "activeShipments": "array",
  "todaySchedule": "array",
  "performanceChart": "array"
}
```

---

### Get Assigned Shipments

**GET** `/delivery-agent/shipments`

Get assigned shipments for delivery agent.

**Required Role**: `DELIVERY_AGENT` or `ADMIN`

#### Query Parameters
- `status`: Filter by shipment status
- `date`: Filter by date
- `limit`: Number of results

#### Response (200 OK)
```json
{
  "shipments": [
    {
      "id": "string",
      "orderId": "string",
      "status": "string",
      "pickupAddress": "object",
      "deliveryAddress": "object",
      "scheduledAt": "ISO date",
      "estimatedDelivery": "ISO date",
      "packageDetails": "object"
    }
  ]
}
```

---

## Realtor Endpoints

### Realtor Dashboard Stats

**GET** `/realtor/dashboard/stats`

Get realtor dashboard statistics.

**Required Role**: `REALTOR` or `ADMIN`

#### Response (200 OK)
```json
{
  "stats": {
    "totalProperties": "number",
    "availableProperties": "number",
    "soldProperties": "number",
    "rentedProperties": "number",
    "totalViewings": "number",
    "pendingViewings": "number",
    "totalPropertyValue": "number",
    "avgPropertyValue": "number"
  },
  "recentProperties": "array",
  "upcomingViewings": "array",
  "monthlyStats": "array"
}
```

---

### Get Realtor Properties

**GET** `/realtor/properties`

Get paginated list of realtor's properties.

**Required Role**: `REALTOR` or `ADMIN`

#### Query Parameters
- `page`: Page number
- `limit`: Items per page
- `type`: Property type (`FOR_SALE`, `FOR_RENT`)
- `status`: Property status
- `search`: Search term

#### Response (200 OK)
```json
{
  "properties": [
    {
      "id": "string",
      "title": "string",
      "description": "string",
      "type": "string",
      "propertyType": "string",
      "price": "number",
      "address": "object",
      "features": "object",
      "images": "array",
      "status": "string",
      "createdAt": "ISO date"
    }
  ],
  "pagination": "object"
}
```

---

### Create Property

**POST** `/realtor/properties`

Create a new property listing.

**Required Role**: `REALTOR`

#### Request Body
```json
{
  "title": "string (required, 5-200 chars)",
  "description": "string (required, 20-5000 chars)",
  "type": "FOR_SALE | FOR_RENT (required)",
  "propertyType": "HOUSE | APARTMENT | CONDO | LAND | COMMERCIAL (required)",
  "price": "number (required, positive)",
  "address": {
    "street": "string (required)",
    "city": "string (required)",
    "state": "string (required)",
    "zipCode": "string (required)",
    "country": "string (required)",
    "coordinates": {
      "lat": "number (optional, -90 to 90)",
      "lng": "number (optional, -180 to 180)"
    }
  },
  "features": {
    "bedrooms": "number (optional, non-negative)",
    "bathrooms": "number (optional, non-negative)",
    "area": "number (optional, positive)",
    "yearBuilt": "number (optional, 1800-current year)",
    "parking": "number (optional, non-negative)",
    "furnished": "boolean (optional)"
  },
  "amenities": "array of strings (optional, max 50 items)"
}
```

#### Response (201 Created)
```json
{
  "success": true,
  "property": {
    "id": "string",
    "title": "string",
    "type": "string",
    "price": "number",
    "status": "DRAFT",
    "realtorId": "string",
    "createdAt": "ISO date"
  }
}
```

---

## Public Endpoints

### Get Products

**GET** `/products`

Get paginated list of active products (public access).

#### Query Parameters
- `page`: Page number
- `limit`: Items per page
- `search`: Search term
- `category`: Filter by category
- `minPrice`: Minimum price filter
- `maxPrice`: Maximum price filter
- `sortBy`: Sort field

#### Response (200 OK)
```json
{
  "products": "array",
  "pagination": "object",
  "filters": {
    "categories": "array",
    "priceRange": {
      "min": "number",
      "max": "number"
    }
  }
}
```

---

### Get Properties

**GET** `/properties`

Get paginated list of available properties (public access).

#### Query Parameters
- `page`: Page number
- `limit`: Items per page
- `type`: Property type filter
- `location`: Location filter
- `minPrice`: Minimum price filter
- `maxPrice`: Maximum price filter

#### Response (200 OK)
```json
{
  "properties": "array",
  "pagination": "object",
  "filters": "object"
}
```

---

## WebSocket Events

The platform supports real-time communication via WebSocket connections.

### Connection

Connect to WebSocket endpoint with authentication:

```javascript
const socket = io('wss://your-domain.com', {
  auth: {
    token: 'your-jwt-token'
  }
});
```

### Events

#### Order Status Updates
```javascript
// Listen for order status changes
socket.on('order-status-update', (data) => {
  console.log('Order status updated:', data);
});

// Send order status update (sellers, delivery agents, admins)
socket.emit('order-status-update', {
  orderId: 'string',
  status: 'string',
  message: 'string'
});
```

#### Real-time Chat
```javascript
// Listen for chat messages
socket.on('chat-message', (data) => {
  console.log('New message:', data);
});

// Send chat message
socket.emit('chat-message', {
  recipientId: 'string',
  message: 'string',
  orderId: 'string' // optional
});
```

#### Location Updates (Delivery Agents)
```javascript
// Send location update
socket.emit('location-update', {
  lat: 'number',
  lng: 'number',
  orderId: 'string' // optional
});

// Listen for delivery location updates
socket.on('delivery-location-update', (data) => {
  console.log('Delivery location:', data);
});
```

#### Notifications
```javascript
// Listen for general notifications
socket.on('notification', (data) => {
  console.log('Notification:', data);
});

// Listen for admin notifications
socket.on('admin-notification', (data) => {
  console.log('Admin notification:', data);
});
```

---

## Webhooks

The platform supports webhooks for external integrations.

### Payment Webhooks

**POST** `/webhooks/payment`

Receive payment status updates from payment providers.

#### Headers
```
Content-Type: application/json
X-Webhook-Signature: HMAC signature
```

### Order Webhooks

**POST** `/webhooks/order`

External order notifications.

---

## Development & Testing

### Testing Environment

Use the following base URL for testing:
```
http://localhost:3000/api
```

### Test Accounts

Development environment includes pre-created test accounts:

- **Admin**: `admin@test.com` / `TestPassword123!`
- **Seller**: `seller@test.com` / `TestPassword123!`
- **Buyer**: `buyer@test.com` / `TestPassword123!`
- **Delivery Agent**: `delivery@test.com` / `TestPassword123!`
- **Realtor**: `realtor@test.com` / `TestPassword123!`

### API Testing

Use tools like Postman, Insomnia, or cURL to test API endpoints:

```bash
# Register a new user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "email": "test@example.com",
    "password": "TestPassword123!",
    "role": "BUYER"
  }'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123!"
  }'

# Access protected route
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Security Considerations

### Input Validation
- All inputs are validated using Zod schemas
- HTML content is sanitized to prevent XSS
- SQL injection protection via Prisma ORM

### Authentication Security
- JWT tokens have configurable expiration
- Passwords are hashed using bcrypt
- Rate limiting prevents brute force attacks

### HTTPS Required
- All production traffic must use HTTPS
- Secure cookie settings in production
- CORS properly configured

### Data Privacy
- User passwords are never returned in responses
- Sensitive data is filtered based on user roles
- Admin access is logged and audited

---

This documentation covers the core functionality of the multi-vendor marketplace API. For additional details or specific use cases, please refer to the individual endpoint documentation or contact the development team.