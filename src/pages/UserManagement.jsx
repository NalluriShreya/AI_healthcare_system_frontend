import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  UserPlus,
  Search,
  MoreVertical,
  Mail,
  Phone,
  Stethoscope,
  User,
  ArrowLeft,
  Ban,
  CheckCircle,
  Bell,
  LogOut,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { AddDoctorModal } from '../components/AddDoctorModal';

export function UserManagement() {
  const navigate = useNavigate();
  const { user, logout, token: authToken } = useAuthStore();

  const [activeTab, setActiveTab]               = useState('doctors');
  const [showAddDoctorModal, setShowAddDoctorModal] = useState(false);
  const [doctors, setDoctors]                   = useState([]);
  const [patients, setPatients]                 = useState([]);
  const [loading, setLoading]                   = useState(true);
  const [searchQuery, setSearchQuery]           = useState('');
  const [statusFilter, setStatusFilter]         = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [showActionMenu, setShowActionMenu]     = useState(null);

  // Resolve token from store or localStorage as fallback
  const getToken = () => authToken || localStorage.getItem('token');

  /* ── Data fetching ────────────────────────────────────────── */
  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status_filter', statusFilter);
      if (departmentFilter !== 'all') params.append('department', departmentFilter);

      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/admin/doctors?${params}`,
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      const data = await res.json();
      setDoctors(data.doctors || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/admin/patients`,
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      const data = await res.json();
      setPatients(data.patients || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    activeTab === 'doctors' ? fetchDoctors() : fetchPatients();
  }, [activeTab, statusFilter, departmentFilter]);

  useEffect(() => {
    const handleClickOutside = () => setShowActionMenu(null);
    if (showActionMenu) document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showActionMenu]);

  const updateDoctorStatus = async (doctorId, status) => {
    await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/admin/doctor/${doctorId}/status`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ status }),
      }
    );
    fetchDoctors();
    setShowActionMenu(null);
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  const filteredDoctors  = doctors.filter(d =>
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.email.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredPatients = patients.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  /* ── Render ───────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-gradient-soft">

      {/* ── NAVBAR — matches AdminDashboard exactly ─────────── */}
      <header className="header-container">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2">

            {/* Left: logo + back button */}
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              {/* Back arrow */}
              <button
                onClick={() => navigate('/dashboard')}
                className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors shrink-0"
                aria-label="Back to dashboard"
              >
                <ArrowLeft size={18} className="text-gray-600" />
              </button>

              {/* Logo */}
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <div className="w-9 h-9 sm:w-12 sm:h-12 bg-gradient-primary rounded-xl flex items-center justify-center text-lg sm:text-2xl shadow-md shrink-0">
                  🏥
                </div>
                <div className="min-w-0">
                  <h1 className="text-sm sm:text-xl font-display text-gray-900 leading-tight">MediCare AI</h1>
                  <p className="text-[11px] sm:text-sm text-gray-600">Admin Portal</p>
                </div>
              </div>
            </div>

            {/* Right: user info + logout */}
            <div className="flex items-center gap-1 sm:gap-3 shrink-0">
              {/* User info — desktop only */}
              <div className="hidden md:flex items-center gap-3 pr-3 border-r border-gray-200">
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900 max-w-[140px] truncate">{user?.name}</p>
                  <p className="text-xs text-gray-500 max-w-[140px] truncate">{user?.email}</p>
                </div>
              </div>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut size={16} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ── PAGE CONTENT ────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8">

        {/* Page title row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5 sm:mb-8">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">User Management</h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Manage your doctors and patients</p>
          </div>

          {activeTab === 'doctors' && (
            <button
              onClick={() => setShowAddDoctorModal(true)}
              className="flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold text-sm sm:text-base shadow-md hover:shadow-lg transition-all self-start sm:self-auto"
            >
              <UserPlus size={16} />
              <span>Add Doctor</span>
            </button>
          )}
        </div>

        {/* Tabs + Search row */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-4 sm:mb-6">

          {/* Tabs */}
          <div className="flex gap-2">
            {[
              { key: 'doctors',  label: 'Doctors',  Icon: Stethoscope },
              { key: 'patients', label: 'Patients', Icon: User },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1.5 px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg font-semibold text-xs sm:text-sm transition-all ${
                  activeTab === tab.key
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                <tab.Icon size={14} />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative flex-1 sm:max-w-xs">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={`Search ${activeTab}…`}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 sm:py-2.5 text-xs sm:text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            />
          </div>

          {/* Status filter (doctors only) */}
          {activeTab === 'doctors' && (
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-3 py-2 sm:py-2.5 text-xs sm:text-sm border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending</option>
            </select>
          )}
        </div>

        {/* List */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : activeTab === 'doctors' ? (
          <DoctorList
            doctors={filteredDoctors}
            showActionMenu={showActionMenu}
            setShowActionMenu={setShowActionMenu}
            onUpdateStatus={updateDoctorStatus}
            navigate={navigate}
          />
        ) : (
          <PatientList patients={filteredPatients} />
        )}
      </main>

      <AddDoctorModal
        isOpen={showAddDoctorModal}
        onClose={() => setShowAddDoctorModal(false)}
        onSuccess={fetchDoctors}
      />
    </div>
  );
}

/* ── SUB-COMPONENTS ─────────────────────────────────────────── */

const StatusBadge = ({ status }) => {
  const styles = {
    pending:  'bg-yellow-100 text-yellow-700',
    active:   'bg-green-100  text-green-700',
    inactive: 'bg-red-100    text-red-700',
  };
  return (
    <span className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold capitalize ${styles[status] || 'bg-gray-100 text-gray-600'}`}>
      {status}
    </span>
  );
};

