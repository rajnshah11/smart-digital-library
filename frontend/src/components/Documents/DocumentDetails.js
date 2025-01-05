import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchDocumentById } from "../../redux/documentsSlice"; // Assume this action exists
import { useDispatch, useSelector } from "react-redux";
import { CircularProgress, Typography, Box, Button, Grid } from "@mui/material";
import { format } from "date-fns";
import libraryBackground from "../../assets/library.jpg"; 

const DocumentDetails = () => {
    const { document_id } = useParams(); // Get document_id from URL
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch document details from Redux store
    const document = useSelector((state) =>
        state.documents.documents.find((doc) => doc.document_id === document_id)
    );

    // Get user role from Redux store
    const role = useSelector((state) => state.auth.role);

    useEffect(() => {
        const fetchData = async () => {
            try {
                await dispatch(fetchDocumentById(document_id));
                setLoading(false);
            } catch (err) {
                setError(err.message || "Failed to fetch document details.");
                setLoading(false);
            }
        };

        fetchData();
    }, [dispatch, document_id]);

    // Handle loading state
    if (loading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", padding: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    // Handle error state
    if (error) {
        return (
            <Typography color="error" sx={{ textAlign: "center", marginTop: 4 }}>
                {error}
            </Typography>
        );
    }

    // Handle missing document
    if (!document) {
        return (
            <Typography color="error" sx={{ textAlign: "center", marginTop: 4 }}>
                Document not found.
            </Typography>
        );
    }

    // Back button navigation based on role
    const handleBackClick = () => {
        if (role === "admin") {
            navigate("/admin");
        } else {
            navigate("/");
        }
    };

    return (
        <Box
            sx={{
                padding: 4,
                position: "relative",
                minHeight: "100vh",
                backgroundImage: `url(${libraryBackground})`, // Replace with your image path
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                "&::before": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    backgroundColor: "rgba(0, 0, 0, 0.5)", // Add a dark overlay for readability
                    zIndex: -1,
                },
            }}
        >
            {/* Back Button */}
            <Button
                variant="contained"
                sx={{
                    marginBottom: 2,
                    backgroundColor: "#861F41",
                    color: "#FFFFFF",
                    "&:hover": { backgroundColor: "#6A1B36" },
                }}
                onClick={handleBackClick}
            >
                Back
            </Button>

            {/* Document Details */}
            <Box
                sx={{
                    padding: 3,
                    borderRadius: 2,
                    boxShadow: 3,
                    backgroundColor: "#ffffffcc", // Semi-transparent white background
                    maxWidth: "800px",
                    marginX: "auto",
                }}
            >
                <Typography variant="h4" gutterBottom>
                    {document.title || "Untitled Document"}
                </Typography>

                {/* Dynamically render fields only if they are not empty */}
                <Grid container spacing={2}>
                    {document.subject && (
                        <Grid item xs={12}>
                            <Typography variant="body1">
                                <strong>Subject:</strong> {document.subject}
                            </Typography>
                        </Grid>
                    )}
                    {document.description && (
                        <Grid item xs={12}>
                            <Typography variant="body1">
                                <strong>Description:</strong> {document.description}
                            </Typography>
                        </Grid>
                    )}
                    {document.date_ && (
                        <Grid item xs={12}>
                            <Typography variant="body1">
                                <strong>Date:</strong>{" "}
                                {format(new Date(document.date_), "MMM dd, yyyy")}
                            </Typography>
                        </Grid>
                    )}
                    {document.contributor && (
                        <Grid item xs={12}>
                            <Typography variant="body1">
                                <strong>Contributor:</strong> {document.contributor}
                            </Typography>
                        </Grid>
                    )}
                    {document.publisher && (
                        <Grid item xs={12}>
                            <Typography variant="body1">
                                <strong>Publisher:</strong> {document.publisher}
                            </Typography>
                        </Grid>
                    )}
                    {document.format_ && (
                        <Grid item xs={12}>
                            <Typography variant="body1">
                                <strong>Format:</strong> {document.format_}
                            </Typography>
                        </Grid>
                    )}
                    {document.language_ && (
                        <Grid item xs={12}>
                            <Typography variant="body1">
                                <strong>Language:</strong> {document.language_}
                            </Typography>
                        </Grid>
                    )}
                    {document.rights && (
                        <Grid item xs={12}>
                            <Typography variant="body1">
                                <strong>Rights:</strong> {document.rights}
                            </Typography>
                        </Grid>
                    )}
                </Grid>
            </Box>
        </Box>
    );
};

export default DocumentDetails;
