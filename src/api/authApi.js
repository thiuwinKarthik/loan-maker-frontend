import axiosInstance from "./axiosInstance";

export const loginUser = async (credentials) => {
  // credentials = { email, password }
  try {
    const response = await axiosInstance.post("/auth/login", credentials);
    return response.data; // typically returns token + user info
  } catch (error) {
    throw error.response?.data || { message: "Login failed" };
  }
};

export const registerUser = async (userData) => {
  // userData = { name, email, password }
  try {
    const response = await fetch("https://loan-maker-backend.onrender.com/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      // Extract error message if available
      const errorData = await response.json().catch(() => null);
      throw errorData || { message: "Registration failed" };
    }

    const data = await response.json();
    return data; // user created info
  } catch (error) {
    throw error;
  }
};
