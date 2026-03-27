# ITMS Frontend

Frontend application for the Integrated Tax Management System built with React, Redux Toolkit, and Tailwind CSS.

## 🚀 Tech Stack

- **Framework**: React 18.2
- **Build Tool**: Vite 5.0
- **State Management**: Redux Toolkit + React Query
- **Routing**: React Router v6
- **Styling**: Tailwind CSS
- **UI Components**: Headless UI + Hero Icons
- **Form Handling**: Formik + Yup
- **Charts**: Chart.js + Recharts
- **HTTP Client**: Axios
- **Payment**: Razorpay + Stripe.js
- **Real-time**: Socket.io Client
- **Notifications**: React Hot Toast
- **Date Handling**: date-fns

## 📁 Project Structure

```
frontend/
├── src/
│   ├── api/                 # API client configuration
│   │   └── client.js        # Axios instance with interceptors
│   │
│   ├── app/                 # Redux store
│   │   └── store.js         # Store configuration
│   │
│   ├── components/          # Reusable components
│   │   ├── AdminRoute.jsx   # Admin route guard
│   │   ├── LoadingSpinner.jsx
│   │   └── PrivateRoute.jsx # Auth route guard
│   │
│   ├── features/            # Feature slices
│   │   ├── auth/
│   │   │   └── authSlice.js
│   │   ├── document/
│   │   │   └── documentSlice.js
│   │   ├── notification/
│   │   │   └── notificationSlice.js
│   │   ├── payment/
│   │   │   └── paymentSlice.js
│   │   ├── property/
│   │   │   └── propertySlice.js
│   │   └── tax/
│   │       └── taxSlice.js
│   │
│   ├── layouts/             # Layout components
│   │   ├── AuthLayout.jsx   # Layout for auth pages
│   │   └── MainLayout.jsx   # Layout for main app
│   │
│   ├── pages/               # Page components
│   │   ├── admin/
│   │   │   └── AdminDashboard.jsx
│   │   ├── auth/
│   │   │   ├── Login.jsx
│   │   │   └── Register.jsx
│   │   ├── dashboard/
│   │   │   └── Dashboard.jsx
│   │   ├── document/
│   │   │   └── Documents.jsx
│   │   ├── payment/
│   │   │   └── Payments.jsx
│   │   ├── profile/
│   │   │   └── Profile.jsx
│   │   ├── tax/
│   │   │   └── TaxCalculator.jsx
│   │   └── NotFound.jsx
│   │
│   ├── App.jsx              # Root component
│   ├── main.jsx             # Entry point
│   └── index.css            # Global styles
│
├── public/                  # Static assets
├── index.html               # HTML template
├── vite.config.js           # Vite configuration
├── tailwind.config.js       # Tailwind configuration
├── postcss.config.js        # PostCSS configuration
└── package.json
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Edit .env with your configuration
nano .env
```

### Environment Variables

Create a `.env` file in the frontend directory:

```env
# API URL
VITE_API_URL=http://localhost:5000/api

# Socket URL
VITE_SOCKET_URL=http://localhost:5000

# Payment Gateway Keys (Public Keys)
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
VITE_STRIPE_PUBLIC_KEY=your_stripe_public_key

# App Configuration
VITE_APP_NAME=ITMS
VITE_APP_VERSION=1.0.0
```

### Running the Application

```bash
# Development mode (with hot reload)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

The app will be available at `http://localhost:5173`

## 📝 Available Scripts

### `npm run dev`
Starts the development server with hot module replacement

### `npm run build`
Creates an optimized production build in the `/dist` directory

### `npm run preview`
Previews the production build locally

### `npm run lint`
Runs ESLint to check code quality

## 🎨 UI Components

### Layout Components

#### MainLayout
Main application layout with:
- Navigation sidebar
- Header with user menu
- Notification bell
- Main content area

#### AuthLayout
Layout for authentication pages:
- Centered forms
- Branding
- Background styling

### Route Guards

