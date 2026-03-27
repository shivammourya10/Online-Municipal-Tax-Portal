import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/client';

// Async thunks
export const fetchProperties = createAsyncThunk(
  'property/fetchProperties',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (filters.city) params.append('city', filters.city);
      if (filters.propertyType) params.append('propertyType', filters.propertyType);
      if (filters.verified !== undefined) params.append('verified', filters.verified);
      
      const response = await api.get(`/properties?${params.toString()}`);
      return Array.isArray(response) ? response : response.data || [];
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch properties');
    }
  }
);

export const addProperty = createAsyncThunk(
  'property/addProperty',
  async (propertyData, { rejectWithValue }) => {
    try {
      const response = await api.post('/properties', propertyData);
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to add property');
    }
  }
);

export const updateProperty = createAsyncThunk(
  'property/updateProperty',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/properties/${id}`, data);
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update property');
    }
  }
);

export const deleteProperty = createAsyncThunk(
  'property/deleteProperty',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/properties/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to delete property');
    }
  }
);

export const calculatePropertyTax = createAsyncThunk(
  'property/calculateTax',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/properties/${id}/calculate-tax`);
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to calculate tax');
    }
  }
);

// Admin thunks
export const fetchAllProperties = createAsyncThunk(
  'property/fetchAllProperties',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (filters.page) params.append('page', filters.page);
      if (filters.limit) params.append('limit', filters.limit);
      if (filters.city) params.append('city', filters.city);
      if (filters.propertyType) params.append('propertyType', filters.propertyType);
      if (filters.verified !== undefined) params.append('verified', filters.verified);
      
      const response = await api.get(`/properties/admin/all?${params.toString()}`);
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch all properties');
    }
  }
);

export const verifyProperty = createAsyncThunk(
  'property/verifyProperty',
  async ({ id, verified, verificationNotes }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/properties/${id}/verify`, { verified, verificationNotes });
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to verify property');
    }
  }
);

export const fetchPropertyStatistics = createAsyncThunk(
  'property/fetchStatistics',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/properties/admin/statistics');
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch statistics');
    }
  }
);

const initialState = {
  properties: [],
  allProperties: { properties: [], totalPages: 0, currentPage: 1, total: 0 },
  statistics: null,
  taxCalculation: null,
  selectedProperty: null,
  loading: false,
  error: null,
};

const propertySlice = createSlice({
  name: 'property',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSelectedProperty: (state, action) => {
      state.selectedProperty = action.payload;
    },
    clearTaxCalculation: (state) => {
      state.taxCalculation = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Properties
      .addCase(fetchProperties.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProperties.fulfilled, (state, action) => {
        state.loading = false;
        state.properties = action.payload;
      })
      .addCase(fetchProperties.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Add Property
      .addCase(addProperty.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addProperty.fulfilled, (state, action) => {
        state.loading = false;
        state.properties.push(action.payload);
      })
      .addCase(addProperty.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update Property
      .addCase(updateProperty.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProperty.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.properties.findIndex(p => p._id === action.payload._id);
        if (index !== -1) state.properties[index] = action.payload;
      })
      .addCase(updateProperty.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Delete Property
      .addCase(deleteProperty.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteProperty.fulfilled, (state, action) => {
        state.loading = false;
        state.properties = state.properties.filter(p => p._id !== action.payload);
      })
      .addCase(deleteProperty.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Calculate Tax
      .addCase(calculatePropertyTax.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(calculatePropertyTax.fulfilled, (state, action) => {
        state.loading = false;
        state.taxCalculation = action.payload;
      })
      .addCase(calculatePropertyTax.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch All Properties (Admin)
      .addCase(fetchAllProperties.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllProperties.fulfilled, (state, action) => {
        state.loading = false;
        state.allProperties = action.payload;
      })
      .addCase(fetchAllProperties.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Verify Property
      .addCase(verifyProperty.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyProperty.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.allProperties.properties.findIndex(p => p._id === action.payload._id);
        if (index !== -1) state.allProperties.properties[index] = action.payload;
      })
      .addCase(verifyProperty.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch Statistics
      .addCase(fetchPropertyStatistics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPropertyStatistics.fulfilled, (state, action) => {
        state.loading = false;
        state.statistics = action.payload;
      })
      .addCase(fetchPropertyStatistics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, setSelectedProperty, clearTaxCalculation } = propertySlice.actions;
export default propertySlice.reducer;
