import React, { useState } from "react";
import {
  TextField,
  Button,
  Container,
  Typography,
  Box,
  Link,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
} from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { register } from "../../redux/authSlice";
import { validateForm } from "../../utils/validation";
import libraryBackground from "../../assets/library.jpg";

function Register() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmpassword: "",
    role: "",
  });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Update form data
    setFormData({ ...formData, [name]: value });
    // Dynamically clear the error for the specific field that was changed
    if (name === "password" || name === "confirmpassword") {
      if (formData.password === formData.confirmpassword) {
        setErrors((prevErrors) => ({ ...prevErrors, confirmpassword: "", password:"" }));
      }
    } else if (name === "email" && errors.email) {
      setErrors((prevErrors) => ({ ...prevErrors, email: "" }));
    } else{
      setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form data
    const { isValid, errors: validationErrors } = validateForm(formData, [
      "username",
      "email",
      "password",
      "confirmpassword",
      "role",
    ]);

    if (!isValid) return setErrors(validationErrors);

    try {
      await axios.post("http://0.0.0.0:8000/auth/register", formData);
      dispatch(
        register({
          username: formData.username,
          email: formData.email,
          role: formData.role,
        })
      );
      alert("Registration successful!");
      navigate("/auth/login");
      setErrors({});
    } catch (error) {
      alert(
        error.response?.data?.detail || "Registration failed! Please try again."
      );
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
        <Typography variant="h4" align="center">
          Register
        </Typography>
        <form onSubmit={handleSubmit}>
          {["username", "email", "password", "confirmpassword"].map((field) => (
            <TextField
              key={field}
              label={field.charAt(0).toUpperCase() + field.slice(1)}
              name={field}
              type={field.includes("password") ? "password" : "text"}
              fullWidth
              margin="normal"
              value={formData[field]}
              onChange={handleChange}
              error={!!errors[field]}
              helperText={errors[field]}
            />
          ))}

          {/* Role Dropdown */}
          <FormControl fullWidth margin="normal" error={!!errors.role}>
            <InputLabel id="role-label">Role</InputLabel>
            <Select
              labelId="role-label"
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
            >
              <MenuItem value="user">User</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
            </Select>
            {errors.role && (
              <Typography variant="caption" color="error">
                {errors.role}
              </Typography>
            )}
          </FormControl>

          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{
              backgroundColor: "#E87722", // Burnt Orange
              color: "#FFFFFF", // White text
              "&:hover": {
                backgroundColor: "#D2691E", // Darker Burnt Orange on hover
              },
            }}
          >
            Register
          </Button>

          <Typography align="center">
            Already have an account?{" "}
            <Link href="/auth/login" color="#E87722">
              Log In
            </Link>
          </Typography>
        </form>
      </Container>
    </Box>
  );
}

export default Register;
