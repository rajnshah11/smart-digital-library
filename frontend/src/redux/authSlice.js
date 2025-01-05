// src/features/auth/authSlice.js
import { createSlice } from "@reduxjs/toolkit";

// Helper function to safely get sessionStorage items
const getSessionItem = (key) => {
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
};

const initialState = {
  username: getSessionItem("username"),
  role: getSessionItem("role"),
  token: getSessionItem("token"),
  isAuthenticated: !!getSessionItem("token"),
  email: null, 
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Handle user login
    login(state, action) {
      const { username, role, token } = action.payload;
      state.username = username;
      state.role = role;
      state.token = token;
      state.isAuthenticated = true;

      try {
        sessionStorage.setItem("username", username);
        sessionStorage.setItem("role", role);
        sessionStorage.setItem("token", token);
      } catch (e) {
        console.error("Failed to set sessionStorage:", e);
      }
    },

    // Handle user logout
    logout(state) {
      state.username = null;
      state.role = null;
      state.token = null;
      state.isAuthenticated = false;

      try {
        sessionStorage.removeItem("username");
        sessionStorage.removeItem("role");
        sessionStorage.removeItem("token");
      } catch (e) {
        console.error("Failed to remove sessionStorage:", e);
      }
    },

    // Handle user registration
    register(state, action) {
      const { username, role, email } = action.payload;
      state.username = username;
      state.role = role;
      state.email = email;
    },
  },
});

export const { login, logout, register } = authSlice.actions;

export default authSlice.reducer;
