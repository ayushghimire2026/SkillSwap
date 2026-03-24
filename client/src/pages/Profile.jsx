import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userAPI, reviewAPI, chatAPI } from '../services/api';
import { useSocket } from '../context/SocketContext';
import { motion } from 'framer-motion';
import {
  HiOutlineStar, HiOutlineLocationMarker, HiOutlineClock, HiOutlinePencil,
  HiOutlineChatAlt2, HiOutlineCalendar, HiOutlineBadgeCheck, HiOutlineTrendingUp,
} from 'react-icons/hi';

export default function Profile() {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const { isUserOnline } = useSocket() || {};
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [loading, setLoading] = useState(true);

  const isOwn = currentUser?._id === id;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const [userRes, reviewRes] = await Promise.all([
          userAPI.getProfile(id),
          reviewAPI.getUserReviews(id),
        ]);
        setProfile(userRes.data.user);
        setReviews(reviewRes.data.reviews);
        setAvgRating(reviewRes.data.averageRating);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [id]);

  const handleMessage = async () => {
    try {
      const { data } = await chatAPI.createConversation(id);
      navigate(`/chat/${data.conversation._id}`);
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return <div className="page-container"><div className="animate-pulse space-y-6"><div className="h-48 bg-surface-200 dark:bg-surface-800 rounded-2xl" /><div className="h-32 bg-surface-200 dark:bg-surface-800 rounded-2xl" /></div></div>;
  }

  if (!profile) {
    return <div className="page-container text-center py-20 text-surface-400">User not found</div>;
  }

  const online = isUserOnline?.(id);

  return (
    <div className="page-container max-w-4xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* Header Card */}
        <div className="card-glass p-8 relative overflow-hidden">
          <div className="absolute inset-0 h-32 gradient-primary opacity-10" />
          <div className="relative flex flex-col sm:flex-row items-start gap-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-2xl gradient-primary flex items-center justify-center text-white text-3xl font-bold shadow-xl overflow-hidden">
                {profile.avatar ? <img src={profile.avatar} alt="" className="w-full h-full object-cover" /> : profile.name?.[0]}
              </div>
              {online !== undefined && (
                <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-3 border-white dark:border-surface-800 ${online ? 'bg-green-500' : 'bg-surface-400'}`} />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold text-surface-900 dark:text-white">{profile.name}</h1>
                {profile.isVerified && <HiOutlineBadgeCheck className="w-6 h-6 text-primary-500" />}
                {online && <span className="text-xs text-green-500 font-medium">Online</span>}
              </div>
              {profile.location && (
                <p className="flex items-center gap-1 text-surface-500 dark:text-surface-400 mt-1 text-sm">
                  <HiOutlineLocationMarker className="w-4 h-4" /> {profile.location}
                </p>
              )}
              {profile.bio && <p className="text-surface-600 dark:text-surface-300 mt-3 leading-relaxed">{profile.bio}</p>}

              <div className="flex items-center gap-4 mt-4 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <HiOutlineTrendingUp className="w-4 h-4 text-primary-500" />
                  <span className="text-sm font-semibold text-surface-700 dark:text-surface-300">{profile.xp} XP</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <HiOutlineStar className="w-4 h-4 text-amber-500" />
                  <span className="text-sm font-semibold text-surface-700 dark:text-surface-300">{avgRating || 0} ({reviews.length} reviews)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <HiOutlineCalendar className="w-4 h-4 text-green-500" />
                  <span className="text-sm font-semibold text-surface-700 dark:text-surface-300">{profile.sessionsCompleted} sessions</span>
                </div>
              </div>

              <div className="flex gap-3 mt-5">
                {isOwn ? (
                  <Link to="/profile/edit" className="btn-primary text-sm flex items-center gap-2"><HiOutlinePencil className="w-4 h-4" /> Edit Profile</Link>
                ) : (
                  <>
                    <button onClick={handleMessage} className="btn-primary text-sm flex items-center gap-2"><HiOutlineChatAlt2 className="w-4 h-4" /> Message</button>
                    <Link to={`/booking?provider=${id}`} className="btn-secondary text-sm flex items-center gap-2"><HiOutlineCalendar className="w-4 h-4" /> Book Session</Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Skills */}
        <div className="grid sm:grid-cols-2 gap-6 mt-6">
          <div className="card p-6">
            <h3 className="section-title mb-3">Skills Offered</h3>
            {profile.skillsOffered?.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {profile.skillsOffered.map((skill, i) => (
                  <span key={i} className="badge-skill">{skill.name} <span className="ml-1 opacity-60 capitalize">({skill.level})</span></span>
                ))}
              </div>
            ) : <p className="text-sm text-surface-400">No skills listed</p>}
          </div>
          <div className="card p-6">
            <h3 className="section-title mb-3">Skills Wanted</h3>
            {profile.skillsWanted?.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {profile.skillsWanted.map((skill, i) => (
                  <span key={i} className="badge-wanted">{skill.name}</span>
                ))}
              </div>
            ) : <p className="text-sm text-surface-400">No skills listed</p>}
          </div>
        </div>

        {/* Badges */}
        {profile.badges?.length > 0 && (
          <div className="card p-6 mt-6">
            <h3 className="section-title mb-3">Badges</h3>
            <div className="flex flex-wrap gap-3">
              {profile.badges.map((badge, i) => (
                <div key={i} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50">
                  <span className="text-lg">{badge.icon}</span>
                  <span className="text-sm font-medium text-amber-800 dark:text-amber-300">{badge.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Portfolio */}
        {profile.portfolio?.length > 0 && (
          <div className="card p-6 mt-6">
            <h3 className="section-title mb-3">Portfolio</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {profile.portfolio.map((item, i) => (
                <a key={i} href={item.url} target="_blank" rel="noreferrer" className="group">
                  <div className="aspect-video rounded-xl bg-surface-100 dark:bg-surface-700 overflow-hidden">
                    {item.type === 'image' ? (
                      <img src={item.url} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-surface-400">
                        <span className="text-sm">{item.title || 'Document'}</span>
                      </div>
                    )}
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Reviews */}
        <div className="card p-6 mt-6">
          <h3 className="section-title mb-4">Reviews ({reviews.length})</h3>
          {reviews.length > 0 ? (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review._id} className="p-4 rounded-xl bg-surface-50 dark:bg-surface-900/50">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-9 h-9 rounded-lg gradient-primary flex items-center justify-center text-white text-sm font-bold overflow-hidden">
                      {review.reviewer?.avatar ? <img src={review.reviewer.avatar} alt="" className="w-full h-full object-cover" /> : review.reviewer?.name?.[0]}
                    </div>
                    <div>
                      <p className="font-medium text-sm text-surface-900 dark:text-white">{review.reviewer?.name}</p>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <HiOutlineStar key={i} className={`w-3.5 h-3.5 ${i < review.rating ? 'text-amber-500 fill-amber-500' : 'text-surface-300'}`} />
                        ))}
                      </div>
                    </div>
                  </div>
                  {review.comment && <p className="text-sm text-surface-600 dark:text-surface-400">{review.comment}</p>}
                </div>
              ))}
            </div>
          ) : <p className="text-sm text-surface-400">No reviews yet</p>}
        </div>
      </motion.div>
    </div>
  );
}
