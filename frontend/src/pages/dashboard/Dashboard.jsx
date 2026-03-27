import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { dashboardAPI, paymentAPI } from '../../api/client';
import { CurrencyRupeeIcon, DocumentTextIcon, BellIcon, CalendarIcon } from '@heroicons/react/24/outline';
import LoadingSpinner from '../../components/LoadingSpinner';

const Dashboard = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['taxpayer-dashboard'],
    queryFn: dashboardAPI.getTaxpayer,
  });

  const { data: transactions } = useQuery({
    queryKey: ['recent-transactions'],
    queryFn: () => paymentAPI.getTransactions({ limit: 5 }),
  });

  if (isLoading) return <LoadingSpinner />;

  const dashboard = data?.data || {};

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">Welcome back, {dashboard.user?.name}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Tax Liability</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                ₹{dashboard.taxLiability?.total?.toLocaleString('en-IN') || 0}
              </p>
            </div>
            <div className="p-3 bg-primary-50 rounded-full">
              <CurrencyRupeeIcon className="h-6 w-6 text-primary-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Paid</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                ₹{dashboard.taxLiability?.paid?.toLocaleString('en-IN') || 0}
              </p>
            </div>
            <div className="p-3 bg-green-50 rounded-full">
              <CurrencyRupeeIcon className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-orange-600 mt-1">
                ₹{dashboard.taxLiability?.pending?.toLocaleString('en-IN') || 0}
              </p>
            </div>
            <div className="p-3 bg-orange-50 rounded-full">
              <CurrencyRupeeIcon className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Recent Transactions</h3>
          <div className="space-y-3">
            {dashboard.recentTransactions?.slice(0, 5).map((txn) => (
              <div key={txn._id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{txn.type.replace('_', ' ').toUpperCase()}</p>
                  <p className="text-sm text-gray-600">{new Date(txn.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">₹{txn.amount.toLocaleString('en-IN')}</p>
                  <span className={`badge ${
                    txn.status === 'success' ? 'badge-success' :
                    txn.status === 'pending' ? 'badge-warning' : 'badge-danger'
                  }`}>
                    {txn.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Deadlines */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Upcoming Deadlines</h3>
          <div className="space-y-3">
            {dashboard.upcomingDeadlines?.map((deadline, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
                <CalendarIcon className="h-5 w-5 text-yellow-600 mt-1" />
                <div>
                  <p className="font-medium text-gray-900">{deadline.title}</p>
                  <p className="text-sm text-gray-600">{deadline.description}</p>
                  <p className="text-sm font-medium text-yellow-700 mt-1">
                    Due: {new Date(deadline.dueDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Compliance Status */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Compliance Status</h3>
        <div className="flex items-center space-x-3">
          <div className={`w-4 h-4 rounded-full ${dashboard.compliance?.isCompliant ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className={`font-medium ${dashboard.compliance?.isCompliant ? 'text-green-700' : 'text-red-700'}`}>
            {dashboard.compliance?.isCompliant ? 'Compliant' : 'Non-Compliant'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
