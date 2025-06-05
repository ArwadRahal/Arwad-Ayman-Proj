import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/Homepage";
import ManagerOverview from "./pages/ManagerOverview";
import CalendarView from "./components/CalendarView";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import ProductManagement from "./pages/ProductManagement";
import ProtectedRoute from "./components/ProtectedRoute"; // مهم

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

         <Route
          path="/ManagerOverview"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <ManagerOverview />
            </ProtectedRoute>
          }
        />
        <Route
          path="/schedule"
          element={
            <ProtectedRoute allowedRoles={["Trainer", "Trainee", "Admin"]}>
              <CalendarView />
            </ProtectedRoute>
          }
        />
        <Route
          path="/Product-Management"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <ProductManagement />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
