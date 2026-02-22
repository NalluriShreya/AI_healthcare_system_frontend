// ReportsView.jsx — Admin Reports Panel
// Drop into AdminDashboard.jsx: import ReportsView and add to features/tabs

import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Download, Calendar, Users, Stethoscope,
  DollarSign, Activity,
  CheckCircle, XCircle, Clock, RefreshCw, TrendingUp, BarChart2,
  AlertCircle, Printer,
} from 'lucide-react';
import { useState } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

// ─────────────────────────────────────────────────────────────
// REPORTS VIEW (top-level, plug into AdminDashboard)
// ─────────────────────────────────────────────────────────────
export default function ReportsView({ token }) {
  const [activeReport, setActiveReport] = useState(null);
  const [data, setData]                 = useState(null);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState(null);

  const reportTypes = [
    {
      id: 'appointments',
      label: 'Appointments',
      description: 'All bookings with status, slot, token and doctor info',
      icon: Calendar,
      color: 'blue',
      endpoint: '/api/admin/analytics',
    },
    {
      id: 'revenue',
      label: 'Revenue & Payments',
      description: 'Collections, refunds and net revenue breakdown',
      icon: DollarSign,
      color: 'green',
      endpoint: '/api/admin/analytics',
    },
    {
      id: 'doctors',
      label: 'Doctors',
      description: 'All registered doctors, departments and status',
      icon: Stethoscope,
      color: 'purple',
      endpoint: '/api/admin/doctors',
    },
    {
      id: 'patients',
      label: 'Patients',
      description: 'Registered patients with activity summary',
      icon: Users,
      color: 'orange',
      endpoint: '/api/admin/patients',
    },
    {
      id: 'leaves',
      label: 'Leave Requests',
      description: 'Doctor leaves with approval status and affected appointments',
      icon: AlertCircle,
      color: 'red',
      endpoint: '/api/admin/leave-requests',
    },
    {
      id: 'summary',
      label: 'Platform Summary',
      description: 'Complete executive overview across all metrics',
      icon: BarChart2,
      color: 'teal',
      endpoint: '/api/admin/analytics',
    },
  ];

  const colorMap = {
    blue:   { card: 'bg-blue-50 border-blue-200',     icon: 'bg-blue-500',   badge: 'bg-blue-100 text-blue-700',    active: 'ring-blue-400'   },
    green:  { card: 'bg-green-50 border-green-200',   icon: 'bg-green-500',  badge: 'bg-green-100 text-green-700',  active: 'ring-green-400'  },
    purple: { card: 'bg-purple-50 border-purple-200', icon: 'bg-purple-500', badge: 'bg-purple-100 text-purple-700',active: 'ring-purple-400' },
    orange: { card: 'bg-orange-50 border-orange-200', icon: 'bg-orange-500', badge: 'bg-orange-100 text-orange-700',active: 'ring-orange-400' },
    red:    { card: 'bg-red-50 border-red-200',       icon: 'bg-red-500',    badge: 'bg-red-100 text-red-700',      active: 'ring-red-400'    },
    teal:   { card: 'bg-teal-50 border-teal-200',     icon: 'bg-teal-500',   badge: 'bg-teal-100 text-teal-700',    active: 'ring-teal-400'   },
  };

  const generateReport = async (report) => {
    setActiveReport(report);
    setData(null);
    setError(null);
    setLoading(true);

    try {
      let res;
      const headers = { Authorization: `Bearer ${token}` };

      if (report.id === 'doctors') {
        res = await axios.get(`${API_BASE_URL}${report.endpoint}`, { headers });
        setData({ type: 'doctors', rows: res.data.doctors || [], total: res.data.total });

      } else if (report.id === 'patients') {
        res = await axios.get(`${API_BASE_URL}${report.endpoint}`, { headers });
        setData({ type: 'patients', rows: res.data.patients || [], total: res.data.total });

      } else if (report.id === 'leaves') {
        res = await axios.get(`${API_BASE_URL}${report.endpoint}`, { headers });
        const all = res.data.all || [];
        setData({ type: 'leaves', rows: all, total: all.length, summary: {
          pending: res.data.pending?.length || 0,
          approved: res.data.approved?.length || 0,
          rejected: res.data.rejected?.length || 0,
        }});

      } else {
        res = await axios.get(`${API_BASE_URL}${report.endpoint}`, { headers });
        setData({ type: report.id, analytics: res.data });
      }
    } catch (e) {
      setError(e.response?.data?.detail || 'Failed to load report');
    } finally {
      setLoading(false);
    }
  };

  // ── CSV Export ───────────────────────────────────────────
  const exportCSV = () => {
    if (!data || !activeReport) return;
    let csv = '';
    let rows = [];

    if (data.type === 'doctors') {
      csv = 'Doctor ID,Name,Email,Phone,Department,Specialization,Qualification,Status,Created At\n';
      rows = (data.rows || []).map(d =>
        [d.doctor_id, d.name, d.email, d.phone, d.department, d.specialization, d.qualification, d.status, d.created_at?.split('T')[0] || ''].join(',')
      );
    } else if (data.type === 'patients') {
      csv = 'Name,Email,Phone,Active,Joined\n';
      rows = (data.rows || []).map(p =>
        [p.name, p.email, p.phone, p.is_active ? 'Yes' : 'No', p.created_at?.split('T')[0] || ''].join(',')
      );
    } else if (data.type === 'leaves') {
      csv = 'Doctor,Start Date,End Date,Days,Status,Affected Appointments,Reason\n';
      rows = (data.rows || []).map(l =>
        [l.doctor_name, l.start_date, l.end_date, l.leave_days, l.approval_status, l.affected_appointments, `"${l.reason || ''}"`].join(',')
      );
    } else if (data.type === 'revenue') {
      const r = data.analytics?.revenue || {};
      const ds = data.analytics?.daily_stats || [];
      csv = 'Date,Total Appointments,Completed,Cancelled,Revenue\n';
      rows = ds.map(d => [d.date, d.total, d.completed, d.cancelled, d.revenue].join(','));
      csv += `\nTotal Collected,${r.total}\nTotal Refunded,${r.total_refunded}\nNet Revenue,${r.net}\n`;
    } else if (data.type === 'appointments') {
      const ds = data.analytics?.daily_stats || [];
      csv = 'Date,Total,Completed,Cancelled,Revenue\n';
      rows = ds.map(d => [d.date, d.total, d.completed, d.cancelled, d.revenue].join(','));
    } else if (data.type === 'summary') {
      const a = data.analytics || {};
      csv = 'Metric,Value\n';
      rows = [
        `Total Doctors,${a.doctors?.total}`,
        `Active Doctors,${a.doctors?.active}`,
        `Total Patients,${a.patients?.total}`,
        `Total Appointments,${a.appointments?.total}`,
        `Completed,${a.appointments?.completed}`,
        `Cancelled,${a.appointments?.cancelled}`,
        `Completion Rate,${a.appointments?.completion_rate}%`,
        `Total Revenue,₹${a.revenue?.total}`,
        `Net Revenue,₹${a.revenue?.net}`,
      ];
    }

    const blob = new Blob([csv + rows.join('\n')], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `${activeReport.id}_report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportPrint = () => window.print();

  return (
    <div className="space-y-5 sm:space-y-7">

      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Reports</h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Generate and export platform data</p>
        </div>
        {data && (
          <div className="flex gap-2 shrink-0">
            <button
              onClick={exportCSV}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 text-xs sm:text-sm transition-colors shadow-sm"
            >
              <Download size={13} />
              <span className="hidden sm:inline">Export CSV</span>
            </button>
            <button
              onClick={exportPrint}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-gray-700 text-white font-semibold rounded-lg hover:bg-gray-800 text-xs sm:text-sm transition-colors shadow-sm"
            >
              <Printer size={13} />
              <span className="hidden sm:inline">Print</span>
            </button>
          </div>
        )}
      </div>

      {/* Report type picker — 2-col mobile, 3-col lg */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-4">
        {reportTypes.map((report, i) => {
          const c = colorMap[report.color];
          const isActive = activeReport?.id === report.id;
          return (
            <motion.button
              key={report.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              onClick={() => generateReport(report)}
              className={`
                relative text-left p-3.5 sm:p-5 rounded-xl border-2 transition-all
                hover:shadow-md hover:-translate-y-0.5
                ${isActive ? `${c.card} ring-2 ${c.active} shadow-md -translate-y-0.5` : 'bg-white border-gray-100 hover:border-gray-200'}
              `}
            >
              <div className={`w-8 h-8 sm:w-10 sm:h-10 ${c.icon} rounded-xl flex items-center justify-center mb-2.5 sm:mb-3 shadow-sm`}>
                <report.icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <p className="text-xs sm:text-sm font-bold text-gray-900 mb-0.5 leading-snug">{report.label}</p>
              <p className="text-[10px] sm:text-xs text-gray-500 leading-relaxed line-clamp-2">{report.description}</p>
              {isActive && (
                <div className={`absolute top-2.5 right-2.5 w-2 h-2 rounded-full ${c.icon}`} />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Report output */}
      <AnimatePresence mode="wait">
        {loading && (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-20 gap-4"
          >
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-gray-500 font-medium">Generating report…</p>
          </motion.div>
        )}

        {error && !loading && (
          <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm"
          >
            <XCircle size={16} className="shrink-0" />
            {error}
          </motion.div>
        )}

        {data && !loading && (
          <motion.div key={activeReport?.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Report header bar */}
            <div className="flex items-center gap-2 print:hidden">
              <div className={`w-7 h-7 ${colorMap[activeReport.color].icon} rounded-lg flex items-center justify-center`}>
                <activeReport.icon className="w-3.5 h-3.5 text-white" />
              </div>
              <p className="text-sm sm:text-base font-bold text-gray-900">{activeReport.label} Report</p>
              <span className="text-xs text-gray-400">— {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
            </div>

            {data.type === 'doctors'      && <DoctorsReport data={data} colorMap={colorMap} />}
            {data.type === 'patients'     && <PatientsReport data={data} />}
            {data.type === 'leaves'       && <LeavesReport data={data} />}
            {data.type === 'revenue'      && <RevenueReport data={data} />}
            {data.type === 'appointments' && <AppointmentsReport data={data} />}
            {data.type === 'summary'      && <SummaryReport data={data} />}
          </motion.div>
        )}

        {!data && !loading && !error && !activeReport && (
          <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400"
          >
            <FileText size={48} strokeWidth={1} />
            <p className="text-sm font-medium">Select a report type above to get started</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// DOCTORS REPORT
// ─────────────────────────────────────────────────────────────
function DoctorsReport({ data, colorMap }) {
  const statusStyle = {
    active:   'bg-green-100 text-green-700',
    inactive: 'bg-gray-100 text-gray-500',
    pending:  'bg-yellow-100 text-yellow-700',
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
        <p className="text-xs sm:text-sm font-semibold text-gray-700">{data.total} Doctors</p>
      </div>

      {/* Desktop table */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-left">
              {['ID','Name','Department','Specialization','Qualification','Status','Joined'].map(h => (
                <th key={h} className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.rows.map((doc, i) => (
              <tr key={doc._id} className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${i % 2 === 0 ? '' : 'bg-gray-50/50'}`}>
                <td className="px-5 py-3 text-xs font-mono text-gray-500">{doc.doctor_id}</td>
                <td className="px-5 py-3 font-semibold text-gray-900">{doc.name}</td>
                <td className="px-5 py-3 text-gray-700">{doc.department}</td>
                <td className="px-5 py-3 text-gray-600 text-xs">{doc.specialization}</td>
                <td className="px-5 py-3 text-gray-600 text-xs">{doc.qualification}</td>
                <td className="px-5 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${statusStyle[doc.status] || 'bg-gray-100 text-gray-600'}`}>
                    {doc.status}
                  </span>
                </td>
                <td className="px-5 py-3 text-gray-500 text-xs whitespace-nowrap">{doc.created_at?.split('T')[0] || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="sm:hidden divide-y divide-gray-100">
        {data.rows.map(doc => (
          <div key={doc._id} className="p-4">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <p className="text-sm font-bold text-gray-900">{doc.name}</p>
                <p className="text-xs text-gray-500 font-mono">{doc.doctor_id}</p>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize shrink-0 ${statusStyle[doc.status]}`}>
                {doc.status}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
              <span className="text-gray-500">Dept</span><span className="text-gray-800 font-medium">{doc.department}</span>
              <span className="text-gray-500">Spec</span><span className="text-gray-800 font-medium">{doc.specialization}</span>
              <span className="text-gray-500">Joined</span><span className="text-gray-800">{doc.created_at?.split('T')[0] || '—'}</span>
            </div>
          </div>
        ))}
      </div>

      {data.rows.length === 0 && <EmptyState label="No doctors found" />}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// PATIENTS REPORT
// ─────────────────────────────────────────────────────────────
function PatientsReport({ data }) {
  const active   = data.rows.filter(p => p.is_active).length;
  const inactive = data.rows.filter(p => !p.is_active).length;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total',    value: data.total, bg: 'bg-blue-50 border-blue-200',   text: 'text-blue-700'  },
          { label: 'Active',   value: active,     bg: 'bg-green-50 border-green-200', text: 'text-green-700' },
          { label: 'Inactive', value: inactive,   bg: 'bg-gray-50 border-gray-200',   text: 'text-gray-600'  },
        ].map(s => (
          <div key={s.label} className={`rounded-xl border-2 p-3 sm:p-4 text-center ${s.bg}`}>
            <p className={`text-xl sm:text-2xl font-bold ${s.text}`}>{s.value}</p>
            <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left">
                {['Name','Email','Phone','Status','Joined'].map(h => (
                  <th key={h} className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.rows.map((p, i) => (
                <tr key={p._id} className={`border-b border-gray-50 hover:bg-gray-50 ${i % 2 ? 'bg-gray-50/40' : ''}`}>
                  <td className="px-5 py-3 font-semibold text-gray-900">{p.name}</td>
                  <td className="px-5 py-3 text-gray-600 text-xs">{p.email}</td>
                  <td className="px-5 py-3 text-gray-600 text-xs font-mono">{p.phone}</td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${p.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {p.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-500 text-xs">{p.created_at?.split('T')[0] || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="sm:hidden divide-y divide-gray-100">
          {data.rows.map(p => (
            <div key={p._id} className="p-4">
              <div className="flex items-start justify-between mb-1.5">
                <p className="text-sm font-bold text-gray-900">{p.name}</p>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${p.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {p.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <p className="text-xs text-gray-500">{p.email}</p>
              <p className="text-xs text-gray-400 font-mono">{p.phone}</p>
            </div>
          ))}
        </div>

        {data.rows.length === 0 && <EmptyState label="No patients found" />}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// LEAVES REPORT
// ─────────────────────────────────────────────────────────────
function LeavesReport({ data }) {
  const statusStyle = {
    pending:      { bg: 'bg-yellow-100 text-yellow-700', label: 'Pending'       },
    approved:     { bg: 'bg-green-100 text-green-700',   label: 'Approved'      },
    auto_approved:{ bg: 'bg-blue-100 text-blue-700',     label: 'Auto-Approved' },
    rejected:     { bg: 'bg-red-100 text-red-700',       label: 'Rejected'      },
    cancelled:    { bg: 'bg-gray-100 text-gray-500',     label: 'Cancelled'     },
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Pending',  value: data.summary.pending,  bg: 'bg-yellow-50 border-yellow-200', text: 'text-yellow-700' },
          { label: 'Approved', value: data.summary.approved, bg: 'bg-green-50 border-green-200',   text: 'text-green-700'  },
          { label: 'Rejected', value: data.summary.rejected, bg: 'bg-red-50 border-red-200',       text: 'text-red-700'    },
        ].map(s => (
          <div key={s.label} className={`rounded-xl border-2 p-3 sm:p-4 text-center ${s.bg}`}>
            <p className={`text-xl sm:text-2xl font-bold ${s.text}`}>{s.value}</p>
            <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left">
                {['Doctor','Start','End','Days','Status','Affected Apts','Reason'].map(h => (
                  <th key={h} className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.rows.map((l, i) => {
                const s = statusStyle[l.approval_status] || { bg: 'bg-gray-100 text-gray-600', label: l.approval_status };
                return (
                  <tr key={l._id} className={`border-b border-gray-50 hover:bg-gray-50 ${i % 2 ? 'bg-gray-50/40' : ''}`}>
                    <td className="px-5 py-3 font-semibold text-gray-900">{l.doctor_name}</td>
                    <td className="px-5 py-3 text-gray-700 text-xs whitespace-nowrap">{l.start_date}</td>
                    <td className="px-5 py-3 text-gray-700 text-xs whitespace-nowrap">{l.end_date}</td>
                    <td className="px-5 py-3 text-gray-700">{l.leave_days}</td>
                    <td className="px-5 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${s.bg}`}>{s.label}</span>
                    </td>
                    <td className="px-5 py-3 text-gray-700">{l.affected_appointments}</td>
                    <td className="px-5 py-3 text-gray-500 text-xs max-w-[160px] truncate">{l.reason || '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="sm:hidden divide-y divide-gray-100">
          {data.rows.map(l => {
            const s = statusStyle[l.approval_status] || { bg: 'bg-gray-100 text-gray-600', label: l.approval_status };
            return (
              <div key={l._id} className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <p className="text-sm font-bold text-gray-900">{l.doctor_name}</p>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${s.bg}`}>{s.label}</span>
                </div>
                <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
                  <span className="text-gray-500">Period</span>
                  <span className="text-gray-800 font-medium">{l.start_date} → {l.end_date}</span>
                  <span className="text-gray-500">Days</span><span className="text-gray-800">{l.leave_days}</span>
                  <span className="text-gray-500">Apts affected</span><span className="text-gray-800">{l.affected_appointments}</span>
                  {l.reason && <><span className="text-gray-500">Reason</span><span className="text-gray-800">{l.reason}</span></>}
                </div>
              </div>
            );
          })}
        </div>

        {data.rows.length === 0 && <EmptyState label="No leave requests found" />}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// REVENUE REPORT
// ─────────────────────────────────────────────────────────────
function RevenueReport({ data }) {
  const r  = data.analytics?.revenue     || {};
  const ds = data.analytics?.daily_stats || [];
  const maxRev = Math.max(...ds.map(d => d.revenue), 1);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Collected', value: `₹${(r.total || 0).toLocaleString()}`,         bg: 'bg-green-50 border-green-200', text: 'text-green-700' },
          { label: 'This Month',      value: `₹${(r.this_month || 0).toLocaleString()}`,     bg: 'bg-blue-50 border-blue-200',   text: 'text-blue-700'  },
          { label: 'Total Refunded',  value: `₹${(r.total_refunded || 0).toLocaleString()}`, bg: 'bg-red-50 border-red-200',     text: 'text-red-700'   },
          { label: 'Net Revenue',     value: `₹${(r.net || 0).toLocaleString()}`,            bg: 'bg-teal-50 border-teal-200',   text: 'text-teal-700'  },
        ].map(s => (
          <div key={s.label} className={`rounded-xl border-2 p-3 sm:p-4 ${s.bg}`}>
            <p className={`text-lg sm:text-xl font-bold ${s.text}`}>{s.value}</p>
            <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 sm:p-6">
        <p className="text-xs sm:text-sm font-semibold text-gray-700 mb-4">Daily Revenue — Last 7 Days</p>
        <div className="flex items-end gap-1.5 sm:gap-3" style={{ height: 110 }}>
          {ds.map((day, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-20
                              bg-gray-900 text-white rounded-lg px-2.5 py-2 shadow-xl
                              opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none
                              text-[10px] whitespace-nowrap">
                <p className="font-semibold">{day.date}</p>
                <p>₹{day.revenue.toLocaleString()}</p>
              </div>
              <div
                className="w-full bg-teal-400 rounded-t-md transition-all duration-500"
                style={{ height: day.revenue > 0 ? Math.max((day.revenue / maxRev) * 80, 4) : 2 }}
              />
              <span className="text-[9px] sm:text-xs font-semibold text-gray-500">{day.label}</span>
              <span className="text-[9px] sm:text-[10px] font-bold text-teal-600">₹{day.revenue}</span>
            </div>
          ))}
        </div>
      </div>

      {data.analytics?.top_doctors?.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-4 sm:px-6 py-3 border-b border-gray-100 bg-gray-50">
            <p className="text-xs sm:text-sm font-semibold text-gray-700">Top Doctors by Appointments</p>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left">
                {['#','Name','Department','Appointments'].map(h => (
                  <th key={h} className="px-4 sm:px-5 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.analytics.top_doctors.map((doc, i) => (
                <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-4 sm:px-5 py-3">
                    <span className={`w-6 h-6 rounded-full inline-flex items-center justify-center text-[10px] font-bold text-white ${
                      i === 0 ? 'bg-yellow-400' : i === 1 ? 'bg-gray-400' : i === 2 ? 'bg-orange-400' : 'bg-blue-400'
                    }`}>{i + 1}</span>
                  </td>
                  <td className="px-4 sm:px-5 py-3 font-semibold text-gray-900 text-xs sm:text-sm">{doc.name}</td>
                  <td className="px-4 sm:px-5 py-3 text-gray-600 text-xs">{doc.department}</td>
                  <td className="px-4 sm:px-5 py-3 font-bold text-blue-600 text-sm sm:text-base">{doc.appointments}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// APPOINTMENTS REPORT
// ─────────────────────────────────────────────────────────────
function AppointmentsReport({ data }) {
  const a  = data.analytics?.appointments || {};
  const ds = data.analytics?.daily_stats  || [];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total',     value: a.total,     bg: 'bg-blue-50 border-blue-200',    text: 'text-blue-700'   },
          { label: 'Confirmed', value: a.confirmed, bg: 'bg-indigo-50 border-indigo-200',text: 'text-indigo-700' },
          { label: 'Completed', value: a.completed, bg: 'bg-green-50 border-green-200',  text: 'text-green-700'  },
          { label: 'Cancelled', value: a.cancelled, bg: 'bg-red-50 border-red-200',      text: 'text-red-700'    },
        ].map(s => (
          <div key={s.label} className={`rounded-xl border-2 p-3 sm:p-4 ${s.bg}`}>
            <p className={`text-xl sm:text-2xl font-bold ${s.text}`}>{s.value ?? '—'}</p>
            <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3 bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
        <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center shrink-0">
          <CheckCircle className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="text-xs text-gray-500">Completion Rate</p>
          <p className="text-2xl font-bold text-green-600">{a.completion_rate}%</p>
        </div>
        <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden ml-4">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${a.completion_rate}%` }}
            transition={{ duration: 0.8 }}
            className="h-full bg-green-400 rounded-full"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-4 sm:px-6 py-3 border-b border-gray-100 bg-gray-50">
          <p className="text-xs sm:text-sm font-semibold text-gray-700">Daily Breakdown — Last 7 Days</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left">
                {['Date','Day','Total','Completed','Cancelled','Revenue'].map(h => (
                  <th key={h} className="px-4 sm:px-5 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ds.map((day, i) => (
                <tr key={i} className={`border-b border-gray-50 hover:bg-gray-50 ${i % 2 ? 'bg-gray-50/40' : ''}`}>
                  <td className="px-4 sm:px-5 py-3 text-gray-700 font-mono text-xs whitespace-nowrap">{day.date}</td>
                  <td className="px-4 sm:px-5 py-3 font-semibold text-gray-700 text-xs">{day.label}</td>
                  <td className="px-4 sm:px-5 py-3 font-bold text-gray-900">{day.total}</td>
                  <td className="px-4 sm:px-5 py-3 text-green-600 font-semibold">{day.completed}</td>
                  <td className="px-4 sm:px-5 py-3 text-red-500 font-semibold">{day.cancelled}</td>
                  <td className="px-4 sm:px-5 py-3 text-teal-600 font-semibold text-xs">₹{day.revenue.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SUMMARY REPORT
// ─────────────────────────────────────────────────────────────
function SummaryReport({ data }) {
  const a = data.analytics || {};

  const sections = [
    {
      title: 'Doctors', icon: Stethoscope, color: 'purple',
      rows: [['Total Doctors',a.doctors?.total],['Active',a.doctors?.active],['Inactive',a.doctors?.inactive],['Pending Signup',a.doctors?.pending]],
    },
    {
      title: 'Patients', icon: Users, color: 'blue',
      rows: [['Total Patients',a.patients?.total],['Active Patients',a.patients?.active],['New This Month',a.patients?.new_this_month]],
    },
    {
      title: 'Appointments', icon: Calendar, color: 'indigo',
      rows: [['Total',a.appointments?.total],['Today',a.appointments?.today],['This Month',a.appointments?.this_month],['Confirmed',a.appointments?.confirmed],['Completed',a.appointments?.completed],['Cancelled',a.appointments?.cancelled],['Completion Rate',`${a.appointments?.completion_rate}%`]],
    },
    {
      title: 'Revenue', icon: DollarSign, color: 'green',
      rows: [['Total Collected',`₹${(a.revenue?.total||0).toLocaleString()}`],['This Month',`₹${(a.revenue?.this_month||0).toLocaleString()}`],['Total Refunded',`₹${(a.revenue?.total_refunded||0).toLocaleString()}`],['Net Revenue',`₹${(a.revenue?.net||0).toLocaleString()}`]],
    },
    {
      title: 'Leaves', icon: AlertCircle, color: 'orange',
      rows: [['Pending Approval',a.leaves?.pending],['Approved',a.leaves?.approved]],
    },
  ];

  const iconBg   = { purple:'bg-purple-500', blue:'bg-blue-500', indigo:'bg-indigo-500', green:'bg-green-500', orange:'bg-orange-500' };
  const cardBorder = { purple:'border-purple-100', blue:'border-blue-100', indigo:'border-indigo-100', green:'border-green-100', orange:'border-orange-100' };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {sections.map((sec, i) => (
        <motion.div key={sec.title} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
          className={`bg-white rounded-xl border-2 ${cardBorder[sec.color]} shadow-sm overflow-hidden`}
        >
          <div className="flex items-center gap-2.5 px-4 py-3 border-b border-gray-100 bg-gray-50/70">
            <div className={`w-7 h-7 ${iconBg[sec.color]} rounded-lg flex items-center justify-center shrink-0`}>
              <sec.icon className="w-3.5 h-3.5 text-white" />
            </div>
            <p className="text-xs sm:text-sm font-bold text-gray-800">{sec.title}</p>
          </div>
          <div className="divide-y divide-gray-50">
            {sec.rows.map(([label, val]) => (
              <div key={label} className="flex items-center justify-between px-4 py-2.5">
                <span className="text-xs text-gray-500">{label}</span>
                <span className="text-xs sm:text-sm font-bold text-gray-900">{val ?? '—'}</span>
              </div>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// EMPTY STATE
// ─────────────────────────────────────────────────────────────
function EmptyState({ label }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-2 text-gray-400">
      <FileText size={32} strokeWidth={1} />
      <p className="text-sm">{label}</p>
    </div>
  );
}