// PaymentHistoryView.jsx

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import {
  Receipt,
  Download,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  CreditCard,
  Smartphone,
  Globe,
  Calendar,
  User,
  Stethoscope,
  ChevronDown,
  ChevronUp,
  IndianRupee,
  TrendingDown,
  TrendingUp,
  Banknote,
  Filter,
  Search,
  AlertCircle,
  X,
} from 'lucide-react';


// ─────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────

const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const formatDateTime = (dateStr) => {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

const paymentMethodIcon = (method) => {
  switch (method?.toLowerCase()) {
    case 'upi':
      return <Smartphone size={15} />;
    case 'netbanking':
      return <Globe size={15} />;
    default:
      return <CreditCard size={15} />;
  }
};

const paymentMethodLabel = (method) => {
  switch (method?.toLowerCase()) {
    case 'upi':
      return 'UPI';
    case 'netbanking':
      return 'Net Banking';
    default:
      return 'Card';
  }
};

const statusConfig = {
  success: {
    label: 'Paid',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    dot: 'bg-emerald-500',
    icon: CheckCircle,
  },
  refunded: {
    label: 'Refunded',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    dot: 'bg-blue-500',
    icon: RefreshCw,
  },
  failed: {
    label: 'Failed',
    bg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-200',
    dot: 'bg-red-500',
    icon: XCircle,
  },
  pending: {
    label: 'Pending',
    bg: 'bg-yellow-50',
    text: 'text-yellow-700',
    border: 'border-yellow-200',
    dot: 'bg-yellow-500',
    icon: Clock,
  },
};

// ─────────────────────────────────────────
// Receipt Modal
// ─────────────────────────────────────────

function ReceiptModal({ payment, onClose }) {
const handleDownloadPDF = async () => {
  const { jsPDF } = await import('jspdf');
  const html2canvas = (await import('html2canvas')).default;

  const receiptEl = document.getElementById('receipt-content');

  const wrapper = document.createElement('div');
  wrapper.style.cssText = `
    position: fixed;
    top: 0;
    left: -9999px;
    width: 480px;
    height: auto;
    overflow: visible;
    max-height: none;
    background: #ffffff;
    z-index: -1;
    font-family: 'Segoe UI', sans-serif;
  `;

  const clone = receiptEl.cloneNode(true);
  clone.style.cssText = `
    width: 480px;
    height: auto;
    max-height: none;
    overflow: visible;
    background: #ffffff;
    padding: 24px;
    color: #111827;
  `;

  const allEls = [clone, ...clone.querySelectorAll('*')];
  allEls.forEach((el) => {
    const computed = window.getComputedStyle(el);
    ['color', 'backgroundColor', 'borderColor', 'borderTopColor', 'borderBottomColor'].forEach((prop) => {
      const val = computed[prop];
      if (val && val.includes('oklch')) {
        el.style[prop] = '#111827';
      }
    });
  });

  wrapper.appendChild(clone);
  document.body.appendChild(wrapper);

  await new Promise((resolve) => setTimeout(resolve, 150));

  try {
    const canvas = await html2canvas(wrapper, {
      scale: 2,
      backgroundColor: '#ffffff',
      useCORS: true,
      scrollY: 0,
      width: 480,
      height: wrapper.scrollHeight,
      windowWidth: 480,
      onclone: (doc) => {
        const style = doc.createElement('style');
        style.textContent = `* { color: revert !important; background-color: revert !important; }`;
        doc.head.appendChild(style);
      },
    });

    const imgData = canvas.toDataURL('image/png');
    const margin = 8;
    const pageWidth = 148;
    const imgW = pageWidth - margin * 2;
    const imgH = (canvas.height / canvas.width) * imgW;
    const pageHeight = imgH + margin * 2;

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [pageWidth, pageHeight],
    });

    pdf.addImage(imgData, 'PNG', margin, margin, imgW, imgH);
    pdf.save(`MediCareAI_Receipt_${payment.transaction_id}.pdf`);
  } finally {
    document.body.removeChild(wrapper);
  }
};

  const cfg = statusConfig[payment.status] || statusConfig.success;
  const StatusIcon = cfg.icon;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 20 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Receipt size={20} className="text-blue-600" />
              Payment Receipt
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={handleDownloadPDF}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 text-sm font-semibold rounded-lg hover:bg-blue-100 transition-colors"
              >
                <Download size={14} />
                Download PDF
              </button>
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={18} className="text-gray-500" />
              </button>
            </div>
          </div>

          {/* Receipt Content (also used for print) */}
          <div className="overflow-y-auto max-h-[75vh] px-6 py-5">
            <div
  id="receipt-content"
  className="receipt"
  style={{
    backgroundColor: "#ffffff",
    color: "#111827",
  }}
