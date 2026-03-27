import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { createPaymentOrder, getTransactions, verifyStripePayment } from '../../features/payment/paymentSlice';
import toast from 'react-hot-toast';
import { loadStripe } from '@stripe/stripe-js';
import api from '../../api/client';

const Payments = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { loading, transactions } = useSelector((state) => state.payment);
  const [properties, setProperties] = useState([]);
  const [paymentData, setPaymentData] = useState({
    amount: '',
    type: 'property_tax',
    description: '',
    paymentGateway: 'stripe',
    propertyId: '',
  });
  
  const [isProcessing, setIsProcessing] = useState(false);
  const taxData = location.state?.taxData;
  const calculationId = location.state?.calculationId;
  const prefilledAmount = location.state?.amount;
  const propertyId = location.state?.propertyId;
  const paymentType = location.state?.type;

  useEffect(() => {
    dispatch(getTransactions());
    loadProperties();
    
    // Check for Stripe Checkout success/cancel
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');
    const status = urlParams.get('status');

    if (status === 'success' && sessionId) {
      // Verify the payment with backend
      const verifyPayment = async () => {
        try {
          setIsProcessing(true);
          console.log('Verifying payment with session ID:', sessionId);
          const result = await dispatch(verifyStripePayment({ sessionId })).unwrap();
          console.log('Payment verification result:', result);
          toast.success('Payment completed successfully!');
          dispatch(getTransactions());
        } catch (error) {
          console.error('Payment verification error:', error);
          console.error('Error type:', typeof error);
          console.error('Error details:', JSON.stringify(error, null, 2));
          toast.error(typeof error === 'string' ? error : error.message || 'Payment verification failed. Please contact support.');
        } finally {
          setIsProcessing(false);
          // Clean URL
          window.history.replaceState({}, '', '/payments');
        }
      };
      verifyPayment();
    } else if (status === 'cancelled') {
      toast.error('Payment was cancelled');
      // Clean URL
      window.history.replaceState({}, '', '/payments');
    }
    
    if (taxData) {
      const amount = prefilledAmount || taxData.pendingAmount || taxData.annualTax || taxData.totalTax || taxData.tax || taxData.totalAmount;
      const cappedAmount = amount > 9999999.99 ? 9999999.99 : amount;
      console.log('Setting payment data with:', {
        amount,
        calculationId,
        taxData,
        propertyId,
        paymentType
      });
      setPaymentData(prev => ({
        ...prev,
        amount: cappedAmount,
        type: paymentType || 'property_tax',
        description: paymentType === 'property_tax' 
          ? `Municipal Property Tax Payment - ${taxData.propertyType || ''}`
          : `Tax Payment - ${taxData.assessmentYear || 'Current Year'}`,
        taxDetails: taxData,
        calculationId: calculationId,
        propertyId: propertyId,
      }));
    }
  }, [dispatch, taxData, calculationId, prefilledAmount, propertyId, paymentType]);

  const loadProperties = async () => {
    try {
      const res = await api.get('/properties');
      const list = Array.isArray(res) ? res : res.data || [];
      setProperties(list);
    } catch (err) {
      console.error('Load properties error:', err);
    }
  };

  const handleChange = (e) => {
    setPaymentData({ ...paymentData, [e.target.name]: e.target.value });
  };

  const handlePropertySelect = (e) => {
    const selectedId = e.target.value;
    const selected = properties.find(p => p._id === selectedId);
    const pending = selected?.taxDetails?.pendingAmount ?? '';
    setPaymentData(prev => ({
      ...prev,
      propertyId: selectedId,
      type: 'property_tax',
      amount: pending !== '' ? pending : prev.amount,
      description: selected ? `Property Tax - ${selected.propertyDetails?.name || 'Property'}` : prev.description,
    }));
  };

  const handleStripePayment = async () => {
    if (!paymentData.amount || paymentData.amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    console.log('Payment data being sent:', paymentData);
    setIsProcessing(true);
    try {
      // Create payment order
      console.log('Creating payment order...');
      const orderResponse = await dispatch(createPaymentOrder(paymentData)).unwrap();
      console.log('Payment order response:', orderResponse);
      
      // Check if response exists
      if (!orderResponse) {
        toast.error('Invalid payment response. Please try again.');
        setIsProcessing(false);
        return;
      }

      // Check for Stripe Checkout URL
      if (orderResponse.checkoutUrl) {
        toast.success('Redirecting to Stripe Checkout...');
        // Redirect to Stripe hosted checkout page
        window.location.href = orderResponse.checkoutUrl;
        return;
      }

      // Fallback: Get Stripe publishable key for manual integration
      const stripePublishableKey = orderResponse.stripePublishableKey;
      const paymentIntentId = orderResponse.gatewayOrderId;
      
      if (!stripePublishableKey) {
        toast.error('Stripe not configured. Please contact administrator.');
        setIsProcessing(false);
        return;
      }

      if (!paymentIntentId) {
        toast.error('Payment order creation failed. Please try again.');
        setIsProcessing(false);
        return;
      }

      // Load Stripe
      const stripe = await loadStripe(stripePublishableKey);
      
      if (!stripe) {
        toast.error('Failed to load Stripe. Please try again.');
        setIsProcessing(false);
        return;
      }
      
      // For testing without checkout URL - simulate successful payment
      toast.success('Redirecting to Stripe payment...');
      
      // Simulate payment success after 2 seconds
      setTimeout(async () => {
        try {
          await dispatch(verifyStripePayment({ paymentIntentId })).unwrap();
          toast.success('Payment successful!');
          setPaymentData({
            amount: '',
            type: 'property_tax',
            description: '',
            paymentGateway: 'stripe',
            propertyId: '',
          });
          dispatch(getTransactions());
        } catch (error) {
          toast.error(error || 'Payment verification failed');
        } finally {
          setIsProcessing(false);
        }
      }, 2000);
      
    } catch (error) {
      console.error('Payment creation error:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response,
        data: error.response?.data
      });
      const errorMsg = error.response?.data?.message || error.message || error || 'Failed to create payment order';
      toast.error(errorMsg);
      setIsProcessing(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card">
        <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
        <p className="text-gray-600 mt-2">Make tax payments and view transaction history</p>
      </div>

      {/* New Payment Form */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Make a Payment</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Property (optional)</label>
            <select
              name="propertyId"
              value={paymentData.propertyId}
              onChange={handlePropertySelect}
              className="input"
              disabled={!!taxData}
            >
              <option value="">-- Not linked to a property --</option>
              {properties.map((p) => (
                <option key={p._id} value={p._id}>
                  {(p.propertyDetails?.name || 'Property')} · {(p.propertyDetails?.address?.city || '').trim()} · Due ₹{p.taxDetails?.pendingAmount || 0}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">Linking a property auto-fills its pending amount.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Amount (₹)</label>
            <input
              type="number"
              name="amount"
              value={paymentData.amount}
              onChange={handleChange}
              className="input"
              placeholder="Enter payment amount"
              disabled={!!taxData}
            />
            {taxData && (
              <p className="text-sm text-gray-600 mt-1">
                Amount calculated from tax calculator
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Payment Type</label>
            <select
              name="type"
              value={paymentData.type}
              onChange={handleChange}
              className="input"
              disabled={!!taxData}
            >
              <option value="property_tax">Property Tax</option>
              <option value="tax_payment">Tax Payment</option>
              <option value="penalty">Penalty</option>
              <option value="advance_tax">Advance Tax</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              name="description"
              value={paymentData.description}
              onChange={handleChange}
              className="input"
              rows="3"
              placeholder="Enter payment description"
            ></textarea>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Payment Gateway</label>
            <select
              name="paymentGateway"
              value={paymentData.paymentGateway}
              onChange={handleChange}
              className="input"
            >
              <option value="stripe">Stripe</option>
              <option value="razorpay">Razorpay</option>
            </select>
          </div>

          {taxData && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">Tax Details</h3>
              <div className="space-y-1 text-sm text-blue-800">
                {taxData.propertyType && (
                  <p className="capitalize">Property Type: {taxData.propertyType}</p>
                )}
                {taxData.marketValue && (
                  <p>Market Value: ₹{taxData.marketValue.toLocaleString('en-IN')}</p>
                )}
                {taxData.builtUpArea && (
                  <p>Built-up Area: {taxData.builtUpArea} sq ft</p>
                )}
                {taxData.baseRate && (
                  <p>Tax Rate: {taxData.baseRate}%</p>
                )}
                {taxData.annualTax && (
                  <p>Annual Tax: ₹{taxData.annualTax.toLocaleString('en-IN')}</p>
                )}
                {taxData.dueDate && (
                  <p>Due Date: {new Date(taxData.dueDate).toLocaleDateString('en-IN')}</p>
                )}
                {taxData.grossIncome && (
                  <p>Gross Income: ₹{taxData.grossIncome.toLocaleString('en-IN')}</p>
                )}
                {taxData.taxableIncome && (
                  <p>Taxable Income: ₹{taxData.taxableIncome.toLocaleString('en-IN')}</p>
                )}
                {taxData.assessmentYear && (
                  <p>Assessment Year: {taxData.assessmentYear}</p>
                )}
              </div>
            </div>
          )}

          <button
            onClick={handleStripePayment}
            disabled={isProcessing || loading}
            className="btn-primary w-full"
          >
            {isProcessing ? 'Processing...' : `Pay ₹${paymentData.amount ? parseFloat(paymentData.amount).toLocaleString('en-IN') : '0'} via ${paymentData.paymentGateway === 'stripe' ? 'Stripe' : 'Razorpay'}`}
          </button>
        </div>
      </div>

      {/* Transaction History */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Transaction History</h2>
        
        {loading && !transactions ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          </div>
        ) : transactions && transactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Transaction ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Gateway
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transactions.map((transaction) => (
                  <tr key={transaction._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {transaction.transactionId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(transaction.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                      {transaction.type.replace('_', ' ')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      ₹{transaction.amount.toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(transaction.status)}`}>
                        {transaction.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                      {transaction.paymentGateway}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>No transactions found</p>
            <p className="text-sm mt-2">Make your first payment to see transaction history</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Payments;
