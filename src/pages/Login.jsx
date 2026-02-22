import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Heart, Calendar, MessageCircle, Loader2 } from 'lucide-react';
import { authAPI, storage } from '../services/api';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';
import ForgotPasswordModal from '../components/ForgotPasswordModal';

export default function Login() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [role, setRole] = useState('patient');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // ── Forgot Password Modal ──────────────────────────────────
  const [forgotOpen, setForgotOpen] = useState(false);

  const handleRoleChange = (newRole) => {
    if (newRole !== role) {
      setRole(newRole);
      setEmail('');
      setPassword('');
      setShowPassword(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let response;

      switch (role) {
        case 'patient':
          response = await authAPI.patientLogin({ email, password });
          break;
        case 'doctor':
          response = await authAPI.doctorLogin({ email, password });
          break;
        case 'admin':
          response = await authAPI.adminLogin({ email, password });
          break;
        default:
          return;
      }

      storage.saveAuth(response.data);
      setAuth(response.data.user, response.data.access_token);

      toast.success('Welcome back!');

      setTimeout(() => {
        navigate('/dashboard');
      }, 500);
    } catch (error) {
      const message =
        error?.response?.data?.detail || 'Login failed. Please try again.';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-gradient-soft">
        {/* Animated Background Blobs */}
        <div className="floating-bg w-96 h-96 bg-blue-400 -top-48 -right-48 animate-float" />
        <div className="floating-bg w-80 h-80 bg-purple-300 -bottom-40 -left-40 animate-float-reverse" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-6xl grid lg:grid-cols-2 gap-0 bg-white rounded-3xl shadow-2xl overflow-hidden relative z-10"
        >
          {/* Left Panel */}
          <div className="bg-gradient-primary p-12 lg:p-16 text-white relative overflow-hidden hidden lg:flex flex-col justify-between">
            <div className="floating-bg w-72 h-72 bg-white/10 -top-36 -left-36" />

            <div className="relative z-10">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="flex items-center gap-3 mb-12"
              >
                <div className="w-14 h-14 bg-white/15 backdrop-blur-sm rounded-2xl flex items-center justify-center text-3xl shadow-lg">
                  🏥
                </div>
                <span className="text-3xl font-display">MediCare AI</span>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <h1 className="text-5xl font-display mb-6 leading-tight">
                  Healthcare Intelligence at Your Fingertips
                </h1>
                <p className="text-xl text-white/90 leading-relaxed">
                  Advanced AI-powered healthcare system for seamless patient care,
                  symptom analysis, and appointment management.
                </p>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="space-y-5 relative z-10"
            >
              {[
                { icon: MessageCircle, text: 'AI-Powered Disease Prediction' },
                { icon: Calendar, text: 'Smart Appointment Booking' },
                { icon: Heart, text: 'Intelligent Symptom Analysis' },
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  className="flex items-center gap-4"
                >
                  <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg">
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <span className="text-lg font-medium">{feature.text}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Right Panel */}
          <div className="p-8 lg:p-12 flex flex-col justify-center">
            <div className="mb-8">
              {/* Mobile Logo */}
              <div className="flex lg:hidden items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center text-2xl shadow-md">
                  🏥
                </div>
                <span className="text-2xl font-display text-gray-900">MediCare AI</span>
              </div>

              <h2 className="text-4xl font-display text-gray-900 mb-2">Welcome Back</h2>
              <p className="text-gray-600 text-lg">
                Sign in to access your healthcare dashboard
              </p>
            </div>

            {/* Role Tabs */}
            <div className="flex gap-2 p-1.5 bg-gray-100 rounded-2xl mb-8">
              {['patient', 'doctor', 'admin'].map((r) => (
                <button
                  key={r}
                  onClick={() => handleRoleChange(r)}
                  className={`flex-1 py-3 px-4 rounded-xl font-semibold capitalize transition-all duration-300 ${
                    role === r
                      ? 'bg-white text-blue-600 shadow-md scale-105'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field"
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold text-gray-700">Password</label>
                  {/* ── Forgot Password Link ─────────────────────────── */}
                  <button
                    type="button"
                    onClick={() => setForgotOpen(true)}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-field pr-12"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn-primary flex items-center justify-center gap-2 text-lg py-4"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            {(role === 'patient' || role === 'doctor') && (
              <div className="mt-6 text-center">
                <span className="text-gray-600">Don't have an account? </span>
                <button
                  onClick={() => navigate('/signup')}
                  className="text-blue-600 font-semibold hover:text-blue-700 transition-colors"
                >
                  Create Account
                </button>
              </div>
            )}

            {/* <div className="mt-8 p-5 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl">
              <p className="text-sm font-semibold text-blue-900 mb-3">🔐 Demo Credentials:</p>
              <div className="text-sm text-blue-800 space-y-2">
                <div className="flex items-start gap-2">
                  <span className="font-semibold min-w-[70px]">Admin:</span>
                  <div>
                    <p>admin@healthcare.com</p>
                    <p className="text-blue-600">Admin@123</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-semibold min-w-[70px]">Doctor:</span>
                  <p className="text-blue-700">dr.smith@hospital.com (signup first)</p>
                </div>
              </div>
            </div> */}
          </div>
        </motion.div>
      </div>

      {/* ── Forgot Password Modal ──────────────────────────── */}
      <ForgotPasswordModal
        isOpen={forgotOpen}
        onClose={() => setForgotOpen(false)}
        defaultRole={role}
      />
    </>
  );
}