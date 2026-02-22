import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2, Info, ArrowLeft } from 'lucide-react';
import { authAPI, storage } from '../services/api';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

export default function Signup() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [role, setRole] = useState('patient');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Patient fields
  const [patientData, setPatientData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
  });

  // Doctor fields
  const [doctorData, setDoctorData] = useState({
    email: '',
    phone: '',
    password: '',
  });

  const getPasswordStrength = (password) => {
    if (!password) return 'weak';

    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);
    const hasLength = password.length >= 8;

    const score = [hasUpper, hasLower, hasNumber, hasSpecial, hasLength]
      .filter(Boolean).length;

    if (score <= 2) return 'weak';
    if (score <= 4) return 'medium';
    return 'strong';
  };


  const patientPasswordStrength = getPasswordStrength(patientData.password);
  const doctorPasswordStrength = getPasswordStrength(doctorData.password);


  const handleRoleChange = (newRole) => {
    if (newRole !== role) {
      setRole(newRole);
      setEmail('');
      setPassword('');
      setShowPassword(false);
    }
  };  

  const handlePatientSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await authAPI.patientSignup(patientData);
      storage.saveAuth(response.data);
      setAuth(response.data.user, response.data.access_token);

      toast.success('Account created successfully!');

      // setTimeout(() => {
      //   navigate('/patient-dashboard');
      // }, 500);

      setTimeout(() => {
        navigate('/dashboard');
      }, 500);


    } catch (error) {
      const message =
        error?.response?.data?.detail || 'Signup failed. Please try again.';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDoctorSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await authAPI.doctorSignup(doctorData);
      storage.saveAuth(response.data);
      setAuth(response.data.user, response.data.access_token);

      toast.success('Account activated successfully!');

      // setTimeout(() => {
      //   navigate('/doctor-dashboard');
      // }, 500);
      setTimeout(() => {
        navigate('/dashboard');
      }, 500);

    } catch (error) {
      const message =
        error?.response?.data?.detail ||
        'Activation failed. Please check your details.';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-gradient-soft">
      {/* Animated Background */}
      <div className="floating-bg w-96 h-96 bg-blue-400 -top-48 -right-48 animate-float" />
      <div className="floating-bg w-80 h-80 bg-purple-300 -bottom-40 -left-40 animate-float-reverse" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-6xl grid lg:grid-cols-2 gap-0 bg-white rounded-3xl shadow-2xl overflow-hidden relative z-10"
      >
        {/* Left Panel */}
        <div className="bg-gradient-primary p-12 lg:p-16 text-white relative overflow-hidden hidden lg:flex flex-col justify-center">
          <div className="floating-bg w-72 h-72 bg-white/10 -top-36 -left-36" />

          <div className="relative z-10">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-3 mb-8"
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
                Join Our Healthcare Community
              </h1>
              <p className="text-xl text-white/90 leading-relaxed">
                Create your account to access advanced AI-powered healthcare
                services and connect with medical professionals.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-12 space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <p className="text-lg">Advanced AI symptom analysis</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <p className="text-lg">24/7 healthcare support</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <p className="text-lg">Secure and private</p>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="p-8 lg:p-12 flex flex-col justify-start max-h-screen overflow-y-auto">
          <div className="mb-8">
            {/* Mobile Logo */}
            <div className="flex lg:hidden items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center text-2xl shadow-md">
                🏥
              </div>
              <span className="text-2xl font-display text-gray-900">MediCare AI</span>
            </div>

            <h2 className="text-4xl font-display text-gray-900 mb-2">
              Create Account
            </h2>
            <p className="text-gray-600 text-lg">
              Sign up to get started with MediCare AI
            </p>
          </div>

          {/* Role Tabs */}
          <div className="flex gap-2 p-1.5 bg-gray-100 rounded-2xl mb-8">
            {['patient', 'doctor'].map((r) => (
              <button
                key={r}
                onClick={() => setRole(r)}
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

          {/* Doctor Info */}
          {role === 'doctor' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-6 p-5 bg-gradient-to-br from-blue-50 to-indigo-50 border-l-4 border-blue-600 rounded-xl"
            >
              <div className="flex gap-3">
                <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-gray-700 leading-relaxed">
                  Doctor accounts must be created by admin first. Enter your
                  registered email and phone to activate your account.
                </p>
              </div>
            </motion.div>
          )}

          {/* Patient Form */}
          {role === 'patient' && (
            <motion.form
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onSubmit={handlePatientSubmit}
              className="space-y-5"
            >
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="John Doe"
                  className="input-field"
                  value={patientData.name}
                  onChange={(e) =>
                    setPatientData({ ...patientData, name: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  className="input-field"
                  value={patientData.email}
                  onChange={(e) =>
                    setPatientData({ ...patientData, email: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  className="input-field"
                  value={patientData.phone}
                  onChange={(e) =>
                    setPatientData({ ...patientData, phone: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Minimum 8 characters"
                    className="input-field pr-12"
                    value={patientData.password}
                    onChange={(e) =>
                      setPatientData({ ...patientData, password: e.target.value })
                    }
                    minLength={8}
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
                {patientData.password && (
                  <div className="mt-2">
                    <div className="h-2 w-full rounded-full bg-gray-200 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          patientPasswordStrength === 'weak'
                            ? 'w-1/3 bg-red-500'
                            : patientPasswordStrength === 'medium'
                            ? 'w-2/3 bg-yellow-500'
                            : 'w-full bg-green-500'
                        }`}
                      />
                    </div>

                    <p
                      className={`mt-1 text-xs font-semibold ${
                        patientPasswordStrength === 'weak'
                          ? 'text-red-600'
                          : patientPasswordStrength === 'medium'
                          ? 'text-yellow-600'
                          : 'text-green-600'
                      }`}
                    >
                      {patientPasswordStrength === 'weak' && 'Weak password'}
                      {patientPasswordStrength === 'medium' && 'Medium strength password'}
                      {patientPasswordStrength === 'strong' && 'Strong password'}
                    </p>

                    {patientPasswordStrength === 'weak' && (
                      <p className="mt-1 text-xs text-gray-500">
                        Strong password = 8+ chars, uppercase, lowercase, number & special character
                      </p>
                    )}
                  </div>
                )}

              </div>

              <button
                type="submit"
                disabled={isLoading || patientPasswordStrength !== 'strong'}
                className="w-full btn-primary flex items-center justify-center gap-2 text-lg py-4 mt-6"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  'Create Patient Account'
                )}
              </button>
            </motion.form>
          )}

          {/* Doctor Form */}
          {role === 'doctor' && (
            <motion.form
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onSubmit={handleDoctorSubmit}
              className="space-y-5"
            >
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="dr.smith@hospital.com"
                  className="input-field"
                  value={doctorData.email}
                  onChange={(e) =>
                    setDoctorData({ ...doctorData, email: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  className="input-field"
                  value={doctorData.phone}
                  onChange={(e) =>
                    setDoctorData({ ...doctorData, phone: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Minimum 8 characters"
                    className="input-field pr-12"
                    value={doctorData.password}
                    onChange={(e) =>
                      setDoctorData({ ...doctorData, password: e.target.value })
                    }
                    minLength={8}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {doctorData.password && (
                  <div className="mt-2">
                    <div className="h-2 w-full rounded-full bg-gray-200 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          doctorPasswordStrength === 'weak'
                            ? 'w-1/3 bg-red-500'
                            : doctorPasswordStrength === 'medium'
                            ? 'w-2/3 bg-yellow-500'
                            : 'w-full bg-green-500'
                        }`}
                      />
                    </div>

                    <p
                      className={`mt-1 text-xs font-semibold ${
                        doctorPasswordStrength === 'weak'
                          ? 'text-red-600'
                          : doctorPasswordStrength === 'medium'
                          ? 'text-yellow-600'
                          : 'text-green-600'
                      }`}
                    >
                      {doctorPasswordStrength === 'weak' && 'Weak password'}
                      {doctorPasswordStrength === 'medium' && 'Medium strength password'}
                      {doctorPasswordStrength === 'strong' && 'Strong password'}
                    </p>

                    {doctorPasswordStrength === 'weak' && (
                      <p className="mt-1 text-xs text-gray-500">
                        Strong password = 8+ chars, uppercase, lowercase, number & special character
                      </p>
                    )}
                  </div>
                )}

              </div>

              <button
                type="submit"
                disabled={isLoading || doctorPasswordStrength !== 'strong'}
                className="w-full btn-primary flex items-center justify-center gap-2 text-lg py-4 mt-6"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Activating Account...
                  </>
                ) : (
                  'Activate Doctor Account'
                )}
              </button>
            </motion.form>
          )}

          <div className="mt-6 text-center">
            <span className="text-gray-600">Already have an account? </span>
            <button
              onClick={() => navigate('/login')}
              className="text-blue-600 font-semibold hover:text-blue-700 transition-colors"
            >
              Sign In
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}