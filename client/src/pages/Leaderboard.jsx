import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { userAPI } from '../services/api';
import { motion } from 'framer-motion';
import { HiOutlineStar, HiOutlineTrendingUp, HiOutlineAcademicCap } from 'react-icons/hi';

export default function Leaderboard() {
  const [users, setUsers] = useState([]);
  const [sortBy, setSortBy] = useState('xp');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    userAPI.getLeaderboard({ sort: sortBy, limit: 30 })
      .then(({ data }) => setUsers(data.leaderboard || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [sortBy]);

  const medals = ['🥇', '🥈', '🥉'];

  return (
    <div className="page-container max-w-4xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="page-title flex items-center gap-3">
            <HiOutlineTrendingUp className="w-8 h-8 text-amber-500" /> Leaderboard
          </h1>
          <p className="mt-1 text-surface-500 dark:text-surface-400">Top skill swappers in the community</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setSortBy('xp')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-1.5
              ${sortBy === 'xp' ? 'bg-primary-600 text-white' : 'bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400'}`}>
            <HiOutlineTrendingUp className="w-4 h-4" /> XP
          </button>
          <button onClick={() => setSortBy('reputation')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-1.5
              ${sortBy === 'reputation' ? 'bg-primary-600 text-white' : 'bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400'}`}>
            <HiOutlineStar className="w-4 h-4" /> Reputation
          </button>
        </div>
      </div>

      {/* Top 3 Podium */}
      {!loading && users.length >= 3 && (
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[1, 0, 2].map((rank) => {
            const u = users[rank];
            if (!u) return null;
            const isFirst = rank === 0;
            return (
              <motion.div key={u._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: rank * 0.1 }}
                className={`card-glass p-6 text-center ${isFirst ? 'ring-2 ring-amber-500 order-2' : rank === 1 ? 'order-1 mt-4' : 'order-3 mt-4'}`}
              >
                <div className="text-3xl mb-2">{medals[rank]}</div>
                <Link to={`/profile/${u._id}`} className="inline-block">
                  <div className={`w-16 h-16 mx-auto rounded-2xl gradient-primary flex items-center justify-center text-white text-xl font-bold overflow-hidden ${isFirst ? 'ring-4 ring-amber-400/50' : ''}`}>
                    {u.avatar ? <img src={u.avatar} alt="" className="w-full h-full object-cover" /> : u.name?.[0]}
                  </div>
                </Link>
                <p className="mt-2 font-semibold text-surface-900 dark:text-white text-sm truncate">{u.name}</p>
                <p className="text-lg font-bold gradient-text">{sortBy === 'xp' ? u.xp : u.reputation}</p>
                <p className="text-xs text-surface-400">{sortBy === 'xp' ? 'XP Points' : 'Reputation'}</p>
                {u.badges?.length > 0 && (
                  <div className="flex justify-center gap-1 mt-2">
                    {u.badges.slice(0, 3).map((b, i) => <span key={i} className="text-sm" title={b.name}>{b.icon}</span>)}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Full List */}
      <div className="card overflow-hidden">
        <div className="p-4 border-b border-surface-200 dark:border-surface-700">
          <div className="grid grid-cols-12 text-xs font-semibold text-surface-400 uppercase tracking-wide">
            <span className="col-span-1">#</span>
            <span className="col-span-5">User</span>
            <span className="col-span-2 text-center">XP</span>
            <span className="col-span-2 text-center">Rep</span>
            <span className="col-span-2 text-center">Sessions</span>
          </div>
        </div>
        {loading ? (
          <div className="animate-pulse p-4 space-y-3">
            {[...Array(5)].map((_, i) => <div key={i} className="h-12 bg-surface-100 dark:bg-surface-800 rounded-lg" />)}
          </div>
        ) : (
          users.map((u, idx) => (
            <motion.div key={u._id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: idx * 0.02 }}
              className="px-4 py-3 border-b border-surface-100 dark:border-surface-800 hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors"
            >
              <div className="grid grid-cols-12 items-center">
                <span className="col-span-1 font-bold text-surface-500 dark:text-surface-400">
                  {idx < 3 ? medals[idx] : idx + 1}
                </span>
                <Link to={`/profile/${u._id}`} className="col-span-5 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg gradient-primary flex items-center justify-center text-white text-sm font-bold overflow-hidden flex-shrink-0">
                    {u.avatar ? <img src={u.avatar} alt="" className="w-full h-full object-cover" /> : u.name?.[0]}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-sm text-surface-900 dark:text-white truncate">{u.name}</p>
                    <div className="flex gap-0.5">
                      {u.badges?.slice(0, 3).map((b, i) => <span key={i} className="text-xs">{b.icon}</span>)}
                    </div>
                  </div>
                </Link>
                <span className="col-span-2 text-center font-semibold text-sm text-primary-600 dark:text-primary-400">{u.xp}</span>
                <span className="col-span-2 text-center font-semibold text-sm text-amber-600 dark:text-amber-400">{u.reputation}</span>
                <span className="col-span-2 text-center text-sm text-surface-500">{u.sessionsCompleted}</span>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
