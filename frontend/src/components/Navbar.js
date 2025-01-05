import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../redux/authSlice";
import { useNavigate } from "react-router-dom";
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  Container,
  Avatar,
  Tooltip,
  MenuItem,
} from "@mui/material";
import { ROUTES } from "../constants/routes"; // Import route constants

function Navbar() {
  const { isAuthenticated, username, role } = useSelector(
    (state) => state.auth
  );
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [anchorElUser, setAnchorElUser] = useState(null);

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate(ROUTES.LOGIN); // Use route constant
    handleCloseUserMenu();
  };

  return (
    <AppBar
      position="static"
      sx={{
        backgroundColor: "#861F41",
        boxShadow: "0px 4px 10px rgba(0,0,0,0.2)",
      }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          {/* Application Title */}
          <Typography
            variant="h6"
            noWrap
            component="a"
            href={ROUTES.USER_DASHBOARD} // Use route constant
            sx={{
              ml: 0, // Remove excess margin on the left
              fontWeight: "bold",
              letterSpacing: ".2rem",
              color: "#FFFFFF", // White text
              textDecoration: "none",
            }}
          >
            Library System
          </Typography>

          {/* Spacer to push profile to the right */}
          <Box sx={{ flexGrow: 1 }} />

          {/* Right-aligned User Menu */}
          {isAuthenticated ? (
            <Box sx={{ flexGrow: 0 }}>
              <Tooltip title="Open settings">
                <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                  <Avatar
                    alt={username}
                    sx={{
                      bgcolor: "#E87722",
                      color: "#FFFFFF",
                    }}
                  >
                    {username ? username.charAt(0).toUpperCase() : ""}
                  </Avatar>
                </IconButton>
              </Tooltip>
              <Menu
                sx={{ mt: "45px" }}
                id="menu-appbar"
                anchorEl={anchorElUser}
                anchorOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                keepMounted
                transformOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                open={Boolean(anchorElUser)}
                onClose={handleCloseUserMenu}
              >
                {/* Admin-Specific Menu Items */}
                {role === "admin" && (
                  <>
                    <MenuItem
                      onClick={() => {
                        navigate(ROUTES.ADMIN_DASHBOARD);
                        handleCloseUserMenu();
                      }}
                      sx={{
                        "&:hover": {
                          backgroundColor: "#E87722",
                          color: "#FFFFFF",
                        },
                      }}
                    >
                      Admin Dashboard
                    </MenuItem>
                    <MenuItem
                      onClick={() => {
                        navigate(ROUTES.ANALYTICS);
                        handleCloseUserMenu();
                      }}
                      sx={{
                        "&:hover": {
                          backgroundColor: "#E87722",
                          color: "#FFFFFF",
                        },
                      }}
                    >
                      Analytics
                    </MenuItem>
                  </>
                )}

                {/* User-Specific Menu Item */}
                {role === "user" && (
                  <MenuItem
                    onClick={() => {
                      navigate(ROUTES.USER_DASHBOARD);
                      handleCloseUserMenu();
                    }}
                    sx={{
                      "&:hover": {
                        backgroundColor: "#E87722",
                        color: "#FFFFFF",
                      },
                    }}
                  >
                    User Dashboard
                  </MenuItem>
                )}

                {/* Logout Option */}
                <MenuItem
                  onClick={handleLogout}
                  sx={{
                    "&:hover": {
                      backgroundColor: "#E87722",
                      color: "#FFFFFF",
                    },
                  }}
                >
                  Logout
                </MenuItem>
              </Menu>
            </Box>
          ) : (
            // Show Login Option for Non-Authenticated Users
            <Typography
              variant="body1"
              component="a"
              href={ROUTES.LOGIN}
              sx={{
                color: "#FFFFFF",
                textDecoration: "none",
                "&:hover": {
                  textDecoration: "underline",
                },
              }}
            >
              Login
            </Typography>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default Navbar;