>
              <div className="header" style={{ textAlign: 'center', marginBottom: 24, borderBottom: '2px dashed #e5e7eb', paddingBottom: 20 }}>
                <div className="logo" style={{ fontSize: 32, marginBottom: 6 }}>🏥</div>
                <div className="clinic" style={{ fontSize: 20, fontWeight: 700, color: '#1d4ed8' }}>MediCare AI</div>
                <div className="subtitle" style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>Official Payment Receipt</div>
                <div style={{ marginTop: 12 }}>
                  <span
                    className={`status-${payment.status}`}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '4px 14px',
                      borderRadius: 999,
                      fontSize: 13,
                      fontWeight: 600,
                      background: payment.status === 'refunded' ? '#dbeafe' : '#d1fae5',
                      color: payment.status === 'refunded' ? '#1e40af' : '#065f46',
                    }}
                  >
                    ✓ {cfg.label}
                  </span>
                </div>
              </div>

              {/* Transaction Info */}
              <div className="section" style={{ margin: '20px 0' }}>
                <div className="section-title" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#9ca3af', marginBottom: 10, fontWeight: 600 }}>
                  Transaction Details
                </div>
                {[
                  ['Transaction ID', payment.transaction_id],
                  ['Date & Time', formatDateTime(payment.paid_at)],
                  ['Payment Method', paymentMethodLabel(payment.payment_method)],
                ].map(([label, value]) => (
                  <div key={label} className="row" style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f3f4f6', fontSize: 13 }}>
                    <span style={{ color: '#6b7280' }}>{label}</span>
                    <span style={{ fontWeight: 500, color: '#111827', fontFamily: label === 'Transaction ID' ? 'monospace' : 'inherit' }}>
                      {value}
                    </span>
                  </div>
                ))}
              </div>

              {/* Doctor & Appointment Info */}
              <div className="section" style={{ margin: '20px 0' }}>
                <div className="section-title" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#9ca3af', marginBottom: 10, fontWeight: 600 }}>
                  Appointment Details
                </div>
                {[
                  ['Doctor', payment.doctor_name],
                  ['Specialization', payment.doctor_specialization || '—'],
                  ['Department', payment.doctor_department || '—'],
                  ['Date', formatDate(payment.appointment_date)],
                  ['Slot', payment.slot === 'morning' ? 'Morning (9:30 AM – 12:30 PM)' : 'Afternoon (1:30 PM – 6:30 PM)'],
                  ...(payment.token_number ? [['Token Number', `#${payment.token_number}`]] : []),
                ].map(([label, value]) => (
                  <div key={label} className="row" style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f3f4f6', fontSize: 13 }}>
                    <span style={{ color: '#6b7280' }}>{label}</span>
                    <span style={{ fontWeight: 500, color: '#111827' }}>{value}</span>
                  </div>
                ))}
              </div>

              {/* Billing Breakdown */}
              <div className="section" style={{ margin: '20px 0' }}>
                <div className="section-title" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#9ca3af', marginBottom: 10, fontWeight: 600 }}>
                  Billing Summary
                </div>
                {[
                  ['Consultation Fee', formatCurrency(payment.consultation_fee ?? 299)],
                  ['Platform Fee', formatCurrency(payment.platform_fee ?? 19)],
                ].map(([label, value]) => (
                  <div key={label} className="row" style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f3f4f6', fontSize: 13 }}>
                    <span style={{ color: '#6b7280' }}>{label}</span>
                    <span style={{ fontWeight: 500, color: '#111827' }}>{value}</span>
                  </div>
                ))}
                <div className="total-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderTop: '2px solid #e5e7eb', marginTop: 8 }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>Total Paid</span>
                  <span style={{ fontSize: 18, fontWeight: 800, color: '#1d4ed8' }}>{formatCurrency(payment.payment_amount)}</span>
                </div>
              </div>

              {/* Refund Info */}
              {payment.status === 'refunded' && (
                <div style={{ background: '#dbeafe', borderRadius: 8, padding: '12px 16px', marginTop: 16 }}>
                  <div style={{ fontSize: 12, color: '#1e40af', fontWeight: 600 }}>Refund Information</div>
                  <div style={{ fontSize: 13, color: '#1e40af', marginTop: 4 }}>
                    Amount: {formatCurrency(payment.refund_amount || payment.payment_amount)}<br />
                    {payment.refund_transaction_id && <>Refund ID: {payment.refund_transaction_id}<br /></>}
                    {payment.refund_at && <>Initiated: {formatDateTime(payment.refund_at)}<br /></>}
                    {payment.refund_reason && <>Reason: {payment.refund_reason}</>}
                  </div>
                </div>
              )}

              <div className="footer" style={{ textAlign: 'center', marginTop: 24, fontSize: 11, color: '#9ca3af', borderTop: '1px solid #e5e7eb', paddingTop: 16 }}>
                <p>Thank you for choosing MediCare AI</p>
                <p style={{ marginTop: 4 }}>This is a computer-generated receipt and does not require a signature.</p>
                <p style={{ marginTop: 4 }}>For support, contact help@medicare-ai.com</p>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─────────────────────────────────────────
