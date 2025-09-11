import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user")); // We'll store user in login

  // If no token → redirect to login
  if (!token || !user) {
    return <Navigate to="/" replace />;
  }

  // If user's role is not allowed → redirect to login
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
