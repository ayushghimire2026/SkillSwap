import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { matchAPI, chatAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlineLightningBolt, HiOutlineChatAlt2, HiOutlineStar } from 'react-icons/hi';

export default function Matches() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    matchAPI.getMatches()
      .then(({ data }) => setMatches(data.matches || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleMessage = async (userId) => {
    try {
      const { data } = await chatAPI.createConversation(userId);
      navigate(`/chat/${data.conversation._id}`);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="page-container">
      <div className="mb-8">
        <h1 className="page-title flex items-center gap-3">
          <HiOutlineLightningBolt className="w-8 h-8 text-primary-500" /> Skill Matches
        </h1>
        <p className="mt-2 text-surface-500 dark:text-surface-400">Users whose skills are compatible with yours</p>
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card p-6 animate-pulse"><div className="h-36 bg-surface-200 dark:bg-surface-700 rounded-xl" /></div>
          ))}
        </div>
      ) : matches.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {matches.map((match, idx) => (
            <motion.div
              key={match.user._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="card p-6 group hover:-translate-y-1"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl gradient-primary flex items-center justify-center text-white text-xl font-bold overflow-hidden shadow-lg group-hover:scale-105 transition-transform">
                    {match.user.avatar ? <img src={match.user.avatar} alt="" className="w-full h-full object-cover" /> : match.user.name?.[0]}
                  </div>
                  <div>
                    <Link to={`/profile/${match.user._id}`} className="font-semibold text-surface-900 dark:text-white hover:text-primary-600">{match.user.name}</Link>
                    <div className="flex items-center gap-1 text-xs text-surface-400 mt-0.5">
                      <HiOutlineStar className="w-3.5 h-3.5 text-amber-500" />
                      {match.user.reputation} reputation
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-center">
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center font-bold text-lg border-4 ${
                    match.totalScore >= 70 ? 'border-green-500 text-green-600 dark:text-green-400' :
                    match.totalScore >= 40 ? 'border-amber-500 text-amber-600 dark:text-amber-400' :
                    'border-surface-300 text-surface-500'
                  }`}>
                    {match.totalScore}%
                  </div>
                </div>
              </div>

              {/* Score breakdown */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-surface-500">Skill Match</span>
                  <span className="font-medium text-surface-700 dark:text-surface-300">{match.skillScore}/50</span>
                </div>
                <div className="w-full h-1.5 bg-surface-200 dark:bg-surface-700 rounded-full overflow-hidden">
                  <div className="h-full bg-primary-500 rounded-full transition-all" style={{ width: `${(match.skillScore / 50) * 100}%` }} />
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-surface-500">Availability</span>
                  <span className="font-medium text-surface-700 dark:text-surface-300">{match.availabilityScore}/25</span>
                </div>
                <div className="w-full h-1.5 bg-surface-200 dark:bg-surface-700 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${(match.availabilityScore / 25) * 100}%` }} />
                </div>
              </div>

              {/* Matched skills */}
              {(match.matchedSkillsBToA?.length > 0 || match.matchedSkillsAToB?.length > 0) && (
                <div className="mb-4">
                  {match.matchedSkillsBToA?.length > 0 && (
                    <div className="mb-2">
                      <p className="text-xs text-surface-400 mb-1">Can teach you:</p>
                      <div className="flex flex-wrap gap-1">
                        {match.matchedSkillsBToA.map((s, i) => <span key={i} className="badge-skill text-xs">{s}</span>)}
                      </div>
                    </div>
                  )}
                  {match.matchedSkillsAToB?.length > 0 && (
                    <div>
                      <p className="text-xs text-surface-400 mb-1">Wants to learn:</p>
                      <div className="flex flex-wrap gap-1">
                        {match.matchedSkillsAToB.map((s, i) => <span key={i} className="badge-wanted text-xs">{s}</span>)}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-2">
                <button onClick={() => handleMessage(match.user._id)} className="btn-primary text-sm flex-1 flex items-center justify-center gap-1.5">
                  <HiOutlineChatAlt2 className="w-4 h-4" /> Message
                </button>
                <Link to={`/profile/${match.user._id}`} className="btn-secondary text-sm px-4">View</Link>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="card-glass p-16 text-center">
          <HiOutlineLightningBolt className="w-16 h-16 mx-auto text-surface-300 dark:text-surface-600 mb-4" />
          <h3 className="text-xl font-semibold text-surface-700 dark:text-surface-300 mb-2">No Matches Yet</h3>
          <p className="text-surface-400 mb-4">Add skills to your profile to find compatible partners.</p>
          <Link to="/profile/edit" className="btn-primary">Add Skills →</Link>
        </div>
      )}
    </div>
  );
}
