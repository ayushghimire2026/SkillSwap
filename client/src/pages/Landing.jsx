import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import {
  HiOutlineLightningBolt, HiOutlineChatAlt2, HiOutlineCalendar,
  HiOutlineStar, HiOutlineShieldCheck, HiOutlineGlobe, HiOutlineMoon, HiOutlineSun,
} from 'react-icons/hi';

const features = [
  { icon: HiOutlineLightningBolt, title: 'Smart Matching', desc: 'AI-powered skill compatibility scoring finds your perfect learning partner.' },
  { icon: HiOutlineChatAlt2, title: 'Real-Time Chat', desc: 'Instant messaging with file sharing to collaborate seamlessly.' },
  { icon: HiOutlineCalendar, title: 'Easy Scheduling', desc: 'Book sessions based on mutual availability with one click.' },
  { icon: HiOutlineStar, title: 'Gamification', desc: 'Earn XP, unlock badges, and climb the leaderboard as you learn.' },
  { icon: HiOutlineShieldCheck, title: 'Trust System', desc: 'Reviews and reputation scores ensure quality exchanges.' },
  { icon: HiOutlineGlobe, title: 'Global Community', desc: 'Connect with learners and teachers around the world.' },
];

const stats = [
  { value: '10K+', label: 'Active Learners' },
  { value: '500+', label: 'Skills Available' },
  { value: '25K+', label: 'Sessions Completed' },
  { value: '4.9★', label: 'Average Rating' },
];

export default function Landing() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 overflow-hidden">
      {/* Header */}
      <header className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-lg shadow-primary-500/30">
              <span className="text-white font-bold text-xl">S</span>
            </div>
            <span className="text-2xl font-bold gradient-text">SkillSwap</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={toggleTheme} className="btn-ghost p-2 rounded-xl">
              {isDark ? <HiOutlineSun className="w-5 h-5 text-amber-400" /> : <HiOutlineMoon className="w-5 h-5" />}
            </button>
            <Link to="/login" className="btn-ghost text-sm">Sign In</Link>
            <Link to="/register" className="btn-primary text-sm">Get Started</Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative pt-16 pb-32 px-4">
        {/* Background gradient orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl" />
        <div className="absolute top-20 right-1/4 w-96 h-96 bg-accent-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-sm font-medium mb-8">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Join 10,000+ learners trading skills today
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight text-surface-900 dark:text-white leading-[1.1]">
              Trade Skills, <br />
              <span className="gradient-text">Not Money</span>
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-surface-500 dark:text-surface-400 max-w-2xl mx-auto text-balance">
              Learn anything by teaching what you know. SkillSwap connects you with peers for free skill exchanges — no cost, just growth.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register" className="btn-primary text-lg px-8 py-3.5 shadow-xl shadow-primary-500/20">
                Start Swapping Free →
              </Link>
              <Link to="/login" className="btn-secondary text-lg px-8 py-3.5">
                I Have an Account
              </Link>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6"
          >
            {stats.map((stat, idx) => (
              <div key={idx} className="card-glass p-6">
                <p className="text-3xl font-bold gradient-text">{stat.value}</p>
                <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-4 bg-white/50 dark:bg-surface-900/50">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-surface-900 dark:text-white">
              Everything You Need to <span className="gradient-text">Level Up</span>
            </h2>
            <p className="mt-4 text-surface-500 dark:text-surface-400 max-w-xl mx-auto">
              A complete platform built for meaningful skill exchanges between peers.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="card-glass p-8 group hover:-translate-y-1 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                </div>
                <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-2">{feature.title}</h3>
                <p className="text-surface-500 dark:text-surface-400 text-sm leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-surface-900 dark:text-white">
              How It <span className="gradient-text">Works</span>
            </h2>
          </div>
          <div className="space-y-8">
            {[
              { step: '01', title: 'Create Your Profile', desc: 'List the skills you can teach and what you want to learn.' },
              { step: '02', title: 'Get Matched', desc: 'Our algorithm finds compatible partners based on skills and availability.' },
              { step: '03', title: 'Chat & Schedule', desc: 'Message your match and book a session that works for both.' },
              { step: '04', title: 'Learn & Grow', desc: 'Complete sessions, earn XP, get reviews, and unlock badges!' },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: idx % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="flex items-start gap-6 card-glass p-6"
              >
                <div className="w-14 h-14 flex-shrink-0 rounded-2xl gradient-primary flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-primary-500/20">
                  {item.step}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-surface-900 dark:text-white">{item.title}</h3>
                  <p className="text-surface-500 dark:text-surface-400 mt-1">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="card-glass p-12 md:p-16 relative overflow-hidden"
          >
            <div className="absolute inset-0 gradient-primary opacity-5" />
            <h2 className="text-3xl sm:text-4xl font-bold text-surface-900 dark:text-white relative z-10">
              Ready to Start <span className="gradient-text">Learning for Free?</span>
            </h2>
            <p className="mt-4 text-surface-500 dark:text-surface-400 max-w-lg mx-auto relative z-10">
              Join thousands of learners who trade skills instead of paying for courses. Your next skill is one swap away.
            </p>
            <div className="mt-8 relative z-10">
              <Link to="/register" className="btn-primary text-lg px-10 py-4 shadow-xl">
                Create Free Account →
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-surface-200 dark:border-surface-800 py-8 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <span className="font-semibold text-surface-700 dark:text-surface-300">SkillSwap</span>
          </div>
          <p className="text-sm text-surface-400">© 2026 SkillSwap. Built with ♥ for learners everywhere.</p>
        </div>
      </footer>
    </div>
  );
}
