# Online Municipal Tax Collection Portal

A comprehensive full-stack MERN application for managing municipal taxes, properties, payments, and civic services like water connections, building plans, and complaints.

:# ✅️ Tech Stack

- **Frontend**: React.js + Redux Toolkit + React Query + Tailwind CSS (Space Grotesk typography & Glassmorphism UI)
- **Backend**: Node.js + Express.js
- **Database**: MongoDB (Mongoose)
- **Authentication**: JWT (Access + Refresh Tokens)
- **Payments**: Stripe & Razorpay Integration
- **Real-time**: Socket.io
- **File Storage**: Cloudinary (Free Tier)
- **Email**: Nodemailer

## ß Project Structure

```text
portal/
├── backend/              # Express.js API server
∂   ├┐ src/
∂   │   ├┐ config/      # Configuration files
"��   │   ├┐ controllers/ # Route controllers
∂   │   ├─ services/    # Business logic (Taxes, Properties, Bills, Water, etc.)
∂   │   ├┐ routes/      # API routes
∂   │   ├┐ models/      # Mongoose models
∂   │   ├─ middleware, # Custom middleware
∂   │   ├─ utils/       # Utility functions
∂   │   ├┐ sockets/     # Socket.io handlers
∂   │   └─ app.js       # Express app
∂   ├┐ server.js        # Server entry point
∂   └┐ package.json
∂
└─ frontend/            # React.js application
    ├─ src/
    ∂   ├─ api/        # API client
    ∂   ├─ app/        # Redux store
    ∂   ├┐ components/ # Reusable components
    ∂   ├┐ features/   # Feature slices
    ∂   ├─ pages/      # Page components (Auth, Dashboard, Tax, Properties, Admin, etc.)
    ∂   ├┐ layouts/    # Layout components
    ∂   └─ main.jsx    # App entry point
    8�'8�  tailwind.config.js
    8�%8�  package.json
```

## 🍣️ Quick Start

### Local Development
See **[SETUP.md](SETUP.md)** for detailed local development instructions.

``bbash
# Backend
cd backend
npm install
cp .env.example .env  # Configure your environment (MongoDB, Stripe, Cloudinary)
npm run dev

# Frontend (new terminal)
cd frontend
npm install
cp .env.example .env  # Configure your environment
npm run dev
```

## 📚 Features

### Implemented ✌
- ✌ **Secure Authentication:** Multi-role access (Taxpayer, Admin, Tax Officer) with JWT.
- ✌ **Property Management:** Add properties, document upload, and administrative verification.
- ✌ **Tax Calculation Engine:** Automated calculations for property tax based on dimensions, usage, and local rules.
- ✌ **Payments Integration:** End-to-end payment processing with Stripe and Razorpay, including webhook verifications.
- ✌ **Municipal Services:** Modules for Water Connections, Building Plans, and Utility Bills.
- ✌ **Grievance Redressal:** File and track complaints.
- ✌ **Defaulter Management:** Automated generation of tax defaulter lists and penalty calculations.
- ✌ **Real-time Notifications:** Socket.io powered alerts for payment updates, verifications, and deadlines.
- ✌ **Document Storage:** Cloudinary integration for scalable file uploads.
- ✌ **Audit Logging & Security:** Rate limiting and system audit trails.

### Frontend Capabilities �8
- ✌ Modern, aesthetic UI with Space Grotesk typography and Glassmorphism elements.
- ✌ Taxpayer Dashboard with visual analytics, pending tasks, and recent transactions.
- ✌ Admin Dashboard for overseeing operations, verifications, and defaulters.
- ✌ Dedicated pages for Property additions, Tax Calculations, Payments, and Documents.
- ✌ Redux / React Query state management for responsive data binding.

## 🗦 Roadmap

### Phase 1: Core Features (✌ Complete)
- Backend API with full civic features (Tax, Properties, Complaints, Water).
- Authentication & authorization.
- Dual Payment gateway processing (Stripe & Razorpay).

### Phase 2: Frontend Implementation (✌ Complete)
- Fully functional tax calculator and property association modules.
- Modernized layout, navigation, and auth pages.
- Admin verification portals.

### Phase 3: Advanced Features (Planned)
- Mobile app (React Native).
- Advanced Predictive Analytics & AI-powered tax suggestions.
- Export capabilities (Pdf,/Excel) for receipts and tax certificates.
- Multi-language support for regional accessibility.

## 🤓 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## 𓄄 License
MIT
