import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/client';

// Async thunks
export const createPaymentOrder = createAsyncThunk(
  'payment/createOrder',
  async (paymentData, { rejectWithValue }) => {
    try {
      const response = await api.post('/payments/create-order', paymentData);
      console.log('Raw API response:', response);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create payment order');
    }
  }
);

export const verifyRazorpayPayment = createAsyncThunk(
  'payment/verifyRazorpay',
  async (verificationData, { rejectWithValue }) => {
    try {
      const response = await api.post('/payments/verify/razorpay', verificationData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Payment verification failed');
    }
  }
);

export const verifyStripePayment = createAsyncThunk(
  'payment/verifyStripe',
  async (verificationData, { rejectWithValue }) => {
    try {
      const response = await api.post('/payments/verify/stripe', verificationData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Payment verification failed');
    }
  }
);

export const getTransactions = createAsyncThunk(
  'payment/getTransactions',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/payments', { params: filters });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch transactions');
    }
  }
);

export const getTransaction = createAsyncThunk(
  'payment/getTransaction',
  async (transactionId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/payments/${transactionId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch transaction');
    }
  }
);

const initialState = {
  transactions: [],
  currentTransaction: null,
  currentOrder: null,
  loading: false,
  error: null,
};

const paymentSlice = createSlice({
  name: 'payment',
  initialState,
  reducers: {
    clearCurrentOrder: (state) => {
      state.currentOrder = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Create Payment Order
    builder
      .addCase(createPaymentOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPaymentOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.currentOrder = action.payload;
      })
      .addCase(createPaymentOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Verify Razorpay Payment
    builder
      .addCase(verifyRazorpayPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyRazorpayPayment.fulfilled, (state, action) => {
        state.loading = false;
        state.currentTransaction = action.payload;
        state.transactions.unshift(action.payload);
      })
      .addCase(verifyRazorpayPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Verify Stripe Payment
    builder
      .addCase(verifyStripePayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyStripePayment.fulfilled, (state, action) => {
        state.loading = false;
        state.currentTransaction = action.payload;
        state.transactions.unshift(action.payload);
      })
      .addCase(verifyStripePayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Get Transactions
    builder
      .addCase(getTransactions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTransactions.fulfilled, (state, action) => {
        state.loading = false;
        state.transactions = action.payload;
      })
      .addCase(getTransactions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Get Transaction
    builder
      .addCase(getTransaction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTransaction.fulfilled, (state, action) => {
        state.loading = false;
        state.currentTransaction = action.payload;
      })
      .addCase(getTransaction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearCurrentOrder, clearError } = paymentSlice.actions;
export default paymentSlice.reducer;
