// PaymentModal.jsx - Professional Simulated Payment UI (Compact Fix)

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CreditCard,
  Lock,
  CheckCircle,
  XCircle,
  Loader2,
  Shield,
  Smartphone,
  Building2,
  Wallet,
  ChevronRight,
  X,
  AlertCircle,
} from 'lucide-react';

const CONSULTATION_FEE = 299;
const PLATFORM_FEE = 19;
const TOTAL = CONSULTATION_FEE + PLATFORM_FEE;

function luhnCheck(num) {
  let arr = (num + '').split('').reverse().map((x) => parseInt(x));
  let lastDigit = arr.splice(0, 1)[0];
  let sum = arr.reduce(
    (acc, val, i) => (i % 2 !== 0 ? acc + val : acc + ((val * 2) % 9) || 9),
    0
  );
  sum += lastDigit;
  return sum % 10 === 0;
}

function detectCardType(num) {
  const n = num.replace(/\s/g, '');
  if (/^4/.test(n)) return 'visa';
  if (/^5[1-5]/.test(n) || /^2[2-7]/.test(n)) return 'mastercard';
  if (/^3[47]/.test(n)) return 'amex';
  if (/^6(?:011|5)/.test(n)) return 'discover';
  return null;
}

function CardIcon({ type, size = 28 }) {
  const icons = {
    visa: (
      <svg width={size} height={size * 0.6} viewBox="0 0 50 32">
        <rect width="50" height="32" rx="4" fill="#1A1F71" />
        <text x="8" y="22" fill="white" fontSize="14" fontWeight="bold" fontFamily="serif">VISA</text>
      </svg>
    ),
    mastercard: (
      <svg width={size} height={size * 0.7} viewBox="0 0 50 32">
        <rect width="50" height="32" rx="4" fill="#252525" />
        <circle cx="20" cy="16" r="10" fill="#EB001B" />
        <circle cx="30" cy="16" r="10" fill="#F79E1B" />
        <path d="M25 8.5a10 10 0 010 15 10 10 0 010-15z" fill="#FF5F00" />
      </svg>
    ),
    amex: (
      <svg width={size} height={size * 0.6} viewBox="0 0 50 32">
        <rect width="50" height="32" rx="4" fill="#2E77BC" />
        <text x="6" y="22" fill="white" fontSize="10" fontWeight="bold">AMEX</text>
      </svg>
    ),
  };
  return icons[type] || (
    <div style={{ width: size, height: size * 0.6 }} className="rounded bg-gray-200 border-2 border-dashed border-gray-300 flex items-center justify-center">
      <CreditCard size={12} className="text-gray-400" />
    </div>
  );
}

const UPI_APPS = {
  gpay:    { bg: '#fff',    label: 'G Pay',   color: '#4285F4', border: '#d1d5db', selectedBorder: '#3b82f6' },
  phonepe: { bg: '#5f259f', label: 'PhonePe', color: '#fff',    border: '#5f259f', selectedBorder: '#3b82f6' },
  paytm:   { bg: '#002970', label: 'Paytm',   color: '#00BAF2', border: '#002970', selectedBorder: '#3b82f6' },
  bhim:    { bg: '#006400', label: 'BHIM',    color: '#fff',    border: '#006400', selectedBorder: '#3b82f6' },
};

