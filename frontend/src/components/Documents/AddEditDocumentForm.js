import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { Button, TextField, Typography, Grid, Paper } from "@mui/material";
import { addDocument, updateDocument } from "../../redux/documentsSlice";

const AddEditDocumentForm = ({ initialData = {}, onSubmitSuccess }) => {
  const dispatch = useDispatch();

  // Initialize form data with initialData or default values
  const [formData, setFormData] = useState({
    title: initialData.title || "",
    creator: initialData.creator || "",
    date_: initialData.date_ || "",
    filename: initialData.filename || "",
    subject: initialData.subject || "",
    publisher: initialData.publisher || "",
    contributor: initialData.contributor || "",
    type_: initialData.type_ || "",
    format_: initialData.format_ || "",
    identifier: initialData.identifier || "",
    language_: initialData.language_ || "",
    rights: initialData.rights || "",
  });

  const [file, setFile] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData.document_id) {
      setFormData(initialData); // Pre-fill form if editing
    }
  }, [initialData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];

    // Validate file type
    const allowedFileTypes = [
      "image/png",
      "image/jpeg",
      "image/jpg",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ];
    if (selectedFile && !allowedFileTypes.includes(selectedFile.type)) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        file: "Unsupported file type. Please upload a valid image or document.",
      }));
      return;
    }

    setFile(selectedFile);
    setErrors((prevErrors) => ({ ...prevErrors, file: null })); // Clear file error if valid
    setFormData((prevState) => ({
      ...prevState,
      filename: selectedFile ? selectedFile.name : "",
    }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = "Title is required.";
    if (!formData.creator.trim()) newErrors.creator = "Creator is required.";
    if (!formData.date_) newErrors.date_ = "Date is required.";
    if (!file && !initialData.document_id) newErrors.file = "File is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      const formPayload = new FormData();
      Object.keys(formData).forEach((key) => {
        formPayload.append(key, formData[key]);
      });

      if (file) {
        formPayload.append("file", file);
      }

      if (!initialData.document_id) {
        await dispatch(addDocument(formPayload));
        alert("Document added successfully!");
        setFormData({});
        setFile(null);
      } else {
        await dispatch(
          updateDocument({
            documentId: initialData.document_id,
            updates: formPayload,
          })
        );
        alert("Document updated successfully!");
      }

      if (onSubmitSuccess) onSubmitSuccess();
    } catch (error) {
      alert("Error saving document");
      console.error(error);
    }
  };

  return (
    <Paper
      elevation={3}
      sx={{ padding: { xs: 2, md: 4 }, borderRadius: "12px" }}
    >
      <Typography
        variant="h5"
        gutterBottom
        sx={{ textAlign: "center", fontWeight: "bold", color: "#861F41" }}
      >
        {initialData.document_id ? "Edit Document" : "Add Document"}
      </Typography>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              label="Title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              fullWidth
              error={!!errors.title}
              helperText={errors.title}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label="Creator"
              name="creator"
              value={formData.creator}
              onChange={handleInputChange}
              fullWidth
              error={!!errors.creator}
              helperText={errors.creator}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label="Date"
              name="date_"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={formData.date_}
              onChange={handleInputChange}
              fullWidth
              error={!!errors.date_}
              helperText={errors.date_}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label="Subject"
              name="subject"
              value={formData.subject}
              onChange={handleInputChange}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label="Publisher"
              name="publisher"
              value={formData.publisher}
              onChange={handleInputChange}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label="Contributor"
              name="contributor"
              value={formData.contributor}
              onChange={handleInputChange}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label="Type"
              name="type_"
              value={formData.type_}
              onChange={handleInputChange}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label="Format"
              name="format_"
              value={formData.format_}
              onChange={handleInputChange}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label="Identifier"
              name="identifier"
              value={formData.identifier}
              onChange={handleInputChange}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label="Language"
              name="language_"
              value={formData.language_}
              onChange={handleInputChange}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label="Rights"
              name="rights"
              value={formData.rights}
              onChange={handleInputChange}
              fullWidth
            />
          </Grid>
          <Grid item xs={12}>
            <Button
              variant="outlined"
              component="label"
              fullWidth
              sx={{ borderColor: "#E87722", color: "#E87722" }}
            >
              Upload File
              <input
                type="file"
                hidden
                accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
                onChange={handleFileChange}
              />
            </Button>
            {file ? (
              <Typography
                variant="body2"
                sx={{ marginTop: "8px", color: "#4CAF50" }}
              >
                Selected File: {file.name}
              </Typography>
            ) : (
              initialData.filename && (
                <Typography
                  variant="body2"
                  sx={{ marginTop: "8px", color: "#1976D2" }}
                >
                  Current File: {initialData.filename}
                </Typography>
              )
            )}
            {errors.file && (
              <Typography color="error" variant="caption">
                {errors.file}
              </Typography>
            )}
          </Grid>

          <Grid item xs={12}>
            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{
                backgroundColor: "#861F41",
                color: "#FFFFFF",
                paddingY: "10px",
              }}
            >
              {initialData.document_id ? "Update Document" : "Add Document"}
            </Button>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
};

export default AddEditDocumentForm;
