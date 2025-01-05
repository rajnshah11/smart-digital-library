// src/redux/documentsSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Async thunk for fetching documents
export const fetchDocuments = createAsyncThunk(
  "documents/fetchDocuments",
  async ({ skip, limit, sortBy, order, search, dateFrom, dateTo }, thunkAPI) => {
    try {
      const token = sessionStorage.getItem("token");
      const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/documents/get-documents`, {
        params: { skip, limit, sort_by: sortBy, order, search, date_from: dateFrom, date_to: dateTo },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || "Something went wrong");
    }
  }
);

// Async thunk for fetching a single document by ID
export const fetchDocumentById = createAsyncThunk(
  "documents/fetchDocumentById",
  async (documentId, thunkAPI) => {
    try {
      const token = sessionStorage.getItem("token");
      const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/documents/get-document/${documentId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data; // The backend should return the document data
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.detail || "Failed to fetch document");
    }
  }
);

// Async thunk for bulk uploading documents
export const bulkAddDocuments = createAsyncThunk(
  "documents/bulkAddDocuments",
  async (documents, thunkAPI) => {
    try {
      const token = sessionStorage.getItem("token");
      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/documents/bulk-upload`,
        documents,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.detail || "Failed to upload documents");
    }
  }
);

// Async thunk for adding a single document
export const addDocument = createAsyncThunk(
  "documents/addDocument",
  async (formPayload, thunkAPI) => {
    try {
      const token = sessionStorage.getItem("token");
      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/documents/add-document`,
        formPayload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.detail || "Failed to add document");
    }
  }
);

// Async thunk for deleting a document
export const deleteDocument = createAsyncThunk(
  "documents/deleteDocument",
  async (documentId, thunkAPI) => {
    try {
      const token = sessionStorage.getItem("token");
      const response = await axios.delete(
        `${process.env.REACT_APP_API_BASE_URL}/documents/delete-document/${documentId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data; // Return deleted document ID
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.detail || "Failed to delete document");
    }
  }
);

// Async thunk for updating a document
export const updateDocument = createAsyncThunk(
  "documents/updateDocument",
  async ({ documentId, updates }, thunkAPI) => {
    try {
      const token = sessionStorage.getItem("token");
      const response = await axios.put(
        `${process.env.REACT_APP_API_BASE_URL}/documents/update-document/${documentId}`,
        updates,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data; // Return updated document data
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.detail || "Failed to update document");
    }
  }
);

const documentsSlice = createSlice({
  name: "documents",
  initialState: {
    documents: [],
    totalCount: 0,
    page: 1,
    pageSize: 10,
    status: "idle",
    error: null,
    currentDocument: null, // Holds data for a single fetched document (for editing)
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch Documents
      .addCase(fetchDocuments.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchDocuments.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.documents = action.payload.results;
        state.totalCount = action.payload.total_count;
        state.pageSize = action.payload.page_size;
        state.page = action.payload.page;
      })
      .addCase(fetchDocuments.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // Fetch Single Document by ID
      .addCase(fetchDocumentById.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchDocumentById.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.currentDocument = action.payload;
      })
      .addCase(fetchDocumentById.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // Bulk Upload Documents
      .addCase(bulkAddDocuments.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(bulkAddDocuments.fulfilled, (state, action) => {
        state.status = "succeeded";
      })
      .addCase(bulkAddDocuments.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // Add Single Document
      .addCase(addDocument.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(addDocument.fulfilled, (state, action) => {
        state.status = "succeeded";        
      })
      .addCase(addDocument.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // Update Document
      .addCase(updateDocument.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(updateDocument.fulfilled, (state, action) => {
        state.status = "succeeded";
      })
      .addCase(updateDocument.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // Delete Document
      .addCase(deleteDocument.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(deleteDocument.fulfilled, (state, action) => {
        state.status = "succeeded";
      })
      .addCase(deleteDocument.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export default documentsSlice.reducer;