function DoctorList({ doctors, showActionMenu, setShowActionMenu, onUpdateStatus, navigate }) {
  if (!doctors.length) return (
    <div className="text-center py-16 text-gray-400">
      <Stethoscope className="w-12 h-12 mx-auto mb-3 opacity-30" />
      <p className="text-sm">No doctors found</p>
    </div>
  );

  return (
    <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

      {/* Desktop table */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Department</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody>
            {doctors.map(doc => (
              <tr
                key={doc._id}
                onClick={() => navigate(`/admin/doctors/${doc.doctor_id}`)}
                className="border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <td className="px-5 py-4 font-medium text-gray-900 text-sm">{doc.name}</td>
                <td className="px-5 py-4 text-gray-500 text-sm">{doc.email}</td>
                <td className="px-5 py-4 text-gray-600 text-sm">{doc.department}</td>
                <td className="px-5 py-4"><StatusBadge status={doc.status} /></td>
                <td className="px-5 py-4">
                  <ActionMenu doc={doc} showActionMenu={showActionMenu} setShowActionMenu={setShowActionMenu} onUpdateStatus={onUpdateStatus} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile card list */}
      <div className="sm:hidden divide-y divide-gray-100">
        {doctors.map(doc => (
          <div
            key={doc._id}
            onClick={() => navigate(`/admin/doctors/${doc.doctor_id}`)}
            className="flex items-center gap-3 px-4 py-3.5 cursor-pointer hover:bg-gray-50 transition-colors"
          >
            {/* Avatar */}
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
              <span className="text-blue-600 font-bold text-sm">{doc.name.charAt(0)}</span>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{doc.name}</p>
              <p className="text-[11px] text-gray-400 truncate">{doc.email}</p>
              <p className="text-[11px] text-gray-500">{doc.department}</p>
            </div>

            {/* Status + menu */}
            <div className="flex flex-col items-end gap-1.5 shrink-0">
              <StatusBadge status={doc.status} />
              <div onClick={e => e.stopPropagation()}>
                <ActionMenu doc={doc} showActionMenu={showActionMenu} setShowActionMenu={setShowActionMenu} onUpdateStatus={onUpdateStatus} />
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}

function ActionMenu({ doc, showActionMenu, setShowActionMenu, onUpdateStatus }) {
  return (
    <div className="relative inline-block">
      <button
        onClick={e => {
          e.stopPropagation();
          setShowActionMenu(showActionMenu === doc._id ? null : doc._id);
        }}
        className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <MoreVertical size={16} className="text-gray-500" />
      </button>

      {showActionMenu === doc._id && (
        <div
          className="absolute right-0 top-9 w-40 bg-white shadow-xl rounded-xl border border-gray-100 z-50 overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          {(doc.status === 'active' || doc.status === 'pending') && (
            <button
              onClick={() => onUpdateStatus(doc.doctor_id, 'inactive')}
              className="flex items-center gap-2 w-full px-4 py-2.5 text-red-600 hover:bg-red-50 transition-colors text-sm"
            >
              <Ban size={14} /> Deactivate
            </button>
          )}
          {doc.status === 'inactive' && (
            <button
              onClick={() => onUpdateStatus(doc.doctor_id, 'active')}
              className="flex items-center gap-2 w-full px-4 py-2.5 text-green-600 hover:bg-green-50 transition-colors text-sm"
            >
              <CheckCircle size={14} /> Activate
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function PatientList({ patients }) {
  if (!patients.length) return (
    <div className="text-center py-16 text-gray-400">
      <User className="w-12 h-12 mx-auto mb-3 opacity-30" />
      <p className="text-sm">No patients found</p>
    </div>
  );

  return (
    <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

      {/* Desktop table */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Phone</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody>
            {patients.map(p => (
              <tr key={p._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <td className="px-5 py-4 font-medium text-gray-900 text-sm">{p.name}</td>
                <td className="px-5 py-4 text-gray-500 text-sm">{p.email}</td>
                <td className="px-5 py-4 text-gray-500 text-sm">{p.phone || '—'}</td>
                <td className="px-5 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${p.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {p.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile card list */}
      <div className="sm:hidden divide-y divide-gray-100">
        {patients.map(p => (
          <div key={p._id} className="flex items-center gap-3 px-4 py-3.5">
            {/* Avatar */}
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
              <span className="text-purple-600 font-bold text-sm">{p.name.charAt(0)}</span>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{p.name}</p>
              <p className="text-[11px] text-gray-400 truncate">{p.email}</p>
              {p.phone && <p className="text-[11px] text-gray-400">{p.phone}</p>}
            </div>

            {/* Status */}
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold shrink-0 ${p.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {p.is_active ? 'Active' : 'Inactive'}
            </span>
          </div>
        ))}
      </div>

    </div>
  );
}