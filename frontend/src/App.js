// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useSelector } from "react-redux";
import Navbar from "./components/Navbar";
import Register from "./components/Auth/Register";
import Login from "./components/Auth/Login";
import AdminUserDashboard from "./components/AdminUserDashboard";
import Analytics from "./components/Dashboard/Analytics";
import DocumentDetails from "./components/Documents/DocumentDetails";
import ProtectedRoute from "./routes/ProtectedRoute";
import { ROUTES } from "./constants/routes";

function App() {
  const { isAuthenticated, role } = useSelector((state) => state.auth);

  return (
    <Router>
      <Navbar />
      <Routes>
        {/* Public Routes */}
        <Route path={ROUTES.REGISTER} element={<Register />} />
        <Route path={ROUTES.LOGIN} element={<Login />} />

        {/* Protected Routes */}
        <Route
          path={ROUTES.ADMIN_DASHBOARD}
          element={
            <ProtectedRoute
              isAuthenticated={isAuthenticated}
              role={role}
              requiredRole="admin"
              redirectTo={ROUTES.USER_DASHBOARD}
            >
              <AdminUserDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.ANALYTICS}
          element={
            <ProtectedRoute
              isAuthenticated={isAuthenticated}
              role={role}
              requiredRole="admin"
              redirectTo={ROUTES.ADMIN_DASHBOARD}
            >
              <Analytics />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.DOCUMENT_DETAILS}
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <DocumentDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.USER_DASHBOARD}
          element={
            <ProtectedRoute
              isAuthenticated={isAuthenticated}
              role={role}
              requiredRole="user"
              redirectTo={ROUTES.ADMIN_DASHBOARD}
            >
              <AdminUserDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
