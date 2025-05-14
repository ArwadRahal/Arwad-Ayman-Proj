import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./pages/Homepage";
import ManagerOverview from "./pages/ManagerOverview";
import LoginPage  from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
// import Dashboard from "./pages/Dashboard";  // your future dashboard

function App() {
  const token = localStorage.getItem("token");
  return (
    <BrowserRouter>
      <Routes>
      <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/ManagerOverview" element={<ManagerOverview />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