export function PaymentModal({ isOpen, onClose, onSuccess, appointmentDetails }) {
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [step, setStep] = useState('details');

  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [showCvv, setShowCvv] = useState(false);
  const [cardType, setCardType] = useState(null);
  const [errors, setErrors] = useState({});

  const [upiId, setUpiId] = useState('');
  const [selectedUpiApp, setSelectedUpiApp] = useState(null);
  const [selectedBank, setSelectedBank] = useState('');

  const banks = [
    'State Bank of India', 'HDFC Bank', 'ICICI Bank', 'Axis Bank',
    'Kotak Mahindra Bank', 'Punjab National Bank', 'Bank of Baroda', 'Canara Bank'
  ];

  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setStep('details');
        setCardNumber(''); setCardName(''); setExpiry(''); setCvv('');
        setUpiId(''); setSelectedUpiApp(null); setSelectedBank('');
        setErrors({});
        setPaymentMethod('card');
        setCardType(null);
      }, 300);
    }
  }, [isOpen]);

  const formatCardNumber = (val) => {
    const digits = val.replace(/\D/g, '').slice(0, 16);
    return digits.replace(/(.{4})/g, '$1 ').trim();
  };

  const formatExpiry = (val) => {
    const digits = val.replace(/\D/g, '').slice(0, 4);
    if (digits.length >= 3) return digits.slice(0, 2) + '/' + digits.slice(2);
    return digits;
  };

  const validateCard = () => {
    const errs = {};
    const rawNum = cardNumber.replace(/\s/g, '');

    // Card Number
    if (!rawNum) {
      errs.cardNumber = 'Card number is required';
    } else if (rawNum.length < 16) {
      errs.cardNumber = 'Enter a valid 16-digit card number';
    }

    // Cardholder Name
    if (!cardName.trim()) {
      errs.cardName = 'Cardholder name is required';
    }

    // Expiry
    if (!expiry) {
      errs.expiry = 'Expiry date is required';
    } else {
      const [month, year] = expiry.split('/');
      const now = new Date();

      if (!month || !year) {
        errs.expiry = 'Invalid expiry date';
      } else if (parseInt(month) > 12 || parseInt(month) < 1) {
        errs.expiry = 'Invalid expiry month';
      } else {
        const expDate = new Date(2000 + parseInt(year), parseInt(month) - 1);
        if (expDate < now) {
          errs.expiry = 'Card has expired';
        }
      }
    }

    // CVV
    if (!cvv) {
      errs.cvv = 'CVV is required';
    } else if (cvv.length !== 3) {
      errs.cvv = 'Invalid CVV';
    }

    return errs;
  };

  const validateUPI = () => {
    const errs = {};
    if (!selectedUpiApp && !upiId.includes('@')) {
      errs.upi = 'Enter a valid UPI ID (e.g. name@upi)';
    }
    return errs;
  };

  const handlePay = () => {
    let errs = {};
    if (paymentMethod === 'card') errs = validateCard();
    if (paymentMethod === 'upi' && !selectedUpiApp) errs = validateUPI();
    if (paymentMethod === 'netbanking' && !selectedBank) errs = { bank: 'Please select a bank' };

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setErrors({});
    setStep('processing');

    setTimeout(() => {
      const success = Math.random() > 0.05;
      setStep(success ? 'success' : 'failed');
    }, 3000);
  };

  const handleSuccess = () => {
    onSuccess({ method: paymentMethod });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={step === 'details' ? onClose : undefined}
          />

          {/* Modal — fixed max height + scroll */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            style={{ maxHeight: '90vh' }}
          >
            {/* Overlay screens (processing / success / failed) */}
            <AnimatePresence>
              {step === 'processing' && <ProcessingScreen />}
              {step === 'success' && <SuccessScreen onContinue={handleSuccess} amount={TOTAL} />}
              {step === 'failed' && (
                <FailedScreen onRetry={() => setStep('details')} onClose={onClose} />
              )}
            </AnimatePresence>

            {/* ── Header (fixed, not scrollable) ── */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-4 pt-4 pb-3 text-white flex-shrink-0">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center">
                    <Lock size={15} />
                  </div>
                  <div>
                    <p className="font-bold text-base leading-tight">Secure Payment</p>
                    <p className="text-blue-200 text-[10px] flex items-center gap-1">
                      <Shield size={9} /> 256-bit SSL encrypted
                    </p>
                  </div>
                </div>
                {step === 'details' && (
                  <button
                    onClick={onClose}
                    className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center hover:bg-white/30 transition-colors"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Order Summary — compact */}
              <div className="bg-white/10 rounded-xl px-3 py-2.5">
                <p className="text-blue-100 text-[10px] mb-1.5 uppercase tracking-wider font-semibold">Order Summary</p>
                <div className="flex justify-between text-xs mb-0.5">
                  <span className="text-blue-100">Consultation with {appointmentDetails?.doctorName}</span>
                  <span className="font-semibold">₹{CONSULTATION_FEE}</span>
                </div>
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-blue-100">Platform fee</span>
                  <span className="font-semibold">₹{PLATFORM_FEE}</span>
                </div>
                <div className="border-t border-white/20 pt-1.5 flex justify-between items-center">
                  <span className="font-bold text-sm">Total</span>
                  <span className="font-bold text-lg">₹{TOTAL}</span>
                </div>
              </div>
            </div>

            {/* ── Scrollable body ── */}
            <div className="overflow-y-auto flex-1 min-h-0">
              {/* Payment Method Tabs */}
              <div className="px-4 pt-3">
                <div className="grid grid-cols-3 gap-1.5 p-1 bg-gray-100 rounded-xl mb-4">
                  {[
                    { id: 'card', icon: CreditCard, label: 'Card' },
                    { id: 'upi', icon: Smartphone, label: 'UPI' },
                    { id: 'netbanking', icon: Building2, label: 'Net Banking' },
                    // { id: 'wallet', icon: Wallet, label: 'Wallet' },
                  ].map((method) => (
                    <button
                      key={method.id}
                      onClick={() => { setPaymentMethod(method.id); setErrors({}); }}
                      className={`flex flex-col items-center gap-0.5 py-1.5 px-1 rounded-lg text-[10px] font-semibold transition-all ${
                        paymentMethod === method.id
                          ? 'bg-white text-blue-600 shadow-md'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <method.icon size={14} />
                      <span className="leading-tight text-center">{method.label}</span>
                    </button>
                  ))}
                </div>

                {/* ── Card Payment ── */}
                {paymentMethod === 'card' && (
                  <div className="space-y-3 pb-3">
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-600 mb-1 uppercase tracking-wider">
                        Card Number
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={cardNumber}
                          onChange={(e) => {
                            const formatted = formatCardNumber(e.target.value);
                            setCardNumber(formatted);
                            setCardType(detectCardType(formatted));
                            setErrors((p) => ({ ...p, cardNumber: '' }));
                          }}
                          placeholder="0000 0000 0000 0000"
                          className={`w-full px-3 py-2.5 pr-14 rounded-xl border-2 transition-all font-mono text-sm tracking-widest ${
                            errors.cardNumber ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-blue-500'
                          } outline-none`}
                          maxLength={19}
                        />
                        <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
                          {cardType ? <CardIcon type={cardType} size={28} /> : <CreditCard size={18} className="text-gray-300" />}
                        </div>
                      </div>
                      {errors.cardNumber && (
                        <p className="text-red-500 text-[10px] mt-0.5 flex items-center gap-1">
                          <AlertCircle size={10} /> {errors.cardNumber}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-gray-600 mb-1 uppercase tracking-wider">
                        Cardholder Name
                      </label>
                      <input
                        type="text"
                        value={cardName}
                        onChange={(e) => { setCardName(e.target.value.toUpperCase()); setErrors((p) => ({ ...p, cardName: '' })); }}
                        placeholder="AS ON CARD"
                        className={`w-full px-3 py-2.5 rounded-xl border-2 transition-all tracking-wider text-sm ${
                          errors.cardName ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-blue-500'
                        } outline-none`}
                      />
                      {errors.cardName && (
                        <p className="text-red-500 text-[10px] mt-0.5 flex items-center gap-1">
                          <AlertCircle size={10} /> {errors.cardName}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-semibold text-gray-600 mb-1 uppercase tracking-wider">
                          Expiry Date
                        </label>
                        <input
                          type="text"
                          value={expiry}
                          onChange={(e) => { setExpiry(formatExpiry(e.target.value)); setErrors((p) => ({ ...p, expiry: '' })); }}
                          placeholder="MM/YY"
                          className={`w-full px-3 py-2.5 rounded-xl border-2 transition-all font-mono text-sm ${
                            errors.expiry ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-blue-500'
                          } outline-none`}
                          maxLength={5}
                        />
                        {errors.expiry && (
                          <p className="text-red-500 text-[10px] mt-0.5 flex items-center gap-1">
                            <AlertCircle size={10} /> {errors.expiry}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-gray-600 mb-1 uppercase tracking-wider flex items-center gap-1">
                          CVV
                          <button
                            onMouseEnter={() => setShowCvv(true)}
                            onMouseLeave={() => setShowCvv(false)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <AlertCircle size={10} />
                          </button>
                        </label>
                        <input
                          type={showCvv ? 'text' : 'password'}
                          value={cvv}
                          onChange={(e) => { setCvv(e.target.value.replace(/\D/g, '').slice(0, 4)); setErrors((p) => ({ ...p, cvv: '' })); }}
                          placeholder="•••"
                          className={`w-full px-3 py-2.5 rounded-xl border-2 transition-all font-mono text-sm ${
                            errors.cvv ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-blue-500'
                          } outline-none`}
                          maxLength={4}
                        />
                        {errors.cvv && (
                          <p className="text-red-500 text-[10px] mt-0.5 flex items-center gap-1">
                            <AlertCircle size={10} /> {errors.cvv}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg">
                      <p className="text-[11px] text-amber-700 font-medium">
                        💳 Test mode: Use card <span className="font-mono font-bold">4111 1111 1111 1111</span>, any future date & any CVV
                      </p>
                    </div> */}
                  </div>
                )}

                {/* ── UPI ── */}
                {paymentMethod === 'upi' && (
                  <div className="space-y-3 pb-3">
                    <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Pay with UPI App</p>
                    <div className="grid grid-cols-4 gap-2">
                      {['gpay', 'phonepe', 'paytm', 'bhim'].map((app) => {
                        const info = UPI_APPS[app];
                        const isSelected = selectedUpiApp === app;
                        return (
                          <button
                            key={app}
                            onClick={() => { setSelectedUpiApp(app); setUpiId(''); setErrors({}); }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform = 'translateY(-3px) scale(1.04)';
                              e.currentTarget.style.boxShadow = isSelected
                                ? '0 6px 18px rgba(59,130,246,0.35)'
                                : '0 6px 16px rgba(0,0,0,0.22)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = 'translateY(0) scale(1)';
                              e.currentTarget.style.boxShadow = isSelected
                                ? '0 0 0 3px rgba(59,130,246,0.2)'
                                : '0 1px 3px rgba(0,0,0,0.08)';
                            }}
                            onMouseDown={(e) => {
                              e.currentTarget.style.transform = 'translateY(0) scale(0.97)';
                            }}
                            onMouseUp={(e) => {
                              e.currentTarget.style.transform = 'translateY(-3px) scale(1.04)';
                            }}
                            style={{
                              backgroundColor: info.bg,
                              color: info.color,
                              border: `2px solid ${isSelected ? '#3b82f6' : info.border}`,
                              borderRadius: '12px',
                              padding: '0',
                              height: '48px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 700,
                              fontSize: '12px',
                              cursor: 'pointer',
                              transition: 'transform 0.15s ease, box-shadow 0.15s ease, border 0.15s ease',
                              boxShadow: isSelected ? '0 0 0 3px rgba(59,130,246,0.2)' : '0 1px 3px rgba(0,0,0,0.08)',
                              overflow: 'hidden',
                              whiteSpace: 'nowrap',
                              width: '100%',
                            }}
                          >
                            {info.label}
                          </button>
                        );
                      })}
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-px bg-gray-200" />
                      <span className="text-[10px] text-gray-500">or enter UPI ID</span>
                      <div className="flex-1 h-px bg-gray-200" />
                    </div>

                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => { setUpiId(e.target.value); setSelectedUpiApp(null); setErrors({}); }}
                      placeholder="yourname@upi"
                      className={`w-full px-3 py-2.5 rounded-xl border-2 transition-all text-sm ${
                        errors.upi ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-blue-500'
                      } outline-none`}
                    />
                    {errors.upi && (
                      <p className="text-red-500 text-[10px] flex items-center gap-1">
                        <AlertCircle size={10} /> {errors.upi}
                      </p>
                    )}
                  </div>
                )}

                {/* ── Net Banking ── */}
                {paymentMethod === 'netbanking' && (
                  <div className="space-y-2 pb-3">
                    <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Select Your Bank</p>
                    <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                      {banks.map((bank) => (
                        <button
                          key={bank}
                          onClick={() => { setSelectedBank(bank); setErrors({}); }}
                          className={`w-full flex items-center justify-between p-2.5 rounded-xl border-2 transition-all text-xs text-left ${
                            selectedBank === bank
                              ? 'border-blue-500 bg-blue-50 font-semibold text-blue-700'
                              : 'border-gray-200 hover:border-blue-300 text-gray-700'
                          }`}
                        >
                          <span>{bank}</span>
                          {selectedBank === bank
                            ? <CheckCircle size={14} className="text-blue-500" />
                            : <ChevronRight size={14} className="text-gray-400" />}
                        </button>
                      ))}
                    </div>
                    {errors.bank && (
                      <p className="text-red-500 text-[10px] flex items-center gap-1">
                        <AlertCircle size={10} /> {errors.bank}
                      </p>
                    )}
                  </div>
                )}

                {/* ── Wallet ── */}
                {/* {paymentMethod === 'wallet' && (
                  <div className="space-y-2 pb-3">
                    <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Select Wallet</p>
                    {[
                      { name: 'Paytm Wallet', balance: '₹2,340 available', color: '#002970' },
                      { name: 'Amazon Pay', balance: '₹580 available', color: '#FF9900' },
                      { name: 'Mobikwik', balance: '₹120 available', color: '#6739B7' },
                    ].map((wallet) => (
                      <button
                        key={wallet.name}
                        onClick={() => { setSelectedBank(wallet.name); setErrors({}); }}
                        className={`w-full flex items-center justify-between p-3 rounded-xl border-2 transition-all ${
                          selectedBank === wallet.name
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-blue-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                            style={{ backgroundColor: wallet.color }}
                          >
                            W
                          </div>
                          <div className="text-left">
                            <p className="font-semibold text-gray-900 text-xs">{wallet.name}</p>
                            <p className="text-[10px] text-gray-500">{wallet.balance}</p>
                          </div>
                        </div>
                        {selectedBank === wallet.name
                          ? <CheckCircle size={16} className="text-blue-500" />
                          : <ChevronRight size={16} className="text-gray-400" />}
                      </button>
                    ))}
                  </div>
                )} */}
              </div>
            </div>

            {/* ── Pay Button (fixed at bottom) ── */}
            <div className="px-4 pb-4 pt-2 flex-shrink-0 border-t border-gray-100 bg-white">
              <button
                onClick={handlePay}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-base rounded-xl hover:shadow-xl hover:shadow-blue-200 transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <Lock size={16} />
                Pay ₹{TOTAL} Securely
              </button>
              <div className="flex items-center justify-center gap-3 mt-2">
                <div className="flex items-center gap-1 text-[10px] text-gray-500">
                  <Shield size={10} className="text-green-500" />
                  100% Secure
                </div>
                <div className="w-px h-2.5 bg-gray-300" />
                <div className="flex items-center gap-1 text-[10px] text-gray-500">
                  <CheckCircle size={10} className="text-green-500" />
                  PCI DSS Compliant
                </div>
                <div className="w-px h-2.5 bg-gray-300" />
                <div className="flex items-center gap-1 text-[10px] text-gray-500">
                  <Lock size={10} className="text-green-500" />
                  End-to-end encrypted
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// ─── Processing Screen ───────────────────────────────────────
function ProcessingScreen() {
  const [stage, setStage] = useState(0);
  const stages = [
    'Connecting to payment gateway...',
    'Verifying card details...',
    'Processing transaction...',
    'Confirming payment...',
  ];

  useEffect(() => {
    const intervals = [500, 1000, 1800, 2500];
    const timers = intervals.map((delay, i) => setTimeout(() => setStage(i), delay));
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 bg-white flex flex-col items-center justify-center z-10 p-6"
    >
      <div className="relative mb-6">
        <div className="w-16 h-16 rounded-full border-4 border-blue-100" />
        <div className="absolute inset-0 w-16 h-16 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Lock size={20} className="text-blue-600" />
        </div>
      </div>

      <h3 className="text-lg font-bold text-gray-900 mb-1">Processing Payment</h3>
      <p className="text-gray-500 text-xs mb-6 text-center">
        Please don't close this window or press the back button
      </p>

      <div className="w-full space-y-2.5">
        {stages.map((s, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-500 ${
              i < stage ? 'bg-green-500' : i === stage ? 'bg-blue-500 animate-pulse' : 'bg-gray-200'
            }`}>
              {i < stage
                ? <CheckCircle size={10} className="text-white" />
                : i === stage
                ? <div className="w-1.5 h-1.5 bg-white rounded-full" />
                : null}
            </div>
            <span className={`text-xs transition-all duration-300 ${
              i < stage ? 'text-green-600 font-semibold' : i === stage ? 'text-blue-600 font-semibold' : 'text-gray-400'
            }`}>
              {s}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// ─── Success Screen ──────────────────────────────────────────
function SuccessScreen({ onContinue, amount }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute inset-0 bg-white flex flex-col items-center justify-center z-10 p-6 text-center"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', damping: 12, stiffness: 200, delay: 0.1 }}
        className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4"
      >
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3 }}>
          <CheckCircle size={40} className="text-green-500" />
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="w-full"
      >
        <h3 className="text-xl font-bold text-gray-900 mb-1">Payment Successful!</h3>
        <p className="text-gray-500 text-sm mb-0.5">₹{amount} paid successfully</p>
        <p className="text-xs text-gray-400 mb-4">
          Transaction ID: TXN{Date.now().toString().slice(-8).toUpperCase()}
        </p>

        <div className="p-3 bg-green-50 rounded-xl border border-green-200 mb-4 text-left">
          <p className="text-sm font-semibold text-green-800 mb-0.5">✅ Appointment Confirmed</p>
          <p className="text-xs text-green-700">
            Your appointment has been booked. You will receive a confirmation notification shortly.
          </p>
        </div>

        <button
          onClick={onContinue}
          className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl hover:shadow-xl transition-all text-sm"
        >
          View My Appointments →
        </button>
      </motion.div>
    </motion.div>
  );
}

// ─── Failed Screen ───────────────────────────────────────────
function FailedScreen({ onRetry, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute inset-0 bg-white flex flex-col items-center justify-center z-10 p-6 text-center"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', damping: 12, stiffness: 200 }}
        className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-4"
      >
        <XCircle size={40} className="text-red-500" />
      </motion.div>

      <h3 className="text-xl font-bold text-gray-900 mb-1">Payment Failed</h3>
      <p className="text-gray-500 text-sm mb-4">
        Your transaction could not be processed. No amount has been deducted.
      </p>

      <div className="p-3 bg-red-50 rounded-xl border border-red-200 mb-4 text-left w-full">
        <p className="text-xs font-semibold text-red-800 mb-1">Possible reasons:</p>
        <ul className="text-xs text-red-700 space-y-0.5">
          <li>• Insufficient balance</li>
          <li>• Card declined by bank</li>
          <li>• Network timeout</li>
        </ul>
      </div>

      <div className="flex gap-3 w-full">
        <button
          onClick={onClose}
          className="flex-1 py-2.5 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 text-sm"
        >
          Cancel
        </button>
        <button
          onClick={onRetry}
          className="flex-1 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl hover:shadow-xl text-sm"
        >
          Try Again
        </button>
      </div>
    </motion.div>
  );
}

export default PaymentModal;