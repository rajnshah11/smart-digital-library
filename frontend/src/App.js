import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Register from "./components/Register";
import Login from "./components/Login";
import UserDashboard from "./components/UserDashboard";
import AdminDashboard from "./components/AdminDashboard";

function App() {
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check for token on app load
  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (token) {
      // Optionally, decode the token to extract username and role
      const storedUsername = sessionStorage.getItem("username");
      const storedRole = sessionStorage.getItem("role");
      setUsername(storedUsername || "");
      setRole(storedRole || "");
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (user, userRole) => {
    setUsername(user);
    setRole(userRole);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("username");
    sessionStorage.removeItem("role");
    setUsername("");
    setRole("");
    setIsAuthenticated(false);
  };

  return (
    <Router>
      {isAuthenticated && <Navbar username={username} onLogout={handleLogout} />}
      <Routes>
        {!isAuthenticated ? (
          <>
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login onLogin={handleLogin} />} />
            <Route path="*" element={<Navigate to="/login" />} />
          </>
        ) : (
          <>
            {role === "admin" && <Route path="/admin" element={<AdminDashboard />} />}
            {role === "user" && <Route path="/user" element={<UserDashboard />} />}
            <Route path="*" element={<Navigate to={role === "admin" ? "/admin" : "/user"} />} />
          </>
        )}
      </Routes>
    </Router>
  );
}

export default App;