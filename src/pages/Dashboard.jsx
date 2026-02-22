// Dashboard.jsx
import { PatientDashboard } from "../components/PatientDashboard";
import { DoctorDashboard } from "../components/DoctorDashboard";
import AdminDashboard from "../components/AdminDashboard";

import { useAuthStore } from "../store/authStore";

export default function Dashboard() {
  const { user } = useAuthStore();

  if (!user) return null;

  switch (user.role) {
    case 'patient':
      return <PatientDashboard />;

    case 'doctor':
      return <DoctorDashboard />;

    case 'admin':
      return <AdminDashboard />;

    default:
      return (
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-gray-600">Unauthorized access</p>
        </div>
      );
  }
}
