import React, { useState, useEffect } from 'react';
import apiClient from '../../../api/client';
import toast from 'react-hot-toast';

const TaxDefaulters = () => {
  const [defaulters, setDefaulters] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDefaulter, setSelectedDefaulter] = useState(null);
  const [showNoticeForm, setShowNoticeForm] = useState(false);
  const [showRecoveryForm, setShowRecoveryForm] = useState(false);
  const [showSettlementForm, setShowSettlementForm] = useState(false);
  const [noticeData, setNoticeData] = useState({
    noticeType: 'reminder',
    message: '',
  });
  const [recoveryData, setRecoveryData] = useState({
    actionType: 'disconnect_services',
    remarks: '',
  });
  const [settlementData, setSettlementData] = useState({
    waiverAmount: 0,
    waiverPercentage: 0,
    installments: {
      numberOfInstallments: 1,
      installmentAmount: 0,
      frequency: 'monthly',
    },
    conditions: '',
  });

  useEffect(() => {
    fetchDefaulters();
    fetchStatistics();
  }, []);

  const fetchDefaulters = async () => {
    try {
      const response = await apiClient.get('/tax-defaulters');
      setDefaulters(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch defaulters');
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await apiClient.get('/tax-defaulters/statistics');
      setStatistics(response.data.data);
    } catch (error) {
      console.error('Failed to fetch statistics');
    }
  };

  const handleIdentifyDefaulters = async () => {
    try {
      await apiClient.post('/tax-defaulters/identify');
      toast.success('Defaulters identified successfully');
      fetchDefaulters();
      fetchStatistics();
    } catch (error) {
      toast.error('Failed to identify defaulters');
    }
  };

  const handleSendNotice = async (e) => {
    e.preventDefault();
    try {
      await apiClient.post(`/tax-defaulters/${selectedDefaulter._id}/send-notice`, noticeData);
      toast.success('Notice sent successfully');
      setShowNoticeForm(false);
      fetchDefaulters();
    } catch (error) {
      toast.error('Failed to send notice');
    }
  };

  const handleTakeRecoveryAction = async (e) => {
    e.preventDefault();
    try {
      await apiClient.post(
        `/tax-defaulters/${selectedDefaulter._id}/recovery-action`,
        recoveryData
      );
      toast.success('Recovery action taken successfully');
      setShowRecoveryForm(false);
      fetchDefaulters();
    } catch (error) {
      toast.error('Failed to take recovery action');
    }
  };

  const handleOfferSettlement = async (e) => {
    e.preventDefault();
    try {
      await apiClient.post(
        `/tax-defaulters/${selectedDefaulter._id}/offer-settlement`,
        settlementData
      );
      toast.success('Settlement offer created successfully');
      setShowSettlementForm(false);
      fetchDefaulters();
    } catch (error) {
      toast.error('Failed to create settlement offer');
    }
  };

  const getRiskLevelColor = (level) => {
    const colors = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800',
    };
    return colors[level] || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'bg-red-100 text-red-800',
      notice_sent: 'bg-yellow-100 text-yellow-800',
      recovery_initiated: 'bg-orange-100 text-orange-800',
      legal_proceedings: 'bg-purple-100 text-purple-800',
      settled: 'bg-green-100 text-green-800',
      resolved: 'bg-blue-100 text-blue-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Tax Defaulter Management</h1>
        <button
          onClick={handleIdentifyDefaulters}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Identify New Defaulters
        </button>
      </div>

      {/* Statistics */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">Total Defaulters</div>
            <div className="text-2xl font-bold text-gray-900">{statistics.totalDefaulters}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">Total Outstanding</div>
            <div className="text-2xl font-bold text-red-600">₹{statistics.totalOutstanding}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">Active Cases</div>
            <div className="text-2xl font-bold text-orange-600">{statistics.activeDefaulters}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">Resolved Cases</div>
            <div className="text-2xl font-bold text-green-600">{statistics.resolvedDefaulters}</div>
          </div>
        </div>
      )}

      {/* Notice Form Modal */}
      {showNoticeForm && selectedDefaulter && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Send Notice</h2>
            <form onSubmit={handleSendNotice} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Notice Type</label>
                <select
                  value={noticeData.noticeType}
                  onChange={(e) => setNoticeData({ ...noticeData, noticeType: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="reminder">Reminder</option>
                  <option value="warning">Warning</option>
                  <option value="final_notice">Final Notice</option>
                  <option value="legal_notice">Legal Notice</option>
                  <option value="disconnection_notice">Disconnection Notice</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Message</label>
                <textarea
                  value={noticeData.message}
                  onChange={(e) => setNoticeData({ ...noticeData, message: e.target.value })}
                  rows="4"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowNoticeForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Send Notice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Recovery Action Form Modal */}
      {showRecoveryForm && selectedDefaulter && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Take Recovery Action</h2>
            <form onSubmit={handleTakeRecoveryAction} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Action Type</label>
                <select
                  value={recoveryData.actionType}
                  onChange={(e) => setRecoveryData({ ...recoveryData, actionType: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="disconnect_services">Disconnect Services</option>
                  <option value="seal_property">Seal Property</option>
                  <option value="property_attachment">Property Attachment</option>
                  <option value="auction">Auction</option>
                  <option value="legal_proceedings">Legal Proceedings</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Remarks</label>
                <textarea
                  value={recoveryData.remarks}
                  onChange={(e) => setRecoveryData({ ...recoveryData, remarks: e.target.value })}
                  rows="3"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowRecoveryForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Take Action
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Settlement Offer Form Modal */}
      {showSettlementForm && selectedDefaulter && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-xl w-full max-h-screen overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Offer Settlement</h2>
            <form onSubmit={handleOfferSettlement} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Waiver Amount</label>
                  <input
                    type="number"
                    value={settlementData.waiverAmount}
                    onChange={(e) =>
                      setSettlementData({ ...settlementData, waiverAmount: parseFloat(e.target.value) })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Waiver Percentage
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={settlementData.waiverPercentage}
                    onChange={(e) =>
                      setSettlementData({
                        ...settlementData,
                        waiverPercentage: parseFloat(e.target.value),
                      })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Installment Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Number of Installments
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={settlementData.installments.numberOfInstallments}
                      onChange={(e) =>
                        setSettlementData({
                          ...settlementData,
                          installments: {
                            ...settlementData.installments,
                            numberOfInstallments: parseInt(e.target.value),
                          },
                        })
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Installment Amount
                    </label>
                    <input
                      type="number"
                      value={settlementData.installments.installmentAmount}
                      onChange={(e) =>
                        setSettlementData({
                          ...settlementData,
                          installments: {
                            ...settlementData.installments,
                            installmentAmount: parseFloat(e.target.value),
                          },
                        })
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Frequency</label>
                    <select
                      value={settlementData.installments.frequency}
                      onChange={(e) =>
                        setSettlementData({
                          ...settlementData,
                          installments: {
                            ...settlementData.installments,
                            frequency: e.target.value,
                          },
                        })
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="monthly">Monthly</option>
                      <option value="quarterly">Quarterly</option>
                      <option value="half_yearly">Half Yearly</option>
                    </select>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Conditions</label>
                <textarea
                  value={settlementData.conditions}
                  onChange={(e) => setSettlementData({ ...settlementData, conditions: e.target.value })}
                  rows="3"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowSettlementForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Offer Settlement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Defaulters List */}
      {defaulters.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No defaulters found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {defaulters.map((defaulter) => (
            <div key={defaulter._id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {defaulter.taxpayerId?.profile?.firstName}{' '}
                    {defaulter.taxpayerId?.profile?.lastName}
                  </h3>
                  <p className="text-sm text-gray-500">{defaulter.taxpayerId?.email}</p>
                </div>
                <div className="flex gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                      defaulter.status
                    )}`}
                  >
                    {defaulter.status.replace('_', ' ').toUpperCase()}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${getRiskLevelColor(
                      defaulter.riskLevel
                    )}`}
                  >
                    {defaulter.riskLevel.toUpperCase()} RISK
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                <div>
                  <span className="text-gray-600">Outstanding Amount:</span>
                  <p className="font-bold text-red-600 text-lg">₹{defaulter.outstandingAmount}</p>
                </div>
                <div>
                  <span className="text-gray-600">Due Since:</span>
                  <p className="font-medium">
                    {new Date(defaulter.defaultSince).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">Overdue Bills:</span>
                  <p className="font-medium">{defaulter.overdueBills.length}</p>
                </div>
                <div>
                  <span className="text-gray-600">Notices Sent:</span>
                  <p className="font-medium">{defaulter.notices.length}</p>
                </div>
              </div>

              {defaulter.settlementOffer && defaulter.settlementOffer.status === 'offered' && (
                <div className="p-4 bg-yellow-50 rounded-lg mb-4">
                  <h4 className="font-semibold text-yellow-900 mb-2">Settlement Offered</h4>
                  <div className="text-sm text-yellow-800">
                    <p>Settlement Amount: ₹{defaulter.settlementOffer.settlementAmount}</p>
                    <p>
                      Installments: {defaulter.settlementOffer.installments.numberOfInstallments} x
                      ₹{defaulter.settlementOffer.installments.installmentAmount}
                    </p>
                  </div>
                </div>
              )}

              {defaulter.legalProceedings && (
                <div className="p-4 bg-purple-50 rounded-lg mb-4">
                  <h4 className="font-semibold text-purple-900 mb-2">Legal Proceedings</h4>
                  <div className="text-sm text-purple-800">
                    <p>Case Number: {defaulter.legalProceedings.caseNumber}</p>
                    <p>Court: {defaulter.legalProceedings.court}</p>
                    <p>Status: {defaulter.legalProceedings.status}</p>
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setSelectedDefaulter(defaulter);
                    setShowNoticeForm(true);
                  }}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
                >
                  Send Notice
                </button>
                <button
                  onClick={() => {
                    setSelectedDefaulter(defaulter);
                    setShowRecoveryForm(true);
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Recovery Action
                </button>
                <button
                  onClick={() => {
                    setSelectedDefaulter(defaulter);
                    setShowSettlementForm(true);
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Offer Settlement
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TaxDefaulters;
