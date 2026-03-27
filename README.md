# Integrated Tax Management System (ITMS)

A comprehensive full-stack MERN application for managing taxes, payments, compliance, and analytics.

## 🚀 Tech Stack

- **Frontend**: React.js + Redux Toolkit + React Query + Tailwind CSS
- **Backend**: Node.js + Express.js
- **Database**: MongoDB (Mongoose)
- **Authentication**: JWT (Access + Refresh Tokens)
- **Payments**: Razorpay (Primary), Stripe (Optional)
- **Real-time**: Socket.io
- **File Storage**: Cloudinary (Free Tier)
- **Email**: Nodemailer

## 📁 Project Structure

```
itms/
├── backend/              # Express.js API server
│   ├── src/
│   │   ├── config/      # Configuration files
│   │   ├── controllers/ # Route controllers
│   │   ├── services/    # Business logic
│   │   ├── routes/      # API routes
│   │   ├── models/      # Mongoose models
│   │   ├── middleware/  # Custom middleware
│   │   ├── utils/       # Utility functions
│   │   ├── sockets/     # Socket.io handlers
│   │   └── app.js       # Express app
│   ├── server.js        # Server entry point
│   ├── .env.example     # Environment variables template
│   └── package.json
│
└── frontend/            # React.js application
    ├── src/
    │   ├── api/        # API client
    │   ├── app/        # Redux store
    │   ├── components/ # Reusable components
    │   ├── features/   # Feature slices
    │   ├── pages/      # Page components
    │   ├── hooks/      # Custom hooks
    │   ├── layouts/    # Layout components
    │   ├── utils/      # Utility functions
    │   └── main.jsx    # App entry point
    ├── tailwind.config.js
    └── package.json
```

## 🛠️ Quick Start

### Local Development
See **[SETUP.md](SETUP.md)** for detailed local development instructions.

```bash
# Backend
cd backend
npm install
cp .env.example .env  # Configure your environment
npm run dev

# Frontend (new terminal)
cd frontend
npm install
cp .env.example .env  # Configure your environment
npm run dev
```

### Deployment (FREE Platforms)
See **[DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)** for complete deployment instructions using:
- **MongoDB Atlas** (Database - FREE)
- **Cloudinary** (File Storage - FREE)
- **Render** or **Railway** (Backend - FREE)
- **Vercel** or **Netlify** (Frontend - FREE)

**Total Cost: ₹0** 🎉

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v16+)
- MongoDB (local or Atlas)
- Razorpay account (for payments)
- Cloudinary account (for file storage)

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your credentials
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

## 🌐 FREE Deployment Options

### Backend Deployment (Choose one)

1. **Render** (Recommended)
   - Free tier: 750 hours/month
   - Auto-deploy from GitHub
   - Built-in environment variables
   - URL: https://render.com

2. **Railway**
   - $5 free credit monthly
   - Easy deployment
   - URL: https://railway.app

3. **Fly.io**
   - Free tier available
   - Global distribution
   - URL: https://fly.io

### Frontend Deployment (Choose one)

1. **Vercel** (Recommended)
   - Unlimited deployments
   - Auto-deploy from GitHub
   - Custom domains
   - URL: https://vercel.com

2. **Netlify**
   - 100GB bandwidth/month
   - Continuous deployment
   - URL: https://netlify.com

### Database

- **MongoDB Atlas** (Free Tier)
  - 512MB storage
  - Shared cluster
  - URL: https://www.mongodb.com/cloud/atlas

### File Storage

- **Cloudinary** (Free Tier)
  - 25 GB storage
  - 25 GB bandwidth/month
  - Image/video transformations
  - URL: https://cloudinary.com

## � Documentation

- **[SETUP.md](SETUP.md)** - Complete local development setup guide
- **[DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)** - FREE deployment instructions (Render, Vercel, MongoDB Atlas)
- **[API_REFERENCE.md](API_REFERENCE.md)** - Complete API documentation with examples

## 🔐 Environment Variables

See `.env.example` files in backend and frontend directories, or refer to [SETUP.md](SETUP.md) for detailed configuration.

## 📚 Features

### Implemented ✅
- ✅ Multi-role authentication (Taxpayer, Admin, Tax Officer)
- ✅ JWT with access & refresh tokens
- ✅ Tax calculation engine (Income, GST, Property, Corporate)
- ✅ Razorpay payment integration with verification
- ✅ Cloudinary file storage (FREE 25GB)
- ✅ Real-time notifications (Socket.io)
- ✅ Email service (Nodemailer)
- ✅ Audit logging system
- ✅ Rate limiting & security middleware
- ✅ Dashboard with analytics
- ✅ Document upload & verification
- ✅ Transaction history & receipts

### Frontend Status 🎨
- ✅ Authentication pages (Login, Register)
- ✅ Dashboard with data visualization
- ✅ Protected routes
- ✅ Redux state management
- ✅ API client with auto token refresh
- ⚠️ Tax calculator UI (placeholder - needs forms)
- ⚠️ Payment UI (placeholder - needs Razorpay integration)
- ⚠️ Document upload UI (placeholder - needs file upload component)
- ⚠️ Admin dashboard (placeholder - needs charts)

## 🎯 Getting Started

### 1. Local Development
```bash
# See SETUP.md for detailed instructions
cd backend && npm install && npm run dev
cd frontend && npm install && npm run dev
```

### 2. Deploy to Production (FREE)
```bash
# See DEPLOYMENT_GUIDE.md for step-by-step guide
# Platforms: MongoDB Atlas + Cloudinary + Render + Vercel = ₹0
```

### 3. Test the Application
```bash
# Use Razorpay test cards
# See API_REFERENCE.md for all endpoints
```

## 🧪 API Testing

See [API_REFERENCE.md](API_REFERENCE.md) for complete API documentation with examples.

**Quick Test:**
```bash
# Register user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","password":"Test@123","role":"taxpayer","pan":"ABCDE1234F"}'
```

## 🚧 Roadmap

### Phase 1: Core Features (✅ Complete)
- Backend API with all features
- Authentication & authorization
- Payment processing
- Tax calculations
- File storage

### Phase 2: Frontend Enhancement (⚠️ In Progress)
- Complete tax calculator forms
- Razorpay payment UI
- File upload components
- Admin analytics charts

### Phase 3: Advanced Features (Planned)
- Mobile app (React Native)
- Advanced analytics & reporting
- AI-powered tax suggestions
- Multi-language support
- Export to PDF/Excel

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Open pull request

## 📄 License

MIT

## 👨‍💻 Author

Built as a comprehensive MERN stack demonstration for real-world tax management.

## 📞 Support

- Check [SETUP.md](SETUP.md) for local development issues
- Check [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for deployment issues
- Check [API_REFERENCE.md](API_REFERENCE.md) for API usage

---

**⭐ Star this repo if you find it helpful!**
