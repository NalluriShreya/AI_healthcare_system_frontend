import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Edit2, Loader2 } from 'lucide-react';

export function EditDoctorModal({ isOpen, onClose, onSuccess, doctor }) {
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

  /* ================= PREFILL FORM ================= */
  useEffect(() => {
    if (doctor) {
      setFormData({
        doctor_id: doctor.doctor_id || '',
        name: doctor.name || '',
        email: doctor.email || '',
        phone_number: doctor.phone || '',
        department: doctor.department || '',
        specialization: doctor.specialization || '',
        qualification: doctor.qualification || '',
        status: doctor.status || 'pending',
      });
    }
  }, [doctor]);

  /* ================= HANDLERS ================= */
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
        `${import.meta.env.VITE_BACKEND_URL}/api/admin/doctor/${doctor.doctor_id}/update`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            phone_number: formData.phone_number,
            department: formData.department,
            specialization: formData.specialization,
            qualification: formData.qualification,
            status: formData.status,
          }),
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || 'Failed to update doctor record');
      }

      onSuccess(data.doctor || data);
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
                    <Edit2 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Edit Doctor</h2>
                    <p className="text-sm text-gray-600">
                      Update doctor information
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/50 rounded-lg"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              {/* Form */}
              <form
                onSubmit={handleSubmit}
                className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]"
              >
                {error && (
                  <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Doctor ID */}
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Doctor ID (Read Only)
                    </label>
                    <input
                      value={formData.doctor_id}
                      disabled
                      className="w-full px-4 py-2.5 border rounded-lg bg-gray-100 cursor-not-allowed"
                    />
                  </div>

                  {/* Name */}
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Full Name
                    </label>
                    <input
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2.5 border rounded-lg"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2.5 border rounded-lg"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Phone Number
                    </label>
                    <input
                      name="phone_number"
                      value={formData.phone_number}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2.5 border rounded-lg"
                    />
                  </div>

                  {/* Department */}
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Department
                    </label>
                    <select
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2.5 border rounded-lg"
                    >
                      <option value="">Select Department</option>
                      {departments.map((dept) => (
                        <option key={dept} value={dept}>
                          {dept}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Specialization */}
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Specialization
                    </label>
                    <input
                      name="specialization"
                      value={formData.specialization}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2.5 border rounded-lg"
                    />
                  </div>

                  {/* Qualification */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold mb-2">
                      Qualification
                    </label>
                    <input
                      name="qualification"
                      value={formData.qualification}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2.5 border rounded-lg"
                    />
                  </div>

                  {/* Status */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold mb-2">
                      Status
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border rounded-lg"
                    >
                      <option value="pending">Pending</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 border px-6 py-3 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <Edit2 />
                        Update Doctor
                      </>
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
