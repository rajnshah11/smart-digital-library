import React, { lazy, Suspense } from "react";
import { Box, Typography } from "@mui/material";
import { useSelector } from "react-redux";

// Lazy load the DocumentList component
const DocumentList = lazy(() => import("./Documents/DocumentList"));

const AdminUserDashboard = () => {
  const { role } = useSelector((state) => state.auth);

  return (
    <Box sx={{ padding: 2 }}>
      <Suspense fallback={<Typography align="center">Loading...</Typography>}>
        <DocumentList role={role} />
      </Suspense>
    </Box>
  );
};

export default AdminUserDashboard;
