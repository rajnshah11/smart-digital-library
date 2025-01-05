import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchDocuments, deleteDocument } from "../../redux/documentsSlice";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  CircularProgress,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Modal,
} from "@mui/material";
import { format } from "date-fns";
import BulkUpload from "./BulkUpload"; // Default export
import AddEditDocumentForm from "./AddEditDocumentForm"; // Default export
import { useNavigate } from "react-router-dom";

const VALID_SORT_FIELDS = ["document_id", "title", "date_"];

const DocumentList = () => {
  const navigate = useNavigate();

  const handleRowClick = (documentId) => {
    navigate(`/documents/${documentId}`);
  };

  const dispatch = useDispatch();
  const { documents, totalCount, status, error } = useSelector(
    (state) => state.documents
  );
  const [isBulkUploadModalOpen, setBulkUploadModalOpen] = useState(false);
  const [isAddDocumentModalOpen, setAddDocumentModalOpen] = useState(false);
  const [editingDocument, setEditingDocument] = useState(false);

  const handleUpdate = (docId) => {
    setAddDocumentModalOpen(true);
    setEditingDocument(documents.find((doc) => doc.document_id === docId));
  };

  const handleAddDocument = () => {
    setEditingDocument(null); // Reset the editing document
    setAddDocumentModalOpen(true);
  };

  const handleDelete = async (docId) => {
    if (window.confirm("Are you sure you want to delete this document?")) {
      try {
        await dispatch(deleteDocument(docId));
        alert("Document deleted successfully!");
      } catch (error) {
        alert("Failed to delete document");
        console.error(error);
      }
    }
  };

  // State for filters, sorting, and pagination
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("date_");
  const [order, setOrder] = useState("asc");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const { role } = useSelector((state) => state.auth);
  // Fetch documents initially
  useEffect(() => {
    dispatch(
      fetchDocuments({
        skip: (page - 1) * pageSize,
        limit: pageSize,
      })
    );
  }, [dispatch, page, pageSize]);

  const handleSearch = () => {
    if (dateFrom && dateTo) {
      if (new Date(dateFrom) > new Date(dateTo)) {
        alert(
          "The 'To Date' must be greater than or equal to the 'From Date'."
        );
        return;
      }
    }

    dispatch(
      fetchDocuments({
        skip: (page - 1) * pageSize,
        limit: pageSize,
        sortBy,
        order,
        search,
        dateFrom,
        dateTo,
      })
    );
    setPage(1); // Reset to first page when performing a new search
  };

  const handleReset = () => {
    // Reset all filters and pagination
    setSearch("");
    setDateFrom("");
    setDateTo("");
    setSortBy("date_");
    setOrder("asc");
    setPage(1);
    setPageSize(10);

    // Fetch all documents without filters
    dispatch(
      fetchDocuments({
        skip: 0,
        limit: 10, // Default page size
      })
    );
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage + 1);
    dispatch(
      fetchDocuments({
        skip: newPage * pageSize,
        limit: pageSize,
        sortBy,
        order,
        search,
        dateFrom,
        dateTo,
      })
    );
  };

  const handleRowsPerPageChange = (event) => {
    const newPageSize = parseInt(event.target.value, 10);
    setPageSize(newPageSize);
    setPage(1);
    dispatch(
      fetchDocuments({
        skip: 0,
        limit: newPageSize,
        sortBy,
        order,
        search,
        dateFrom,
        dateTo,
      })
    );
  };
  return (
    <Box sx={{ padding: { xs: 2, md: 4 } }}>
      <Box sx={{ marginBottom: 2 }}>
        <Grid container spacing={2} alignItems="center">
          {/* Document List Heading */}
          <Grid item xs={12} md={6}>
            <Typography variant="h4" gutterBottom>
              Document List
            </Typography>
          </Grid>
          {role === "admin" && (
            <Grid
              item
              xs={12}
              md={6}
              sx={{
                display: "flex",
                justifyContent: { xs: "center", md: "flex-end" }, // Left-align on small screens, right-align on larger screens
                gap: "10px",
                flexWrap: "wrap", // Ensure buttons wrap on smaller screens
              }}
            >
              <Button
                variant="contained"
                sx={{
                  backgroundColor: "#861F41",
                  color: "#FFFFFF",
                  "&:hover": { backgroundColor: "#6A1B36" },
                }}
                onClick={() => setBulkUploadModalOpen(true)}
              >
                Bulk Upload
              </Button>
              <Button
                variant="contained"
                sx={{
                  backgroundColor: "#E87722",
                  color: "#FFFFFF",
                  "&:hover": { backgroundColor: "#D2691E" },
                }}
                onClick={() => handleAddDocument()}
              >
                Add Document
              </Button>
            </Grid>
          )}
        </Grid>
      </Box>

      {/* Bulk Upload Modal */}
      <Modal
        open={isBulkUploadModalOpen}
        onClose={() => setBulkUploadModalOpen(false)}
      >
        <Box
          sx={{
            width: "50%",
            maxHeight: "90vh", // Limit height to make it scrollable
            overflowY: "auto", // Enable scrolling for overflow content
            marginX: "auto",
            marginTop: "5%",
            padding: "20px",
            backgroundColor: "#fff",
            borderRadius: "8px",
          }}
        >
          <BulkUpload />
        </Box>
      </Modal>

      {/* Add Document Modal */}
      <Modal
        open={isAddDocumentModalOpen}
        onClose={() => setAddDocumentModalOpen(false)}
      >
        <Box
          sx={{
            width: "50%",
            maxHeight: "90vh", // Limit height to make it scrollable
            overflowY: "auto", // Enable scrolling for overflow content
            marginX: "auto",
            marginTop: "5%",
            padding: "20px",
            backgroundColor: "#fff",
            borderRadius: "8px",
          }}
        >
          <AddEditDocumentForm
            initialData={editingDocument || {}}
            onSubmitSuccess={() => {
              setAddDocumentModalOpen(false);
            }}
          />
        </Box>
      </Modal>

      <Grid container spacing={2} alignItems="center" sx={{ marginBottom: 3 }}>
        {/* Search Input */}
        <Grid item xs={12} md={3}>
          <TextField
            label="Search"
            variant="outlined"
            size="small"
            fullWidth
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </Grid>

        {/* Date Range Filters */}
        <Grid item xs={6} md={2}>
          <TextField
            label="From Date"
            type="date"
            InputLabelProps={{ shrink: true }}
            size="small"
            fullWidth
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />
        </Grid>
        <Grid item xs={6} md={2}>
          <TextField
            label="To Date"
            type="date"
            InputLabelProps={{ shrink: true }}
            size="small"
            fullWidth
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
          />
        </Grid>

        {/* Sort Dropdowns */}
        <Grid item xs={6} md={1}>
          <FormControl size="small" fullWidth>
            <InputLabel>Sort By</InputLabel>
            <Select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              {VALID_SORT_FIELDS.map((field) => (
                <MenuItem key={field} value={field}>
                  {field.replace("_", " ")}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={6} md={1}>
          <FormControl size="small" fullWidth>
            <InputLabel>Order</InputLabel>
            <Select value={order} onChange={(e) => setOrder(e.target.value)}>
              <MenuItem value="asc">Ascending</MenuItem>
              <MenuItem value="desc">Descending</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={6} md={1}>
          <Button
            variant="contained"
            sx={{
              backgroundColor: "#861F41", // Chicago Maroon
              color: "#FFFFFF", // White text
              "&:hover": {
                backgroundColor: "#6A1B36", // Slightly darker maroon on hover
              },
            }}
            fullWidth
            onClick={handleSearch}
          >
            Apply
          </Button>
        </Grid>

        {/* Reset Button */}
        <Grid item xs={6} md={1}>
          <Button
            variant="contained"
            sx={{
              backgroundColor: "#E87722", // Burnt Orange
              color: "#FFFFFF", // White text
              "&:hover": {
                backgroundColor: "#D2691E", // Slightly darker orange on hover
              },
            }}
            fullWidth
            onClick={handleReset}
          >
            Reset
          </Button>
        </Grid>
      </Grid>

      {/* Table */}
      {status === "loading" ? (
        <Box sx={{ display: "flex", justifyContent: "center", padding: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : (
        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell>Subject</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Contributor</TableCell>
                  <TableCell>Publisher</TableCell>
                  <TableCell>Format</TableCell>
                  {role === "admin" && <TableCell>Actions</TableCell>}
                </TableRow>
              </TableHead>

              <TableBody>
                {documents.map((doc) => (
                  <TableRow
                    key={doc.document_id}
                    onClick={() => handleRowClick(doc.document_id)}
                    style={{ cursor: "pointer" }} // Add pointer cursor for better UX
                  >
                    <TableCell>{doc.title}</TableCell>
                    <TableCell>{doc.subject}</TableCell>
                    <TableCell>{doc.description}</TableCell>
                    <TableCell>
                      {format(new Date(doc.date_), "MMM dd, yyyy")}
                    </TableCell>
                    <TableCell>{doc.contributor}</TableCell>
                    <TableCell>{doc.publisher}</TableCell>
                    <TableCell>{doc.format_}</TableCell>

                    {/* Conditionally render actions for admin */}
                    {role === "admin" && (
                      <TableCell>
                        {/* Update Button */}
                        <Button
                          variant="outlined"
                          size="small"
                          sx={{
                            color: "#E87722", // Burnt Orange text color
                            borderColor: "#E87722", // Burnt Orange border
                            marginRight: 1, // Space between buttons
                            "&:hover": {
                              backgroundColor: "rgba(232, 119, 34, 0.1)", // Light orange background on hover
                              borderColor: "#D2691E", // Darker orange border on hover
                            },
                          }}
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent row click event
                            handleUpdate(doc.document_id);
                          }}
                        >
                          Update
                        </Button>

                        {/* Delete Button */}
                        <Button
                          variant="outlined"
                          size="small"
                          sx={{
                            color: "#861F41", // Chicago Maroon text color
                            borderColor: "#861F41", // Chicago Maroon border
                            "&:hover": {
                              backgroundColor: "rgba(134, 31, 65, 0.1)", // Light maroon background on hover
                              borderColor: "#6A1B36", // Darker maroon border on hover
                            },
                          }}
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent row click event
                            handleDelete(doc.document_id);
                          }}
                        >
                          Delete
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={totalCount}
            page={page - 1}
            rowsPerPage={pageSize}
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleRowsPerPageChange}
          />
        </Paper>
      )}
    </Box>
  );
};

export default DocumentList;
