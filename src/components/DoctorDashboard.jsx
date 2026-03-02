// DoctorDashboard.jsx

import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import { useRef, useState, useEffect } from 'react';
import {
  LogOut,
  Calendar,
  Clock,
  Users,
  Bell,
  Settings,
  CheckCircle,
  XCircle,
  AlertCircle,
  Plus,
  Trash2,
  ChevronRight,
  TrendingUp,
  Check,
  X as XIcon,
  Info,
} from 'lucide-react';
import axios from 'axios';


// Future Appointments View Component (defined before main component)
function FutureAppointmentsView({ futureData, token }) {
  if (!futureData || futureData.total === 0) {
    return (
      <div className="card text-center py-12">
        <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No future appointments</h3>
        <p className="text-gray-600">You don't have any scheduled appointments beyond today</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">
          Future Appointments ({futureData.total})
        </h2>
        <div className="text-sm text-gray-600">
          Showing appointments from tomorrow onwards
        </div>
      </div>

      {/* Grouped by Date */}
      {futureData.by_date?.map((dayData) => (
        <div key={dayData.date} className="card">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-1">
              {new Date(dayData.date).toLocaleDateString('en-US', { 
                weekday: 'long', 
                month: 'long', 
                day: 'numeric',
                year: 'numeric'
              })}
            </h3>
            <p className="text-sm text-gray-600">
              Total: {dayData.total} appointments 
              ({dayData.morning.length} morning, {dayData.afternoon.length} afternoon)
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Morning */}
            {dayData.morning.length > 0 && (
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                    <Clock className="w-4 h-4 text-white" />
                  </div>
                  Morning ({dayData.morning.length})
                </h4>
                <div className="space-y-3">
                  {dayData.morning.map((apt) => (
                    <div key={apt._id} className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-gray-900">{apt.patient?.name}</p>
                            {apt.token_number && (
                              <span className="px-2 py-1 bg-blue-600 text-white text-xs font-bold rounded">
                                #{apt.token_number}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">{apt.patient?.phone}</p>
                          {apt.symptoms && (
                            <p className="text-sm text-gray-700 mt-2">
                              <span className="font-semibold">Symptoms:</span> {apt.symptoms}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Afternoon */}
            {dayData.afternoon.length > 0 && (
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                    <Clock className="w-4 h-4 text-white" />
                  </div>
                  Afternoon ({dayData.afternoon.length})
                </h4>
                <div className="space-y-3">
                  {dayData.afternoon.map((apt) => (
                    <div key={apt._id} className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-gray-900">{apt.patient?.name}</p>
                            {apt.token_number && (
                              <span className="px-2 py-1 bg-purple-600 text-white text-xs font-bold rounded">
                                #{apt.token_number}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">{apt.patient?.phone}</p>
                          {apt.symptoms && (
                            <p className="text-sm text-gray-700 mt-2">
                              <span className="font-semibold">Symptoms:</span> {apt.symptoms}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// Leave Request Modal Component
function LeaveModal({ show, onClose, onSuccess, token }) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/doctor/leave/request`,
        {
          start_date: startDate,
          end_date: endDate,
          reason: reason || undefined
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.needs_approval) {
        alert('Leave request submitted for admin approval');
      } else {
        alert('Leave auto-approved! (Within monthly limit)');
      }
      onSuccess();
    } catch (error) {
      alert(error.response?.data?.detail || 'Failed to request leave');
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900">Request Leave</h3>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <XIcon size={18} className="text-gray-500" />
          </button>
        </div>

        <div className="px-6 py-4 space-y-4">
          {/* Policy Info */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start gap-2">
              <Info size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-900">
                <p className="font-semibold mb-1">Leave Policy:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>First 3 days/month: Auto-approved</li>
                  <li>More than 3 days: Requires admin approval + reason</li>
                  <li>Sunday is a holiday (no working day)</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              required
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={startDate || new Date().toISOString().split('T')[0]}
              required
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Reason */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">
              Reason <span className="font-normal">(Optional for first 3 days)</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              placeholder="Enter reason for leave..."
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 border border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-50 transition-colors text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !startDate || !endDate}
            className="flex-1 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? 'Requesting...' : 'Request Leave'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// Main Doctor Dashboard Component
export function DoctorDashboard() {
  const { user, logout, token } = useAuthStore();
  const navigate = useNavigate();
  const notificationRef = useRef(null);

  // State Management
  const [todayAvailability, setTodayAvailability] = useState(null);
  const [todayAppointments, setTodayAppointments] = useState(null);
  const [upcomingLeaves, setUpcomingLeaves] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [view, setView] = useState('today'); // 'today', 'future'
  const [futureAppointments, setFutureAppointments] = useState(null);
  const [showAllLeaves, setShowAllLeaves] = useState(false);

  // Fetch all data on mount
  useEffect(() => {
    fetchDashboardData();
    fetchNotifications();
    fetchFutureAppointments();
  }, []);

  // Close notifications dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
    };

    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications]);

  const fetchDashboardData = async () => {
    try {
      const availRes = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/doctor/availability/today`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      let availabilityData = availRes.data;

      setTodayAvailability(availabilityData);

      const [appointmentsRes, leavesRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/doctor/appointments/today`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/doctor/leave/list`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setTodayAppointments(appointmentsRes.data);

      const visibleStatuses = ['pending', 'approved', 'auto_approved'];

      const sortedLeaves = leavesRes.data.leaves
        .filter(l => visibleStatuses.includes(l.approval_status))
        .sort((a, b) => new Date(a.start_date) - new Date(b.start_date));

      setUpcomingLeaves(sortedLeaves);


      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/doctor/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setNotifications(res.data.notifications);
      
      // Check if notifications were already read from localStorage
      const readNotificationsKey = `read_notifications_${user?._id}`;
      const readNotifications = JSON.parse(localStorage.getItem(readNotificationsKey) || '[]');
      
      // Filter out notifications that have been read
      const unreadNotifs = res.data.notifications.filter(
        notif => !readNotifications.includes(notif._id)
      );
      
      setUnreadCount(unreadNotifs.length);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  const fetchFutureAppointments = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/doctor/appointments/future`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFutureAppointments(res.data);
    } catch (error) {
      console.error('Error fetching future appointments:', error);
    }
  };

  const markAsCompleted = async (appointmentId) => {
    try {
      await axios.patch(
        `${import.meta.env.VITE_BACKEND_URL}/api/doctor/appointment/${appointmentId}/complete`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Refresh data after updating
      fetchDashboardData();
      fetchFutureAppointments();
      fetchNotifications();
    } catch (error) {
      alert(error.response?.data?.detail || "Failed to update status");
    }
  };

  const markNotificationsAsRead = () => {
    // Store all current notification IDs as read in localStorage
    const readNotificationsKey = `read_notifications_${user?._id}`;
    const notificationIds = notifications.map(n => n._id);
    localStorage.setItem(readNotificationsKey, JSON.stringify(notificationIds));
    setUnreadCount(0);
  };

  const isNotificationRead = (notifId) => {
    const readNotificationsKey = `read_notifications_${user?._id}`;
    const readNotifications = JSON.parse(localStorage.getItem(readNotificationsKey) || '[]');
    return readNotifications.includes(notifId);
  };

  const toggleTodayAvailability = async () => {
    const today = new Date().toISOString().split('T')[0];
    const isAvailableToday = todayAvailability?.is_available ?? false;
    const newStatus = !isAvailableToday;

    try {
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/doctor/availability/set`,
        {
          date: today,
          is_available: newStatus,
          morning_slot_enabled: newStatus,
          afternoon_slot_enabled: newStatus,
          morning_capacity: 100,
          afternoon_capacity: 100
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      fetchDashboardData();
    } catch (error) {
      console.error('Error toggling availability:', error);
      alert('Failed to update availability');
    }
  };

  const toggleSlot = async (slot) => {
    const isAvailableToday = todayAvailability?.is_available ?? false;

    if (!isAvailableToday) return;

    const today = new Date().toISOString().split('T')[0];

    const isCurrentlyEnabled =
      slot === 'morning'
        ? todayAvailability?.morning_slot_enabled
        : todayAvailability?.afternoon_slot_enabled;

    const action = isCurrentlyEnabled ? 'disable' : 'enable';

    try {
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/doctor/slot/toggle`,
        {
          date: today,
          slot: slot,
          action: action
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      fetchDashboardData();
    } catch (error) {
      console.error('Error toggling slot:', error.response?.data);
      alert(error.response?.data?.detail || 'Failed to update slot');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-soft flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const isAvailableToday = todayAvailability?.is_available ?? false;
  const morningEnabled = todayAvailability?.morning_slot_enabled ?? false;
  const afternoonEnabled = todayAvailability?.afternoon_slot_enabled ?? false;
  
  const morningBooked = todayAvailability?.morning_booked ?? 0;
  const afternoonBooked = todayAvailability?.afternoon_booked ?? 0;
  const morningCapacity = todayAvailability?.morning_capacity ?? 100;
  const afternoonCapacity = todayAvailability?.afternoon_capacity ?? 100;

  return (
    <div className="min-h-screen bg-gradient-soft">
      {/* Header */}
      <header className="header-container">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center text-2xl shadow-md">
                🏥
              </div>
              <div>
                <h1 className="text-xl font-display text-gray-900">MediCare AI</h1>
                <p className="text-sm text-gray-600">Doctor Portal</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Notification Bell */}
              <div className="relative" ref={notificationRef}>
                <button 
                  onClick={() => {
                    if (!showNotifications) {
                      markNotificationsAsRead();
                    }
                    setShowNotifications(prev => !prev);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative"
                >
                  <Bell size={20} className="text-gray-600" />
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl border-2 border-gray-200 z-50 max-h-96 overflow-y-auto">
                    <div className="p-4 border-b border-gray-200 bg-gray-50">
                      <h3 className="font-semibold text-gray-900">Notifications</h3>
                    </div>
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-gray-500">
                        <Bell className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                        <p>No notifications</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-100">
                        {notifications.map((notif) => {
                          const isRead = isNotificationRead(notif._id);
                          return (
                            <div 
                              key={notif._id}
                              className={`p-4 hover:bg-gray-50 transition-colors relative ${
                                ['approved', 'auto_approved'].includes(notif.status)
                                  ? 'bg-green-50'
                                  : notif.status === 'pending'
                                  ? 'bg-yellow-50'
                                  : 'bg-red-50'
                              } ${!isRead ? 'border-l-4 border-blue-500' : ''}`}
                            >
                              <div className="flex items-start gap-3">
                                {['approved', 'auto_approved'].includes(notif.status) ? (
                                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                                    <Check size={16} className="text-white" />
                                  </div>
                                ) : (
                                  <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                                    <XIcon size={16} className="text-white" />
                                  </div>
                                )}

                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <p className="text-sm font-semibold text-gray-900">
                                      {notif.message}
                                    </p>
                                    {!isRead && (
                                      <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></span>
                                    )}
                                  </div>
                                  {notif.admin_notes && (
                                    <p className="text-xs text-gray-600 mt-1">
                                      Admin: {notif.admin_notes}
                                    </p>
                                  )}
                                  <p className="text-xs text-gray-500 mt-1">
                                    {formatDateTime(notif.timestamp)}
                                  </p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Settings size={20} className="text-gray-600" />
              </button>
              <div className="hidden sm:flex items-center gap-3 ml-2 pl-3 border-l border-gray-200">
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">Dr. {user?.name}</p>
                  <p className="text-xs text-gray-600">{user?.specialization}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut size={18} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h2 className="heading-lg mb-2">
            Welcome, Dr. {user?.name?.split(' ').slice(-1)[0]} 👨‍⚕️
          </h2>
          <p className="text-lg text-gray-600">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </motion.div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-8">
          <button
            onClick={() => setView('today')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              view === 'today'
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Today's Schedule
          </button>
          <button
            onClick={() => setView('future')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              view === 'future'
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Future Appointments
          </button>
        </div>

        {/* Conditional View Rendering */}
        {view === 'today' ? (
          <>
            {/* Daily Availability Toggle */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-8"
            >
              <div className="card">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                      isAvailableToday ? 'bg-green-100' : 'bg-gray-100'
                    }`}>
                      {isAvailableToday ? (
                        <CheckCircle className="w-8 h-8 text-green-600" />
                      ) : (
                        <XCircle className="w-8 h-8 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">
                        {isAvailableToday ? 'Available Today' : 'Not Available Today'}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {isAvailableToday 
                          ? 'Patients can book appointments with you' 
                          : 'You won\'t appear in patient search'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={toggleTodayAvailability}
                    className={`px-8 py-4 rounded-xl font-semibold text-lg transition-all shadow-lg ${
                      isAvailableToday
                        ? 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:shadow-xl'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {isAvailableToday ? 'Mark Unavailable' : 'Mark Available'}
                  </button>
                </div>
              </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
              {/* Slot Management */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="lg:col-span-2"
              >
                <div className="card">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">Today's Slots</h3>
                  
                  <div className="space-y-6">
                    {/* Morning Slot */}
                    <div className={`p-6 rounded-xl border-2 transition-all ${
                      morningEnabled 
                        ? 'border-blue-200 bg-blue-50' 
                        : 'border-gray-200 bg-gray-50'
                    }`}>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                            <Clock className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h4 className="text-lg font-semibold text-gray-900">Morning Slot</h4>
                            <p className="text-sm text-gray-600">9:30 AM - 12:30 PM</p>
                          </div>
                        </div>
                        <button
                          onClick={() => toggleSlot('morning')}
                          disabled={!isAvailableToday}
                          className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                            !isAvailableToday
                              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                              : morningEnabled
                              ? 'bg-blue-600 text-white hover:bg-blue-700'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          {morningEnabled ? 'Enabled' : 'Disabled'}
                        </button>
                      </div>
                      
                      {morningEnabled && (
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-semibold text-gray-700">
                              Bookings: {morningBooked} / {morningCapacity}
                            </span>
                            <span className="text-sm font-semibold text-blue-600">
                              {morningCapacity - morningBooked} slots remaining
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                            <div 
                              className="bg-gradient-to-r from-blue-500 to-blue-600 h-full transition-all duration-500"
                              style={{ width: `${(morningBooked / morningCapacity) * 100}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Afternoon Slot */}
                    <div className={`p-6 rounded-xl border-2 transition-all ${
                      afternoonEnabled 
                        ? 'border-purple-200 bg-purple-50' 
                        : 'border-gray-200 bg-gray-50'
                    }`}>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                            <Clock className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h4 className="text-lg font-semibold text-gray-900">Afternoon Slot</h4>
                            <p className="text-sm text-gray-600">1:30 PM - 6:30 PM</p>
                          </div>
                        </div>
                        <button
                          onClick={() => toggleSlot('afternoon')}
                          disabled={!isAvailableToday}
                          className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                            !isAvailableToday
                              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                              : afternoonEnabled
                              ? 'bg-purple-600 text-white hover:bg-purple-700'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          {afternoonEnabled ? 'Enabled' : 'Disabled'}
                        </button>
                      </div>
                      
                      {afternoonEnabled && (
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-semibold text-gray-700">
                              Bookings: {afternoonBooked} / {afternoonCapacity}
                            </span>
                            <span className="text-sm font-semibold text-purple-600">
                              {afternoonCapacity - afternoonBooked} slots remaining
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                            <div 
                              className="bg-gradient-to-r from-purple-500 to-purple-600 h-full transition-all duration-500"
                              style={{ width: `${(afternoonBooked / afternoonCapacity) * 100}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Quick Stats & Leaves */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-6"
              >
                <div className="card">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Stats</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Users className="w-5 h-5 text-blue-600" />
                        <span className="text-sm font-semibold text-gray-700">Total Appointments</span>
                      </div>
                      <span className="text-2xl font-bold text-blue-600">
                        {todayAppointments?.total ?? 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <TrendingUp className="w-5 h-5 text-green-600" />
                        <span className="text-sm font-semibold text-gray-700">Morning</span>
                      </div>
                      <span className="text-2xl font-bold text-green-600">
                        {todayAppointments?.morning?.count ?? 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <TrendingUp className="w-5 h-5 text-purple-600" />
                        <span className="text-sm font-semibold text-gray-700">Afternoon</span>
                      </div>
                      <span className="text-2xl font-bold text-purple-600">
                        {todayAppointments?.afternoon?.count ?? 0}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="card">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">My Leaves</h3>
                    <button
                      onClick={() => setShowLeaveModal(true)}
                      className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Plus className="w-5 h-5 text-blue-600" />
                    </button>
                  </div>
                  <div className="space-y-3">
                    {upcomingLeaves.length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-4">No upcoming leaves</p>
                    ) : (
                      (showAllLeaves ? upcomingLeaves : upcomingLeaves.slice(0, 3)).map((leave) => (
                        <div 
                          key={leave._id} 
                          className={`p-3 rounded-lg border-2 ${
                            leave.approval_status === 'pending' ? 'bg-yellow-50 border-yellow-200' :
                            leave.approval_status === 'auto_approved' ? 'bg-green-50 border-green-200' :
                            'bg-blue-50 border-blue-200'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="text-sm font-semibold text-gray-900">
                                {new Date(leave.start_date).toLocaleDateString()} - {new Date(leave.end_date).toLocaleDateString()}
                              </p>
                              <p className="text-xs text-gray-600 mt-1">
                                {leave.leave_days} day{leave.leave_days > 1 ? 's' : ''}
                              </p>
                              {leave.reason && (
                                <p className="text-xs text-gray-600 mt-1">{leave.reason}</p>
                              )}
                              <div className="flex items-center gap-2 mt-2">
                                {leave.approval_status === 'pending' && (
                                  <span className="text-xs font-semibold text-yellow-700 bg-yellow-100 px-2 py-1 rounded-full">
                                    Pending Approval
                                  </span>
                                )}
                                {leave.approval_status === 'auto_approved' && (
                                  <span className="text-xs font-semibold text-green-700 bg-green-100 px-2 py-1 rounded-full">
                                    Auto-Approved
                                  </span>
                                )}
                                {leave.approval_status === 'approved' && (
                                  <span className="text-xs font-semibold text-blue-700 bg-blue-100 px-2 py-1 rounded-full">
                                    Approved
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  {upcomingLeaves.length > 3 && (
                    <button
                      onClick={() => setShowAllLeaves(!showAllLeaves)}
                      className="w-full mt-3 text-sm text-blue-600 hover:text-blue-700 font-semibold cursor-pointer"
                    >
                      {showAllLeaves ? "Show less" : "View all leaves"}
                    </button>
                  )}
                </div>
              </motion.div>
            </div>

            {/* Today's Appointments */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="card"
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Today's Appointments</h3>
              
              {todayAppointments?.total === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No appointments scheduled for today</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Morning Appointments */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                        <Clock className="w-4 h-4 text-white" />
                      </div>
                      Morning ({todayAppointments?.morning?.count ?? 0})
                    </h4>
                    <div className="space-y-3">
                      {todayAppointments?.morning?.appointments?.map((apt, idx) => (
                        <div key={apt._id} className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="font-semibold text-gray-900">{apt.patient?.name}</p>
                              <p className="text-sm text-gray-600">{apt.patient?.phone}</p>
                              {apt.symptoms && (
                                <p className="text-sm text-gray-700 mt-2">
                                  <span className="font-semibold">Symptoms:</span> {apt.symptoms}
                                </p>
                              )}
                              {apt.status !== "completed" ? (
                                <button
                                  onClick={() => markAsCompleted(apt._id)}
                                  className="mt-3 px-3 py-1 text-xs font-semibold bg-green-600 text-white rounded-lg hover:bg-green-700"
                                >
                                  Mark as Completed
                                </button>
                              ) : (
                                <span className="mt-3 inline-block text-xs font-semibold text-green-700 bg-green-100 px-3 py-1 rounded-full">
                                  Consultation Completed
                                </span>
                              )}
                            </div>
                            <span className="text-xs font-semibold text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
                              #{idx + 1}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Afternoon Appointments */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                        <Clock className="w-4 h-4 text-white" />
                      </div>
                      Afternoon ({todayAppointments?.afternoon?.count ?? 0})
                    </h4>
                    <div className="space-y-3">
                      {todayAppointments?.afternoon?.appointments?.map((apt, idx) => (
                        <div key={apt._id} className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="font-semibold text-gray-900">{apt.patient?.name}</p>
                              <p className="text-sm text-gray-600">{apt.patient?.phone}</p>
                              {apt.symptoms && (
                                <p className="text-sm text-gray-700 mt-2">
                                  <span className="font-semibold">Symptoms:</span> {apt.symptoms}
                                </p>
                              )}
                              {apt.status !== "completed" ? (
                                <button
                                  onClick={() => markAsCompleted(apt._id)}
                                  className="mt-3 px-3 py-1 text-xs font-semibold bg-green-600 text-white rounded-lg hover:bg-green-700"
                                >
                                  Mark as Completed
                                </button>
                              ) : (
                                <span className="mt-3 inline-block text-xs font-semibold text-green-700 bg-green-100 px-3 py-1 rounded-full">
                                  Consultation Completed
                                </span>
                              )}
                            </div>
                            <span className="text-xs font-semibold text-purple-600 bg-purple-100 px-3 py-1 rounded-full">
                              #{idx + 1}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </>
        ) : (
          <FutureAppointmentsView futureData={futureAppointments} token={token} />
        )}
      </main>

      {/* Leave Modal */}
      <LeaveModal 
        show={showLeaveModal}
        onClose={() => setShowLeaveModal(false)}
        onSuccess={() => {
          setShowLeaveModal(false);
          fetchDashboardData();
          fetchNotifications();
        }}
        token={token}
      />
    </div>
  );
}

export default DoctorDashboard;