import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userAPI, sessionAPI } from '../services/api';
import { motion } from 'framer-motion';
import { HiOutlineCalendar, HiOutlineClock, HiOutlineChevronLeft, HiOutlineCheckCircle } from 'react-icons/hi';

export default function Booking() {
  const [searchParams] = useSearchParams();
  const providerId = searchParams.get('provider');
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSkill, setSelectedSkill] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!providerId) return navigate('/matches');
    if (providerId === currentUser?._id) return navigate('/dashboard');

    userAPI.getProfile(providerId)
      .then(({ data }) => {
        setProvider(data.user);
        if (data.user.skillsOffered?.length > 0) {
          setSelectedSkill(data.user.skillsOffered[0].name);
        }
      })
      .catch(() => setError('Failed to load instructor profile'))
      .finally(() => setLoading(false));
  }, [providerId, currentUser, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSkill || !selectedDate || !selectedSlot) {
      return setError('Please select a skill, date, and time slot');
    }

    setSubmitting(true);
    setError('');
    try {
      await sessionAPI.create({
        provider: providerId,
        skill: selectedSkill,
        date: selectedDate,
        timeSlot: selectedSlot,
        notes
      });
      setSuccess(true);
      setTimeout(() => navigate('/sessions'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to request session');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="page-container flex items-center justify-center min-h-[60vh]"><div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>;

  if (success) {
    return (
      <div className="page-container flex items-center justify-center min-h-[70vh]">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center card p-12 max-w-md">
          <HiOutlineCheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-surface-900 dark:text-white mb-2">Request Sent!</h2>
          <p className="text-surface-500 dark:text-surface-400 mb-6">Your session request has been sent to {provider?.name}. Redirecting to your sessions...</p>
          <div className="w-full bg-surface-100 dark:bg-surface-800 h-1.5 rounded-full overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 2 }} className="h-full bg-green-500" />
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="page-container max-w-3xl">
      <Link to={`/profile/${providerId}`} className="inline-flex items-center gap-1 text-sm text-surface-500 hover:text-primary-600 mb-6 transition-colors">
        <HiOutlineChevronLeft className="w-4 h-4" /> Back to Profile
      </Link>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="page-title mb-2">Book a Session</h1>
        <p className="text-surface-500 dark:text-surface-400 mb-8">Schedule a skill exchange with {provider?.name}</p>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Skill Selection */}
          <div className="card p-6">
            <h3 className="section-title mb-4 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 text-sm font-bold">1</span>
              Select Skill to Learn
            </h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {provider?.skillsOffered?.map((skill) => (
                <button
                  key={skill.name}
                  type="button"
                  onClick={() => setSelectedSkill(skill.name)}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    selectedSkill === skill.name
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/10'
                      : 'border-surface-200 dark:border-surface-700 hover:border-surface-300 dark:hover:border-surface-600'
                  }`}
                >
                  <p className="font-semibold text-surface-900 dark:text-white capitalize">{skill.name}</p>
                  <p className="text-xs text-surface-400 capitalize">{skill.level} level</p>
                </button>
              ))}
            </div>
          </div>

          {/* Date Selection */}
          <div className="card p-6">
            <h3 className="section-title mb-4 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400 text-sm font-bold">2</span>
              Choose a Date
            </h3>
            <div className="relative">
              <HiOutlineCalendar className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400" />
              <input
                type="date"
                required
                min={new Date().toISOString().split('T')[0]}
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setSelectedSlot(null);
                }}
                className="input-field pl-12"
              />
            </div>
          </div>

          {/* Time Slot Selection */}
          <div className="card p-6">
            <h3 className="section-title mb-4 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400 text-sm font-bold">3</span>
              Available Slots
            </h3>
            {selectedDate ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {provider?.availability?.map((slot, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setSelectedSlot(slot)}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      selectedSlot === slot
                        ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/10 text-amber-700 dark:text-amber-300 font-medium'
                        : 'border-surface-200 dark:border-surface-700 hover:bg-surface-50 dark:hover:bg-surface-800'
                    }`}
                  >
                    <HiOutlineClock className="inline mr-1 w-3.5 h-3.5" />
                    <span className="text-xs">{slot.startTime} - {slot.endTime}</span>
                  </button>
                ))}
                {(!provider?.availability || provider.availability.length === 0) && (
                  <p className="col-span-full text-center py-4 text-surface-400 italic">No slots defined by instructor</p>
                )}
              </div>
            ) : (
              <p className="text-center py-4 text-surface-400">Please select a date first</p>
            )}
          </div>

          {/* Notes */}
          <div className="card p-6">
            <h3 className="section-title mb-4 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 text-sm font-bold">4</span>
              Add a Note (Optional)
            </h3>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="What do you want to learn specifically? Any prior experience?"
              className="input-field resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Link to={`/profile/${providerId}`} className="btn-secondary">Cancel</Link>
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary min-w-[160px] flex items-center justify-center gap-2"
            >
              {submitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                'Send Request'
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
