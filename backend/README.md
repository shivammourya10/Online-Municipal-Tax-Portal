# ITMS Backend API

Backend API server for the Integrated Tax Management System built with Node.js, Express, and MongoDB.

## 🚀 Tech Stack

- **Runtime**: Node.js (v16+)
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (Access + Refresh Tokens)
- **Payment Gateways**: Razorpay (Primary), Stripe (Optional)
- **Real-time Communication**: Socket.io
- **File Storage**: Cloudinary
- **Email**: Nodemailer
- **Validation**: Joi + express-validator
- **Security**: Helmet, XSS Clean, Rate Limiting
- **Logging**: Winston

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/              # Configuration files
│   │   ├── cloudinary.js    # Cloudinary setup
│   │   ├── database.js      # MongoDB connection
│   │   ├── email.js         # Email transporter
│   │   ├── razorpay.js      # Razorpay client
│   │   └── stripe.js        # Stripe client
│   │
│   ├── controllers/         # Route handlers
│   │   ├── authController.js
│   │   ├── dashboardController.js
│   │   ├── documentController.js
│   │   ├── notificationController.js
│   │   ├── paymentController.js
│   │   ├── propertyController.js
│   │   ├── taxController.js
│   │   ├── taxProfileController.js
│   │   └── webhookController.js
│   │
│   ├── services/            # Business logic layer
│   │   ├── authService.js
│   │   ├── dashboardService.js
│   │   ├── documentService.js
│   │   ├── notificationService.js
│   │   ├── paymentService.js
│   │   ├── propertyService.js
│   │   ├── taxProfileService.js
│   │   └── taxService.js
│   │
│   ├── models/              # Mongoose schemas
│   │   ├── AuditLog.js
│   │   ├── Document.js
│   │   ├── Notification.js
│   │   ├── Property.js
│   │   ├── TaxCalculation.js
│   │   ├── TaxProfile.js
│   │   ├── TaxRule.js
│   │   ├── Transaction.js
│   │   └── User.js
│   │
│   ├── routes/              # API routes
│   │   ├── authRoutes.js
│   │   ├── dashboardRoutes.js
│   │   ├── documentRoutes.js
│   │   ├── notificationRoutes.js
│   │   ├── paymentRoutes.js
│   │   ├── propertyRoutes.js
│   │   ├── taxProfileRoutes.js
│   │   ├── taxRoutes.js
│   │   └── webhookRoutes.js
│   │
│   ├── middleware/          # Custom middleware
│   │   ├── auth.js          # JWT authentication
│   │   ├── audit.js         # Audit logging
│   │   ├── error.js         # Error handling
│   │   ├── rateLimiter.js   # Rate limiting
│   │   └── validate.js      # Request validation
│   │
│   ├── utils/               # Utility functions
│   │   ├── email.js         # Email templates & sending
│   │   ├── jwt.js           # JWT helpers
│   │   ├── logger.js        # Winston logger
│   │   ├── payment.js       # Payment utilities
│   │   ├── response.js      # Response formatter
│   │   └── taxCalculator.js # Tax calculation logic
│   │
│   ├── sockets/             # Socket.io handlers
│   │   └── index.js         # Real-time notifications
│   │
│   └── app.js               # Express app configuration
│
├── scripts/                 # Utility scripts
│   ├── createAdmin.js       # Create admin user
│   └── seedTaxRules.js      # Seed tax rules
│
├── logs/                    # Application logs
├── server.js                # Entry point
├── package.json
└── .env.example             # Environment variables template
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- Razorpay account
- Cloudinary account
- SMTP credentials (for email)

### Installation

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Edit .env with your credentials
nano .env
```

### Environment Variables

Create a `.env` file with the following variables:

```env
# Server
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/itms
# Or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/itms

# JWT
JWT_ACCESS_SECRET=your_access_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Client URL
CLIENT_URL=http://localhost:5173

# Razorpay (Primary Payment Gateway)
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Stripe (Optional Payment Gateway)
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# Cloudinary (File Storage)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email (Nodemailer)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
EMAIL_FROM=noreply@itms.com
```

### Running the Server

```bash
# Development mode (with nodemon)
npm run dev

# Production mode
npm start

# Run tests
npm test
```

The server will start at `http://localhost:5000`

## 📝 Available Scripts

### `npm run dev`
Starts the development server with nodemon (auto-restart on changes)

### `npm start`
Starts the production server

### `npm test`
Runs the test suite with Jest

### Admin Script
```bash
# Create an admin user
node scripts/createAdmin.js
```

### Seed Script
```bash
# Seed tax rules database
node scripts/seedTaxRules.js
```

## 🔐 Authentication

The API uses JWT-based authentication with access and refresh tokens:

- **Access Token**: Short-lived (15 minutes), sent in Authorization header
- **Refresh Token**: Long-lived (7 days), stored in httpOnly cookie

### User Roles
- `taxpayer` - Regular users who file taxes
- `officer` - Tax officers who review documents
- `admin` - Full system access

## 🌐 API Endpoints

### Authentication (`/api/auth`)
- `POST /register` - Register new user
- `POST /login` - Login user
- `POST /logout` - Logout user
- `POST /refresh` - Refresh access token
- `GET /me` - Get current user
- `PUT /profile` - Update profile
- `PUT /change-password` - Change password

### Tax Management (`/api/tax`)
- `POST /calculate` - Calculate tax
- `GET /calculations` - Get user's calculations
- `GET /calculations/:id` - Get specific calculation
- `POST /calculations/:id/pay` - Pay tax
- `GET /rules` - Get tax rules
- `POST /rules` - Create tax rule (Admin)

