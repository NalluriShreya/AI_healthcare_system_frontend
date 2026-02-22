import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import Login from './pages/Login';
import Signup from './pages/Signup';
import { UserManagement } from './pages/UserManagement.jsx';
import { DoctorDetails } from './pages/DoctorDetails.jsx';
// import EnhancedDoctorDashboard from './components/EnhancedDoctorDashboard.jsx';
// import EnhancedPatientDashboard from './components/EnhancedPatientDashboard.jsx';

// import {
//   PatientDashboard,
//   DoctorDashboard,
//   AdminDashboard,
// } from './pages/Dashboard';

import Dashboard from './pages/Dashboard';


import { useAuthStore } from './store/authStore.js';

/* ---------- Protected Route Wrapper ---------- */
function ProtectedRoute({ children, role }) {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (role && user?.role !== role) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default function App() {
  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />

      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/users"
            element={
              <ProtectedRoute role="admin">
                <UserManagement />
              </ProtectedRoute>
            }
          />

          <Route path="/admin/doctors/:doctorId" element={<DoctorDetails />} />



          {/* Fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </>
  );
}
