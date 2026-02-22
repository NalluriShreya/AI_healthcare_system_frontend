import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const OTPLogin = () => {
  const [step, setStep] = useState(1); // 1: phone entry, 2: OTP verification
  const [role, setRole] = useState('patient');
  const [phone, setPhone] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpInfo, setOtpInfo] = useState(null);
  const navigate = useNavigate();
  const { requestOTP, loginWithOTP } = useAuth();

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const phoneRegex = /^\+?[1-9]\d{9,14}$/;
    if (!phoneRegex.test(phone)) {
      setError('Please enter a valid phone number');
      setLoading(false);
      return;
    }

    const result = await requestOTP(phone, role);

    if (result.success) {
      setOtpInfo(result.data);
      setStep(2);
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (otpCode.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      setLoading(false);
      return;
    }

    const result = await loginWithOTP(phone, otpCode, role);

    if (result.success) {
      const dashboardRoute = 
        role === 'doctor' ? '/doctor/dashboard' : '/patient/dashboard';
      navigate(dashboardRoute);
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  const handleResendOTP = async () => {
    setError('');
    setOtpCode('');
    const result = await requestOTP(phone, role);

    if (result.success) {
      setOtpInfo(result.data);
      setError('');
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>OTP Login</h1>
          <p>Sign in with one-time password</p>
        </div>

        {step === 1 ? (
          <>
            <div className="role-selector">
              <button
                className={`role-btn ${role === 'patient' ? 'active' : ''}`}
                onClick={() => setRole('patient')}
              >
                Patient
              </button>
              <button
                className={`role-btn ${role === 'doctor' ? 'active' : ''}`}
                onClick={() => setRole('doctor')}
              >
                Doctor
              </button>
            </div>

            <form onSubmit={handleRequestOTP} className="auth-form">
              {error && <div className="error-message">{error}</div>}

              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <input
                  type="tel"
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  placeholder="+1234567890"
                />
                <small>Enter your registered phone number with country code</small>
              </div>

              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? 'Sending OTP...' : 'Send OTP'}
              </button>
            </form>
          </>
        ) : (
          <>
            <div className="otp-info">
              <p>OTP sent to: <strong>{phone}</strong></p>
              {otpInfo && otpInfo.otp && (
                <div className="dev-otp-display">
                  <p className="dev-note">Development Mode - OTP:</p>
                  <p className="otp-code-display">{otpInfo.otp}</p>
                </div>
              )}
            </div>

            <form onSubmit={handleVerifyOTP} className="auth-form">
              {error && <div className="error-message">{error}</div>}

              <div className="form-group">
                <label htmlFor="otp">Enter OTP</label>
                <input
                  type="text"
                  id="otp"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  required
                  maxLength={6}
                  placeholder="000000"
                  className="otp-input"
                />
                <small>Enter the 6-digit code sent to your phone</small>
              </div>

              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? 'Verifying...' : 'Verify OTP'}
              </button>

              <div className="otp-actions">
                <button
                  type="button"
                  className="link-btn-small"
                  onClick={handleResendOTP}
                >
                  Resend OTP
                </button>
                <button
                  type="button"
                  className="link-btn-small"
                  onClick={() => {
                    setStep(1);
                    setOtpCode('');
                    setError('');
                  }}
                >
                  Change Phone Number
                </button>
              </div>
            </form>
          </>
        )}

        <div className="auth-footer">
          <p className="signup-link">
            <Link to="/login">Back to Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default OTPLogin;