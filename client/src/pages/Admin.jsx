import { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import { motion } from 'framer-motion';
import {
  HiOutlineUsers, HiOutlineChartBar, HiOutlineExclamation,
  HiOutlineShieldCheck, HiOutlineBan, HiOutlineBadgeCheck,
  HiOutlineTrendingUp, HiOutlineCalendar, HiOutlineStar, HiOutlineClock,
} from 'react-icons/hi';

export default function Admin() {
  const [tab, setTab] = useState('analytics');
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (tab === 'analytics') {
          const { data } = await adminAPI.getAnalytics();
          setAnalytics(data.analytics);
        } else if (tab === 'users') {
          const { data } = await adminAPI.getUsers({ search, limit: 50 });
          setUsers(data.users || []);
        } else if (tab === 'reports') {
          const { data } = await adminAPI.getReports({});
          setReports(data.reports || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [tab, search]);

  const handleBan = async (userId) => {
    try {
      await adminAPI.toggleBan(userId);
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, isBanned: !u.isBanned } : u));
    } catch (e) {
      console.error(e);
    }
  };

  const handleVerify = async (userId) => {
    try {
      await adminAPI.verify(userId);
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, isVerified: true } : u));
    } catch (e) {
      console.error(e);
    }
  };

  const handleReportAction = async (reportId, status) => {
    try {
      await adminAPI.updateReport(reportId, { status });
      setReports(prev => prev.map(r => r._id === reportId ? { ...r, status } : r));
    } catch (e) {
      console.error(e);
    }
  };

  const tabs = [
    { key: 'analytics', label: 'Analytics', icon: HiOutlineChartBar },
    { key: 'users', label: 'Users', icon: HiOutlineUsers },
    { key: 'reports', label: 'Reports', icon: HiOutlineExclamation },
  ];

  return (
    <div className="page-container">
      <div className="mb-8">
        <h1 className="page-title flex items-center gap-3">
          <HiOutlineShieldCheck className="w-8 h-8 text-primary-500" /> Admin Panel
        </h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center gap-2
              ${tab === t.key ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/25' : 'bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400 hover:bg-surface-200 dark:hover:bg-surface-700'}`}>
            <t.icon className="w-4 h-4" /> {t.label}
          </button>
        ))}
      </div>

      {/* Analytics */}
      {tab === 'analytics' && analytics && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Total Users', value: analytics.totalUsers, icon: HiOutlineUsers, color: 'from-primary-500 to-primary-600' },
              { label: 'Active Now', value: analytics.activeUsers, icon: HiOutlineTrendingUp, color: 'from-green-500 to-emerald-500' },
              { label: 'Total Sessions', value: analytics.totalSessions, icon: HiOutlineCalendar, color: 'from-amber-500 to-orange-500' },
              { label: 'Reviews', value: analytics.totalReviews, icon: HiOutlineStar, color: 'from-accent-500 to-pink-500' },
              { label: 'Completed Sessions', value: analytics.completedSessions, icon: HiOutlineBadgeCheck, color: 'from-teal-500 to-cyan-500' },
              { label: 'Pending Sessions', value: analytics.pendingSessions, icon: HiOutlineClock, color: 'from-blue-500 to-indigo-500' },
              { label: 'Pending Reports', value: analytics.pendingReports, icon: HiOutlineExclamation, color: 'from-red-500 to-rose-500' },
              { label: 'New This Week', value: analytics.recentSignups, icon: HiOutlineTrendingUp, color: 'from-violet-500 to-purple-500' },
            ].map((stat, idx) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
                className="card p-5">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3 shadow-lg`}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
                <p className="text-2xl font-bold text-surface-900 dark:text-white">{stat.value}</p>
                <p className="text-xs text-surface-500 dark:text-surface-400">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Top Skills */}
          {analytics.topSkills?.length > 0 && (
            <div className="card p-6">
              <h3 className="section-title mb-4">Top Skills on Platform</h3>
              <div className="space-y-3">
                {analytics.topSkills.map((skill, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-sm font-medium text-surface-700 dark:text-surface-300 w-32 truncate">{skill._id}</span>
                    <div className="flex-1 h-3 bg-surface-200 dark:bg-surface-700 rounded-full overflow-hidden">
                      <div className="h-full bg-primary-500 rounded-full transition-all"
                        style={{ width: `${(skill.count / analytics.topSkills[0].count) * 100}%` }} />
                    </div>
                    <span className="text-sm font-bold text-surface-600 dark:text-surface-400 w-8 text-right">{skill.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Users */}
      {tab === 'users' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            className="input-field mb-4 max-w-md" placeholder="Search users by name or email..." />
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-surface-50 dark:bg-surface-900">
                  <tr>
                    {['User', 'Email', 'Role', 'XP', 'Status', 'Actions'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-surface-500 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={6} className="text-center py-8 text-surface-400">Loading...</td></tr>
                  ) : users.map(u => (
                    <tr key={u._id} className="border-t border-surface-100 dark:border-surface-800 hover:bg-surface-50 dark:hover:bg-surface-800/50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center text-white text-sm font-bold overflow-hidden">
                            {u.avatar ? <img src={u.avatar} alt="" className="w-full h-full object-cover" /> : u.name?.[0]}
                          </div>
                          <span className="text-sm font-medium text-surface-900 dark:text-white">{u.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-surface-500">{u.email}</td>
                      <td className="px-4 py-3"><span className="badge-skill capitalize text-xs">{u.role}</span></td>
                      <td className="px-4 py-3 text-sm font-medium text-primary-600">{u.xp}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {u.isVerified && <span className="text-xs text-green-500 flex items-center gap-0.5"><HiOutlineBadgeCheck className="w-3.5 h-3.5" /> Verified</span>}
                          {u.isBanned && <span className="text-xs text-red-500 flex items-center gap-0.5"><HiOutlineBan className="w-3.5 h-3.5" /> Banned</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1.5">
                          {!u.isVerified && (
                            <button onClick={() => handleVerify(u._id)} className="text-xs px-2.5 py-1 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-200 transition-colors">Verify</button>
                          )}
                          <button onClick={() => handleBan(u._id)}
                            className={`text-xs px-2.5 py-1 rounded-lg transition-colors ${u.isBanned ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'}`}>
                            {u.isBanned ? 'Unban' : 'Ban'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      )}

      {/* Reports */}
      {tab === 'reports' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {loading ? (
            <div className="animate-pulse space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="card p-6 h-24" />)}</div>
          ) : reports.length > 0 ? (
            <div className="space-y-4">
              {reports.map(report => (
                <div key={report._id} className="card p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm"><span className="font-medium text-surface-900 dark:text-white">{report.reporter?.name}</span>
                        <span className="text-surface-400"> reported </span>
                        <span className="font-medium text-surface-900 dark:text-white">{report.reportedUser?.name}</span></p>
                      <p className="text-sm text-surface-500 mt-1"><span className="badge-wanted text-xs capitalize">{report.reason}</span></p>
                      {report.description && <p className="text-sm text-surface-400 mt-2 italic">"{report.description}"</p>}
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      {report.status === 'pending' && (
                        <>
                          <button onClick={() => handleReportAction(report._id, 'resolved')} className="text-xs px-3 py-1.5 rounded-lg bg-green-100 text-green-700 hover:bg-green-200">Resolve</button>
                          <button onClick={() => handleReportAction(report._id, 'dismissed')} className="text-xs px-3 py-1.5 rounded-lg bg-surface-200 text-surface-600 hover:bg-surface-300">Dismiss</button>
                        </>
                      )}
                      <span className={`text-xs px-2.5 py-1 rounded-full capitalize font-medium
                        ${report.status === 'pending' ? 'bg-amber-100 text-amber-700' : report.status === 'resolved' ? 'bg-green-100 text-green-700' : 'bg-surface-200 text-surface-500'}`}>
                        {report.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card-glass p-12 text-center text-surface-400">
              <HiOutlineExclamation className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p>No reports</p>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