### Tax Profiles (`/api/tax-profiles`)
- `POST /` - Create tax profile
- `GET /` - Get user's profiles
- `GET /:id` - Get specific profile
- `PUT /:id` - Update profile
- `DELETE /:id` - Delete profile

### Properties (`/api/properties`)
- `POST /` - Add property
- `GET /` - Get user's properties
- `GET /:id` - Get specific property
- `PUT /:id` - Update property
- `DELETE /:id` - Delete property

### Payments (`/api/payments`)
- `POST /create-order` - Create payment order
- `POST /verify` - Verify payment
- `GET /transactions` - Get transactions
- `GET /transactions/:id` - Get transaction details

### Documents (`/api/documents`)
- `POST /upload` - Upload document
- `GET /` - Get user's documents
- `GET /:id` - Get document details
- `PUT /:id/verify` - Verify document (Officer)
- `DELETE /:id` - Delete document

### Notifications (`/api/notifications`)
- `GET /` - Get user's notifications
- `PUT /:id/read` - Mark as read
- `PUT /read-all` - Mark all as read
- `DELETE /:id` - Delete notification

### Dashboard (`/api/dashboard`)
- `GET /stats` - Get dashboard statistics
- `GET /recent-activities` - Recent activities
- `GET /analytics` - Tax analytics data
- `GET /admin/stats` - Admin statistics
- `GET /admin/users` - All users (Admin)
- `GET /admin/audit-logs` - Audit logs (Admin)

### Webhooks (`/api/webhooks`)
- `POST /razorpay` - Razorpay webhook
- `POST /stripe` - Stripe webhook

## 🔒 Security Features

### Implemented Security Measures
- **Helmet.js**: HTTP headers security
- **XSS Protection**: XSS-clean middleware
- **Rate Limiting**: Prevents brute force attacks
- **CORS**: Configured for frontend origin
- **Input Validation**: Joi/express-validator
- **Password Hashing**: bcryptjs with salt rounds
- **JWT Security**: httpOnly cookies for refresh tokens
- **Audit Logging**: Track all sensitive operations
- **Environment Variables**: Secure configuration

### Rate Limits
- Auth endpoints: 5 requests/15 minutes
- API endpoints: 100 requests/15 minutes
- Payment endpoints: 10 requests/15 minutes

## 💳 Payment Integration

### Razorpay (Primary)
```javascript
// Create order
POST /api/payments/create-order
{
  "amount": 50000,
  "taxCalculationId": "calc_id"
}

// Verify payment
POST /api/payments/verify
{
  "razorpay_order_id": "order_xyz",
  "razorpay_payment_id": "pay_xyz",
  "razorpay_signature": "signature_xyz",
  "taxCalculationId": "calc_id"
}
```

### Stripe (Optional)
Similar flow with Stripe payment intents.

## 📧 Email Templates

The system sends emails for:
- Welcome emails
- Password reset
- Tax calculation complete
- Payment confirmation
- Document verification
- System notifications

Email templates are in `src/utils/email.js`

## 🔄 Real-time Features

Socket.io is used for:
- Real-time notifications
- Payment status updates
- Document verification updates

Connect to: `http://localhost:5000`
```javascript
socket.on('notification', (data) => {
  // Handle notification
});
```

## 📊 Logging

Winston logger is configured with:
- Console transport (development)
- File transports (error.log, combined.log)
- Custom format with timestamps
- Error stack traces

Logs are stored in `/logs` directory.

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run with coverage
npm test -- --coverage
```

Test files should be named `*.test.js` or `*.spec.js`

## 🐛 Error Handling

Centralized error handling with custom error classes:
- `ValidationError` - 400
- `AuthenticationError` - 401
- `AuthorizationError` - 403
- `NotFoundError` - 404
- `ConflictError` - 409
- `ServerError` - 500

All errors return consistent JSON:
```json
{
  "success": false,
  "message": "Error message",
  "errors": []
}
```

## 🔧 Debugging

Enable debug mode:
```bash
DEBUG=app:* npm run dev
```

Use Winston logger:
```javascript
import logger from './utils/logger.js';
logger.info('Info message');
logger.error('Error message', error);
```

## 🚀 Deployment

### Environment Setup
1. Set `NODE_ENV=production`
2. Use production MongoDB URI
3. Set secure JWT secrets
4. Configure production email
5. Use production payment keys

### Recommended Platforms
- **Render** (Free tier)
- **Railway** ($5 credit/month)
- **Fly.io** (Free tier)
- **Heroku** (Paid)

### Pre-deployment Checklist
- [ ] Environment variables configured
- [ ] MongoDB Atlas connected
- [ ] Cloudinary configured
- [ ] Payment gateway keys (production)
- [ ] Email service configured
- [ ] CORS origins updated
- [ ] Rate limits configured
- [ ] Logs directory exists

## 📚 Best Practices

### Code Organization
- Controllers handle HTTP requests/responses
- Services contain business logic
- Models define data schemas
- Middleware for cross-cutting concerns
- Utils for reusable functions

### Database Queries
- Use indexes for frequently queried fields
- Implement pagination for large datasets
- Use `lean()` for read-only queries
- Populate selectively

### Error Handling
- Always use try-catch in async functions
- Throw custom errors with meaningful messages
- Log errors with context
- Return consistent error responses

### Security
- Validate all inputs
- Sanitize user data
- Use parameterized queries
- Keep dependencies updated
- Review audit logs regularly

## 🤝 Contributing

1. Create feature branch: `git checkout -b feature/new-feature`
2. Follow existing code style
3. Write tests for new features
4. Update documentation
5. Submit pull request

## 📄 License

MIT

## 📞 Support

For issues and questions:
- Check the main [README.md](../README.md)
- Review API documentation
- Check error logs in `/logs`
- Use debug mode for troubleshooting
