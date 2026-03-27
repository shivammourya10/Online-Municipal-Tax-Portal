import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../features/auth/authSlice';
import { 
  HomeIcon, 
  CalculatorIcon, 
  CreditCardIcon, 
  DocumentTextIcon,
  BuildingOfficeIcon,
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
        { name: 'Add Property', path: '/tax-calculator', icon: BuildingOfficeIcon },
        { name: 'Tax Calculator', path: '/tax-calculator', icon: CalculatorIcon },
        { name: 'Payments', path: '/payments', icon: CreditCardIcon },
        { name: 'Documents', path: '/documents', icon: DocumentTextIcon },
        { name: 'Profile', path: '/profile', icon: UserIcon },
      ];

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-primary-200 blur-3xl opacity-60" />
        <div className="absolute right-[-10%] top-10 h-96 w-96 rounded-full bg-teal-200 blur-3xl opacity-60" />
        <div className="absolute left-1/3 bottom-[-20%] h-80 w-80 rounded-full bg-indigo-100 blur-3xl opacity-70" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <header className="bg-white/80 border border-white/60 backdrop-blur-xl shadow-xl shadow-primary-100/60 rounded-2xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary-500 via-primary-600 to-indigo-600 text-white flex items-center justify-center shadow-lg">
              <span className="text-lg font-bold">IT</span>
            </div>
            <div>
              <p className="text-sm text-slate-500">Online Municipal Tax Collection Portal</p>
              <h1 className="text-2xl font-bold text-slate-900">Online Municipal Tax Collection Portal</h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs text-slate-500">Signed in as</span>
              <span className="text-sm font-semibold text-slate-900">{user?.profile?.firstName} {user?.profile?.lastName}</span>
            </div>
            <span className="px-3 py-1 rounded-full bg-primary-100 text-primary-700 text-xs font-semibold">
              {user?.role?.replace('_', ' ') || 'User'}
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-700 hover:text-primary-700 hover:bg-primary-50 transition"
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5" />
              <span className="hidden sm:inline font-semibold">Logout</span>
            </button>
          </div>
        </header>

        <div className="flex gap-6">
          {/* Sidebar */}
          <aside className="w-64 shrink-0 bg-white/75 border border-white/60 backdrop-blur-xl rounded-2xl shadow-xl shadow-primary-100/50 p-4">
            <nav className="space-y-2">
              {navigation.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-4 py-3 rounded-xl border transition ${
                      isActive
                        ? 'bg-gradient-to-r from-primary-50 to-white text-primary-700 border-primary-100 shadow-md'
                        : 'text-slate-700 hover:bg-white/70 border-transparent'
                    }`
                  }
                >
                  <item.icon className="h-5 w-5" />
                  <span className="font-semibold">{item.name}</span>
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
