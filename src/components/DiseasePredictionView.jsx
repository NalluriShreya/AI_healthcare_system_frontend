// DiseasePredictionView.jsx

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import {
  Activity, ChevronRight, ChevronLeft, AlertTriangle,
  CheckCircle, Info, Loader2, RefreshCw, Brain,
  Heart, Droplets, Stethoscope, ArrowRight, BarChart2,
  Microscope, Baby, Scan, X, ImagePlus, Dna, Zap, Bone,
} from 'lucide-react';

// ── Department styles ─────────────────────────────────────────────────────────
const DEPT_STYLES = {
  general_practice: { gradient: 'from-blue-500 to-cyan-600',      bg: 'bg-blue-50',    border: 'border-blue-200',    text: 'text-blue-700',    Icon: Stethoscope },
  cardiology:       { gradient: 'from-rose-500 to-pink-600',      bg: 'bg-rose-50',    border: 'border-rose-200',    text: 'text-rose-700',    Icon: Heart       },
  endocrinology:    { gradient: 'from-amber-500 to-orange-600',   bg: 'bg-amber-50',   border: 'border-amber-200',   text: 'text-amber-700',   Icon: Droplets    },
  psychiatry:       { gradient: 'from-violet-500 to-purple-600',  bg: 'bg-violet-50',  border: 'border-violet-200',  text: 'text-violet-700',  Icon: Brain       },
  gastroenterology: { gradient: 'from-teal-500 to-emerald-600',   bg: 'bg-teal-50',    border: 'border-teal-200',    text: 'text-teal-700',    Icon: Microscope  },
  pediatrics:       { gradient: 'from-sky-400 to-indigo-500',     bg: 'bg-sky-50',     border: 'border-sky-200',     text: 'text-sky-700',     Icon: Baby        },
  dermatology:      { gradient: 'from-fuchsia-500 to-rose-500',   bg: 'bg-fuchsia-50', border: 'border-fuchsia-200', text: 'text-fuchsia-700', Icon: Scan        },
  orthopedics:      { gradient: 'from-cyan-600 to-blue-700',      bg: 'bg-cyan-50',    border: 'border-cyan-200',    text: 'text-cyan-700',    Icon: Bone        },
  alzheimer:        { gradient: 'from-indigo-500 to-blue-600',    bg: 'bg-indigo-50',  border: 'border-indigo-200',  text: 'text-indigo-700',  Icon: Brain       },
  stroke:           { gradient: 'from-red-500 to-orange-500',     bg: 'bg-red-50',     border: 'border-red-200',     text: 'text-red-700',     Icon: Zap         },
  cancer:           { gradient: 'from-slate-600 to-gray-800',     bg: 'bg-slate-50',   border: 'border-slate-200',   text: 'text-slate-700',   Icon: Dna         },
};

