// AdminDashboard.jsx

import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import {
  LogOut, Users, Activity, FileText, Bell, Calendar,
  CheckCircle, XCircle, Clock, AlertCircle,
  TrendingUp, TrendingDown, DollarSign, Stethoscope,
  BarChart2, ArrowUpRight, ArrowDownRight, RefreshCw,
  X as XIcon, Download,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import ReportsView from './ReportsView';

const API_BASE_URL = 'http://localhost:8000';

// ─────────────────────────────────────────────────────────────
// ROOT COMPONENT
// ─────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const { user, logout, token } = useAuthStore();
  const navigate = useNavigate();

  const [leaveRequests, setLeaveRequests] = useState(null);
  const [analytics, setAnalytics]         = useState(null);
  const [loadingLeave, setLoadingLeave]   = useState(true);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [view, setView] = useState('home'); // 'home' | 'analytics' | 'reports'

  useEffect(() => { fetchLeaveRequests(); }, []);
  useEffect(() => {
    if (view === 'analytics' && !analytics) fetchAnalytics();
  }, [view]);

  const fetchLeaveRequests = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/admin/leave-requests`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLeaveRequests(res.data);
    } catch (e) {
      console.error('leave-requests:', e);
    } finally {
      setLoadingLeave(false);
    }
  };

  const fetchAnalytics = async () => {
    setLoadingAnalytics(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/admin/analytics`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAnalytics(res.data);
    } catch (e) {
      console.error('analytics:', e);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  const handleLogout = () => { logout(); navigate('/login'); };
  const pendingCount = leaveRequests?.pending?.length || 0;

  const features = [
    { icon: Users,    title: 'User Management', description: 'Manage patients and doctors',         color: 'bg-blue-500',   onClick: () => navigate('/admin/users') },
    { icon: Calendar, title: 'Leave Requests',  description: `${pendingCount} pending approval${pendingCount !== 1 ? 's' : ''}`, color: 'bg-orange-500', badge: pendingCount, onClick: () => setShowLeaveModal(true) },
    { icon: Activity, title: 'System Analytics',description: 'View platform usage and health stats',color: 'bg-green-500',  onClick: () => setView('analytics') },
    { icon: FileText, title: 'Reports',         description: 'Generate, filter and export reports', color: 'bg-purple-500', onClick: () => setView('reports') },
  ];

  return (
    <div className="min-h-screen bg-gradient-soft">

      {/* ── HEADER ─────────────────────────────────────────────── */}
      <header className="header-container">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2">

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

            {/* Right actions */}
            <div className="flex items-center gap-1 sm:gap-3 shrink-0">
              {/* Bell */}
              <button
                onClick={() => setShowLeaveModal(true)}
                className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Bell size={18} className="text-gray-600" />
                {pendingCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 sm:w-5 sm:h-5 bg-red-500 text-white text-[9px] sm:text-xs rounded-full flex items-center justify-center font-bold">
                    {pendingCount > 9 ? '9+' : pendingCount}
                  </span>
                )}
              </button>

              {/* User info — desktop only */}
              <div className="hidden md:flex items-center gap-3 pl-3 border-l border-gray-200">
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

      {/* ── MAIN ───────────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8">

        {/* View tabs */}
        <div className="flex gap-2 mb-5 sm:mb-8 overflow-x-auto no-scrollbar pb-1">
          {[
            { key: 'home',      label: 'Home',             Icon: null      },
            { key: 'analytics', label: 'System Analytics', Icon: BarChart2 },
            { key: 'reports',   label: 'Reports',          Icon: FileText  },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setView(tab.key)}
              className={`
                flex items-center gap-1.5 px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg font-semibold
                transition-all whitespace-nowrap shrink-0 text-xs sm:text-sm
                ${view === tab.key
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'}
              `}
            >
              {tab.Icon && <tab.Icon size={14} />}
              {tab.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">

          {/* ── HOME VIEW ──────────────────────────────────────── */}
          {view === 'home' && (
            <motion.div key="home"
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
            >
              <div className="mb-5 sm:mb-8">
                <h2 className="text-xl sm:text-3xl font-bold text-gray-900 mb-1">Admin Dashboard 🛡️</h2>
                <p className="text-sm sm:text-lg text-gray-600">System overview and management tools</p>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                {features.map((feature, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    onClick={feature.onClick}
                    className={`relative bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 group transition-all hover:shadow-md hover:-translate-y-0.5 ${feature.onClick ? 'cursor-pointer' : 'opacity-60'}`}
                  >
                    {feature.badge > 0 && (
                      <div className="absolute top-2.5 right-2.5 sm:top-4 sm:right-4 w-5 h-5 sm:w-7 sm:h-7 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold">
                        {feature.badge}
                      </div>
                    )}
                    <div className={`w-9 h-9 sm:w-14 sm:h-14 ${feature.color} rounded-xl sm:rounded-2xl flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300 shadow-md`}>
                      <feature.icon className="w-4 h-4 sm:w-7 sm:h-7 text-white" />
                    </div>
                    <h3 className="text-sm sm:text-xl font-semibold text-gray-900 mb-0.5 sm:mb-2 leading-snug">{feature.title}</h3>
                    <p className="text-[11px] sm:text-sm text-gray-500 leading-relaxed line-clamp-2">{feature.description}</p>
                  </motion.div>
                ))}
              </div>

              {/* Leave overview summary */}
              {leaveRequests && (
                <motion.div
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
                  className="mt-5 sm:mt-8 bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100"
                >
                  <h3 className="text-base sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">Leave Request Overview</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6">
                    {[
                      { count: leaveRequests.pending.length,  label: 'Pending',  Icon: Clock,       bg: 'bg-yellow-50 border-yellow-200', iconBg: 'bg-yellow-500' },
                      { count: leaveRequests.approved.length, label: 'Approved', Icon: CheckCircle, bg: 'bg-green-50 border-green-200',   iconBg: 'bg-green-500'  },
                      { count: leaveRequests.rejected.length, label: 'Rejected', Icon: XCircle,     bg: 'bg-red-50 border-red-200',       iconBg: 'bg-red-500'    },
                    ].map(item => (
                      <div key={item.label} className={`flex items-center gap-3 sm:gap-4 p-4 sm:p-6 rounded-xl border-2 ${item.bg}`}>
                        <div className={`w-10 h-10 sm:w-12 sm:h-12 ${item.iconBg} rounded-lg flex items-center justify-center shrink-0`}>
                          <item.Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                        </div>
                        <div>
                          <p className="text-2xl sm:text-3xl font-bold text-gray-900">{item.count}</p>
                          <p className="text-xs sm:text-sm text-gray-600">{item.label} Requests</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* ── ANALYTICS VIEW ─────────────────────────────────── */}
          {view === 'analytics' && (
            <motion.div key="analytics"
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
            >
              <AnalyticsView analytics={analytics} loading={loadingAnalytics} onRefresh={fetchAnalytics} />
            </motion.div>
          )}

          {/* ── REPORTS VIEW ───────────────────────────────────── */}
          {view === 'reports' && (
            <motion.div key="reports"
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
            >
              <ReportsView token={token} />
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* Leave Requests Modal */}
      <LeaveRequestsModal
        show={showLeaveModal}
        onClose={() => setShowLeaveModal(false)}
        leaveRequests={leaveRequests}
        token={token}
        onUpdate={fetchLeaveRequests}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// ANALYTICS VIEW
// ─────────────────────────────────────────────────────────────
function AnalyticsView({ analytics, loading, onRefresh }) {
  if (loading) return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-gray-500 text-sm font-medium">Loading analytics…</p>
    </div>
  );
  if (!analytics) return (
    <div className="text-center py-20">
      <BarChart2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
      <p className="text-gray-500 mb-4 text-sm">No analytics data available</p>
      <button onClick={onRefresh} className="px-5 py-2.5 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 text-sm">
        Load Analytics
      </button>
    </div>
  );

  const { doctors, patients, appointments, revenue, daily_stats, departments, top_doctors, leaves } = analytics;
  const maxDaily = Math.max(...daily_stats.map(d => d.total), 1);

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">System Analytics</h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Live overview of platform activity</p>
        </div>
        <button onClick={onRefresh} className="flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-white border border-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 text-xs sm:text-sm shrink-0">
          <RefreshCw size={13} /><span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <KpiCard label="Total Revenue"  value={`₹${revenue.total.toLocaleString()}`}         sub={`₹${revenue.this_month.toLocaleString()} this month`}            icon={DollarSign}  color="green"  trend="up"      />
        <KpiCard label="Appointments"   value={appointments.total.toLocaleString()}           sub={`${appointments.today} today · ${appointments.this_month} month`} icon={Calendar}    color="blue"   trend="up"      />
        <KpiCard label="Total Patients" value={patients.total.toLocaleString()}               sub={`${patients.new_this_month} new this month`}                      icon={Users}       color="purple" trend="up"      />
        <KpiCard label="Active Doctors" value={doctors.active}                                sub={`${doctors.total} total · ${doctors.pending} pending`}            icon={Stethoscope} color="orange" trend="neutral" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100">
          <h3 className="text-sm sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-5">Appointment Breakdown</h3>
          <div className="space-y-2.5 sm:space-y-4">
            <StatusBar label="Confirmed" value={appointments.confirmed} total={appointments.total} color="bg-blue-500"  textColor="text-blue-700"  bgColor="bg-blue-50"  />
            <StatusBar label="Completed" value={appointments.completed} total={appointments.total} color="bg-green-500" textColor="text-green-700" bgColor="bg-green-50" />
            <StatusBar label="Cancelled" value={appointments.cancelled} total={appointments.total} color="bg-red-400"   textColor="text-red-700"   bgColor="bg-red-50"   />
          </div>
          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
            <span className="text-xs sm:text-sm text-gray-500">Completion Rate</span>
            <span className="text-base sm:text-lg font-bold text-green-600">{appointments.completion_rate}%</span>
          </div>
        </div>
        <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100">
          <h3 className="text-sm sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-5">Revenue Breakdown</h3>
          <div className="space-y-2.5 sm:space-y-4">
            {[
              { label: 'Total Collected', value: `₹${revenue.total.toLocaleString()}`,         Icon: TrendingUp,   bg: 'bg-green-50', iconBg: 'bg-green-500' },
              { label: 'Total Refunded',  value: `₹${revenue.total_refunded.toLocaleString()}`, Icon: TrendingDown, bg: 'bg-red-50',   iconBg: 'bg-red-400'  },
            ].map(r => (
              <div key={r.label} className={`flex items-center gap-3 p-3 sm:p-4 rounded-xl ${r.bg}`}>
                <div className={`w-8 h-8 sm:w-9 sm:h-9 ${r.iconBg} rounded-lg flex items-center justify-center shrink-0`}>
                  <r.Icon className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs text-gray-500">{r.label}</p>
                  <p className="font-bold text-gray-900 text-sm sm:text-base">{r.value}</p>
                </div>
              </div>
            ))}
            <div className="flex items-center justify-between gap-2 p-3 sm:p-4 bg-blue-50 rounded-xl border-2 border-blue-200">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 sm:w-9 sm:h-9 bg-blue-500 rounded-lg flex items-center justify-center shrink-0">
                  <DollarSign className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs text-gray-500">Net Revenue</p>
                  <p className="font-bold text-blue-700 text-sm sm:text-lg">₹{revenue.net.toLocaleString()}</p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-[10px] sm:text-xs text-blue-500 font-semibold">This month</p>
                <p className="text-xs sm:text-sm font-bold text-blue-700">₹{revenue.this_month.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100">
        <h3 className="text-sm sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-6">Last 7 Days — Appointments</h3>
        <div className="flex items-end gap-1.5 sm:gap-3" style={{ height: 130 }}>
          {daily_stats.map((day, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-20 bg-gray-900 text-white rounded-lg px-2.5 py-2 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none text-[10px] sm:text-xs whitespace-nowrap">
                <p className="font-semibold mb-0.5">{day.date}</p>
                <p>Total: {day.total}</p>
                <p>✅ {day.completed} · ❌ {day.cancelled}</p>
                <p>₹{day.revenue.toLocaleString()}</p>
              </div>
              <div className="w-full flex flex-col justify-end gap-px" style={{ height: 95 }}>
                {[
                  { val: day.cancelled,                             cls: 'bg-red-300' },
                  { val: day.completed,                             cls: 'bg-green-400' },
                  { val: day.total - day.completed - day.cancelled, cls: 'bg-blue-400 rounded-t-md' },
                ].map((seg, si) => (
                  <div key={si} className={`w-full transition-all duration-500 ${seg.cls}`}
                    style={{ height: seg.val > 0 ? Math.max((seg.val / maxDaily) * 90, 3) : 0 }}
                  />
                ))}
              </div>
              <span className="text-[9px] sm:text-xs font-semibold text-gray-500">{day.label}</span>
              <span className="text-[9px] sm:text-xs font-bold text-gray-700">{day.total}</span>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-3 sm:gap-6 mt-3 pt-3 border-t border-gray-100">
          <LegendDot color="bg-blue-400"  label="Confirmed" />
          <LegendDot color="bg-green-400" label="Completed" />
          <LegendDot color="bg-red-300"   label="Cancelled" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100">
          <h3 className="text-sm sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-5">Doctors by Department</h3>
          {departments.length === 0 ? <p className="text-sm text-gray-400 text-center py-8">No data</p> : (
            <div className="space-y-2.5 sm:space-y-3">
              {departments.map((dept, i) => {
                const pct = Math.round((dept.count / departments[0].count) * 100);
                const colors = ['bg-blue-500','bg-purple-500','bg-green-500','bg-orange-500','bg-pink-500','bg-teal-500','bg-indigo-500','bg-red-400'];
                return (
                  <div key={dept.name} className="flex items-center gap-2 sm:gap-3">
                    <span className="w-20 sm:w-28 text-[10px] sm:text-xs font-semibold text-gray-600 truncate shrink-0">{dept.name}</span>
                    <div className="flex-1 h-2 sm:h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ delay: i * 0.07, duration: 0.5 }}
                        className={`h-full rounded-full ${colors[i % colors.length]}`}
                      />
                    </div>
                    <span className="text-[10px] sm:text-xs font-bold text-gray-700 w-4 text-right shrink-0">{dept.count}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100">
          <h3 className="text-sm sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-5">Top Doctors by Appointments</h3>
          {top_doctors.length === 0 ? <p className="text-sm text-gray-400 text-center py-8">No data yet</p> : (
            <div className="space-y-2 sm:space-y-3">
              {top_doctors.map((doc, i) => (
                <div key={i} className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 bg-gray-50 rounded-xl">
                  <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-white text-[10px] sm:text-sm font-bold shrink-0 ${i===0?'bg-yellow-400':i===1?'bg-gray-400':i===2?'bg-orange-400':'bg-blue-400'}`}>
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-semibold text-gray-900 truncate">{doc.name}</p>
                    <p className="text-[10px] sm:text-xs text-gray-400 truncate">{doc.specialization} · {doc.department}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm sm:text-lg font-bold text-blue-600">{doc.appointments}</p>
                    <p className="text-[9px] sm:text-xs text-gray-400">appts</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100">
          <h3 className="text-sm sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-5">Doctor Status</h3>
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            {[
              { label: 'Active',         value: doctors.active,   bg: 'bg-green-50  border-green-200',  text: 'text-green-700',  dot: 'bg-green-500'  },
              { label: 'Inactive',       value: doctors.inactive, bg: 'bg-gray-50   border-gray-200',   text: 'text-gray-600',   dot: 'bg-gray-400'   },
              { label: 'Pending Signup', value: doctors.pending,  bg: 'bg-yellow-50 border-yellow-200', text: 'text-yellow-700', dot: 'bg-yellow-400' },
              { label: 'Total',          value: doctors.total,    bg: 'bg-blue-50   border-blue-200',   text: 'text-blue-700',   dot: 'bg-blue-500'   },
            ].map(item => (
              <div key={item.label} className={`p-3 sm:p-4 rounded-xl border-2 ${item.bg}`}>
                <div className="flex items-center gap-1.5 mb-1">
                  <div className={`w-2 h-2 rounded-full shrink-0 ${item.dot}`} />
                  <p className="text-[10px] sm:text-xs font-semibold text-gray-500 leading-tight">{item.label}</p>
                </div>
                <p className={`text-xl sm:text-2xl font-bold ${item.text}`}>{item.value}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100">
          <h3 className="text-sm sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-5">Platform Summary</h3>
          <div className="space-y-2 sm:space-y-3">
            {[
              { label: 'Total Patients',        value: patients.total,          Icon: Users,       color: 'bg-purple-100 text-purple-600' },
              { label: 'Active Patients',        value: patients.active,         Icon: CheckCircle, color: 'bg-green-100 text-green-600'   },
              { label: 'New Patients (Month)',   value: patients.new_this_month, Icon: TrendingUp,  color: 'bg-blue-100 text-blue-600'     },
              { label: 'Pending Leave Requests', value: leaves.pending,          Icon: Clock,       color: 'bg-yellow-100 text-yellow-600' },
              { label: 'Approved Leaves',        value: leaves.approved,         Icon: Calendar,    color: 'bg-teal-100 text-teal-600'     },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between gap-2 p-2.5 sm:p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center shrink-0 ${item.color}`}>
                    <item.Icon size={13} />
                  </div>
                  <span className="text-xs sm:text-sm font-medium text-gray-700 truncate">{item.label}</span>
                </div>
                <span className="text-sm sm:text-lg font-bold text-gray-900 shrink-0">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SMALL SHARED COMPONENTS
// ─────────────────────────────────────────────────────────────
function KpiCard({ label, value, sub, icon: Icon, color, trend }) {
  const map = {
    green:  { bg: 'bg-green-50',  border: 'border-green-200',  icon: 'bg-green-500',  text: 'text-green-700'  },
    blue:   { bg: 'bg-blue-50',   border: 'border-blue-200',   icon: 'bg-blue-500',   text: 'text-blue-700'   },
    purple: { bg: 'bg-purple-50', border: 'border-purple-200', icon: 'bg-purple-500', text: 'text-purple-700' },
    orange: { bg: 'bg-orange-50', border: 'border-orange-200', icon: 'bg-orange-500', text: 'text-orange-700' },
  }[color];
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      className={`${map.bg} border-2 ${map.border} rounded-xl sm:rounded-2xl p-3 sm:p-5`}
    >
      <div className="flex items-start justify-between mb-2 sm:mb-3">
        <div className={`w-8 h-8 sm:w-11 sm:h-11 ${map.icon} rounded-xl flex items-center justify-center shadow-sm shrink-0`}>
          <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
        </div>
        {trend === 'up'   && <ArrowUpRight  size={14} className="text-green-500 shrink-0" />}
        {trend === 'down' && <ArrowDownRight size={14} className="text-red-500 shrink-0"   />}
      </div>
      <p className={`text-lg sm:text-2xl font-bold ${map.text} mb-0.5 leading-tight`}>{value}</p>
      <p className="text-[10px] sm:text-xs font-semibold text-gray-500 mb-0.5">{label}</p>
      <p className="text-[9px] sm:text-xs text-gray-400 leading-snug">{sub}</p>
    </motion.div>
  );
}

function StatusBar({ label, value, total, color, textColor, bgColor }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div className={`p-2.5 sm:p-3 rounded-xl ${bgColor}`}>
      <div className="flex items-center justify-between mb-1.5">
        <span className={`text-xs sm:text-sm font-semibold ${textColor}`}>{label}</span>
        <span className="text-xs sm:text-sm font-bold text-gray-700">
          {value} <span className="font-normal text-gray-400">({pct}%)</span>
        </span>
      </div>
      <div className="w-full h-1.5 sm:h-2 bg-white/70 rounded-full overflow-hidden">
        <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.6 }}
          className={`h-full rounded-full ${color}`}
        />
      </div>
    </div>
  );
}

function LegendDot({ color, label }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className={`w-2.5 h-2.5 rounded-sm ${color}`} />
      <span className="text-[10px] sm:text-xs text-gray-500">{label}</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// LEAVE REQUESTS MODAL
// ─────────────────────────────────────────────────────────────
function LeaveRequestsModal({ show, onClose, leaveRequests, token, onUpdate }) {
  const [filter, setFilter]                 = useState('pending');
  const [reviewingLeave, setReviewingLeave] = useState(null);
  const [adminNotes, setAdminNotes]         = useState('');
  const [loading, setLoading]               = useState(false);

  const handleReview = async (leaveId, action) => {
    if (!confirm(`Are you sure you want to ${action} this leave request?`)) return;
    setLoading(true);
    try {
      await axios.post(
        `${API_BASE_URL}/api/admin/leave/review`,
        { leave_id: leaveId, action, admin_notes: adminNotes || undefined },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      alert(`Leave ${action}d successfully`);
      setReviewingLeave(null);
      setAdminNotes('');
      onUpdate();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to review leave');
    } finally {
      setLoading(false);
    }
  };

  if (!show || !leaveRequests) return null;
  const filteredLeaves = leaveRequests[filter] || [];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm sm:p-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 60 }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        onClick={e => e.stopPropagation()}
        className="w-full bg-white shadow-2xl flex flex-col overflow-hidden rounded-t-2xl max-h-[92dvh] sm:rounded-2xl sm:max-w-4xl sm:max-h-[90vh]"
      >
        <div className="sm:hidden flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>
        <div className="shrink-0 px-4 sm:px-6 pt-3 sm:pt-5 pb-3 sm:pb-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-base sm:text-2xl font-bold text-gray-900">Leave Requests</h3>
            <button onClick={onClose} className="p-1.5 sm:p-2 hover:bg-gray-200 rounded-lg transition-colors shrink-0">
              <XIcon size={18} className="text-gray-600" />
            </button>
          </div>
          <div className="flex gap-1.5 sm:gap-2 mt-3 overflow-x-auto no-scrollbar pb-0.5">
            {['pending', 'approved', 'rejected', 'all'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-semibold capitalize whitespace-nowrap shrink-0 text-[11px] sm:text-sm transition-all ${filter === f ? 'bg-blue-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
              >
                {f} ({leaveRequests[f]?.length || 0})
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {filteredLeaves.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">No {filter} leave requests</p>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {filteredLeaves.map(leave => (
                <LeaveRequestCard key={leave._id} leave={leave} onReview={handleReview}
                  reviewingLeave={reviewingLeave} setReviewingLeave={setReviewingLeave}
                  adminNotes={adminNotes} setAdminNotes={setAdminNotes} loading={loading}
                />
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

function LeaveRequestCard({ leave, onReview, reviewingLeave, setReviewingLeave, adminNotes, setAdminNotes, loading }) {
  const isPending  = leave.approval_status === 'pending';
  const isExpanded = reviewingLeave === leave._id;

  const statusBg = { pending:'bg-yellow-50 border-yellow-200', approved:'bg-green-50 border-green-200', auto_approved:'bg-blue-50 border-blue-200', rejected:'bg-red-50 border-red-200' };
  const badgeCls = { pending:'bg-yellow-100 text-yellow-700', approved:'bg-green-100 text-green-700',  auto_approved:'bg-blue-100 text-blue-700',   rejected:'bg-red-100 text-red-700'  };

  return (
    <div className={`rounded-xl border-2 p-3.5 sm:p-6 ${statusBg[leave.approval_status]}`}>
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <h4 className="text-sm sm:text-lg font-bold text-gray-900 truncate">{leave.doctor_name}</h4>
            <span className={`text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${badgeCls[leave.approval_status]}`}>
              {leave.approval_status === 'auto_approved' ? 'Auto-Approved' : leave.approval_status}
            </span>
          </div>
        </div>
        {isPending && (
          <button onClick={() => setReviewingLeave(isExpanded ? null : leave._id)}
            className="shrink-0 px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors text-[11px] sm:text-sm"
          >
            {isExpanded ? 'Cancel' : 'Review'}
          </button>
        )}
      </div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-2 sm:gap-4 text-xs sm:text-sm">
        {[
          { label: 'Start Date',    value: new Date(leave.start_date).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' }) },
          { label: 'End Date',      value: new Date(leave.end_date).toLocaleDateString('en-US',   { month:'short', day:'numeric', year:'numeric' }) },
          { label: 'Duration',      value: `${leave.leave_days} day${leave.leave_days > 1 ? 's' : ''}` },
          { label: 'Affected Apts', value: leave.affected_appointments },
        ].map(cell => (
          <div key={cell.label}>
            <p className="text-[10px] sm:text-xs text-gray-500">{cell.label}</p>
            <p className="font-semibold text-gray-900 text-xs sm:text-sm">{cell.value}</p>
          </div>
        ))}
      </div>
      {leave.reason && (
        <div className="mt-2.5 sm:mt-4 p-2.5 sm:p-3 bg-white rounded-lg">
          <p className="text-[10px] sm:text-xs font-semibold text-gray-500 mb-0.5">Reason</p>
          <p className="text-xs sm:text-sm text-gray-900">{leave.reason}</p>
        </div>
      )}
      {leave.needs_approval && (
        <div className="mt-2 sm:mt-3 flex items-start gap-2 text-[10px] sm:text-xs text-orange-700 bg-orange-100 px-2.5 py-2 rounded-lg">
          <AlertCircle size={12} className="shrink-0 mt-px" />
          <span>Exceeds monthly limit — Admin approval required</span>
        </div>
      )}
      {leave.admin_notes && (
        <div className="mt-2 sm:mt-3 p-2.5 sm:p-3 bg-white/60 rounded-lg">
          <p className="text-[10px] sm:text-xs font-semibold text-gray-500 mb-0.5">Admin Notes</p>
          <p className="text-xs sm:text-sm text-gray-900">{leave.admin_notes}</p>
        </div>
      )}
      {isExpanded && isPending && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
          className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200"
        >
          <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
            Admin Notes <span className="font-normal text-gray-400">(optional)</span>
          </label>
          <textarea value={adminNotes} onChange={e => setAdminNotes(e.target.value)} rows={3}
            placeholder="Add notes for the doctor…"
            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-xs sm:text-sm mb-3"
          />
          <div className="flex gap-2 sm:gap-3">
            <button onClick={() => onReview(leave._id, 'reject')} disabled={loading}
              className="flex-1 py-2.5 sm:py-3 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 disabled:opacity-50 flex items-center justify-center gap-1.5 text-xs sm:text-sm transition-colors"
            >
              <XCircle size={14} /> Reject
            </button>
            <button onClick={() => onReview(leave._id, 'approve')} disabled={loading}
              className="flex-1 py-2.5 sm:py-3 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 disabled:opacity-50 flex items-center justify-center gap-1.5 text-xs sm:text-sm transition-colors"
            >
              <CheckCircle size={14} /> Approve
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}