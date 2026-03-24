import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { sessionAPI, reviewAPI } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineCalendar, HiOutlineCheck, HiOutlineX, HiOutlineStar, HiOutlineClock } from 'react-icons/hi';

export default function Sessions() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [reviewModal, setReviewModal] = useState(null);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [submitting, setSubmitting] = useState(false);

  const fetchSessions = async () => {
    try {
      const params = {};
      if (filter !== 'all') params.status = filter;
      const { data } = await sessionAPI.getAll(params);
      setSessions(data.sessions || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSessions(); }, [filter]);

  const handleAction = async (id, action) => {
    try {
      if (action === 'approve') await sessionAPI.approve(id);
      else if (action === 'complete') await sessionAPI.complete(id);
      else if (action === 'cancel') await sessionAPI.cancel(id);
      fetchSessions();
    } catch (e) {
      console.error(e);
    }
  };

  const submitReview = async () => {
    if (!reviewModal) return;
    setSubmitting(true);
    try {
      await reviewAPI.create({
        session: reviewModal._id,
        rating: reviewForm.rating,
        comment: reviewForm.comment,
      });
      setReviewModal(null);
      setReviewForm({ rating: 5, comment: '' });
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const statusColors = {
    pending: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
    approved: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
    completed: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
    cancelled: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
    rejected: 'bg-surface-200 dark:bg-surface-700 text-surface-600 dark:text-surface-400',
  };

  return (
    <div className="page-container">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="page-title flex items-center gap-3">
            <HiOutlineCalendar className="w-8 h-8 text-green-500" /> Sessions
          </h1>
          <p className="mt-1 text-surface-500 dark:text-surface-400">Manage your skill exchange sessions</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {['all', 'pending', 'approved', 'completed', 'cancelled'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors capitalize
                ${filter === f ? 'bg-primary-600 text-white' : 'bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400 hover:bg-surface-200 dark:hover:bg-surface-700'}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="card p-6 animate-pulse"><div className="h-20 bg-surface-200 dark:bg-surface-700 rounded-xl" /></div>)}</div>
      ) : sessions.length > 0 ? (
        <div className="space-y-4">
          {sessions.map((session, idx) => {
            const isProvider = session.provider?._id === user?._id;
            const other = isProvider ? session.requester : session.provider;
            return (
              <motion.div key={session._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
                className="card p-6">
                <div className="flex flex-col sm:flex-row items-start gap-4">
                  <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center text-white font-bold flex-shrink-0 overflow-hidden">
                    {other?.avatar ? <img src={other.avatar} alt="" className="w-full h-full object-cover" /> : other?.name?.[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-surface-900 dark:text-white">{session.skill}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${statusColors[session.status]}`}>{session.status}</span>
                    </div>
                    <p className="text-sm text-surface-500 mt-1">
                      {isProvider ? 'Requested by' : 'With'} <span className="font-medium text-surface-700 dark:text-surface-300">{other?.name}</span>
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-surface-400">
                      <span className="flex items-center gap-1"><HiOutlineCalendar className="w-3.5 h-3.5" />{new Date(session.date).toLocaleDateString()}</span>
                      <span className="flex items-center gap-1"><HiOutlineClock className="w-3.5 h-3.5" />{session.timeSlot?.startTime} - {session.timeSlot?.endTime}</span>
                    </div>
                    {session.notes && <p className="text-sm text-surface-400 mt-2 italic">"{session.notes}"</p>}
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    {session.status === 'pending' && isProvider && (
                      <>
                        <button onClick={() => handleAction(session._id, 'approve')} className="btn-primary text-sm px-3 py-1.5 flex items-center gap-1">
                          <HiOutlineCheck className="w-4 h-4" /> Approve
                        </button>
                        <button onClick={() => handleAction(session._id, 'cancel')} className="btn-danger text-sm px-3 py-1.5 flex items-center gap-1">
                          <HiOutlineX className="w-4 h-4" /> Decline
                        </button>
                      </>
                    )}
                    {session.status === 'approved' && (
                      <button onClick={() => handleAction(session._id, 'complete')} className="btn-primary text-sm px-3 py-1.5 flex items-center gap-1 bg-green-600 hover:bg-green-700">
                        <HiOutlineCheck className="w-4 h-4" /> Complete
                      </button>
                    )}
                    {session.status === 'completed' && (
                      <button onClick={() => setReviewModal(session)} className="btn-secondary text-sm px-3 py-1.5 flex items-center gap-1">
                        <HiOutlineStar className="w-4 h-4" /> Review
                      </button>
                    )}
                    {['pending', 'approved'].includes(session.status) && !isProvider && (
                      <button onClick={() => handleAction(session._id, 'cancel')} className="btn-ghost text-sm text-red-500 px-3 py-1.5">Cancel</button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="card-glass p-16 text-center">
          <HiOutlineCalendar className="w-16 h-16 mx-auto text-surface-300 dark:text-surface-600 mb-4" />
          <h3 className="text-xl font-semibold text-surface-700 dark:text-surface-300 mb-2">No Sessions</h3>
          <p className="text-surface-400">Book a session from a match's profile to get started!</p>
        </div>
      )}

      {/* Review Modal */}
      <AnimatePresence>
        {reviewModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setReviewModal(null)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="card p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
              <h3 className="text-lg font-bold text-surface-900 dark:text-white mb-4">Leave a Review</h3>
              <p className="text-sm text-surface-500 mb-4">Session: {reviewModal.skill}</p>
              <div className="flex gap-1 mb-4">
                {[1, 2, 3, 4, 5].map(n => (
                  <button key={n} onClick={() => setReviewForm({...reviewForm, rating: n})}
                    className={`text-2xl transition-colors ${n <= reviewForm.rating ? 'text-amber-500' : 'text-surface-300 dark:text-surface-600'}`}>★</button>
                ))}
              </div>
              <textarea value={reviewForm.comment} onChange={e => setReviewForm({...reviewForm, comment: e.target.value})}
                className="input-field mb-4 resize-none" rows={3} placeholder="Share your experience..." />
              <div className="flex gap-3 justify-end">
                <button onClick={() => setReviewModal(null)} className="btn-secondary text-sm">Cancel</button>
                <button onClick={submitReview} disabled={submitting} className="btn-primary text-sm">
                  {submitting ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
