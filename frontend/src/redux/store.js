// src/redux/store.js
import { configureStore } from "@reduxjs/toolkit";
import dashboardReducer from "./dashboardSlice";
import logsReducer from "./logsSlice";
import authReducer from "./authSlice";
import documentsReducer from "./documentsSlice";

const store = configureStore({
  reducer: {
    dashboard: dashboardReducer,
    logs: logsReducer,
    auth: authReducer,
    documents: documentsReducer
  },
});

export default store;
