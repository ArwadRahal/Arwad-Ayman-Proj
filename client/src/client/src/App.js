import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';

import HomePage from './pages/Homepage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ManagerOverview from './pages/ManagerOverview';
import ProductManagement from './pages/ProductManagement';
import StatusPage from './pages/StatusPage';
import CalendarView from './components/CalendarView';
import TraineeView from './pages/TraineeDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import Shop from './pages/Shop';
import ProfilePage from './pages/ProfilePage';
import CoachView from './pages/CoachView';
import AdminOrders from './pages/AdminOrders';
import MyOrders from './pages/MyPayments';  

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        <Route element={<Layout />}>
          <Route
            path="/ManagerOverview"
            element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <ManagerOverview />
              </ProtectedRoute>
            }
          />
          <Route
            path="/schedule"
            element={
              <ProtectedRoute allowedRoles={['Coach', 'Trainee', 'Admin']}>
                <CalendarView />
              </ProtectedRoute>
            }
          />
          <Route
            path="/product-management"
            element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <ProductManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/status"
            element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <StatusPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/TraineeView"
            element={
              <ProtectedRoute allowedRoles={['Trainee']}>
                <TraineeView />
              </ProtectedRoute>
            }
          />
          <Route
            path="/shop"
            element={
              <ProtectedRoute allowedRoles={['Trainee', 'Coach']}>
                <Shop />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute allowedRoles={['Admin', 'Trainee', 'Coach']}>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/:id"
            element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/coach"
            element={
              <ProtectedRoute allowedRoles={['Coach']}>
                <CoachView />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/orders"
            element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <AdminOrders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-payments"
            element={
              <ProtectedRoute allowedRoles={['Trainee', 'Coach']}>
                <MyOrders />
              </ProtectedRoute>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