#### PrivateRoute
Protects routes that require authentication:
```jsx
<PrivateRoute>
  <Dashboard />
</PrivateRoute>
```

#### AdminRoute
Protects routes that require admin role:
```jsx
<AdminRoute>
  <AdminDashboard />
</AdminRoute>
```

### Reusable Components
- **LoadingSpinner**: Loading indicator
- **Button**: Styled button component
- **Card**: Content card component
- **Modal**: Dialog/modal component
- **Form Fields**: Input, Select, TextArea

## 🔐 Authentication Flow

### Login Process
1. User enters credentials
2. API call to `/api/auth/login`
3. Access token stored in Redux
4. Refresh token stored in httpOnly cookie
5. Redirect to dashboard

### Token Refresh
Automatic token refresh using Axios interceptors:
```javascript
// On 401 error
1. Call /api/auth/refresh
2. Get new access token
3. Retry original request
4. If refresh fails, logout user
```

### Protected Routes
```jsx
<Routes>
  <Route path="/login" element={<Login />} />
  <Route element={<PrivateRoute />}>
    <Route path="/dashboard" element={<Dashboard />} />
  </Route>
  <Route element={<AdminRoute />}>
    <Route path="/admin" element={<AdminDashboard />} />
  </Route>
</Routes>
```

## 🎯 Features by Page

### Dashboard (`/dashboard`)
- Overview statistics
- Recent transactions
- Tax summary
- Quick actions
- Charts and analytics

### Tax Calculator (`/tax/calculator`)
- Tax calculation form
- Income, GST, Property, Corporate tax types
- Real-time calculation
- Save calculations
- View history

### Payments (`/payments`)
- Payment history
- Transaction details
- Download receipts
- Payment status tracking
- Razorpay/Stripe integration

### Documents (`/documents`)
- Upload documents
- View uploaded documents
- Verification status
- Download documents
- Document categories

### Profile (`/profile`)
- Update personal information
- Change password
- Tax profile management
- Notification preferences
- PAN/Aadhaar details

### Admin Dashboard (`/admin`)
- User management
- System statistics
- Audit logs
- Tax rule management
- Document verification queue

## 🔌 State Management

### Redux Slices

#### authSlice
```javascript
- user: Current user data
- token: Access token
- isAuthenticated: Auth status
- loading: Loading state
```

#### taxSlice
```javascript
- calculations: Tax calculations list
- currentCalculation: Active calculation
- taxRules: Tax rules data
```

#### paymentSlice
```javascript
- transactions: Payment history
- currentOrder: Active payment order
```

#### documentSlice
```javascript
- documents: User documents
- uploadProgress: Upload status
```

#### notificationSlice
```javascript
- notifications: Notification list
- unreadCount: Unread count
```

## 💳 Payment Integration

### Razorpay Integration
```javascript
// Load Razorpay script
const loadRazorpay = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    document.body.appendChild(script);
  });
};

// Initialize payment
const options = {
  key: import.meta.env.VITE_RAZORPAY_KEY_ID,
  amount: order.amount,
  currency: 'INR',
  name: 'ITMS',
  description: 'Tax Payment',
  order_id: order.id,
  handler: async (response) => {
    // Verify payment
  }
};
```

### Stripe Integration
```javascript
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLIC_KEY
);
```

## 🔔 Real-time Notifications

### Socket.io Connection
```javascript
import io from 'socket.io-client';

const socket = io(import.meta.env.VITE_SOCKET_URL, {
  auth: {
    token: accessToken
  }
});

socket.on('notification', (notification) => {
  dispatch(addNotification(notification));
  toast.success(notification.message);
});
```

## 📊 Charts & Analytics

### Chart.js Usage
```javascript
import { Line, Bar, Pie } from 'react-chartjs-2';

<Line
  data={chartData}
  options={chartOptions}
/>
```

### Recharts Usage
```javascript
import { LineChart, Line, XAxis, YAxis } from 'recharts';

<LineChart data={data}>
  <Line type="monotone" dataKey="amount" />
</LineChart>
```

