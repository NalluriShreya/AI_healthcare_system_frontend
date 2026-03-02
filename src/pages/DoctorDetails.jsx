import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Mail,
  Phone,
  Briefcase,
  Award,
  Calendar,
  Clock,
  User,
  Edit,
  Ban,
  CheckCircle,
  GraduationCap,
} from 'lucide-react';
import { EditDoctorModal } from '../components/EditDoctorModal';

export function DoctorDetails() {
  const { doctorId } = useParams();
  const navigate = useNavigate();

  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  /* ================= FETCH DOCTOR ================= */
  useEffect(() => {
    fetchDoctor();
  }, [doctorId]);

  const fetchDoctor = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/admin/doctor/${doctorId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      setDoctor(data.doctor ?? data);
    } catch (error) {
      console.error('Failed to fetch doctor:', error);
    } finally {
      setLoading(false);
    }
  };

  /* ================= STATUS UPDATE ================= */
  const handleStatusChange = async (newStatus) => {
    try {
      setUpdatingStatus(true);
      const token = localStorage.getItem('token');

      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/admin/doctor/${doctor.doctor_id}/status`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Failed to update status');
      }

      setDoctor((prev) => ({
        ...prev,
        status: newStatus,
      }));
    } catch (error) {
      console.error(error);
      alert(error.message || 'Failed to update status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  /* ================= EDIT SUCCESS ================= */
  const handleEditSuccess = (updatedDoctor) => {
    setDoctor(updatedDoctor);
  };

  /* ================= HELPERS ================= */
  const formatDateTime = (date) => {
    if (!date) return '—';

    const utcDate = new Date(date);
    const istDate = new Date(utcDate.getTime() + 5.5 * 60 * 60 * 1000);

    return istDate.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      active: 'bg-green-100 text-green-800 border-green-200',
      inactive: 'bg-red-100 text-red-800 border-red-200',
    };

    return (
      <span
        className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold border ${styles[status]}`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  /* ================= LOADING / ERROR ================= */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading doctor details...</p>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-600">Doctor not found</p>
      </div>
    );
  }

  /* ================= UI ================= */
  return (
    <div className="min-h-screen bg-gradient-soft">
      {/* HEADER */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft />
            </button>
            <h1 className="text-2xl font-bold">Doctor Details</h1>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setShowEditModal(true)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <Edit size={18} /> Edit
            </button>

            {doctor.status === 'active' && (
              <button
                onClick={() => handleStatusChange('inactive')}
                disabled={updatingStatus}
                className="flex items-center gap-2 px-4 py-2 border border-red-300 text-red-600 rounded-lg cursor-pointer hover:bg-red-50 hover:border-red-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Ban size={18} />
                {updatingStatus ? 'Updating...' : 'Deactivate'}
              </button>
            )}

            {doctor.status === 'inactive' && (
              <button
                onClick={() => handleStatusChange('active')}
                disabled={updatingStatus}
                className="flex items-center gap-2 px-4 py-2 border border-green-300 text-green-600 rounded-lg cursor-pointer hover:bg-green-50 hover:border-green-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CheckCircle size={18} />
                {updatingStatus ? 'Updating...' : 'Activate'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg p-6"
        >
          <h2 className="text-3xl font-bold mb-6">{doctor.name}</h2>

          <div className="flex items-center gap-3 mb-6">
            {getStatusBadge(doctor.status)}
            <span className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-sm font-semibold">
              ID: {doctor.doctor_id}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InfoItem icon={<Mail />} label="Email" value={doctor.email} />
            <InfoItem icon={<Phone />} label="Phone" value={doctor.phone} />
            <InfoItem icon={<Briefcase />} label="Department" value={doctor.department} />
            <InfoItem icon={<Award />} label="Qualification" value={doctor.qualification} />
            <InfoItem icon={<GraduationCap />} label="Specialization" value={doctor.specialization} />
            <InfoItem icon={<User />} label="Created By" value={doctor.created_by_admin_name} />
            <InfoItem icon={<Calendar />} label="Created At" value={formatDateTime(doctor.created_at)} />
            <InfoItem
              icon={<Clock />}
              label="Last Login"
              value={
                doctor.last_login ? (
                  formatDateTime(doctor.last_login)
                ) : (
                  <span className="text-gray-400">Never logged in</span>
                )
              }
            />
          </div>
        </motion.div>
      </div>

      {/* EDIT MODAL */}
      <EditDoctorModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSuccess={handleEditSuccess}
        doctor={doctor}
      />
    </div>
  );
}

/* ================= HELPER ================= */
function InfoItem({ icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-1 text-gray-400">{icon}</div>
      <div>
        <p className="text-xs uppercase text-gray-500">{label}</p>
        <p className="font-semibold">{value || '—'}</p>
      </div>
    </div>
  );
}
