import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/client';

// Upload document
export const uploadDocument = createAsyncThunk(
  'document/upload',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await api.post('/documents', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('Upload API response:', response);
      console.log('Response data:', response.data);
      // API client already extracts data, so response.data IS the document
      return response.data;
    } catch (error) {
      console.error('Upload API error:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to upload document');
    }
  }
);

// Get all documents
export const getDocuments = createAsyncThunk(
  'document/getAll',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams(filters);
      const response = await api.get(`/documents?${params}`);
      console.log('Get documents response:', response.data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch documents');
    }
  }
);

// Get document by ID
export const getDocumentById = createAsyncThunk(
  'document/getById',
  async (documentId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/documents/${documentId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch document');
    }
  }
);

// Update document
export const updateDocument = createAsyncThunk(
  'document/update',
  async ({ documentId, updateData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/documents/${documentId}`, updateData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update document');
    }
  }
);

// Delete document
export const deleteDocument = createAsyncThunk(
  'document/delete',
  async (documentId, { rejectWithValue }) => {
    try {
      await api.delete(`/documents/${documentId}`);
      return documentId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete document');
    }
  }
);

const initialState = {
  documents: [],
  currentDocument: null,
  loading: false,
  error: null,
};

const documentSlice = createSlice({
  name: 'document',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentDocument: (state) => {
      state.currentDocument = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Upload document
      .addCase(uploadDocument.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadDocument.fulfilled, (state, action) => {
        state.loading = false;
        state.documents.unshift(action.payload);
      })
      .addCase(uploadDocument.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get all documents
      .addCase(getDocuments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getDocuments.fulfilled, (state, action) => {
        state.loading = false;
        state.documents = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(getDocuments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.documents = [];
      })
      
      // Get document by ID
      .addCase(getDocumentById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getDocumentById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentDocument = action.payload;
      })
      .addCase(getDocumentById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update document
      .addCase(updateDocument.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateDocument.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.documents.findIndex(doc => doc._id === action.payload._id);
        if (index !== -1) {
          state.documents[index] = action.payload;
        }
      })
      .addCase(updateDocument.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Delete document
      .addCase(deleteDocument.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteDocument.fulfilled, (state, action) => {
        state.loading = false;
        state.documents = state.documents.filter(doc => doc._id !== action.payload);
      })
      .addCase(deleteDocument.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearCurrentDocument } = documentSlice.actions;
export default documentSlice.reducer;
