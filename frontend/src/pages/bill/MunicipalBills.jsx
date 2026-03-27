import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import apiClient from '../../api/client';
import toast from 'react-hot-toast';

const MunicipalBills = () => {
  const { user } = useSelector((state) => state.auth);
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBill, setSelectedBill] = useState(null);
  const [showBillDetails, setShowBillDetails] = useState(false);

  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async () => {
    try {
      const response = await apiClient.get('/municipal-bills/my-bills');
      setBills(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch bills');
    } finally {
      setLoading(false);
    }
  };

  const handlePayBill = async (billId) => {
    try {
      const response = await apiClient.post(`/municipal-bills/${billId}/pay`, {
        paymentMethod: 'razorpay',
      });
      
      if (response.data.data.paymentGatewayResponse) {
        // Handle Razorpay payment
        const options = {
          key: response.data.data.paymentGatewayResponse.key,
          amount: response.data.data.paymentGatewayResponse.amount,
          currency: response.data.data.paymentGatewayResponse.currency,
          name: 'Municipal Tax Payment',
          description: `Bill #${response.data.data.transactionDetails.transactionId}`,
          order_id: response.data.data.paymentGatewayResponse.orderId,
          handler: async (razorpayResponse) => {
            // Verify payment on backend
            toast.success('Payment successful!');
            fetchBills();
          },
          prefill: {
            name: user.profile.firstName + ' ' + user.profile.lastName,
            email: user.email,
            contact: user.profile.phone,
          },
        };
        
        const razorpay = new window.Razorpay(options);
        razorpay.open();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to process payment');
    }
  };

  const getPaymentStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      paid: 'bg-green-100 text-green-800',
      overdue: 'bg-red-100 text-red-800',
      partially_paid: 'bg-orange-100 text-orange-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const viewBillDetails = (bill) => {
    setSelectedBill(bill);
    setShowBillDetails(true);
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
        <h1 className="text-2xl font-bold text-gray-900">Municipal Bills</h1>
        <div className="text-sm text-gray-600">
          Total Bills: {bills.length}
        </div>
      </div>

      {/* Bill Details Modal */}
      {showBillDetails && selectedBill && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-3xl w-full max-h-screen overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Bill Details</h2>
                <p className="text-sm text-gray-500">Bill #{selectedBill.billNumber}</p>
              </div>
              <button
                onClick={() => setShowBillDetails(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            {/* Tax Breakdown */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4">Tax Breakdown</h3>
              <div className="space-y-3">
                {selectedBill.taxes.propertyTax > 0 && (
                  <div className="flex justify-between p-3 bg-gray-50 rounded">
                    <span className="text-gray-700">Property Tax</span>
                    <span className="font-semibold">₹{selectedBill.taxes.propertyTax}</span>
                  </div>
                )}
                {selectedBill.taxes.waterTax > 0 && (
                  <div className="flex justify-between p-3 bg-gray-50 rounded">
                    <span className="text-gray-700">Water Tax</span>
                    <span className="font-semibold">₹{selectedBill.taxes.waterTax}</span>
                  </div>
                )}
                {selectedBill.taxes.sewerageCharges > 0 && (
                  <div className="flex justify-between p-3 bg-gray-50 rounded">
                    <span className="text-gray-700">Sewerage Charges</span>
                    <span className="font-semibold">₹{selectedBill.taxes.sewerageCharges}</span>
                  </div>
                )}
                {selectedBill.taxes.streetLightTax > 0 && (
                  <div className="flex justify-between p-3 bg-gray-50 rounded">
                    <span className="text-gray-700">Street Light Tax</span>
                    <span className="font-semibold">₹{selectedBill.taxes.streetLightTax}</span>
                  </div>
                )}
                {selectedBill.taxes.solidWasteTax > 0 && (
                  <div className="flex justify-between p-3 bg-gray-50 rounded">
                    <span className="text-gray-700">Solid Waste Tax</span>
                    <span className="font-semibold">₹{selectedBill.taxes.solidWasteTax}</span>
                  </div>
                )}
                {selectedBill.taxes.healthCess > 0 && (
                  <div className="flex justify-between p-3 bg-gray-50 rounded">
                    <span className="text-gray-700">Health Cess</span>
                    <span className="font-semibold">₹{selectedBill.taxes.healthCess}</span>
                  </div>
                )}
                {selectedBill.taxes.educationCess > 0 && (
                  <div className="flex justify-between p-3 bg-gray-50 rounded">
                    <span className="text-gray-700">Education Cess</span>
                    <span className="font-semibold">₹{selectedBill.taxes.educationCess}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Arrears */}
            {selectedBill.arrears.totalArrears > 0 && (
              <div className="mb-6 p-4 bg-red-50 rounded-lg">
                <h3 className="text-lg font-semibold text-red-900 mb-3">Arrears</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-red-800">Previous Outstanding</span>
                    <span className="font-semibold">₹{selectedBill.arrears.principalAmount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-red-800">Interest</span>
                    <span className="font-semibold">₹{selectedBill.arrears.interestAmount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-red-800">Penalty</span>
                    <span className="font-semibold">₹{selectedBill.arrears.penaltyAmount}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-red-200">
                    <span className="text-red-900 font-semibold">Total Arrears</span>
                    <span className="font-bold text-lg">₹{selectedBill.arrears.totalArrears}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Discount */}
            {selectedBill.discount.totalDiscount > 0 && (
              <div className="mb-6 p-4 bg-green-50 rounded-lg">
                <h3 className="text-lg font-semibold text-green-900 mb-3">Discounts Applied</h3>
                <div className="space-y-2 text-sm">
                  {selectedBill.discount.earlyPaymentDiscount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-green-800">Early Payment Discount</span>
                      <span className="font-semibold">-₹{selectedBill.discount.earlyPaymentDiscount}</span>
                    </div>
                  )}
                  {selectedBill.discount.seniorCitizenDiscount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-green-800">Senior Citizen Discount</span>
                      <span className="font-semibold">-₹{selectedBill.discount.seniorCitizenDiscount}</span>
                    </div>
                  )}
                  {selectedBill.discount.otherDiscount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-green-800">Other Discount</span>
                      <span className="font-semibold">-₹{selectedBill.discount.otherDiscount}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-2 border-t border-green-200">
                    <span className="text-green-900 font-semibold">Total Discount</span>
                    <span className="font-bold">-₹{selectedBill.discount.totalDiscount}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Grand Total */}
            <div className="p-4 bg-blue-50 rounded-lg mb-6">
              <div className="flex justify-between items-center">
                <span className="text-blue-900 text-xl font-bold">Grand Total</span>
                <span className="text-blue-900 text-2xl font-bold">₹{selectedBill.grandTotal}</span>
              </div>
              {selectedBill.paymentStatus === 'pending' && (
                <p className="text-sm text-blue-700 mt-2">
                  Due Date: {new Date(selectedBill.dueDate).toLocaleDateString()}
                </p>
              )}
            </div>

            {selectedBill.paymentStatus === 'pending' && (
              <button
                onClick={() => {
                  setShowBillDetails(false);
                  handlePayBill(selectedBill._id);
                }}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-semibold"
              >
                Pay Now
              </button>
            )}

            {selectedBill.paymentStatus === 'paid' && (
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-green-900 font-semibold">✓ Paid</p>
                <p className="text-sm text-green-700">
                  Paid on: {new Date(selectedBill.paidAt).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bills Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600 mb-1">Pending Bills</div>
          <div className="text-2xl font-bold text-yellow-600">
            {bills.filter((b) => b.paymentStatus === 'pending').length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600 mb-1">Overdue Bills</div>
          <div className="text-2xl font-bold text-red-600">
            {bills.filter((b) => b.paymentStatus === 'overdue').length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600 mb-1">Paid Bills</div>
          <div className="text-2xl font-bold text-green-600">
            {bills.filter((b) => b.paymentStatus === 'paid').length}
          </div>
        </div>
      </div>

      {/* Bills List */}
      {bills.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No bills found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {bills.map((bill) => (
            <div key={bill._id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Bill #{bill.billNumber}</h3>
                  <p className="text-sm text-gray-500">
                    Period: {bill.billingPeriod.month}/{bill.billingPeriod.year}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(
                    bill.paymentStatus
                  )}`}
                >
                  {bill.paymentStatus.replace('_', ' ').toUpperCase()}
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                <div>
                  <span className="text-gray-600">Total Tax:</span>
                  <p className="font-medium">₹{bill.totalTax}</p>
                </div>
                <div>
                  <span className="text-gray-600">Arrears:</span>
                  <p className="font-medium text-red-600">₹{bill.arrears.totalArrears || 0}</p>
                </div>
                <div>
                  <span className="text-gray-600">Discount:</span>
                  <p className="font-medium text-green-600">-₹{bill.discount.totalDiscount || 0}</p>
                </div>
                <div>
                  <span className="text-gray-600">Grand Total:</span>
                  <p className="font-bold text-lg">₹{bill.grandTotal}</p>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-600">
                  {bill.paymentStatus === 'pending' && (
                    <>Due Date: {new Date(bill.dueDate).toLocaleDateString()}</>
                  )}
                  {bill.paymentStatus === 'paid' && (
                    <>Paid on: {new Date(bill.paidAt).toLocaleDateString()}</>
                  )}
                  {bill.paymentStatus === 'overdue' && (
                    <span className="text-red-600">Overdue since {new Date(bill.dueDate).toLocaleDateString()}</span>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => viewBillDetails(bill)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    View Details
                  </button>
                  {bill.paymentStatus !== 'paid' && (
                    <button
                      onClick={() => handlePayBill(bill._id)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Pay Now
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MunicipalBills;
