// src/App.jsx
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


function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* דפים בלי סיידבר */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* דפים עם סיידבר */}
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
              <ProtectedRoute allowedRoles={['Trainer','Trainee','Admin']}>
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
              <ProtectedRoute allowedRoles={['Trainee']}>
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


        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
