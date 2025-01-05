import React, { useState } from "react";
import libraryBackground from "../../assets/library.jpg"; // Import the image
import {
  TextField,
  Button,
  Container,
  Typography,
  Box,
  Link,
} from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { login } from "../../redux/authSlice";
import { validateForm } from "../../utils/validation";


const Login = () => {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { isValid, errors: validationErrors } = validateForm(formData, [
      "username",
      "password",
    ]);
    if (!isValid) return setErrors(validationErrors);

    try {
      const params = new URLSearchParams(formData);
      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/auth/login`,
        params
      );
      const { access_token, role } = response.data;

      sessionStorage.setItem("token", access_token);
      dispatch(
        login({
          username: formData.username,
          role,
          token: access_token,
        })
      );
      navigate(role === "admin" ? "/admin" : "/");
    } catch (error) {
      alert("Login failed! Please check your credentials.");
    }
  };

  return (
    <Box
      sx={{
        backgroundImage: `url(${libraryBackground})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Container
        maxWidth="sm"
        sx={{
          backgroundColor: "rgba(255,255,255,0.9)",
          padding: "20px",
          borderRadius: "10px",
          boxShadow: "0px 4px 10px rgba(0,0,0,0.25)",
        }}
      >
        <Typography variant="h4" align="center" gutterBottom>
          Log In
        </Typography>
        <form onSubmit={handleSubmit}>
          {["username", "password"].map((field) => (
            <TextField
              key={field}
              label={field.charAt(0).toUpperCase() + field.slice(1)}
              name={field}
              type={field === "password" ? "password" : "text"}
              fullWidth
              margin="normal"
              value={formData[field]}
              onChange={handleChange}
              error={!!errors[field]}
              helperText={errors[field]}
            />
          ))}
          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{
              backgroundColor: "#E87722", 
              color: "#FFFFFF", 
              "&:hover": {
                backgroundColor: "#D2691E",
              },
            }}
          >
            Log In
          </Button>

          <Typography align="center">
            Don't have an account?{" "}
            <Link href="/auth/register" color="#E87722">
              Register
            </Link>
          </Typography>
        </form>
      </Container>
    </Box>
  );
};

export default Login;
