// src/routes/ProtectedRoute.js
import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ isAuthenticated, role, requiredRole, children, redirectTo }) => {
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" />;
  }
  if (requiredRole && role !== requiredRole) {
    return <Navigate to={redirectTo} />;
  }
  return children;
};

export default ProtectedRoute;
