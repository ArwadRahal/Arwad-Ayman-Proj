import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const userData = localStorage.getItem("currentUser");
  const user = userData ? JSON.parse(userData) : null;

  if (!user || (allowedRoles && !allowedRoles.includes(user.role))) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