## 🎨 Styling

### Tailwind CSS
Utility-first CSS framework. Common patterns:

```jsx
// Layout
<div className="container mx-auto px-4">
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {/* Content */}
  </div>
</div>

// Card
<div className="bg-white rounded-lg shadow-md p-6">
  {/* Card content */}
</div>

// Button
<button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded">
  Click me
</button>
```

### Custom CSS
Global styles in `src/index.css`

### Theme Configuration
Customize in `tailwind.config.js`:
```javascript
theme: {
  extend: {
    colors: {
      primary: '#3B82F6',
      secondary: '#10B981',
    }
  }
}
```

## 📱 Responsive Design

Mobile-first approach using Tailwind breakpoints:
- `sm:` - 640px and up
- `md:` - 768px and up
- `lg:` - 1024px and up
- `xl:` - 1280px and up
- `2xl:` - 1536px and up

```jsx
<div className="text-sm md:text-base lg:text-lg">
  Responsive text
</div>
```

## 🧪 Testing

### Unit Testing
```bash
# Install testing libraries
npm install --save-dev @testing-library/react @testing-library/jest-dom vitest

# Run tests
npm test
```

### Component Testing
```javascript
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import Dashboard from './Dashboard';

test('renders dashboard', () => {
  render(
    <Provider store={store}>
      <Dashboard />
    </Provider>
  );
  expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
});
```

## 🚀 Deployment

### Build for Production
```bash
# Create optimized build
npm run build

# Output directory: /dist
```

### Environment Variables
Set production environment variables on your hosting platform.

### Recommended Platforms

#### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

#### Netlify
```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod
```

#### Build Settings
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Node Version**: 16+

### Pre-deployment Checklist
- [ ] Update API URL to production
- [ ] Set production payment keys
- [ ] Test all features
- [ ] Check responsive design
- [ ] Optimize images
- [ ] Enable HTTPS
- [ ] Configure CORS on backend

## 🔧 Development Tips

### VS Code Extensions
- ESLint
- Prettier
- Tailwind CSS IntelliSense
- ES7+ React/Redux snippets

### Code Snippets
```javascript
// React component
import React from 'react';

const Component = () => {
  return (
    <div>
      {/* Component content */}
    </div>
  );
};

export default Component;
```

### API Calls
```javascript
import apiClient from '../api/client';

// GET request
const fetchData = async () => {
  const response = await apiClient.get('/endpoint');
  return response.data;
};

// POST request
const postData = async (data) => {
  const response = await apiClient.post('/endpoint', data);
  return response.data;
};
```

### Redux Async Thunks
```javascript
import { createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../../api/client';

export const fetchUser = createAsyncThunk(
  'auth/fetchUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get('/auth/me');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);
```

## 🐛 Common Issues

### Port Already in Use
```bash
# Kill process on port 5173
lsof -ti:5173 | xargs kill -9
```

### Module Not Found
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Build Errors
```bash
# Clean build
rm -rf dist
npm run build
```

## 📚 Best Practices

### Component Structure
- Keep components small and focused
- Use functional components with hooks
- Extract reusable logic into custom hooks
- Implement proper prop validation

### State Management
- Use Redux for global state
- Use local state for component-specific data
- Use React Query for server state
- Avoid prop drilling

### Performance
- Use React.memo for expensive components
- Implement code splitting with lazy loading
- Optimize images and assets
- Use production build for deployment

### Code Quality
- Follow ESLint rules
- Write meaningful commit messages
- Add comments for complex logic
- Keep files under 300 lines

## 🤝 Contributing

1. Create feature branch: `git checkout -b feature/new-feature`
2. Follow React/Redux best practices
3. Use Tailwind CSS for styling
4. Test components thoroughly
5. Update documentation
6. Submit pull request

## 📄 License

MIT

## 📞 Support

For issues and questions:
- Check the main [README.md](../README.md)
- Review component documentation
- Check browser console for errors
- Use React DevTools for debugging
