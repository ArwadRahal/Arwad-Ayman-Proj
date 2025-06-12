// App.jsx
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import HomePage from "./pages/Homepage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import ManagerOverview from "./pages/ManagerOverview";
import ProductManagement from "./pages/ProductManagement";
import StatusPage from "./pages/StatusPage";
import CalendarView from "./components/CalendarView";
import TraineeDashboard from "./pages/TraineeDashboard";
import ProtectedRoute from "./components/ProtectedRoute";

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
          path="/product-management"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <ProductManagement />
            </ProtectedRoute>
          }
        />

        <Route
          path="/status"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <StatusPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/TraineeView"
          element={
            <ProtectedRoute allowedRoles={["Trainee"]}>
              <TraineeDashboard />
            </ProtectedRoute>
          }
        />
       

      </Routes>
    </BrowserRouter>
  );
}

export default App;