// ── Risk level config ─────────────────────────────────────────────────────────
const RISK_CONFIG = {
  Low:      { color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-300', bar: 'bg-emerald-500', Icon: CheckCircle,   label: 'Low Risk'      },
  Moderate: { color: 'text-amber-700',   bg: 'bg-amber-50',   border: 'border-amber-300',   bar: 'bg-amber-500',   Icon: Info,          label: 'Moderate Risk' },
  High:     { color: 'text-rose-700',    bg: 'bg-rose-50',    border: 'border-rose-300',    bar: 'bg-rose-500',    Icon: AlertTriangle, label: 'High Risk'     },
};

// ── Severity helpers (Pediatrics) ─────────────────────────────────────────────
const SEVERITY_LABELS  = { 0: 'Absent', 1: 'Mild', 2: 'Moderate', 3: 'Severe' };
const SEVERITY_COLORS  = { 0: 'text-gray-400', 1: 'text-amber-500', 2: 'text-orange-600', 3: 'text-rose-600' };
const SEVERITY_BUTTON_ACTIVE = [
  'bg-gray-100   text-gray-500  border-gray-300',
  'bg-amber-100  text-amber-700 border-amber-400',
  'bg-orange-100 text-orange-700 border-orange-400',
  'bg-rose-100   text-rose-700  border-rose-400',
];

// ── Department grouping for the picker ────────────────────────────────────────
const DEPT_GROUPS = [
  { label: null,            ids: ['general_practice', 'cardiology', 'endocrinology', 'psychiatry', 'gastroenterology', 'pediatrics', 'cancer', 'dermatology', 'orthopedics', 'alzheimer', 'stroke'] },
];

// ── Misc helpers ──────────────────────────────────────────────────────────────
const modelShortName = (name) =>
  ({ GradientBoosting: 'GBM', RandomForest: 'RF', LogisticRegression: 'LR' }[name] || name || '—');

const isSeveritySelect = (info) =>
  info?.type === 'select' && info.options?.some((o) => o.value === 0 && o.label === 'Absent');

const detectSeverityOnlyDept = (dept) =>
  dept.feature_names.every((n) => {
    const info = dept.feature_info?.[n];
    return info?.type === 'number' || isSeveritySelect(info);
  });

const buildDefaults = (dept) => {
  const defaults = {};
  dept.feature_names.forEach((name) => {
    const info = dept.feature_info[name];
    if (!info) { defaults[name] = 0; return; }
    if (info.type === 'number') {
      defaults[name] = parseFloat((((info.min ?? 0) + (info.max ?? 100)) / 2).toFixed(2));
    } else if (info.type === 'select') {
      defaults[name] = info.options?.[0]?.value ?? 0;
    } else {
      defaults[name] = 0;
    }
  });
  return defaults;
};


// ════════════════════════════════════════════════════════════════════════════
// Image Upload component for Dermatology
// ════════════════════════════════════════════════════════════════════════════
function DermatologyUploader({ token, onResult, onError }) {
  const [file, setFile]             = useState(null);
  const [preview, setPreview]       = useState(null);
  const [dragging, setDragging]     = useState(false);
  const [predicting, setPredicting] = useState(false);
  const inputRef = useRef(null);

  const handleFile = (f) => {
    if (!f) return;
    if (!['image/jpeg', 'image/png', 'image/jpg', 'image/webp'].includes(f.type)) {
      onError('Please upload a JPEG or PNG image.');
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      onError('Image too large. Maximum size is 10 MB.');
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
    onError('');
  };

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  }, []);

  const runPrediction = async () => {
    if (!file) { onError('Please upload an image first.'); return; }
    setPredicting(true);
    onError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/predict/dermatology`, formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
      });
      onResult(res.data);
    } catch (err) {
      onError(err.response?.data?.detail || 'Prediction failed. Please try again.');
    } finally {
      setPredicting(false);
    }
  };

  return (
    <div className="space-y-5">
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 ${
          dragging      ? 'border-fuchsia-400 bg-fuchsia-50 scale-[1.01]'
          : preview     ? 'border-fuchsia-300 bg-fuchsia-50'
                        : 'border-gray-300 bg-gray-50 hover:border-fuchsia-300 hover:bg-fuchsia-50'
        }`}
      >
        <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp"
          className="hidden" onChange={(e) => handleFile(e.target.files[0])} />

        {preview ? (
          <div className="relative">
            <img src={preview} alt="Preview" className="mx-auto max-h-56 rounded-xl object-cover shadow-md" />
            <button type="button"
              onClick={(e) => { e.stopPropagation(); setFile(null); setPreview(null); }}
              className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow"
            ><X size={14} /></button>
            <p className="text-xs text-fuchsia-600 font-medium mt-3">{file.name}</p>
          </div>
        ) : (
          <>
            <div className="w-16 h-16 bg-fuchsia-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <ImagePlus className="w-8 h-8 text-fuchsia-500" />
            </div>
            <p className="text-sm font-semibold text-gray-700">Drop your image here</p>
            <p className="text-xs text-gray-400 mt-1">or click to browse — JPEG, PNG, WebP up to 10 MB</p>
          </>
        )}
      </div>

      <div className="p-4 bg-fuchsia-50 border border-fuchsia-200 rounded-xl text-xs text-fuchsia-800 space-y-1">
        <p className="font-semibold">📸 For best results:</p>
        <p>• Use a well-lit, in-focus photo of the affected area</p>
        <p>• Fill the frame with the skin condition</p>
        <p>• Avoid blurry, dark, or heavily filtered images</p>
      </div>

      <button onClick={runPrediction} disabled={!file || predicting}
        className="w-full py-3.5 bg-gradient-to-r from-fuchsia-500 to-rose-500 text-white font-semibold rounded-xl hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {predicting
          ? <><Loader2 size={18} className="animate-spin" /> Analysing image...</>
          : <><Scan size={18} /> Analyse Skin Image</>}
      </button>
    </div>
  );
}


