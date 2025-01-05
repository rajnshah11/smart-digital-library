import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchLogsData, setPage, setPageSize } from "../../redux/logsSlice";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Box,
  useMediaQuery,
  CircularProgress,
} from "@mui/material";
import { format } from "date-fns";

const Logs = () => {
  const dispatch = useDispatch();
  const { data, totalItems, loading, error, page, pageSize } = useSelector(
    (state) => state.logs
  );

  const isSmallScreen = useMediaQuery("(max-width:600px)");

  useEffect(() => {
    dispatch(fetchLogsData({ page, pageSize }));
  }, [dispatch, page, pageSize]);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', padding: 2 }}><CircularProgress /></Box>;
  if (error) return <Box sx={{ padding: 2 }}><p>Error: {error}</p></Box>;

  // Helper function to generate action descriptions
  const getActionDescription = (action) => {
    switch (action) {
      case "add_document":
        return `Document created`;
      case "update_document":
        return `Document updated`;
      case "delete_document":
        return `Document deleted`;
      case "get_document_by_id":
        return `Document viewed`;
      default:
        return action; // Default to the raw action name if unhandled
    }
  };

  // Format the data
  const formattedData = data.map((log) => ({
    Timestamp: format(new Date(log.timestamp), "MMM dd, yyyy hh:mm a"), // Format timestamp
    Action: getActionDescription(log.action), // Generate action description
    DocumentID: log.document_id || "N/A", // Handle missing document ID
    User: log.user || "Unknown", // Handle missing user
  }));

  return (
    <Box sx={{ overflowX: isSmallScreen ? "auto" : "visible", padding: 2 }}>
      <TableContainer>
        <Table>
          {!isSmallScreen && (
            <TableHead>
              <TableRow>
                <TableCell>Timestamp</TableCell>
                <TableCell>Action</TableCell>
                <TableCell>Document ID</TableCell>
                <TableCell>Who Did It</TableCell>
              </TableRow>
            </TableHead>
          )}
          <TableBody>
            {formattedData.map((log, index) => (
              <TableRow key={index}>
                {isSmallScreen ? (
                  <TableCell colSpan={4}>
                    <Box sx={{ marginBottom: 1 }}>
                      <strong>Timestamp:</strong> {log.Timestamp}
                    </Box>
                    <Box sx={{ marginBottom: 1 }}>
                      <strong>Action:</strong> {log.Action}
                    </Box>
                    <Box sx={{ marginBottom: 1 }}>
                      <strong>Document ID:</strong> {log.DocumentID}
                    </Box>
                    <Box>
                      <strong>Who Did It:</strong> {log.User}
                    </Box>
                  </TableCell>
                ) : (
                  <>
                    <TableCell>{log.Timestamp}</TableCell>
                    <TableCell>{log.Action}</TableCell>
                    <TableCell>{log.DocumentID}</TableCell>
                    <TableCell>{log.User}</TableCell>
                  </>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {!isSmallScreen && (
        <TablePagination
          rowsPerPageOptions={[5, 10]}
          component="div"
          count={totalItems}
          rowsPerPage={pageSize}
          page={page - 1}
          onPageChange={(_, newPage) => dispatch(setPage(newPage + 1))}
          onRowsPerPageChange={(event) =>
            dispatch(setPageSize(parseInt(event.target.value)))
          }
        />
      )}
    </Box>
  );
};

export default Logs;
