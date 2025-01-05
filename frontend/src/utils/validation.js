export const validateForm = (formData, fields) => {
  const errors = {};
  let isValid = true;

  // Helper function to format field names
  const formatFieldName = (field) => {
    return field
      .replace(/([A-Z])/g, " $1") // Add space before capital letters
      .replace(/^./, (str) => str.toUpperCase()); // Capitalize first letter
  };

  // Iterate over fields and validate each one
  fields.forEach((field) => {
    if (!formData[field]) {
      errors[field] = `${formatFieldName(field)} is required.`;
      isValid = false;
    } else {
      // Additional validations for specific fields
      if (field === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData[field])) {
        errors[field] = "Invalid email address.";
        isValid = false;
      }

      if (field === "password" && formData.password.length < 6) {
        errors[field] = "Password must be at least 6 characters long.";
        isValid = false;
      }
    }
  });

  // Password match validation
  if (
    formData.password &&
    formData.confirmpassword &&
    formData.password !== formData.confirmpassword
  ) {
    errors.confirmpassword = "Passwords do not match.";
    isValid = false;
  }

  return { isValid, errors };
};
