import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../features/auth/authSlice';
import { 
  HomeIcon, 
  CalculatorIcon, 
  CreditCardIcon, 
  DocumentTextIcon,
  UserIcon,
  ArrowRightOnRectangleIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

const MainLayout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  // Different navigation based on user role
  const isAdmin = user?.role === 'admin' || user?.role === 'tax_officer';
  
  const navigation = isAdmin
    ? [
        { name: 'Admin Dashboard', path: '/admin', icon: ChartBarIcon },
        { name: 'Profile', path: '/profile', icon: UserIcon },
      ]
    : [
        { name: 'Dashboard', path: '/dashboard', icon: HomeIcon },
        { name: 'Tax Calculator', path: '/tax-calculator', icon: CalculatorIcon },
        { name: 'Payments', path: '/payments', icon: CreditCardIcon },
        { name: 'Documents', path: '/documents', icon: DocumentTextIcon },
        { name: 'Profile', path: '/profile', icon: UserIcon },
      ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-primary-600">ITMS</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                {user?.profile?.firstName} {user?.profile?.lastName}
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center text-gray-700 hover:text-primary-600 transition-colors"
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-6">
          {/* Sidebar */}
          <aside className="w-64 bg-white rounded-lg shadow-md p-4">
            <nav className="space-y-2">
              {navigation.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-primary-50 text-primary-600'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`
                  }
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </NavLink>
              ))}
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