// ════════════════════════════════════════════════════════════════════════════
// Image Upload component for Orthopedics (MURA X-ray)
// ════════════════════════════════════════════════════════════════════════════
function OrthopedicsUploader({ token, onResult, onError }) {
  const [file, setFile]             = useState(null);
  const [preview, setPreview]       = useState(null);
  const [dragging, setDragging]     = useState(false);
  const [predicting, setPredicting] = useState(false);
  const inputRef = useRef(null);

  const handleFile = (f) => {
    if (!f) return;
    if (!['image/jpeg', 'image/png', 'image/jpg', 'image/webp'].includes(f.type)) {
      onError('Please upload a JPEG or PNG image.');
      return;
    }
    if (f.size > 15 * 1024 * 1024) {
      onError('Image too large. Maximum size is 15 MB.');
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
    onError('');
  };

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  }, []);

  const runPrediction = async () => {
    if (!file) { onError('Please upload an X-ray image first.'); return; }
    setPredicting(true);
    onError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/predict/orthopedics`, formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
      });
      onResult(res.data);
    } catch (err) {
      onError(err.response?.data?.detail || 'Prediction failed. Please try again.');
    } finally {
      setPredicting(false);
    }
  };

  return (
    <div className="space-y-5">
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 ${
          dragging      ? 'border-cyan-400 bg-cyan-50 scale-[1.01]'
          : preview     ? 'border-cyan-300 bg-cyan-50'
                        : 'border-gray-300 bg-gray-50 hover:border-cyan-300 hover:bg-cyan-50'
        }`}
      >
        <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp"
          className="hidden" onChange={(e) => handleFile(e.target.files[0])} />

        {preview ? (
          <div className="relative">
            {/* X-ray images look better on dark bg */}
            <div className="bg-gray-900 rounded-xl p-2 inline-block">
              <img src={preview} alt="X-ray Preview"
                className="mx-auto max-h-56 rounded-lg object-contain"
                style={{ filter: 'grayscale(20%) contrast(1.1)' }} />
            </div>
            <button type="button"
              onClick={(e) => { e.stopPropagation(); setFile(null); setPreview(null); }}
              className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow"
            ><X size={14} /></button>
            <p className="text-xs text-cyan-600 font-medium mt-3">{file.name}</p>
          </div>
        ) : (
          <>
            <div className="w-16 h-16 bg-cyan-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Bone className="w-8 h-8 text-cyan-600" />
            </div>
            <p className="text-sm font-semibold text-gray-700">Drop your X-ray here</p>
            <p className="text-xs text-gray-400 mt-1">or click to browse — JPEG, PNG, WebP up to 15 MB</p>
          </>
        )}
      </div>

      {/* Body part guide */}
      <div className="p-4 bg-cyan-50 border border-cyan-200 rounded-xl text-xs text-cyan-800 space-y-1">
        <p className="font-semibold">🦴 Supported body parts (MURA):</p>
        <div className="grid grid-cols-4 gap-1 mt-1.5">
          {['Elbow', 'Finger', 'Forearm', 'Hand', 'Humerus', 'Shoulder', 'Wrist'].map((part) => (
            <span key={part} className="px-2 py-1 bg-white border border-cyan-200 rounded-lg text-center font-medium text-cyan-700">
              {part}
            </span>
          ))}
        </div>
        <p className="mt-2">• Upload a standard X-ray radiograph (posteroanterior view preferred)</p>
        <p>• Ensure the image is not over-exposed or cropped</p>
      </div>

      <button onClick={runPrediction} disabled={!file || predicting}
        className="w-full py-3.5 bg-gradient-to-r from-cyan-600 to-blue-700 text-white font-semibold rounded-xl hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {predicting
          ? <><Loader2 size={18} className="animate-spin" /> Analysing X-ray...</>
          : <><Bone size={18} /> Analyse X-ray</>}
      </button>
    </div>
  );
}


