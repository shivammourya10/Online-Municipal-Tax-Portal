import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/client';

// Async thunks
export const calculateIncomeTax = createAsyncThunk(
  'tax/calculateIncome',
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post('/tax/calculate/income', data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to calculate income tax');
    }
  }
);

export const calculateGST = createAsyncThunk(
  'tax/calculateGST',
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post('/tax/calculate/gst', data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to calculate GST');
    }
  }
);

export const calculatePropertyTax = createAsyncThunk(
  'tax/calculateProperty',
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post('/tax/calculate/property', data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to calculate property tax');
    }
  }
);

export const calculateCorporateTax = createAsyncThunk(
  'tax/calculateCorporate',
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post('/tax/calculate/corporate', data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to calculate corporate tax');
    }
  }
);

export const getTaxRules = createAsyncThunk(
  'tax/getRules',
  async (filters, { rejectWithValue }) => {
    try {
      const response = await api.get('/tax/rules', { params: filters });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch tax rules');
    }
  }
);

const initialState = {
  calculation: null,
  calculations: [],
  rules: [],
  loading: false,
  error: null,
};

const taxSlice = createSlice({
  name: 'tax',
  initialState,
  reducers: {
    clearCalculations: (state) => {
      state.calculation = null;
      state.calculations = [];
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Calculate Income Tax
    builder
      .addCase(calculateIncomeTax.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(calculateIncomeTax.fulfilled, (state, action) => {
        state.loading = false;
        state.calculation = action.payload;
        state.calculations.unshift(action.payload);
      })
      .addCase(calculateIncomeTax.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Calculate GST
    builder
      .addCase(calculateGST.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(calculateGST.fulfilled, (state, action) => {
        state.loading = false;
        state.calculation = action.payload;
      })
      .addCase(calculateGST.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Calculate Property Tax
    builder
      .addCase(calculatePropertyTax.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(calculatePropertyTax.fulfilled, (state, action) => {
        state.loading = false;
        state.calculation = action.payload;
      })
      .addCase(calculatePropertyTax.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Calculate Corporate Tax
    builder
      .addCase(calculateCorporateTax.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(calculateCorporateTax.fulfilled, (state, action) => {
        state.loading = false;
        state.calculation = action.payload;
      })
      .addCase(calculateCorporateTax.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Get Tax Rules
    builder
      .addCase(getTaxRules.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTaxRules.fulfilled, (state, action) => {
        state.loading = false;
        state.rules = action.payload;
      })
      .addCase(getTaxRules.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearCalculations, clearError } = taxSlice.actions;
export default taxSlice.reducer;
