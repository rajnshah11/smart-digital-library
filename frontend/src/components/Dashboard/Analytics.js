import React, {lazy } from "react";
import {
  Box,
  Typography,
} from "@mui/material";

const Dashboard = lazy(() => import("./Dashboard"));
const Logs = lazy(() => import("./Logs"));

const AdminDashboard = () => {
  return (
      <Box sx={{ padding: 2 }}>
        <Typography variant="h4" align="center" gutterBottom>
          Admin Dashboard
        </Typography>
        <Dashboard />
        <Logs />
        </Box>
  );
};

export default AdminDashboard;
