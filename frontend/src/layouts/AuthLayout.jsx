import { Outlet } from 'react-router-dom';

const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary-600">ITMS</h1>
          <p className="mt-2 text-gray-600">Integrated Tax Management System</p>
        </div>
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;
