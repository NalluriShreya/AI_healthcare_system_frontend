import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UserPlus, Loader2 } from 'lucide-react';

export function AddDoctorModal({ isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    doctor_id: '',
    name: '',
    email: '',
    phone_number: '',
    department: '',
    specialization: '',
    qualification: '',
    status: 'pending',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');

      const response = await fetch(
        'http://localhost:8000/api/admin/doctor/create',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          // body: JSON.stringify({
          //   ...formData,
          //   created_by_admin_name: adminName,
          // }),
          body: JSON.stringify(formData)
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || 'Failed to create doctor record');
      }

      setFormData({
        doctor_id: '',
        name: '',
        email: '',
        phone_number: '',
        department: '',
        specialization: '',
        qualification: '',
        status: 'pending',
      });

      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const departments = [
    'Cardiology',
    'Dermatology',
    'Emergency Medicine',
    'Endocrinology',
    'Gastroenterology',
    'General Practice',
    'Neurology',
    'Oncology',
    'Orthopedics',
    'Pediatrics',
    'Psychiatry',
    'Radiology',
    'Surgery',
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/50 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-50 to-purple-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                    <UserPlus className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Add New Doctor</h2>
                    <p className="text-sm text-gray-600">
                      Create a new doctor record
                    </p>
                  </div>
                </div>
                <button onClick={onClose}>
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              {/* Form */}
              <form
                onSubmit={handleSubmit}
                className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]"
              >
                {error && (
                  <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg">
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    ['doctor_id', 'Doctor ID', 'DOC001'],
                    ['name', 'Full Name', 'Dr. John Smith'],
                    ['email', 'Email', 'doctor@hospital.com'],
                    ['phone_number', 'Phone Number', '+1234567890'],
                  ].map(([key, label, placeholder]) => (
                    <div key={key}>
                      <label className="block text-sm font-semibold mb-2">
                        {label}
                      </label>
                      <input
                        name={key}
                        value={formData[key]}
                        onChange={handleChange}
                        placeholder={placeholder}
                        required
                        className="input-field"
                      />
                    </div>
                  ))}

                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Department
                    </label>
                    <select
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      required
                      className="input-field"
                    >
                      <option value="">Select Department</option>
                      {departments.map((d) => (
                        <option key={d}>{d}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Specialization
                    </label>
                    <input
                      name="specialization"
                      value={formData.specialization}
                      onChange={handleChange}
                      required
                      className="input-field"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold mb-2">
                      Qualification
                    </label>
                    <input
                      name="qualification"
                      value={formData.qualification}
                      onChange={handleChange}
                      required
                      className="input-field"
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 border px-4 py-2 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 btn-primary"
                  >
                    {loading ? (
                      <Loader2 className="animate-spin mx-auto" />
                    ) : (
                      'Create Doctor'
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
