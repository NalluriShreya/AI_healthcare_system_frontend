import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, KeyRound, Lock, Eye, EyeOff, CheckCircle, Loader2, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

// ─── reuse your existing API base URL ───────────────────────
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({ baseURL: API_BASE });

// ─────────────────────────────────────────────────────────────
// Step indicator
// ─────────────────────────────────────────────────────────────
const steps = ['Email', 'Verify OTP', 'New Password'];

function StepIndicator({ current }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-6">
      {steps.map((label, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="flex flex-col items-center gap-1">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                i < current
                  ? 'bg-green-500 text-white'
                  : i === current
                  ? 'bg-blue-600 text-white shadow-lg scale-110'
                  : 'bg-gray-200 text-gray-400'
              }`}
            >
              {i < current ? <CheckCircle size={16} /> : i + 1}
            </div>
            <span
              className={`text-xs font-medium ${
                i === current ? 'text-blue-600' : i < current ? 'text-green-600' : 'text-gray-400'
              }`}
            >
              {label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div
              className={`h-0.5 w-10 mb-4 rounded-full transition-all duration-500 ${
                i < current ? 'bg-green-400' : 'bg-gray-200'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// OTP input boxes
// ─────────────────────────────────────────────────────────────
function OTPInput({ value, onChange, disabled }) {
  const inputs = useRef([]);

  const handleChange = (index, val) => {
    const digits = value.split('');
    digits[index] = val.replace(/\D/, '').slice(-1);
    const next = digits.join('');
    onChange(next);
    if (val && index < 5) inputs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !value[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    onChange(pasted.padEnd(6, '').slice(0, 6));
    if (pasted.length > 0) inputs.current[Math.min(pasted.length, 5)]?.focus();
  };

  return (
    <div className="flex gap-2 justify-center">
      {Array.from({ length: 6 }).map((_, i) => (
        <input
          key={i}
          ref={(el) => (inputs.current[i] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[i] || ''}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          disabled={disabled}
          className={`w-11 h-12 text-center text-xl font-bold border-2 rounded-xl outline-none transition-all duration-200 
            ${disabled ? 'bg-gray-100 text-gray-400 border-gray-200' : 'bg-white'}
            ${value[i]
              ? 'border-blue-500 text-blue-700 bg-blue-50'
              : 'border-gray-300 focus:border-blue-500 focus:bg-blue-50'
            }`}
        />
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Countdown timer
// ─────────────────────────────────────────────────────────────
function Countdown({ seconds, onExpire }) {
  const [remaining, setRemaining] = useState(seconds);

  useEffect(() => {
    setRemaining(seconds);
    const interval = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) { clearInterval(interval); onExpire?.(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [seconds]);

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const pct = (remaining / seconds) * 100;

  return (
    <div className="flex items-center gap-2 justify-center text-sm">
      <svg width="28" height="28" viewBox="0 0 28 28" className="-rotate-90">
        <circle cx="14" cy="14" r="11" fill="none" stroke="#e5e7eb" strokeWidth="3" />
        <circle
          cx="14" cy="14" r="11" fill="none"
          stroke={remaining < 60 ? '#ef4444' : '#3b82f6'}
          strokeWidth="3"
          strokeDasharray={`${2 * Math.PI * 11}`}
          strokeDashoffset={`${2 * Math.PI * 11 * (1 - pct / 100)}`}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s linear' }}
        />
      </svg>
      <span className={remaining < 60 ? 'text-red-500 font-semibold' : 'text-gray-600'}>
        {mins}:{String(secs).padStart(2, '0')} remaining
      </span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Password strength meter
// ─────────────────────────────────────────────────────────────
function PasswordStrength({ password }) {
  if (!password) return null;

  const checks = [
    { label: 'At least 8 characters', ok: password.length >= 8 },
    { label: 'Uppercase letter', ok: /[A-Z]/.test(password) },
    { label: 'Lowercase letter', ok: /[a-z]/.test(password) },
    { label: 'Number', ok: /[0-9]/.test(password) },
    { label: 'Special character', ok: /[^A-Za-z0-9]/.test(password) },
  ];

  const score = checks.filter((c) => c.ok).length;
  const strength = score <= 2 ? 'Weak' : score <= 4 ? 'Medium' : 'Strong';
  const colors = { Weak: 'bg-red-500', Medium: 'bg-yellow-400', Strong: 'bg-green-500' };
  const textColors = { Weak: 'text-red-600', Medium: 'text-yellow-600', Strong: 'text-green-600' };

  return (
    <div className="mt-3 space-y-2">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
              i <= score ? colors[strength] : 'bg-gray-200'
            }`}
          />
        ))}
      </div>
      <p className={`text-xs font-semibold ${textColors[strength]}`}>{strength} password</p>
      <div className="grid grid-cols-2 gap-1">
        {checks.map((c, i) => (
          <div key={i} className="flex items-center gap-1">
            <span className={c.ok ? 'text-green-500' : 'text-gray-300'}>
              {c.ok ? '✓' : '○'}
            </span>
            <span className={`text-xs ${c.ok ? 'text-green-700' : 'text-gray-400'}`}>{c.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// MAIN MODAL
// ─────────────────────────────────────────────────────────────
export default function ForgotPasswordModal({ isOpen, onClose, defaultRole = 'patient' }) {
  const [step, setStep] = useState(0);   // 0: email, 1: OTP, 2: new password, 3: success
  const [role, setRole] = useState(defaultRole);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [otpExpired, setOtpExpired] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Reset everything when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setStep(0);
      setRole(defaultRole);
      setEmail('');
      setOtp('');
      setNewPassword('');
      setConfirmPassword('');
      setOtpExpired(false);
      setResendCooldown(0);
    }
  }, [isOpen, defaultRole]);

  // Resend cooldown
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  // ── Step 1: Request OTP ──────────────────────────────────
  const handleRequestOTP = async (e) => {
    e?.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/api/auth/forgot-password', { email, role });
      toast.success(res.data.message);
      setStep(1);
      setOtpExpired(false);
      setOtp('');
      setResendCooldown(60);
    } catch (err) {
      const msg = err?.response?.data?.detail || 'Something went wrong.';
      if (err?.response?.status === 429) {
        toast.error('Too many requests. Please wait before trying again.');
      } else {
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: Verify OTP ───────────────────────────────────
  const handleVerifyOTP = async () => {
    if (otp.length < 6) { toast.error('Please enter the full 6-digit OTP.'); return; }
    setLoading(true);
    try {
      await api.post('/api/auth/verify-reset-otp', { email, role, otp_code: otp });
      toast.success('OTP verified!');
      setStep(2);
    } catch (err) {
      const msg = err?.response?.data?.detail || 'Invalid OTP.';
      toast.error(msg);
      if (msg.toLowerCase().includes('maximum')) {
        setOtpExpired(true);
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Step 3: Reset Password ───────────────────────────────
  const handleResetPassword = async (e) => {
    e?.preventDefault();
    if (newPassword !== confirmPassword) { toast.error('Passwords do not match.'); return; }
    if (newPassword.length < 8) { toast.error('Password must be at least 8 characters.'); return; }
    setLoading(true);
    try {
      const res = await api.post('/api/auth/reset-password', {
        email,
        role,
        otp_code: otp,
        new_password: newPassword,
      });
      toast.success(res.data.message);
      setStep(3);
    } catch (err) {
      const msg = err?.response?.data?.detail || 'Failed to reset password.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    await handleRequestOTP();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 pt-6 pb-4 text-white relative">
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
                >
                  <X size={16} />
                </button>
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <KeyRound size={20} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Forgot Password</h2>
                    <p className="text-white/80 text-sm">Reset your account password</p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                {step < 3 && <StepIndicator current={step} />}

                <AnimatePresence mode="wait">
                  {/* ── STEP 0: Enter Email ── */}
                  {step === 0 && (
                    <motion.form
                      key="step0"
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -30 }}
                      onSubmit={handleRequestOTP}
                      className="space-y-5"
                    >
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Select Role
                        </label>
                        <div className="flex gap-2 p-1 bg-gray-100 rounded-xl">
                          {['patient', 'doctor', 'admin'].map((r) => (
                            <button
                              key={r}
                              type="button"
                              onClick={() => setRole(r)}
                              className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold capitalize transition-all duration-200 ${
                                role === r
                                  ? 'bg-white text-blue-600 shadow-md'
                                  : 'text-gray-500 hover:text-gray-700'
                              }`}
                            >
                              {r}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Registered Email Address
                        </label>
                        <div className="relative">
                          <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            required
                            className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl outline-none focus:border-blue-500 transition-colors text-gray-800"
                          />
                        </div>
                        <p className="mt-2 text-xs text-gray-500 flex items-start gap-1">
                          <span>🔒</span>
                          <span>For security, we won't confirm whether this email is registered.</span>
                        </p>
                      </div>

                      <button
                        type="submit"
                        disabled={loading || !email}
                        className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {loading ? <><Loader2 size={18} className="animate-spin" /> Sending OTP...</> : 'Send OTP'}
                      </button>
                    </motion.form>
                  )}

                  {/* ── STEP 1: Enter OTP ── */}
                  {step === 1 && (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -30 }}
                      className="space-y-5"
                    >
                      <div className="text-center">
                        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Mail size={28} className="text-blue-600" />
                        </div>
                        <p className="text-sm text-gray-600">
                          We sent a 6-digit OTP to
                        </p>
                        <p className="font-semibold text-gray-900 text-sm mt-1 break-all">{email}</p>
                      </div>

                      <div className="space-y-3">
                        <label className="block text-sm font-semibold text-gray-700 text-center">
                          Enter OTP
                        </label>
                        <OTPInput value={otp} onChange={setOtp} disabled={loading || otpExpired} />
                      </div>

                      {!otpExpired ? (
                        <Countdown seconds={600} onExpire={() => setOtpExpired(true)} />
                      ) : (
                        <div className="text-center">
                          <p className="text-red-500 text-sm font-semibold">⏰ OTP has expired.</p>
                        </div>
                      )}

                      {!otpExpired ? (
                        <button
                          onClick={handleVerifyOTP}
                          disabled={loading || otp.length < 6}
                          className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          {loading ? <><Loader2 size={18} className="animate-spin" /> Verifying...</> : 'Verify OTP'}
                        </button>
                      ) : null}

                      <div className="flex items-center justify-between pt-1">
                        <button
                          type="button"
                          onClick={() => { setStep(0); setOtp(''); setOtpExpired(false); }}
                          className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
                        >
                          <ArrowLeft size={14} /> Change email
                        </button>
                        <button
                          type="button"
                          onClick={handleResend}
                          disabled={resendCooldown > 0 || loading}
                          className={`text-sm font-semibold ${
                            resendCooldown > 0
                              ? 'text-gray-400 cursor-not-allowed'
                              : 'text-blue-600 hover:text-blue-700'
                          }`}
                        >
                          {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend OTP'}
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* ── STEP 2: New Password ── */}
                  {step === 2 && (
                    <motion.form
                      key="step2"
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -30 }}
                      onSubmit={handleResetPassword}
                      className="space-y-5"
                    >
                      <div className="text-center">
                        <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Lock size={28} className="text-green-600" />
                        </div>
                        <p className="text-sm text-gray-600">OTP verified! Set your new password.</p>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          New Password
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Enter new password"
                            required
                            className="w-full px-4 pr-12 py-3 border-2 border-gray-200 rounded-xl outline-none focus:border-blue-500 transition-colors text-gray-800"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                          </button>
                        </div>
                        <PasswordStrength password={newPassword} />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Confirm Password
                        </label>
                        <div className="relative">
                          <input
                            type={showConfirm ? 'text' : 'password'}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Re-enter new password"
                            required
                            className="w-full px-4 pr-12 py-3 border-2 border-gray-200 rounded-xl outline-none focus:border-blue-500 transition-colors text-gray-800"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirm(!showConfirm)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showConfirm ? <Eye size={18} /> : <EyeOff size={18} />}
                          </button>
                        </div>
                        {confirmPassword && newPassword !== confirmPassword && (
                          <p className="mt-1 text-xs text-red-500">Passwords do not match.</p>
                        )}
                        {confirmPassword && newPassword === confirmPassword && (
                          <p className="mt-1 text-xs text-green-600 flex items-center gap-1">
                            <CheckCircle size={12} /> Passwords match
                          </p>
                        )}
                      </div>

                      <button
                        type="submit"
                        disabled={loading || newPassword !== confirmPassword || newPassword.length < 8}
                        className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {loading ? <><Loader2 size={18} className="animate-spin" /> Resetting...</> : 'Reset Password'}
                      </button>
                    </motion.form>
                  )}

                  {/* ── STEP 3: Success ── */}
                  {step === 3 && (
                    <motion.div
                      key="step3"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-4 space-y-4"
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
                        className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto"
                      >
                        <CheckCircle size={40} className="text-green-500" />
                      </motion.div>
                      <h3 className="text-xl font-bold text-gray-900">Password Reset!</h3>
                      <p className="text-gray-600 text-sm">
                        Your password has been updated successfully.
                        <br />You can now log in with your new password.
                      </p>
                      <button
                        onClick={onClose}
                        className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all"
                      >
                        Back to Login
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}