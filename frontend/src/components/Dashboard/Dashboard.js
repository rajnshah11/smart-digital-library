import React, { useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchDashboardData } from "../../redux/dashboardSlice";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  useTheme,
  Box,
} from "@mui/material";
import { Bar, Line, Scatter } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  TimeScale, // Import TimeScale
  Title,
  Tooltip,
} from "chart.js";
import "chartjs-adapter-date-fns"; 

ChartJS.register(
  BarElement,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  TimeScale, 
  Title,
  Tooltip
);

ChartJS.register(
  BarElement,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip
);

const Dashboard = () => {
  const dispatch = useDispatch();
  const { data, loading, error } = useSelector((state) => state.dashboard);
  const theme = useTheme();

  const vtColors = useMemo(() => ({
    maroon: "#861F41",
    orange: "#E87722",
    gray: "#75787B",
    white: "#FFFFFF",
    lightGray: "#f5f5f5",
  }), []);
  
  useEffect(() => {
    dispatch(fetchDashboardData());
  }, [dispatch]);

  const { activity_trends = [], views_per_year = [], heatmap_distribution = [] } = data || {};

  const scatterData = useMemo(() => {
    return heatmap_distribution.flatMap((item) => {
      const actions = [
        { action: "Document created", count: item.add_document, color: vtColors.maroon, y: 1 },
        { action: "Bulk upload", count: item.bulk_upload_document, color: vtColors.gray, y: 2 }, 
        { action: "Document deleted", count: item.delete_document, color: vtColors.orange, y: 3 },
        { action: "Document viewed", count: item.get_document_by_id, color: vtColors.gray, y: 4 },
        { action: "Document updated", count: item.update_document, color: vtColors.lightGray, y: 5 }, 
      ];
      return actions.flatMap((action) =>
        Array.from({ length: action.count }, () => ({
          x: new Date(item.year, item.month - 1).getTime(), 
          y: action.y,
          label: action.action,
          backgroundColor: action.color,
        }))
      );
    });
  }, [heatmap_distribution, vtColors]);
  
  const scatterChartData = {
    datasets: [
      {
        label: "Activity Logs",
        data: scatterData,
        borderColor: scatterData.map((point) => point.backgroundColor),
        backgroundColor: scatterData.map((point) => point.backgroundColor),
        pointRadius: 5,
        pointHoverRadius: 7,
      },
    ],
  };
  
  const scatterChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        type: "time",
        time: {
          unit: "month",
          tooltipFormat: "MMM yyyy",
        },
        title: {
          display: true,
          text: "Time (Month-Year)",
        },
      },
      y: {
        ticks: {
          callback(value) {
            if (value === 1) return "Created";
            if (value === 2) return "Bulk Upload";
            if (value === 3) return "Deleted";
            if (value === 4) return "Viewed";
            if (value === 5) return "Updated";
            return "";
          },
        },
        title: {
          display: true,
          text: "Operation Type",
        },
      },
    },
    plugins: {
      tooltip: {
        callbacks: {
          label(context) {
            const operation = context.raw.label || context.dataset.label || "";
            return `${operation}: (${new Date(context.raw.x).toLocaleDateString()}, ${context.raw.y})`;
          },
        },
      },
      legend: {
        display: true,
        position: "top",
      },
    },
  };
  
  if (loading)
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Typography>Loading...</Typography>
      </Box>
    );

  if (error)
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Typography>Error: {error}</Typography>
      </Box>
    );

  if (!data)
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Typography>No data available</Typography>
      </Box>
    );
  return (
    <Grid
      container
      spacing={3}
      sx={{ padding: theme.spacing(2), maxWidth: "100vw" }}
    >
      {/* Activity Trends */}
      <Grid item xs={12} sm={12} md={4}>
        <Card
          sx={{
            height: "100%",
            maxHeight: "400px",
            backgroundColor: vtColors.lightGray,
          }}
        >
          <CardContent>
            <Typography
              variant="h6"
              gutterBottom
              sx={{ color: vtColors.maroon }}
            >
              Activity Trends
            </Typography>
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "300px",
              }}
            >
              <Bar
                data={{
                  labels: [
                    ...new Set(activity_trends.map((item) => item.month_year)),
                  ],
                  datasets: [
                    {
                      label: "Create Document",
                      data: activity_trends
                        .filter((item) => item.action === "add_document")
                        .map((item) => item.count),
                      backgroundColor: vtColors.orange,
                    },
                    {
                      label: "Update Document",
                      data: activity_trends
                        .filter((item) => item.action === "update_document")
                        .map((item) => item.count),
                      backgroundColor: vtColors.maroon,
                    },
                    {
                      label: "Delete Document",
                      data: activity_trends
                        .filter((item) => item.action === "delete_document")
                        .map((item) => item.count),
                      backgroundColor: vtColors.gray,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    x: { title: { display: true, text: "Month-Year" } },
                    y: {
                      title: { display: true, text: "Count" },
                      beginAtZero: true,
                    },
                  },
                  plugins: { legend: { position: "top" } },
                }}
              />
            </Box>
          </CardContent>
        </Card>
      </Grid>
      {/* Scatter Plot */}
      <Grid item xs={12} sm={12} md={4}>
        <Card
          sx={{
            height: "100%",
            maxHeight: "400px",
            overflowY: "auto",
            backgroundColor: vtColors.lightGray,
          }}
        >
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ color: vtColors.maroon }}>
              Activity Scatter Plot
            </Typography>
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "300px",
                width: "100%",
              }}
            >
              <Scatter data={scatterChartData} options={scatterChartOptions} />
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Views Per Year */}
      <Grid item xs={12} sm={12} md={4}>
        <Card
          sx={{
            height: "100%",
            maxHeight: "400px",
            backgroundColor: vtColors.lightGray,
          }}
        >
          <CardContent>
            <Typography
              variant="h6"
              gutterBottom
              sx={{ color: vtColors.maroon }}
            >
              Views Per Year
            </Typography>
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "300px",
              }}
            >
              <Line
                data={{
                  labels: views_per_year.map((item) => item.year),
                  datasets: [
                    {
                      label: "Views",
                      data: views_per_year.map((item) => item.count),
                      borderColor: vtColors.orange,
                      backgroundColor: `${vtColors.orange}33`,
                      tension: 0.4,
                    },
                  ],
                }}
              />
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default Dashboard;
