import React, { useState } from "react";
import { useDispatch } from "react-redux";
import {
  Button,
  Box,
  Typography,
  CircularProgress,
  Input,
} from "@mui/material";
import { bulkAddDocuments } from "../../redux/documentsSlice"; // Redux action

const BulkUpload = () => {
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = () => {
    if (!file) {
      alert("Please select a file.");
      return;
    }

    setIsLoading(true);

    // Use FormData to handle file upload
    const formData = new FormData();
    formData.append("file", file);

    // Dispatch the Redux action with FormData
    dispatch(bulkAddDocuments(formData))
      .then(() => {
        alert("Documents uploaded successfully!");
        setFile(null); // Clear file after successful upload
      })
      .catch((err) => {
        alert(`Error: ${err.message || "Failed to upload file."}`);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <Box sx={{ padding: { xs: 2, md: 4 }, textAlign: "center" }}>
      <Typography variant="h5" gutterBottom>
        Bulk Upload Documents
      </Typography>

      {/* Fancy File Upload Area */}
      <Box
        sx={{
          border: "2px dashed #E87722",
          borderRadius: "8px",
          padding: "20px",
          marginBottom: "20px",
          backgroundColor: "#F9F9F9",
          textAlign: "center",
          cursor: "pointer",
          "&:hover": {
            backgroundColor: "#FFF3E0",
          },
        }}
        onClick={() => document.getElementById("file-upload").click()}
      >
        <Input
          type="file"
          id="file-upload"
          accept=".csv, .xls, .xlsx"
          style={{ display: "none" }}
          onChange={handleFileChange}
        />
        <Typography
          variant="body1"
          sx={{ color: "#861F41", fontWeight: "bold" }}
        >
          {file
            ? `Selected File: ${file.name}`
            : "Drag & Drop or Click to Select a CSV or Excel File"}
        </Typography>
      </Box>

      <Button
        variant="contained"
        onClick={handleUpload}
        disabled={isLoading || !file}
        sx={{
          backgroundColor: "#861F41",
          color: "#FFFFFF",
          "&:hover": { backgroundColor: "#6A1B36" },
        }}
      >
        {isLoading ? <CircularProgress size={24} /> : "Upload File"}
      </Button>
    </Box>
  );
};

export default BulkUpload;