// ════════════════════════════════════════════════════════════════════════════
// Main component
// ════════════════════════════════════════════════════════════════════════════
export default function DiseasePredictionView({ token }) {
  const [departments, setDepartments]   = useState([]);
  const [loadingDepts, setLoadingDepts] = useState(true);
  const [selectedDept, setSelectedDept] = useState(null);
  const [formValues, setFormValues]     = useState({});
  const [result, setResult]             = useState(null);
  const [predicting, setPredicting]     = useState(false);
  const [error, setError]               = useState('');

  const topRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/predict/departments`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDepartments(res.data.departments);
      } catch {
        setError('Could not load departments. Make sure models are trained and the server is running.');
      } finally {
        setLoadingDepts(false);
      }
    })();
  }, [token]);

  const selectDepartment = (dept) => {
    setSelectedDept(dept);
    setResult(null);
    setError('');
    setFormValues(dept.is_image ? {} : buildDefaults(dept));
  };

  const setValue = (name, value) =>
    setFormValues((prev) => ({ ...prev, [name]: value }));

  const runPrediction = async () => {
    const main = document.getElementById('dashboard-main');
    setError('');

    const requireSymptomDept = ['general_practice', 'endocrinology', 'gastroenterology'];

    if (selectedDept.id === 'pediatrics') {
      const hasSeverity = selectedDept.feature_names.some(
        (n) => isSeveritySelect(selectedDept.feature_info?.[n]) && Number(formValues[n]) > 0
      );
      if (!hasSeverity) {
        setError('Please rate at least one symptom above "Absent" before running the prediction.');
        main?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
    }

    if (requireSymptomDept.includes(selectedDept.id)) {
      const hasCheckbox = selectedDept.feature_names.some(
        (n) => selectedDept.feature_info?.[n]?.type === 'checkbox' && formValues[n] === 1
      );
      if (!hasCheckbox) {
        setError('Please select at least one symptom before running the prediction.');
        main?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
    }

    setPredicting(true);
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/predict/`,
        { department: selectedDept.id, features: formValues },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Prediction failed.');
      main?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } finally {
      setPredicting(false);
    }
  };

  const reset = () => {
    setSelectedDept(null);
    setResult(null);
    setError('');
    setFormValues({});
  };

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loadingDepts) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  // ── Department picker ─────────────────────────────────────────────────────
  if (!selectedDept) {
    return (
      <motion.div ref={topRef} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">AI Disease Prediction</h2>
          <p className="text-gray-500 text-sm">
            Select a department, describe your symptoms, and get an AI-powered assessment.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-2">
            <AlertTriangle size={16} /> {error}
          </div>
        )}

        {departments.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 text-center">
            <Activity className="w-14 h-14 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-700">No models available</h3>
            <p className="text-sm text-gray-500 mt-1">
              Run <code className="bg-gray-100 px-2 py-0.5 rounded text-xs">python train_models.py</code> to train and save models first.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {DEPT_GROUPS.map((group, groupIdx) => {
              const groupDepts = departments.filter((d) => group.ids.includes(d.id));
              if (groupDepts.length === 0) return null;
              return (
                <div key={groupIdx}>
                  {group.label && (
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 pl-1">
                      {group.label}
                    </h3>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {groupDepts.map((dept, i) => {
                      const style    = DEPT_STYLES[dept.id] || DEPT_STYLES.cardiology;
                      const { Icon } = style;
                      return (
                        <motion.div
                          key={dept.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.07 }}
                          onClick={() => selectDepartment(dept)}
                          className={`bg-white rounded-2xl p-6 shadow-sm cursor-pointer group border-2 ${style.border} hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}
                        >
                          <div className="flex items-start gap-4">
                            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${style.gradient} flex items-center justify-center shadow-md flex-shrink-0 group-hover:scale-110 transition-transform`}>
                              <Icon className="w-7 h-7 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="text-lg font-bold text-gray-900">{dept.label}</h3>
                                {dept.is_image && (
                                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${
                                    dept.id === 'orthopedics'
                                      ? 'bg-cyan-100 text-cyan-600 border-cyan-200'
                                      : 'bg-fuchsia-100 text-fuchsia-600 border-fuchsia-200'
                                  }`}>
                                    {dept.id === 'orthopedics' ? '🦴 X-Ray AI' : '📷 Image AI'}
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-500 mt-0.5">{dept.description}</p>
                            </div>
                          </div>

                          <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                            <div className="flex gap-4">
                              <div>
                                <p className="text-xs font-bold text-gray-900">{dept.metrics?.accuracy ?? '—'}%</p>
                                <p className="text-xs text-gray-400">Accuracy</p>
                              </div>
                              <div>
                                <p className="text-xs font-bold text-gray-900">
                                  {dept.metrics?.roc_auc ?? dept.metrics?.kappa ?? '—'}
                                  {(dept.metrics?.roc_auc || dept.metrics?.kappa) ? (dept.metrics?.kappa ? '' : '%') : ''}
                                </p>
                                <p className="text-xs text-gray-400">{dept.metrics?.kappa ? 'Kappa' : 'AUC'}</p>
                              </div>
                              <div>
                                <p className="text-xs font-bold text-gray-900">{modelShortName(dept.metrics?.best_model)}</p>
                                <p className="text-xs text-gray-400">Model</p>
                              </div>
                              <div>
                                <p className="text-xs font-bold text-gray-900">
                                  {dept.is_multiclass ? `${dept.class_names?.length ?? '?'} diseases` : 'Risk score'}
                                </p>
                                <p className="text-xs text-gray-400">Output</p>
                              </div>
                            </div>
                            <div className="flex items-center text-sm font-semibold text-blue-600 gap-1 group-hover:gap-2 transition-all">
                              Start <ChevronRight size={16} />
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>
    );
  }

  // ── Result screen ─────────────────────────────────────────────────────────
  if (result) {
    const style        = DEPT_STYLES[selectedDept.id] || DEPT_STYLES.cardiology;
    const featureInfo  = selectedDept.feature_info  || {};
    const featureNames = selectedDept.feature_names || [];

    const checkedSymptoms      = featureNames.filter((n) => featureInfo[n]?.type === 'checkbox' && formValues[n] === 1);
    const hasCheckboxes        = featureNames.some((n) => featureInfo[n]?.type === 'checkbox');
    const activeSeverityFields = featureNames.filter((n) => isSeveritySelect(featureInfo[n]) && Number(formValues[n]) > 0);
    const summaryMetaFields    = featureNames.filter((n) => {
      const info = featureInfo[n];
      return info?.type === 'number' || (info?.type === 'select' && !isSeveritySelect(info));
    });

    // ── Orthopedics result (binary: normal vs abnormal) ───────────────────
    if (result.is_ortho) {
      const isAbnormal = result.prediction === 1;
      return (
        <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

            <div className="px-6 py-5 bg-gradient-to-r from-cyan-600 to-blue-700">
              <p className="text-white/80 text-sm font-medium">Orthopedics — Musculoskeletal X-Ray</p>
              <h2 className="text-2xl font-bold text-white">Abnormality Detection Result</h2>
            </div>

            <div className="p-6">
              {/* Main verdict */}
              <div className={`flex items-center gap-4 p-5 rounded-2xl border-2 mb-6 ${
                isAbnormal
                  ? 'bg-rose-50 border-rose-300'
                  : 'bg-emerald-50 border-emerald-300'
              }`}>
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                  isAbnormal ? 'bg-rose-100' : 'bg-emerald-100'
                }`}>
                  {isAbnormal
                    ? <AlertTriangle className="w-7 h-7 text-rose-600" />
                    : <CheckCircle  className="w-7 h-7 text-emerald-600" />}
                </div>
                <div>
                  <p className={`text-2xl font-bold ${isAbnormal ? 'text-rose-700' : 'text-emerald-700'}`}>
                    {result.result}
                  </p>
                  <p className="text-sm text-gray-600 mt-0.5">{result.message}</p>
                </div>
              </div>

              {/* Probability bars */}
              <div className="space-y-3 mb-6">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-rose-600">Abnormal</span>
                    <span className="font-bold text-rose-700">{result.prob_abnormal}%</span>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }} animate={{ width: `${result.prob_abnormal}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className="h-full rounded-full bg-rose-500"
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-emerald-600">Normal</span>
                    <span className="font-bold text-emerald-700">{result.prob_normal}%</span>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }} animate={{ width: `${result.prob_normal}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className="h-full rounded-full bg-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* Body part & study info */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="p-3 bg-gray-50 rounded-xl text-center">
                  <p className="text-xs text-gray-500">Body Part</p>
                  <p className="text-sm font-bold text-gray-800 mt-0.5">{result.body_part || '—'}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl text-center">
                  <p className="text-xs text-gray-500">Model</p>
                  <p className="text-sm font-bold text-gray-800 mt-0.5">{result.model_used}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl text-center">
                  <p className="text-xs text-gray-500">Kappa Score</p>
                  <p className="text-sm font-bold text-gray-800 mt-0.5">{result.model_kappa}</p>
                </div>
              </div>

              {/* Disclaimer */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl mb-6 text-sm text-blue-800">
                <strong>⚕️ Medical Disclaimer:</strong> {result.disclaimer}
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button onClick={reset}
                  className="flex-1 py-3 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                ><RefreshCw size={16} /> New Assessment</button>
                <button onClick={() => setResult(null)}
                  className="flex-1 py-3 bg-gradient-to-r from-cyan-600 to-blue-700 text-white font-semibold rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2"
                ><ChevronLeft size={16} /> Upload Another</button>
              </div>
            </div>
          </div>
        </motion.div>
      );
    }

    return (
      <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

          <div className={`px-6 py-5 bg-gradient-to-r ${style.gradient}`}>
            <p className="text-white/80 text-sm font-medium">{selectedDept.label}</p>
            <h2 className="text-2xl font-bold text-white">
              {result.is_multiclass ? 'Disease Prediction Result' : `${result.condition} Risk Assessment`}
            </h2>
          </div>

          <div className="p-6">
            {result.is_multiclass ? (
              <>
                <div className="flex items-center gap-3 p-4 rounded-xl border-2 bg-blue-50 border-blue-300 mb-6">
                  <CheckCircle className="w-7 h-7 text-blue-600 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-blue-500 uppercase tracking-wide">Most Likely Diagnosis</p>
                    <p className="text-xl font-bold text-blue-800">{result.predicted_class}</p>
                    <p className="text-sm text-blue-600 mt-0.5">{result.confidence}% confidence</p>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-semibold text-gray-700">Prediction Confidence</span>
                    <span className="text-xl font-bold text-blue-600">{result.confidence}%</span>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }} animate={{ width: `${result.confidence}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className="h-full rounded-full bg-blue-500"
                    />
                  </div>
                </div>

                {result.top_predictions?.length > 0 && (
                  <div className="mb-6">
                    <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <BarChart2 size={16} className="text-gray-400" />
                      {result.is_image ? 'Top 5 Possibilities' : 'Other Possibilities'}
                    </p>
                    <div className="space-y-2">
                      {result.top_predictions.map((p, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                          <span className="text-xs text-gray-500 w-4">{idx + 1}</span>
                          <span className="text-sm text-gray-700 flex-1 truncate">{p.disease}</span>
                          <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full rounded-full bg-blue-400" style={{ width: `${p.probability}%` }} />
                          </div>
                          <span className="text-xs font-semibold text-gray-600 w-10 text-right">{p.probability}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <>
                {(() => {
                  const risk = RISK_CONFIG[result.risk_level] || RISK_CONFIG.Low;
                  const { Icon: RIcon } = risk;
                  return (
                    <>
                      <div className={`flex items-center gap-3 p-4 rounded-xl border-2 ${risk.bg} ${risk.border} mb-6`}>
                        <RIcon className={`w-7 h-7 ${risk.color} flex-shrink-0`} />
                        <div>
                          <p className={`text-xl font-bold ${risk.color}`}>{risk.label}</p>
                          <p className="text-sm text-gray-600">{result.message}</p>
                        </div>
                      </div>
                      <div className="mb-6">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-semibold text-gray-700">Risk Probability</span>
                          <span className={`text-2xl font-bold ${risk.color}`}>{result.probability}%</span>
                        </div>
                        <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }} animate={{ width: `${result.probability}%` }}
                            transition={{ duration: 1, ease: 'easeOut' }}
                            className={`h-full rounded-full ${risk.bar}`}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-gray-400 mt-1">
                          <span>0% – No Risk</span><span>50%</span><span>100% – Certain</span>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </>
            )}

            {/* Input summary — skip for image-based dept */}
            {!result.is_image && (
              <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Your Inputs</p>

                {summaryMetaFields.length > 0 && (
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    {summaryMetaFields.map((name) => {
                      const info    = featureInfo[name] || {};
                      const val     = formValues[name];
                      const display = info.type === 'select'
                        ? (info.options?.find((o) => String(o.value) === String(val))?.label ?? val)
                        : val;
                      return (
                        <div key={name} className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-gray-200">
                          <span className="text-xs text-gray-500 truncate mr-2">{info.label || name}</span>
                          <span className="text-xs font-bold text-gray-800 whitespace-nowrap">
                            {display}{info.unit ? ` ${info.unit}` : ''}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {activeSeverityFields.length > 0 && (
                  <>
                    <p className="text-xs text-gray-400 mb-2">Symptoms reported ({activeSeverityFields.length})</p>
                    <div className="flex flex-wrap gap-1.5">
                      {activeSeverityFields.map((name) => {
                        const info = featureInfo[name] || {};
                        const val  = Number(formValues[name]);
                        return (
                          <span key={name} className="text-xs font-medium px-2.5 py-1 rounded-full bg-white border border-gray-200 text-gray-700 flex items-center gap-1">
                            {info.label || name}
                            <span className={`font-bold ${SEVERITY_COLORS[val]}`}>· {SEVERITY_LABELS[val]}</span>
                          </span>
                        );
                      })}
                    </div>
                  </>
                )}

                {hasCheckboxes && (
                  checkedSymptoms.length > 0 ? (
                    <>
                      <p className="text-xs text-gray-400 mb-2 mt-3">Symptoms / risk factors reported ({checkedSymptoms.length})</p>
                      <div className="flex flex-wrap gap-1.5">
                        {checkedSymptoms.map((name) => (
                          <span key={name} className="text-xs font-medium px-2.5 py-1 rounded-full bg-white border border-gray-200 text-gray-700">
                            {featureInfo[name]?.label || name}
                          </span>
                        ))}
                      </div>
                    </>
                  ) : (
                    <p className="text-xs text-gray-400 italic mt-2">No symptoms selected</p>
                  )
                )}
              </div>
            )}

            {/* Model info */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-3 bg-gray-50 rounded-xl text-center">
                <p className="text-xs text-gray-500">Model Used</p>
                <p className="text-sm font-bold text-gray-800 mt-0.5">{result.model_used}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl text-center">
                <p className="text-xs text-gray-500">Model Accuracy</p>
                <p className="text-sm font-bold text-gray-800 mt-0.5">{result.model_accuracy}%</p>
              </div>
            </div>

            {/* Disclaimer */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl mb-6 text-sm text-blue-800">
              <strong>⚕️ Medical Disclaimer:</strong> {result.disclaimer}
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button onClick={reset}
                className="flex-1 py-3 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
              ><RefreshCw size={16} /> New Assessment</button>
              <button onClick={() => setResult(null)}
                className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2"
              ><ChevronLeft size={16} /> Edit Inputs</button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // ── Input form ────────────────────────────────────────────────────────────
  const style              = DEPT_STYLES[selectedDept.id] || DEPT_STYLES.cardiology;
  const { Icon: FormIcon } = style;
  const severityOnlyDept   = detectSeverityOnlyDept(selectedDept);

  const severityFeatures          = selectedDept.feature_names.filter((n) => isSeveritySelect(selectedDept.feature_info?.[n]));
  const numberFeatures            = selectedDept.feature_names.filter((n) => selectedDept.feature_info?.[n]?.type === 'number');
  const nonSeveritySelectFeatures = selectedDept.feature_names.filter((n) => {
    const info = selectedDept.feature_info?.[n];
    return info?.type === 'select' && !isSeveritySelect(info);
  });
  const checkboxFeatures       = selectedDept.feature_names.filter((n) => selectedDept.feature_info?.[n]?.type === 'checkbox');
  const standardOtherFeatures  = [...numberFeatures, ...nonSeveritySelectFeatures];

  return (
    <motion.div ref={topRef} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto">

      {/* Dept header */}
      <div className={`bg-gradient-to-r ${style.gradient} rounded-2xl p-6 mb-6 text-white`}>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
            <FormIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-white/80 text-sm">{selectedDept.label}</p>
            <h2 className="text-xl font-bold">{selectedDept.condition} Assessment</h2>
          </div>
        </div>
        <p className="text-white/70 text-sm mt-3">
          {selectedDept.id === 'orthopedics'
            ? 'Upload a musculoskeletal X-ray. Our EfficientNetV2 AI will detect abnormalities across 7 body parts.'
            : selectedDept.is_image
            ? 'Upload a clear photo of the affected skin area. Our DINOv2 AI will analyse it across 23 conditions.'
            : severityOnlyDept
            ? 'Rate the severity of each symptom. Leave as "Absent" if the symptom is not present.'
            : 'Fill in your details and check all risk factors or symptoms that apply.'}
        </p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-2">
          <AlertTriangle size={16} /> {error}
        </div>
      )}

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">

        {/* ── Orthopedics ───────────────────────────────────────────────────── */}
        {selectedDept.id === 'orthopedics' ? (
          <OrthopedicsUploader
            token={token}
            onResult={(res) => setResult(res)}
            onError={(msg) => setError(msg)}
          />

        ) : selectedDept.is_image ? (
          /* ── Dermatology ───────────────────────────────────────────────── */
          <DermatologyUploader
            token={token}
            onResult={(res) => setResult(res)}
            onError={(msg) => setError(msg)}
          />

        ) : severityOnlyDept ? (
          // ── Pediatrics: severity-only layout ─────────────────────────────
          <>
            {numberFeatures.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
                {numberFeatures.map((name) => {
                  const info = selectedDept.feature_info?.[name] || {};
                  const val  = formValues[name] ?? '';
                  return (
                    <div key={name}>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                        {info.label || name}
                        {info.unit ? <span className="font-normal text-gray-400 ml-1">({info.unit})</span> : null}
                      </label>
                      <input type="number" step="any" value={val}
                        min={info.min ?? undefined} max={info.max ?? undefined}
                        onChange={(e) => setValue(name, parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        placeholder={info.min !== undefined && info.max !== undefined ? `${info.min} – ${info.max}` : ''} />
                      {info.min !== undefined && info.max !== undefined && (
                        <p className="text-xs text-gray-400 mt-1">Range: {info.min} – {info.max}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">
              Symptom Severity — rate each symptom
            </p>
            <div className="space-y-2.5 mb-6">
              {severityFeatures.map((name) => {
                const info    = selectedDept.feature_info?.[name] || {};
                const current = Number(formValues[name] ?? 0);
                return (
                  <div key={name} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                    <span className="text-sm font-medium text-gray-700 flex-1 min-w-0 truncate">{info.label || name}</span>
                    <div className="flex gap-1.5 flex-shrink-0">
                      {[0, 1, 2, 3].map((val) => (
                        <button key={val} type="button" onClick={() => setValue(name, val)}
                          className={`px-2.5 py-1 text-xs font-semibold rounded-lg border-2 transition-all ${
                            current === val ? SEVERITY_BUTTON_ACTIVE[val] : 'bg-white text-gray-400 border-gray-200 hover:border-gray-300 hover:text-gray-600'
                          }`}
                        >{SEVERITY_LABELS[val]}</button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </>

        ) : (
          // ── Standard layout ───────────────────────────────────────────────
          <>
            {standardOtherFeatures.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
                {standardOtherFeatures.map((name) => {
                  const info = selectedDept.feature_info?.[name] || {};
                  const val  = formValues[name] ?? '';
                  return (
                    <div key={name}>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                        {info.label || name}
                        {info.unit ? <span className="font-normal text-gray-400 ml-1">({info.unit})</span> : null}
                      </label>
                      {info.type === 'select' ? (
                        <select value={val}
                          onChange={(e) => setValue(name, parseFloat(e.target.value))}
                          className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white outline-none"
                        >
                          {info.options?.map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      ) : (
                        <div>
                          <input type="number" step="any" value={val}
                            min={info.min ?? undefined} max={info.max ?? undefined}
                            onChange={(e) => setValue(name, parseFloat(e.target.value) || 0)}
                            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                            placeholder={info.min !== undefined && info.max !== undefined ? `${info.min} – ${info.max}` : ''} />
                          {info.min !== undefined && info.max !== undefined && (
                            <p className="text-xs text-gray-400 mt-1">Range: {info.min} – {info.max}</p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {checkboxFeatures.length > 0 && (
              <>
                {standardOtherFeatures.length > 0 && (
                  <div className="border-t border-gray-100 pt-5 mb-5">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">
                      Risk Factors &amp; Symptoms — check all that apply
                    </p>
                  </div>
                )}
                {standardOtherFeatures.length === 0 && (
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">
                    Symptoms — check all that apply
                  </p>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                  {checkboxFeatures.map((name) => {
                    const info    = selectedDept.feature_info?.[name] || {};
                    const checked = formValues[name] === 1;
                    return (
                      <label key={name}
                        className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all select-none ${
                          checked
                            ? `${style.bg} ${style.border} ${style.text}`
                            : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <input type="checkbox" checked={checked}
                          onChange={(e) => setValue(name, e.target.checked ? 1 : 0)}
                          className="w-4 h-4 rounded accent-blue-500 flex-shrink-0" />
                        <span className="text-sm font-medium leading-tight">{info.label || name}</span>
                      </label>
                    );
                  })}
                </div>
              </>
            )}
          </>
        )}

        {/* Actions — non-image departments */}
        {!selectedDept.is_image && selectedDept.id !== 'orthopedics' && (
          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <button onClick={reset}
              className="px-5 py-3 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-2"
            ><ChevronLeft size={16} /> Back</button>
            <button onClick={runPrediction} disabled={predicting}
              className={`flex-1 py-3 bg-gradient-to-r ${style.gradient} text-white font-semibold rounded-xl hover:shadow-xl transition-all disabled:opacity-60 flex items-center justify-center gap-2`}
            >
              {predicting
                ? <><Loader2 size={18} className="animate-spin" /> Analysing...</>
                : <>Run Prediction <ArrowRight size={18} /></>}
            </button>
          </div>
        )}

        {/* Back button for image depts */}
        {(selectedDept.is_image || selectedDept.id === 'orthopedics') && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <button onClick={reset}
              className="px-5 py-3 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-2"
            ><ChevronLeft size={16} /> Back to Departments</button>
          </div>
        )}
      </div>
    </motion.div>
  );
}