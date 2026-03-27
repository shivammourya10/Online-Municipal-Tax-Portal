import { Outlet } from 'react-router-dom';

const AuthLayout = () => {
  return (
    <div className="relative min-h-screen overflow-hidden flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-20 -top-24 h-80 w-80 rounded-full bg-primary-200 blur-3xl opacity-60" />
        <div className="absolute right-[-10%] top-32 h-96 w-96 rounded-full bg-indigo-200 blur-3xl opacity-60" />
        <div className="absolute left-1/3 bottom-[-25%] h-96 w-96 rounded-full bg-teal-200 blur-3xl opacity-60" />
      </div>

      <div className="relative z-10 max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 via-primary-600 to-indigo-600 text-white shadow-lg shadow-primary-200/60">
            <span className="text-xl font-bold">IT</span>
          </div>
          <h1 className="mt-4 text-4xl font-bold text-slate-900">Online Municipal Tax Collection Portal</h1>
          <p className="mt-2 text-slate-600">Online Municipal Tax Collection Portal</p>
        </div>

        <div className="card p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
