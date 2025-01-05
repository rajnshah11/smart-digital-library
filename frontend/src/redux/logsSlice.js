// src/redux/logsSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Async action to fetch logs
export const fetchLogsData = createAsyncThunk(
  "logs/fetchData",
  async ({ page, pageSize }) => {
    const token = sessionStorage.getItem("token"); // Retrieve the token from sessionStorage
    const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/analysis/logs`, {
      headers: {
        Authorization: `Bearer ${token}`, // Dynamically add the token
      },
      params: { page, page_size: pageSize },
    });
    return response.data;
  }
);

const logsSlice = createSlice({
  name: "logs",
  initialState: {
    data: [],
    totalItems: 0,
    loading: false,
    error: null,
    page: 1,
    pageSize: 10,
  },
  reducers: {
    setPage(state, action) {
      state.page = action.payload;
    },
    setPageSize(state, action) {
      state.pageSize = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLogsData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLogsData.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.data;
        state.totalItems = action.payload.pagination.total_items;
      })
      .addCase(fetchLogsData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export const { setPage, setPageSize } = logsSlice.actions;

export default logsSlice.reducer;