// Payment Card
// ─────────────────────────────────────────

function PaymentCard({ payment, index, onViewReceipt }) {
  const [expanded, setExpanded] = useState(false);
  const cfg = statusConfig[payment.status] || statusConfig.success;
  const StatusIcon = cfg.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`bg-white rounded-xl border ${cfg.border} shadow-sm overflow-hidden`}
    >
      {/* Main Row */}
      <div className="px-5 py-4">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
            {payment.doctor_name?.charAt(0) || 'D'}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <div>
                <p className="font-semibold text-gray-900 text-sm">{payment.doctor_name}</p>
                <p className="text-xs text-gray-500 mt-0.5">{payment.doctor_specialization}</p>
              </div>
              {/* Amount */}
              <div className="text-right flex-shrink-0">
                <p className="font-bold text-gray-900">
                  {payment.status === 'refunded' ? (
                    <span className="line-through text-gray-400 text-sm">{formatCurrency(payment.payment_amount)}</span>
                  ) : (
                    formatCurrency(payment.payment_amount)
                  )}
                </p>
                {payment.status === 'refunded' && (
                  <p className="text-xs text-blue-600 font-semibold">
                    Refunded {formatCurrency(payment.refund_amount || payment.payment_amount)}
                  </p>
                )}
              </div>
            </div>

            {/* Meta row */}
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              <span className="flex items-center gap-1 text-xs text-gray-500">
                <Calendar size={11} />
                {formatDate(payment.appointment_date)}
              </span>
              <span className="flex items-center gap-1 text-xs text-gray-500">
                {paymentMethodIcon(payment.payment_method)}
                {paymentMethodLabel(payment.payment_method)}
              </span>
              <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                {cfg.label}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Expand/Collapse */}
      <div className="border-t border-gray-100 px-5 py-2 flex items-center justify-between bg-gray-50">
        <span className="text-xs text-gray-400 font-mono truncate max-w-[180px]">
          {payment.transaction_id}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onViewReceipt(payment)}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <Receipt size={13} />
            Receipt
          </button>
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 px-2 py-1.5 text-xs text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </div>

      {/* Expanded Details */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-5 py-4 border-t border-gray-100 grid grid-cols-2 gap-3 text-sm">
              {[
                ['Date & Time', formatDateTime(payment.paid_at)],
                ['Department', payment.doctor_department || '—'],
                ['Slot', payment.slot === 'morning' ? 'Morning' : 'Afternoon'],
                ['Token', payment.token_number ? `#${payment.token_number}` : '—'],
                ['Consultation Fee', formatCurrency(payment.consultation_fee ?? 299)],
                ['Platform Fee', formatCurrency(payment.platform_fee ?? 19)],
              ].map(([label, value]) => (
                <div key={label}>
                  <p className="text-xs text-gray-400 mb-0.5">{label}</p>
                  <p className="text-sm font-medium text-gray-800">{value}</p>
                </div>
              ))}
              {payment.status === 'refunded' && (
                <>
                  <div className="col-span-2 mt-1 p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <p className="text-xs font-semibold text-blue-700 mb-1 flex items-center gap-1">
                      <RefreshCw size={11} /> Refund Details
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-xs text-blue-700">
                      <span>Amount: {formatCurrency(payment.refund_amount || payment.payment_amount)}</span>
                      {payment.refund_at && <span>On: {formatDate(payment.refund_at)}</span>}
                      {payment.refund_transaction_id && (
                        <span className="col-span-2 font-mono">ID: {payment.refund_transaction_id}</span>
                      )}
                      {payment.refund_reason && (
                        <span className="col-span-2">Reason: {payment.refund_reason}</span>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─────────────────────────────────────────
// Main PaymentHistoryView
// ─────────────────────────────────────────

export function PaymentHistoryView({ token }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/patient/payment-history`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load payment history');
    } finally {
      setLoading(false);
    }
  };

  const filteredPayments = (data?.payments || []).filter((p) => {
    const matchesStatus = filterStatus === 'all' || p.status === filterStatus;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      p.doctor_name?.toLowerCase().includes(q) ||
      p.transaction_id?.toLowerCase().includes(q) ||
      p.doctor_department?.toLowerCase().includes(q) ||
      p.doctor_specialization?.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
        <p className="text-gray-500 text-sm">Loading payment history...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <AlertCircle className="w-12 h-12 text-red-400" />
        <p className="text-gray-700 font-medium">{error}</p>
        <button
          onClick={fetchPayments}
          className="px-5 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  const summary = data?.summary || {};

  return (
    <motion.div
      key="payments"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Payment History</h2>
          <p className="text-sm text-gray-500 mt-0.5">All your transactions and receipts</p>
        </div>
        <button
          onClick={fetchPayments}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500"
          title="Refresh"
        >
          <RefreshCw size={18} />
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: 'Total Spent',
            value: formatCurrency(summary.total_spent || 0),
            icon: IndianRupee,
            color: 'text-blue-600',
            bg: 'bg-blue-50',
            sub: `${summary.successful_count || 0} transactions`,
          },
          {
            label: 'Total Refunded',
            value: formatCurrency(summary.total_refunded || 0),
            icon: RefreshCw,
            color: 'text-purple-600',
            bg: 'bg-purple-50',
            sub: `${summary.refunded_count || 0} refunds`,
          },
          {
            label: 'Net Paid',
            value: formatCurrency(summary.net_spent || 0),
            icon: TrendingUp,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50',
            sub: 'After refunds',
          },
          {
            label: 'Transactions',
            value: summary.total_transactions || 0,
            icon: Receipt,
            color: 'text-orange-600',
            bg: 'bg-orange-50',
            sub: 'All time',
          },
        ].map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex items-center gap-3"
          >
            <div className={`p-2.5 rounded-xl ${card.bg} flex-shrink-0`}>
              <card.icon className={`w-5 h-5 ${card.color}`} />
            </div>
            <div className="min-w-0">
              <p className="text-lg font-bold text-gray-900 truncate">{card.value}</p>
              <p className="text-xs text-gray-500">{card.label}</p>
              <p className="text-xs text-gray-400">{card.sub}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by doctor, department, transaction ID..."
            className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Status Filter */}
        <div className="flex gap-2 flex-shrink-0">
          {['all', 'success', 'refunded'].map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize transition-all ${
                filterStatus === s
                  ? 'bg-blue-600 text-white shadow'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {s === 'all' ? `All (${summary.total_transactions || 0})` : s === 'success' ? `Paid (${summary.successful_count || 0})` : `Refunded (${summary.refunded_count || 0})`}
            </button>
          ))}
        </div>
      </div>

      {/* Payment List */}
      {filteredPayments.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 py-16 text-center">
          <Receipt className="w-14 h-14 text-gray-200 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-1">
            {searchQuery || filterStatus !== 'all' ? 'No matching payments' : 'No payments yet'}
          </h3>
          <p className="text-sm text-gray-400">
            {searchQuery || filterStatus !== 'all'
              ? 'Try adjusting your filters'
              : 'Your payment history will appear here once you book an appointment'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredPayments.map((payment, index) => (
            <PaymentCard
              key={payment._id}
              payment={payment}
              index={index}
              onViewReceipt={setSelectedReceipt}
            />
          ))}
        </div>
      )}

      {/* Receipt Modal */}
      <AnimatePresence>
        {selectedReceipt && (
          <ReceiptModal
            payment={selectedReceipt}
            onClose={() => setSelectedReceipt(null)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default PaymentHistoryView;