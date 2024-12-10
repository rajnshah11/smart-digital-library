import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Divider,
  Box,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import LogoutIcon from "@mui/icons-material/Logout";

function Navbar({ username, onLogout }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  // Toggle drawer for mobile
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Drawer content for mobile
  const drawer = (
    <List sx={{ paddingTop: 2 }}>
      <ListItem>
        <Typography
          variant="h5"
          sx={{
            fontWeight: "bold",
            color: "#333", // Dark text color to stand out on light background
            letterSpacing: "2px",
          }}
        >
          📚 Smart Library
        </Typography>
      </ListItem>
      <Divider sx={{ backgroundColor: "#ccc", marginY: 1 }} />
      <ListItem>
        <Typography sx={{ color: "#555", fontSize: "1.1rem" }}>
        Hi, {username}
        </Typography>
      </ListItem>
      <ListItem
        button
        onClick={onLogout}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          paddingY: 1,
          marginY: 1,
          borderRadius: "10px",
          "&:hover": {
            backgroundColor: "#ddd", // Light hover effect for logout button
          },
        }}
      >
        <LogoutIcon sx={{ color: "#555" }} />
        <ListItemText
          primary="Logout"
          sx={{ color: "#333", fontSize: "1.1rem" }}
        />
      </ListItem>
    </List>
  );

  return (
    <>
      {/* AppBar for Desktop */}
      <AppBar
        position="sticky"
        sx={{
          backgroundColor: "#f5f5f5", // Light grey background for AppBar
          boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)", // Light shadow for depth
          paddingY: 1,
        }}
      >
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          {/* Library Logo */}
          <Typography
            variant="h6"
            sx={{
              fontWeight: "bold",
              color: "#333", // Dark text color for contrast on light background
              fontSize: "1.5rem",
            }}
          >
            📚 Smart Library
          </Typography>

          {/* Desktop View */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: "20px",
              color: "#333",
            }}
          >
            {/* Only display username and logout button on Desktop */}
            <Box sx={{ display: { xs: "none", sm: "flex" } }}>
              <Typography
                sx={{
                  fontSize: "1.1rem",
                  color: "#333",
                  marginRight: "15px",
                  paddingTop:"10px"
                }}
              >
              Hi, {username}
              </Typography>
              <Button
                color="inherit"
                startIcon={<LogoutIcon />}
                onClick={onLogout}
                sx={{
                  backgroundColor: "#e0e0e0", // Light grey button background
                  borderRadius: "25px",
                  paddingX: "15px",
                  fontSize: "1.1rem",
                  "&:hover": {
                    backgroundColor: "#d0d0d0", // Slightly darker grey on hover
                  },
                }}
              >
                Logout
              </Button>
            </Box>
          </Box>

          {/* Mobile Menu Button */}
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={handleDrawerToggle}
            sx={{ display: { sm: "none" }, color: "#333" }}
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Drawer for Mobile */}
      <Drawer
        anchor="left"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        sx={{
          display: { xs: "block", sm: "none" },
          "& .MuiDrawer-paper": {
            backgroundColor: "#f5f5f5", // Matching light gray background for drawer
            color: "#333", // Dark text for contrast
            width: 240,
            paddingTop: 2,
            borderRadius: "10px",
          },
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
}

export default Navbar;
