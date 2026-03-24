import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { matchAPI, sessionAPI } from '../services/api';
import { motion } from 'framer-motion';
import {
  HiOutlineLightningBolt, HiOutlineCalendar, HiOutlineStar,
  HiOutlineAcademicCap, HiOutlineTrendingUp, HiOutlineChatAlt2, HiArrowRight,
} from 'react-icons/hi';

export default function Dashboard() {
  const { user } = useAuth();
  const [topMatches, setTopMatches] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [matchRes, sessionRes] = await Promise.all([
          matchAPI.getMatches().catch(() => ({ data: { matches: [] } })),
          sessionAPI.getAll({ status: 'pending' }).catch(() => ({ data: { sessions: [] } })),
        ]);
        setTopMatches(matchRes.data.matches?.slice(0, 3) || []);
        setSessions(sessionRes.data.sessions?.slice(0, 5) || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const statCards = [
    { label: 'XP Points', value: user?.xp || 0, icon: HiOutlineTrendingUp, color: 'from-primary-500 to-primary-600' },
    { label: 'Reputation', value: user?.reputation || 0, icon: HiOutlineStar, color: 'from-amber-500 to-orange-500' },
    { label: 'Sessions', value: user?.sessionsCompleted || 0, icon: HiOutlineCalendar, color: 'from-green-500 to-emerald-500' },
    { label: 'Badges', value: user?.badges?.length || 0, icon: HiOutlineAcademicCap, color: 'from-accent-500 to-pink-500' },
  ];

  if (loading) {
    return (
      <div className="page-container">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card p-6 animate-pulse"><div className="h-16 bg-surface-200 dark:bg-surface-700 rounded-xl" /></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Welcome */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="page-title">
          Welcome back, <span className="gradient-text">{user?.name?.split(' ')[0]}</span> 👋
        </h1>
        <p className="mt-2 text-surface-500 dark:text-surface-400">
          {user?.skillsOffered?.length > 0
            ? "Here's what's happening on your SkillSwap today."
            : "Get started by adding skills to your profile!"}
        </p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="card p-5 group hover:-translate-y-1"
          >
            <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3 shadow-lg group-hover:scale-110 transition-transform`}>
              <stat.icon className="w-5 h-5 text-white" />
            </div>
            <p className="text-2xl font-bold text-surface-900 dark:text-white">{stat.value}</p>
            <p className="text-sm text-surface-500 dark:text-surface-400">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Quick actions */}
      {(!user?.skillsOffered?.length || !user?.skillsWanted?.length) && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          className="card-glass p-6 mb-8 relative overflow-hidden">
          <div className="absolute inset-0 gradient-primary opacity-5" />
          <div className="relative z-10">
            <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-2">🚀 Complete Your Profile</h3>
            <p className="text-surface-500 dark:text-surface-400 mb-4">Add your skills to start matching with other learners.</p>
            <Link to="/profile/edit" className="btn-primary text-sm">Complete Profile →</Link>
          </div>
        </motion.div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top Matches */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title flex items-center gap-2">
              <HiOutlineLightningBolt className="w-5 h-5 text-primary-500" /> Top Matches
            </h2>
            <Link to="/matches" className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
              View All <HiArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {topMatches.length > 0 ? (
            <div className="space-y-3">
              {topMatches.map((match) => (
                <Link to={`/profile/${match.user._id}`} key={match.user._id}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-50 dark:hover:bg-surface-700/50 transition-colors group">
                  <div className="w-11 h-11 rounded-xl gradient-primary flex items-center justify-center text-white font-bold flex-shrink-0 overflow-hidden">
                    {match.user.avatar ? <img src={match.user.avatar} alt="" className="w-full h-full object-cover" /> : match.user.name?.[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-surface-900 dark:text-white truncate">{match.user.name}</p>
                    <p className="text-xs text-surface-400 truncate">
                      {match.matchedSkillsBToA?.join(', ') || 'Compatible match'}
                    </p>
                  </div>
                  <div className="flex-shrink-0 px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-sm font-bold">
                    {match.totalScore}%
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-surface-400">
              <HiOutlineLightningBolt className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">Add skills to find matches</p>
            </div>
          )}
        </motion.div>

        {/* Upcoming Sessions */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title flex items-center gap-2">
              <HiOutlineCalendar className="w-5 h-5 text-green-500" /> Pending Sessions
            </h2>
            <Link to="/sessions" className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
              View All <HiArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {sessions.length > 0 ? (
            <div className="space-y-3">
              {sessions.map((session) => {
                const other = session.requester._id === user._id ? session.provider : session.requester;
                return (
                  <div key={session._id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-50 dark:hover:bg-surface-700/50 transition-colors">
                    <div className="w-11 h-11 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                      <HiOutlineCalendar className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-surface-900 dark:text-white truncate">{session.skill}</p>
                      <p className="text-xs text-surface-400">with {other.name} • {new Date(session.date).toLocaleDateString()}</p>
                    </div>
                    <span className="badge-skill capitalize text-xs">{session.status}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-surface-400">
              <HiOutlineCalendar className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No pending sessions</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Badges */}
      {user?.badges?.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mt-6 card p-6">
          <h2 className="section-title mb-4">Your Badges</h2>
          <div className="flex flex-wrap gap-3">
            {user.badges.map((badge, i) => (
              <div key={i} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50">
                <span className="text-xl">{badge.icon}</span>
                <span className="text-sm font-medium text-amber-800 dark:text-amber-300">{badge.name}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
