// PatientDashboard.jsx - FIXED VERSION

import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import {
  LogOut,
  Calendar,
  MessageSquare,
  Activity,
  Clock,
  FileText,
  Bell,
  Settings,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronRight,
  User,
  Stethoscope,
  Loader2,
  X,
  ChevronDown,
  Check,
  X as XIcon,
  Lock,
  Receipt
} from 'lucide-react';
import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import PaymentModal from './PaymentModal';
import PaymentHistoryView from './PaymentHistoryView';

const API_BASE_URL = 'http://localhost:8000';

export function PatientDashboard() {
  const { user, logout, token } = useAuthStore();
  const navigate = useNavigate();

  const [view, setView] = useState('home'); // 'home', 'book', 'appointments', 'payments'
  const [myAppointments, setMyAppointments] = useState(null);
  const [loading, setLoading] = useState(true);

  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const notificationRef = useRef(null);

  const [showSettings, setShowSettings] = useState(false);
const [editForm, setEditForm] = useState({
  name: user?.name || '',
  email: user?.email || '',
  phone: user?.phone || '',
  currentPassword: '',
  newPassword: '',
});
const [savingSettings, setSavingSettings] = useState(false);
const [settingsError, setSettingsError] = useState('');
const [settingsSuccess, setSettingsSuccess] = useState('');



  useEffect(() => {
    fetchAppointments();
    fetchNotifications();
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

  const fetchAppointments = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/patient/appointments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMyAppointments(res.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/api/patient/notifications`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setNotifications(res.data.notifications);

      // Check if notifications were already read from localStorage
      const readNotificationsKey = `read_notifications_patient_${user?._id}`;
      const readNotifications = JSON.parse(localStorage.getItem(readNotificationsKey) || '[]');
      
      // Filter out notifications that have been read
      const unreadNotifs = res.data.notifications.filter(
        notif => !readNotifications.includes(notif._id)
      );
      
      setUnreadCount(unreadNotifs.length);
    } catch (err) {
      console.error('Error fetching notifications', err);
    }
  };

  const markNotificationsAsRead = () => {
    // Store all current notification IDs as read in localStorage
    const readNotificationsKey = `read_notifications_patient_${user?._id}`;
    const notificationIds = notifications.map(n => n._id);
    localStorage.setItem(readNotificationsKey, JSON.stringify(notificationIds));
    setUnreadCount(0);
  };

  const isNotificationRead = (notifId) => {
    const readNotificationsKey = `read_notifications_patient_${user?._id}`;
    const readNotifications = JSON.parse(localStorage.getItem(readNotificationsKey) || '[]');
    return readNotifications.includes(notifId);
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

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    setSettingsError('');
    setSettingsSuccess('');
    try {
      const res = await axios.patch(
        `${API_BASE_URL}/api/patient/profile`,
        {
          name: editForm.name || undefined,
          email: editForm.email || undefined,
          phone: editForm.phone || undefined,
          current_password: editForm.currentPassword || undefined,
          new_password: editForm.newPassword || undefined,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSettingsSuccess('Profile updated successfully!');

      // ✅ updateUser already exists in your authStore
      useAuthStore.getState().updateUser(res.data.user);

      // Clear password fields after success
      setEditForm((prev) => ({ ...prev, currentPassword: '', newPassword: '' }));
    } catch (err) {
      setSettingsError(err.response?.data?.detail || 'Failed to update profile');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const stats = [
    { 
      label: 'Upcoming Appointments', 
      value: myAppointments?.upcoming?.length || 0, 
      icon: Calendar, 
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    },
    { 
      label: 'Completed', 
      value: myAppointments?.completed?.length || 0, 
      icon: CheckCircle, 
      color: 'text-green-600',
      bg: 'bg-green-50'
    },
    { 
      label: 'Total Consultations', 
      value: myAppointments?.total || 0, 
      icon: MessageSquare, 
      color: 'text-purple-600',
      bg: 'bg-purple-50'
    },
  ];

  const features = [
    {
      icon: MessageSquare,
      title: 'Symptom Checker',
      description: 'AI-powered chatbot to analyze your symptoms',
      color: 'from-blue-500 to-blue-600',
      iconBg: 'bg-blue-500',
      onClick: () => alert('Coming soon!')
    },
    {
      icon: Activity,
      title: 'Disease Prediction',
      description: 'Get intelligent health predictions',
      color: 'from-green-500 to-green-600',
      iconBg: 'bg-green-500',
      onClick: () => alert('Coming soon!')
    },
    {
      icon: Calendar,
      title: 'Book Appointment',
      description: 'Schedule appointments with doctors',
      color: 'from-purple-500 to-purple-600',
      iconBg: 'bg-purple-500',
      onClick: () => setView('book')
    },
    {
      icon: Clock,
      title: 'My Appointments',
      description: 'View and manage your appointments',
      color: 'from-orange-500 to-orange-600',
      iconBg: 'bg-orange-500',
      onClick: () => setView('appointments')
    },
    {
      icon: Receipt,
      title: 'Payment History',
      description: 'View receipts and transaction history',
      color: 'from-indigo-500 to-indigo-600',
      iconBg: 'bg-indigo-500',
      onClick: () => setView('payments')
    },
  ];

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
                <p className="text-sm text-gray-600">Patient Portal</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Notification Bell */}
              <div className="relative" ref={notificationRef}>
                <button 
                  onClick={() => {
                    if (!showNotifications) {
                      // Only mark as read when opening the dropdown
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
                                notif.status === 'confirmed' ? 'bg-green-50' : 
                                notif.status === 'cancelled' ? 'bg-red-50' : 
                                notif.status === 'refund' ? 'bg-blue-50' :
                                'bg-yellow-50'
                              } ${!isRead ? 'border-l-4 border-blue-500' : ''}`}
                            >
                              <div className="flex items-start gap-3">
                                {notif.status === 'confirmed' ? (
                                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                                    <Check size={16} className="text-white" />
                                  </div>
                                ) : notif.status === 'cancelled' ? (
                                  <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                                    <XIcon size={16} className="text-white" />
                                  </div>
                                ) : notif.status === 'refund' ? (
                                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                                      <span className="text-white text-xs font-bold">₹</span>
                                  </div>
                                ) : (
                                  <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0">
                                    <Clock size={16} className="text-white" />
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

              {/* Settings button */}
              <button
                onClick={() => setShowSettings(true)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Settings size={20} className="text-gray-600" />
              </button>

              {/* Edit Account Modal */}
              {showSettings && (
                <div
                  className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                  onClick={() => setShowSettings(false)}
                >
                  <div
                    className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                      <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <User size={18} className="text-blue-600" />
                        Edit Account Details
                      </h3>
                      <button
                        onClick={() => setShowSettings(false)}
                        className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <X size={18} className="text-gray-500" />
                      </button>
                    </div>

                    {/* Avatar */}
                    <div className="flex justify-center pt-6 pb-2">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                        {editForm.name?.charAt(0).toUpperCase()}
                      </div>
                    </div>

                    {/* Form */}
                    <div className="px-6 py-4 space-y-4">

                      {/* Name */}
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1.5">Full Name</label>
                        <input
                          type="text"
                          value={editForm.name}
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Your full name"
                        />
                      </div>

                      {/* Email */}
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1.5">Email</label>
                        <input
                          type="email"
                          value={editForm.email}
                          onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="your@email.com"
                        />
                      </div>

                      {/* Phone */}
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1.5">Phone Number</label>
                        <input
                          type="tel"
                          value={editForm.phone}
                          onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="+91 XXXXX XXXXX"
                        />
                      </div>

                      {/* Divider */}
                      <div className="border-t border-gray-100 pt-2">
                        <p className="text-xs font-semibold text-gray-400 mb-3">Change Password <span className="font-normal">(leave blank to keep current)</span></p>

                        <div className="space-y-3">
                          <input
                            type="password"
                            value={editForm.currentPassword}
                            onChange={(e) => setEditForm({ ...editForm, currentPassword: e.target.value })}
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Current password"
                          />
                          <input
                            type="password"
                            value={editForm.newPassword}
                            onChange={(e) => setEditForm({ ...editForm, newPassword: e.target.value })}
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="New password"
                          />
                        </div>
                      </div>

                      {/* Feedback */}
                      {settingsError && (
                        <p className="text-sm text-red-600 bg-red-50 px-4 py-2.5 rounded-xl">{settingsError}</p>
                      )}
                      {settingsSuccess && (
                        <p className="text-sm text-emerald-600 bg-emerald-50 px-4 py-2.5 rounded-xl">{settingsSuccess}</p>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="px-6 pb-6 flex gap-3">
                      <button
                        onClick={() => setShowSettings(false)}
                        className="flex-1 py-2.5 border border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-50 transition-colors text-sm"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveSettings}
                        disabled={savingSettings}
                        className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors text-sm flex items-center justify-center gap-2 disabled:opacity-60"
                      >
                        {savingSettings ? (
                          <><Loader2 size={15} className="animate-spin" /> Saving...</>
                        ) : (
                          'Save Changes'
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
              <div className="hidden sm:flex items-center gap-3 ml-2 pl-3 border-l border-gray-200">
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                  <p className="text-xs text-gray-600">{user?.email}</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {user?.name?.charAt(0).toUpperCase()}
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
        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto">
          <button
            onClick={() => setView('home')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all whitespace-nowrap ${
              view === 'home'
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Home
          </button>
          <button
            onClick={() => setView('book')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all whitespace-nowrap ${
              view === 'book'
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Book Appointment
          </button>
          <button
            onClick={() => setView('appointments')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all whitespace-nowrap ${
              view === 'appointments'
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            My Appointments
          </button>
          <button
            onClick={() => setView('payments')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all whitespace-nowrap flex items-center gap-2 ${
              view === 'payments'
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Receipt size={16} />
            Payment History
          </button>
        </div>

        {/* Content Views */}
        <AnimatePresence mode="wait">
          {view === 'home' && (
            <HomeView 
              user={user} 
              stats={stats} 
              features={features}
              myAppointments={myAppointments}
            />
          )}
          {view === 'book' && (
            <BookAppointmentView 
              token={token}
              onSuccess={() => {
                fetchAppointments();
                fetchNotifications();
                setView('appointments');
              }}
            />
          )}
          {view === 'appointments' && (
            <MyAppointmentsView 
              appointments={myAppointments}
              token={token}
              onUpdate={() => {
                fetchAppointments();
                fetchNotifications();
              }}
            />
          )}
          {view === 'payments' && (
            <PaymentHistoryView token={token} />
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

// Home View Component
function HomeView({ user, stats, features, myAppointments }) {
  return (
    <motion.div
      key="home"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8"
    >
      {/* Welcome Section */}
      <div>
        <h2 className="heading-lg mb-2">
          Welcome back, {user?.name?.split(' ')[0]}! 👋
        </h2>
        <p className="text-lg text-gray-600">
          Your health is our priority. How can we help you today?
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="card flex items-center gap-4"
          >
            <div className={`p-3 rounded-xl ${stat.bg}`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-600">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Feature Cards */}
      <div>
        <h3 className="text-2xl font-semibold text-gray-900 mb-6">Quick Actions</h3>

        {/* Scrollable on all screens */}
        <div className="flex gap-4 overflow-x-auto overflow-y-hidden pb-4 pt-4 snap-x snap-mandatory -mt-4 scrollbar-thin">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              onClick={feature.onClick}
              className="dashboard-feature-card group cursor-pointer flex-shrink-0 w-56 snap-start"
            >
              <div
                className={`w-14 h-14 ${feature.iconBg} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}
              >
                <feature.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      {myAppointments?.upcoming?.length > 0 && (
        <div className="card">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Upcoming Appointments</h3>
          <div className="space-y-3">
            {myAppointments.upcoming.slice(0, 3).map((apt) => (
              <div key={apt._id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">
                    {apt.doctor?.name || 'Dr. ' + apt.doctor_name}
                  </p>
                  <p className="text-xs text-gray-600">
                    {new Date(apt.date).toLocaleDateString()} • {apt.slot_time}
                  </p>
                </div>
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                  apt.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {apt.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

// Book Appointment View Component - WITH GOOGLE-LIKE AUTOCOMPLETE SEARCH
function BookAppointmentView({ token, onSuccess }) {
  const [step, setStep] = useState(1);
  const [isInputFocused, setIsInputFocused] = useState(false);
  
  // Step 1: Date selection
  const [selectedDate, setSelectedDate] = useState('');
  
  // Step 2: Time slot selection
  const [selectedSlot, setSelectedSlot] = useState('');
  
  // Step 3: Department selection
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [departments, setDepartments] = useState([]);
  
  // Step 4: Doctor search with autocomplete
  const [searchQuery, setSearchQuery] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  
  // Final step: Confirmation
  const [symptoms, setSymptoms] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Refs
  const searchInputRef = useRef(null);
  const suggestionsRef = useRef(null);

  const [showPayment, setShowPayment] = useState(false);

  // Fetch departments on mount
  useEffect(() => {
    fetchDepartments();
  }, []);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        suggestionsRef.current && 
        !suggestionsRef.current.contains(event.target) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchAllDoctors = async () => {
    if (!selectedDate || !selectedDepartment) return;

    setLoadingSuggestions(true);

    try {
      const params = new URLSearchParams({
        date: selectedDate,
        department: selectedDepartment
      });

      if (selectedSlot) {
        params.append('slot', selectedSlot);
      }

      const res = await axios.get(
        `${API_BASE_URL}/api/patient/doctors/search?${params}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSearchSuggestions(res.data.doctors || []);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    } finally {
      setLoadingSuggestions(false);
    }
  };


  // Fetch suggestions as user types (Google-like autocomplete)
  // useEffect(() => {
  //   const fetchSuggestions = async () => {
  //     if (!searchQuery.trim() || searchQuery.length < 2) {
  //       setSearchSuggestions([]);
  //       setShowSuggestions(false);
  //       return;
  //     }

  //     if (!selectedDate || !selectedDepartment) {
  //       return;
  //     }

  //     // If search is empty → fetch all doctors
  //     if (!searchQuery.trim()) {
  //       fetchAllDoctors();
  //       return;
  //     }

  //     setLoadingSuggestions(true);
      
  //     try {
  //       const params = new URLSearchParams({ 
  //         date: selectedDate,
  //         department: selectedDepartment,
  //         search: searchQuery.trim()
  //       });
        
  //       if (selectedSlot) {
  //         params.append('slot', selectedSlot);
  //       }

  //       const res = await axios.get(
  //         `${API_BASE_URL}/api/patient/doctors/search?${params}`,
  //         { headers: { Authorization: `Bearer ${token}` } }
  //       );

  //       setSearchSuggestions(res.data.doctors || []);
  //       setShowSuggestions(true);
  //     } catch (error) {
  //       console.error('Error fetching suggestions:', error);
  //       setSearchSuggestions([]);
  //     } finally {
  //       setLoadingSuggestions(false);
  //     }
  //   };

  //   // Debounce the search
  //   const timeoutId = setTimeout(fetchSuggestions, 300);
  //   return () => clearTimeout(timeoutId);
  // }, [searchQuery, selectedDate, selectedDepartment, selectedSlot, token]);

  useEffect(() => {
    if (!isInputFocused) return;
    
    const fetchSuggestions = async () => {

      if (!selectedDate || !selectedDepartment) {
        return;
      }

      // If search empty → show all doctors
      if (!searchQuery.trim()) {
        fetchAllDoctors();
        return;
      }

      setLoadingSuggestions(true);

      try {
        const params = new URLSearchParams({
          date: selectedDate,
          department: selectedDepartment,
          search: searchQuery.trim()
        });

        if (selectedSlot) {
          params.append('slot', selectedSlot);
        }

        const res = await axios.get(
          `${API_BASE_URL}/api/patient/doctors/search?${params}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setSearchSuggestions(res.data.doctors || []);
        setShowSuggestions(true);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setSearchSuggestions([]);
      } finally {
        setLoadingSuggestions(false);
      }
    };

    const timeoutId = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timeoutId);

  }, [searchQuery, selectedDate, selectedDepartment, selectedSlot, token]);


  const fetchDepartments = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/departments`);
      setDepartments(res.data.departments);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const handleDoctorSelect = (doctor) => {
    console.log("Selected doctor:", doctor); // ADD THIS

    setSelectedDoctor({
      doctor_id: doctor.doctor_id,
      name: doctor.name,
      specialization: doctor.specialization,
      department: doctor.department,
      qualification: doctor.qualification
    });
    setSearchQuery(doctor.name);
    setShowSuggestions(false);
    setStep(5); // Move to confirmation
  };

  const handleBookAppointment = async () => {
    if (isSlotExpiredToday(selectedSlot)) {
      alert('Booking time for this slot has already ended today.');
      return;
    }
    if (!selectedDoctor || !selectedSlot) {
      alert('Please complete all steps');
      return;
    }
    // Open payment modal instead of booking directly
    setShowPayment(true);
  };

  const handlePaymentSuccess = async ({ method } = {}) => {
      setLoading(true);
      try {
          await axios.post(`${API_BASE_URL}/api/patient/appointment/book`, {
              doctor_id: selectedDoctor.doctor_id,
              date: selectedDate,
              slot: selectedSlot,
              symptoms: symptoms || undefined,
              payment_method: method || "card",
              payment_amount: 318
          }, { headers: { Authorization: `Bearer ${token}` } });
          onSuccess();
      } catch (error) {
          alert(error.response?.data?.detail || 'Failed to book appointment');
      } finally {
          setLoading(false);
      }
  };

  const isTodayAfterClosingTime = () => {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const afternoonEnd = 18 * 60 + 30; // 6:30 PM

    return currentMinutes >= afternoonEnd;
  };


  const resetBooking = () => {
    setStep(1);
    setSelectedDate('');
    setSelectedSlot('');
    setSelectedDepartment('');
    setSearchQuery('');
    setSearchSuggestions([]);
    setSelectedDoctor(null);
    setSymptoms('');
  };

  const goToStep = (stepNumber) => {
    if (stepNumber <= step) {
      setStep(stepNumber);
      if (stepNumber < 4) {
        setSearchQuery('');
        setSelectedDoctor(null);
      }
      if (stepNumber < 3) {
        setSelectedDepartment('');
      }
      if (stepNumber < 2) {
        setSelectedSlot('');
      }
    }
  };

  const isSunday = (dateStr) => {
    const date = new Date(dateStr);
    return date.getDay() === 0; // Sunday = 0
  };

  const isSlotExpiredToday = (slot) => {
    if (!selectedDate) return false;

    const todayStr = new Date().toISOString().split('T')[0];

    // Only validate for today
    if (selectedDate !== todayStr) return false;

    const now = new Date();

    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const morningEnd = 12 * 60 + 30;     // 12:30 PM
    const afternoonEnd = 18 * 60 + 30;   // 6:30 PM

    if (slot === 'morning' && currentMinutes >= morningEnd) {
      return true;
    }

    if (slot === 'afternoon' && currentMinutes >= afternoonEnd) {
      return true;
    }

    return false;
  };



  return (
    <motion.div
      key="book"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-4xl mx-auto"
    >
      {/* Progress Steps */}
      {/* <div className="card mb-6">
        <div className="flex items-center justify-between">
          {[
            { num: 1, label: 'Date', icon: Calendar },
            { num: 2, label: 'Time Slot', icon: Clock },
            { num: 3, label: 'Department', icon: Stethoscope },
            { num: 4, label: 'Doctor', icon: User },
            { num: 5, label: 'Confirm', icon: CheckCircle },
          ].map((item, index) => (
            <div key={item.num} className="flex items-center flex-1">
              <button
                onClick={() => goToStep(item.num)}
                disabled={item.num > step}
                className={`flex flex-col items-center gap-2 transition-all ${
                  item.num <= step ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold transition-all ${
                    step >= item.num
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {step > item.num ? (
                    <CheckCircle size={24} />
                  ) : (
                    <item.icon size={20} />
                  )}
                </div>
                <span
                  className={`text-xs font-semibold ${
                    step >= item.num ? 'text-gray-900' : 'text-gray-500'
                  }`}
                >
                  {item.label}
                </span>
              </button>
              {index < 4 && (
                <div
                  className={`flex-1 h-1 mx-2 rounded transition-all ${
                    step > item.num ? 'bg-gradient-to-r from-blue-500 to-purple-600' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div> */}

      {/* Progress Steps */}
<div className="card mb-6">
  {/* Circles row with connectors */}
  <div className="flex items-center justify-between w-full px-2">
    {[
      { num: 1, label: 'Date', icon: Calendar },
      { num: 2, label: 'Time Slot', icon: Clock },
      { num: 3, label: 'Department', icon: Stethoscope },
      { num: 4, label: 'Doctor', icon: User },
      { num: 5, label: 'Confirm', icon: CheckCircle },
    ].map((item, index) => (
      <div key={item.num} className="flex items-center flex-1 last:flex-none">
        {/* Circle */}
        <button
          onClick={() => goToStep(item.num)}
          disabled={item.num > step}
          className={`flex-shrink-0 transition-all ${
            item.num <= step ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
          }`}
        >
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
              step >= item.num
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                : 'bg-gray-200 text-gray-500'
            }`}
          >
            {step > item.num ? <CheckCircle size={18} /> : <item.icon size={17} />}
          </div>
        </button>

        {/* Connector — only between steps, not after last */}
        {index < 4 && (
          <div
            className={`h-1 flex-1 mx-1 rounded transition-all ${
              step > item.num
                ? 'bg-gradient-to-r from-blue-500 to-purple-600'
                : 'bg-gray-200'
            }`}
          />
        )}
      </div>
    ))}
  </div>

  {/* Labels row — separate, perfectly aligned under each circle */}
  <div className="flex justify-between mt-2 px-2">
    {[
      { num: 1, label: 'Date' },
      { num: 2, label: 'Time Slot' },
      { num: 3, label: 'Department' },
      { num: 4, label: 'Doctor' },
      { num: 5, label: 'Confirm' },
    ].map((item) => (
      <div key={item.num} className="w-10 flex justify-center">
        <span
          className={`text-xs font-semibold text-center leading-tight whitespace-nowrap
            ${step === item.num ? 'block' : 'hidden sm:block'}
            ${step >= item.num ? 'text-gray-900' : 'text-gray-400'}
          `}
        >
          {item.label}
        </span>
      </div>
    ))}
  </div>
</div>

      {/* Step 1: Date Selection */}
      {step === 1 && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="card"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Select Date</h2>
          <div className="space-y-4">
            <input
              type="date"
              value={selectedDate}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => {
                const value = e.target.value;
                const todayStr = new Date().toISOString().split('T')[0];

                // Block Sundays
                if (isSunday(value)) {
                  alert('Sunday is not a working day. Please select another date.');
                  setSelectedDate('');
                  return;
                }

                // 🔥 Block selecting today after 6:30 PM
                if (value === todayStr && isTodayAfterClosingTime()) {
                  alert('Booking for today is closed. Please select a future date.');
                  setSelectedDate('');
                  return;
                }

                setSelectedDate(value);
              }}
              className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-lg"
            />
            {selectedDate && (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm font-semibold text-blue-900 flex items-center gap-2">
                  <CheckCircle size={16} />
                  Selected: {new Date(selectedDate).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    month: 'long', 
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </p>
              </div>
            )}
            <button
              onClick={() => setStep(2)}
              disabled={!selectedDate}
              className="w-full px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue to Time Slot →
            </button>
          </div>
        </motion.div>
      )}

      {/* Step 2: Time Slot Selection */}
      {step === 2 && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="card"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Select Time Slot</h2>
          <p className="text-sm text-gray-600 mb-6">
            {new Date(selectedDate).toLocaleDateString('en-US', { 
              weekday: 'long', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <button
              onClick={() => {
                if (isSlotExpiredToday('morning')) {
                  alert('Morning slot booking time has ended for today (9:30 AM - 12:30 PM)');
                  return;
                }
                setSelectedSlot('morning');
              }}
              className={`p-6 rounded-xl border-2 transition-all ${
                selectedSlot === 'morning'
                  ? 'border-blue-500 bg-blue-50 shadow-lg'
                  : 'border-gray-300 hover:border-blue-300 hover:bg-gray-50'
              }`}
            >
              <Clock className={`w-8 h-8 mx-auto mb-3 ${selectedSlot === 'morning' ? 'text-blue-600' : 'text-gray-600'}`} />
              <p className="text-xl font-bold text-gray-900 mb-1">Morning</p>
              <p className="text-sm text-gray-600">9:30 AM - 12:30 PM</p>
            </button>

            <button
              onClick={() => {
                if (isSlotExpiredToday('afternoon')) {
                  alert('Afternoon slot booking time has ended for today (1:30 PM - 6:30 PM)');
                  return;
                }
                setSelectedSlot('afternoon');
              }}
              className={`p-6 rounded-xl border-2 transition-all ${
                selectedSlot === 'afternoon'
                  ? 'border-purple-500 bg-purple-50 shadow-lg'
                  : 'border-gray-300 hover:border-purple-300 hover:bg-gray-50'
              }`}
            >
              <Clock className={`w-8 h-8 mx-auto mb-3 ${selectedSlot === 'afternoon' ? 'text-purple-600' : 'text-gray-600'}`} />
              <p className="text-xl font-bold text-gray-900 mb-1">Afternoon</p>
              <p className="text-sm text-gray-600">1:30 PM - 6:30 PM</p>
            </button>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => setStep(1)}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
            >
              ← Back
            </button>
            <button
              onClick={() => setStep(3)}
              disabled={!selectedSlot}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue to Department →
            </button>
          </div>
        </motion.div>
      )}

      {/* Step 3: Department Selection */}
      {step === 3 && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="card"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Select Department</h2>
          <p className="text-sm text-gray-600 mb-6">
            {new Date(selectedDate).toLocaleDateString()} • {selectedSlot === 'morning' ? 'Morning (9:30 AM - 12:30 PM)' : 'Afternoon (1:30 PM - 6:30 PM)'}
          </p>
          
          <div className="space-y-3 mb-6 max-h-96 overflow-y-auto">
            {departments.map((dept) => (
              <button
                key={dept}
                onClick={() => setSelectedDepartment(dept)}
                className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                  selectedDepartment === dept
                    ? 'border-blue-500 bg-blue-50 shadow-md'
                    : 'border-gray-300 hover:border-blue-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-900">{dept}</span>
                  {selectedDepartment === dept && (
                    <CheckCircle className="text-blue-600" size={20} />
                  )}
                </div>
              </button>
            ))}
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => setStep(2)}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
            >
              ← Back
            </button>
            <button
              onClick={() => setStep(4)}
              disabled={!selectedDepartment}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Search for Doctor →
            </button>
          </div>
        </motion.div>
      )}

      {/* Step 4: Doctor Search with Autocomplete */}
      {step === 4 && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="card"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Search for Doctor</h2>
          <div className="flex flex-wrap gap-2 mb-6 text-sm">
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full">
              {new Date(selectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
            <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full capitalize">
              {selectedSlot}
            </span>
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full">
              {selectedDepartment}
            </span>
          </div>

          <div className="relative mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Type doctor name or specialization
            </label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              {/* <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                // onFocus={() => searchSuggestions.length > 0 && setShowSuggestions(true)}
                onFocus={async () => {
                  if (!selectedDate || !selectedDepartment) return;

                  try {
                    setLoadingSuggestions(true);

                    const params = new URLSearchParams({
                      date: selectedDate,
                      department: selectedDepartment
                    });

                    if (selectedSlot) {
                      params.append('slot', selectedSlot);
                    }

                    const res = await axios.get(
                      `${API_BASE_URL}/api/patient/doctors/search?${params}`,
                      { headers: { Authorization: `Bearer ${token}` } }
                    );

                    setSearchSuggestions(res.data.doctors || []);
                    setShowSuggestions(true);
                  } catch (err) {
                    console.error(err);
                  } finally {
                    setLoadingSuggestions(false);
                  }
                }}
                placeholder="Start typing doctor name..."
                className="w-full pl-12 pr-12 py-4 rounded-lg border-2 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-lg"
                autoComplete="off"
              /> */}
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}

                onFocus={async () => {
                  setIsInputFocused(true);

                  if (!selectedDate || !selectedDepartment) return;

                  try {
                    setLoadingSuggestions(true);

                    const params = new URLSearchParams({
                      date: selectedDate,
                      department: selectedDepartment
                    });

                    if (selectedSlot) {
                      params.append('slot', selectedSlot);
                    }

                    const res = await axios.get(
                      `${API_BASE_URL}/api/patient/doctors/search?${params}`,
                      { headers: { Authorization: `Bearer ${token}` } }
                    );

                    setSearchSuggestions(res.data.doctors || []);
                    setShowSuggestions(true);
                  } catch (err) {
                    console.error(err);
                  } finally {
                    setLoadingSuggestions(false);
                  }
                }}

                // onBlur={() => {
                //   // Small delay so clicking suggestion works
                //   setTimeout(() => {
                //     setIsInputFocused(false);
                //     setShowSuggestions(false);
                //   }, 150);
                // }}

                placeholder="Start typing doctor name..."
                className="w-full pl-12 pr-12 py-4 rounded-lg border-2 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-lg"
                autoComplete="off"
              />

              {loadingSuggestions && (
                <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-500 animate-spin" size={20} />
              )}
            </div>

            {/* Autocomplete Suggestions Dropdown */}
            {showSuggestions && searchSuggestions.length > 0 && (
              <div
                ref={suggestionsRef}
                className="absolute z-50 w-full mt-2 bg-white rounded-lg shadow-2xl border-2 border-gray-200 max-h-96 overflow-y-auto"
              >
                <div className="p-2 border-b border-gray-100 bg-gray-50">
                  <p className="text-xs font-semibold text-gray-600 px-2">
                    {searchSuggestions.length} doctor{searchSuggestions.length !== 1 ? 's' : ''} found
                  </p>
                </div>
                {searchSuggestions.map((doctor) => (
                  <button
                    key={doctor._id}
                    onClick={() => handleDoctorSelect(doctor)}
                    className="w-full p-4 hover:bg-blue-50 transition-colors text-left border-b border-gray-100 last:border-0"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
                        {doctor.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 truncate">{doctor.name}</p>
                        <p className="text-sm text-gray-600 truncate">{doctor.specialization}</p>
                        <div className="flex items-center gap-4 mt-1">
                          {doctor.availability.morning.available && (
                            <span className="text-xs text-green-600 font-semibold">
                              Morning: {doctor.availability.morning.remaining} slots
                            </span>
                          )}
                          {doctor.availability.afternoon.available && (
                            <span className="text-xs text-purple-600 font-semibold">
                              Afternoon: {doctor.availability.afternoon.remaining} slots
                            </span>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="text-gray-400 flex-shrink-0" size={20} />
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* No Results Message */}
            {showSuggestions && searchQuery.length >= 2 && searchSuggestions.length === 0 && !loadingSuggestions && (
              <div className="absolute z-50 w-full mt-2 bg-white rounded-lg shadow-xl border-2 border-gray-200 p-6 text-center">
                <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-600">No doctors found matching "{searchQuery}"</p>
                <p className="text-sm text-gray-500 mt-1">Try a different search term</p>
              </div>
            )}
          </div>

          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-900">
              💡 <strong>Tip:</strong> Start typing the doctor's name or their specialization. 
              Matching doctors will appear as you type.
            </p>
          </div>

          <div className="flex gap-4 mt-6">
            <button
              onClick={() => setStep(3)}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
            >
              ← Back
            </button>
          </div>
        </motion.div>
      )}

      {/* Step 5: Confirmation */}
      {step === 5 && selectedDoctor && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="card"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Confirm Appointment</h2>
          
          <div className="space-y-6">
            {/* Doctor Info Card */}
            <div className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border-2 border-blue-200">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {selectedDoctor.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{selectedDoctor.name}</h3>
                  <p className="text-sm text-gray-700">{selectedDoctor.specialization}</p>
                  <p className="text-sm text-gray-600">{selectedDoctor.department}</p>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-blue-200">
                <div className="flex justify-between">
                  <span className="text-gray-700">Date:</span>
                  <span className="font-semibold text-gray-900">
                    {new Date(selectedDate).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      month: 'long', 
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Time Slot:</span>
                  <span className="font-semibold text-gray-900 capitalize">
                    {selectedSlot} ({selectedSlot === 'morning' ? '9:30 AM - 12:30 PM' : '1:30 PM - 6:30 PM'})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Qualification:</span>
                  <span className="font-semibold text-gray-900">{selectedDoctor.qualification}</span>
                </div>
              </div>
            </div>

            {/* Symptoms */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Symptoms / Reason for Visit (Optional)
              </label>
              <textarea
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                rows={4}
                placeholder="Describe your symptoms or reason for visit..."
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setStep(4)}
                className="flex-1 px-6 py-4 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
              >
                ← Back
              </button>
              <button
                onClick={handleBookAppointment}
                disabled={loading}
                className="flex-1 px-6 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <><Loader2 className="animate-spin" size={20} /> Booking...</>
                ) : (
                  <><Lock size={20} /> Proceed to Payment</>
                )}
              </button>

              {/* Payment Modal */}
              <PaymentModal
                isOpen={showPayment}
                onClose={() => setShowPayment(false)}
                onSuccess={handlePaymentSuccess}
                appointmentDetails={{
                  doctorName: selectedDoctor?.name,
                  date: selectedDate,
                  slot: selectedSlot,
                }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

// My Appointments View Component
function MyAppointmentsView({ appointments, token, onUpdate }) {
  const [filter, setFilter] = useState('upcoming');

  const cancelAppointment = async (appointmentId) => {
    if (!confirm('Are you sure you want to cancel this appointment?')) return;

    try {
      await axios.patch(
        `${API_BASE_URL}/api/patient/appointment/${appointmentId}/cancel`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Appointment cancelled successfully');
      onUpdate();
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      alert(error.response?.data?.detail || 'Failed to cancel appointment');
    }
  };

  const filteredAppointments = appointments?.[filter] || [];

  return (
    <motion.div
      key="appointments"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <h2 className="text-2xl font-bold text-gray-900 mb-6">My Appointments</h2>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {['upcoming', 'completed', 'cancelled', 'all'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-6 py-2 rounded-lg font-semibold capitalize transition-all whitespace-nowrap ${
              filter === f
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            {f} ({appointments?.[f]?.length || 0})
          </button>
        ))}
      </div>

      {/* Appointments List */}
      {filteredAppointments.length === 0 ? (
        <div className="card text-center py-12">
          <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No appointments found</h3>
          <p className="text-gray-600">
            {filter === 'upcoming' 
              ? 'You don\'t have any upcoming appointments' 
              : `No ${filter} appointments`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAppointments.map((apt) => (
            <AppointmentCard
              key={apt._id}
              appointment={apt}
              onCancel={cancelAppointment}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}

// Appointment Card Component
// function AppointmentCard({ appointment, onCancel }) {
//   const statusColors = {
//     confirmed: 'bg-green-100 text-green-700',
//     pending: 'bg-yellow-100 text-yellow-700',
//     completed: 'bg-blue-100 text-blue-700',
//     cancelled: 'bg-red-100 text-red-700',
//   };

//   const canCancel = ['confirmed', 'pending'].includes(appointment.status) && 
//                     new Date(appointment.date) >= new Date();

//   return (
//     <div className="card">
//       <div className="flex items-start justify-between gap-4">
//         <div className="flex-1">
//           <div className="flex items-start gap-4">
//             <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
//               {appointment.doctor?.name?.charAt(0) || 'D'}
//             </div>
//             <div className="flex-1 min-w-0">
//               <h3 className="text-lg font-semibold text-gray-900">
//                 {appointment.doctor?.name || 'Dr. ' + appointment.doctor_name}
//               </h3>
//               <p className="text-sm text-gray-600">{appointment.doctor?.department}</p>
//               <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
//                 <div className="flex items-center gap-1">
//                   <Calendar className="w-4 h-4" />
//                   {new Date(appointment.date).toLocaleDateString()}
//                 </div>
//                 <div className="flex items-center gap-1">
//                   <Clock className="w-4 h-4" />
//                   {appointment.slot_time}
//                 </div>
//               </div>
//               {appointment.symptoms && (
//                 <p className="text-sm text-gray-700 mt-2 bg-gray-50 p-3 rounded-lg">
//                   <span className="font-semibold">Symptoms:</span> {appointment.symptoms}
//                 </p>
//               )}
//             </div>
//           </div>
//         </div>
//         <div className="text-right flex-shrink-0">
//           <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${statusColors[appointment.status]}`}>
//             {appointment.status}
//           </span>
//           {canCancel && (
//             <button
//               onClick={() => onCancel(appointment._id)}
//               className="mt-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
//             >
//               Cancel
//             </button>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

// Add to PatientDashboard.jsx - Updated AppointmentCard Component

// function AppointmentCard({ appointment, onCancel }) {
//   const statusColors = {
//     confirmed: 'bg-green-100 text-green-700',
//     pending: 'bg-yellow-100 text-yellow-700',
//     completed: 'bg-blue-100 text-blue-700',
//     cancelled: 'bg-red-100 text-red-700',
//   };

//   const canCancel = ['confirmed', 'pending'].includes(appointment.status) && 
//                     new Date(appointment.date) >= new Date();

//   return (
//     <div className="card">
//       <div className="flex items-start justify-between gap-4">
//         <div className="flex-1">
//           <div className="flex items-start gap-3">
//             <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
//               {appointment.doctor?.name?.charAt(0) || 'D'}
//             </div>
//             <div className="flex-1 min-w-0">
//               <div className="flex items-center gap-3">
//                 <h3 className="text-lg font-semibold text-gray-900">
//                   {appointment.doctor?.name || 'Dr. ' + appointment.doctor_name}
//                 </h3>
//                 {/* 🆕 Token Number Badge */}
//                 {appointment.token_number && (
//                   <span className="px-3 py-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-bold rounded-full">
//                     Token #{appointment.token_number}
//                   </span>
//                 )}
//               </div>
//               <p className="text-sm text-gray-600">{appointment.doctor?.department}</p>
//               <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
//                 <div className="flex items-center gap-1">
//                   <Calendar className="w-4 h-4" />
//                   {new Date(appointment.date).toLocaleDateString()}
//                 </div>
//                 <div className="flex items-center gap-1">
//                   <Clock className="w-4 h-4" />
//                   {appointment.slot_time}
//                 </div>
//               </div>
//               {appointment.symptoms && (
//                 <p className="text-sm text-gray-700 mt-2 bg-gray-50 p-3 rounded-lg">
//                   <span className="font-semibold">Symptoms:</span> {appointment.symptoms}
//                 </p>
//               )}
//             </div>
//           </div>
//         </div>
//         <div className="text-right flex-shrink-0">
//           <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${statusColors[appointment.status]}`}>
//             {appointment.status}
//           </span>
//           {canCancel && (
//             <button
//               onClick={() => onCancel(appointment._id)}
//               className="mt-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
//             >
//               Cancel
//             </button>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

function AppointmentCard({ appointment, onCancel }) {
  const statusColors = {
    confirmed: 'bg-green-100 text-green-700',
    pending: 'bg-yellow-100 text-yellow-700',
    completed: 'bg-blue-100 text-blue-700',
    cancelled: 'bg-red-100 text-red-700',
  };

  const canCancel = ['confirmed', 'pending'].includes(appointment.status) &&
                    new Date(appointment.date) >= new Date();

  return (
    <div className="card">
      {/* Top row: avatar + info + status badge */}
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
          {appointment.doctor?.name?.charAt(0) || 'D'}
        </div>

        <div className="flex-1 min-w-0">
          {/* Name + status on same row, wraps naturally */}
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-base font-semibold text-gray-900 leading-tight">
              {appointment.doctor?.name || 'Dr. ' + appointment.doctor_name}
            </h3>
            <span className={`flex-shrink-0 px-2.5 py-1 rounded-full text-xs font-semibold ${statusColors[appointment.status]}`}>
              {appointment.status}
            </span>
          </div>

          <p className="text-sm text-gray-500 mt-0.5">{appointment.doctor?.department}</p>

          {/* Token badge */}
          {appointment.token_number && (
            <span className="inline-block mt-1.5 px-2.5 py-0.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs font-bold rounded-full">
              Token #{appointment.token_number}
            </span>
          )}
        </div>
      </div>

      {/* Date + time row */}
      <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
        <span className="flex items-center gap-1">
          <Calendar className="w-4 h-4 flex-shrink-0" />
          {new Date(appointment.date).toLocaleDateString()}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="w-4 h-4 flex-shrink-0" />
          {appointment.slot_time}
        </span>
      </div>

      {/* Symptoms */}
      {appointment.symptoms && (
        <p className="text-sm text-gray-700 mt-3 bg-gray-50 p-3 rounded-lg">
          <span className="font-semibold">Symptoms:</span> {appointment.symptoms}
        </p>
      )}

      {/* Cancel button — full width on its own row */}
      {canCancel && (
        <button
          onClick={() => onCancel(appointment._id)}
          className="mt-3 w-full px-4 py-2 text-sm font-semibold text-red-600 border border-red-200 hover:bg-red-50 rounded-lg transition-colors"
        >
          Cancel Appointment
        </button>
      )}
    </div>
  );
}

export default PatientDashboard;