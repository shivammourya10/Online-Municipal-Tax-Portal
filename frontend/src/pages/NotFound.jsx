import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 py-12">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-primary-200 blur-3xl opacity-60" />
        <div className="absolute right-[-10%] top-20 h-96 w-96 rounded-full bg-indigo-200 blur-3xl opacity-60" />
      </div>

      <div className="relative z-10 max-w-xl w-full text-center card">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 via-primary-600 to-indigo-600 text-white shadow-lg shadow-primary-200/60">
          <span className="text-2xl font-bold">404</span>
        </div>
        <h1 className="mt-4 text-3xl font-bold text-slate-900">Page Not Found</h1>
        <p className="mt-2 text-slate-600">Looks like this route is missing. Let&apos;s get you back on track.</p>
        <Link to="/dashboard" className="btn btn-primary mt-6 inline-flex">
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
