import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight, Zap, MapPin, Users, CheckCircle, Shield, Clock,
  BarChart3, MessageSquare, Star, Building2, ChevronDown, Sun, Moon
} from 'lucide-react';
import ThemeToggle from '../../components/common/ThemeToggle';
import { useAuth } from '../../context/AuthContext';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5, ease: 'easeOut' } }),
};

const features = [
  { icon: Zap, title: 'Instant Reporting', desc: 'File complaints in seconds with location, photos, and priority tagging.', color: 'bg-orange-500' },
  { icon: MapPin, title: 'Location Tracking', desc: 'Pin-point complaint locations on a map for faster resolution.', color: 'bg-blue-500' },
  { icon: Users, title: 'Community Voting', desc: 'Upvote critical issues to prioritise them for faster admin attention.', color: 'bg-violet-500' },
  { icon: BarChart3, title: 'Live Analytics', desc: 'Admins get real-time dashboards with trends, heatmaps and reports.', color: 'bg-teal-500' },
  { icon: MessageSquare, title: 'Built-in Chat', desc: 'Staff and admins coordinate directly on complaint threads.', color: 'bg-rose-500' },
  { icon: Shield, title: 'Workspace Isolation', desc: 'Each organisation gets its own private, code-protected workspace.', color: 'bg-amber-500' },
];

const stats = [
  { label: 'Issues Resolved', value: '50K+' },
  { label: 'Active Workspaces', value: '1.2K+' },
  { label: 'Avg. Resolution', value: '< 48h' },
  { label: 'Satisfaction Rate', value: '96%' },
];

const workspaceTypes = [
  { icon: '🎓', label: 'Colleges & Universities' },
  { icon: '🏛️', label: 'Municipalities' },
  { icon: '🏘️', label: 'Housing Societies' },
  { icon: '🏢', label: 'RWAs & Corporates' },
];

export default function LandingPage({ openAuthModal }) {
  const navigate = useNavigate();
  const { authStatus } = useAuth();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  useEffect(() => {
    if (authStatus.isAuthenticated) {
      if (authStatus.userRole === 'admin') navigate('/admin/dashboard');
      else if (authStatus.userRole === 'staff') navigate('/staff/dashboard');
      else navigate('/home');
    }
  }, [authStatus]);

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      {/* Navbar */}
      <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? 'shadow-sm' : ''}`}
        style={{ background: scrolled ? 'var(--bg-primary)' : 'transparent', borderBottom: scrolled ? '1px solid var(--border)' : 'none' }}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-md">
              <span className="text-white font-display font-700 text-sm">R</span>
            </div>
            <span className="font-display font-700 text-lg" style={{ color: 'var(--text-primary)' }}>ResolveX</span>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <button onClick={() => openAuthModal?.('user')} className="btn-ghost text-sm hidden md:inline-flex">Sign In</button>
            <button onClick={() => openAuthModal?.('user')} className="btn-primary text-sm">Get Started</button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-24 px-6 relative overflow-hidden">
        {/* Background blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-10 left-1/4 w-72 h-72 bg-orange-200 dark:bg-orange-900 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-20 animate-pulse-slow" />
          <div className="absolute top-32 right-1/4 w-72 h-72 bg-red-200 dark:bg-red-900 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-20 animate-pulse-slow" style={{ animationDelay: '1s' }} />
          <div className="absolute -bottom-10 left-1/2 w-96 h-96 bg-amber-100 dark:bg-amber-900 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-10" />
        </div>

        <div className="max-w-4xl mx-auto text-center relative">
          <motion.div variants={fadeUp} initial="hidden" animate="show" custom={0}>
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-6"
              style={{ background: 'var(--accent-light)', color: 'var(--accent)', border: '1px solid var(--border)' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
              Smart Complaint Resolution Platform
            </span>
          </motion.div>

          <motion.h1 variants={fadeUp} initial="hidden" animate="show" custom={1}
            className="font-display font-800 text-5xl md:text-6xl lg:text-7xl leading-none tracking-tight mb-6"
            style={{ color: 'var(--text-primary)' }}>
            Resolve Issues.{' '}
            <span style={{ color: 'var(--accent)' }}>Together.</span>
          </motion.h1>

          <motion.p variants={fadeUp} initial="hidden" animate="show" custom={2}
            className="text-lg md:text-xl leading-relaxed mb-10 max-w-2xl mx-auto"
            style={{ color: 'var(--text-secondary)' }}>
            A workspace-based complaint platform for colleges, municipalities, and housing societies.
            Report, track, and resolve community issues — fast.
          </motion.p>

          <motion.div variants={fadeUp} initial="hidden" animate="show" custom={3}
            className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => openAuthModal?.('user')}
              className="btn-primary text-base py-3 px-7 shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40"
            >
              Start for Free <ArrowRight size={18} />
            </button>
            <button
              onClick={() => openAuthModal?.('admin')}
              className="btn-secondary text-base py-3 px-7"
            >
              <Building2 size={18} /> Create Workspace
            </button>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-14 px-6" style={{ borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', background: 'var(--bg-secondary)' }}>
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s, i) => (
            <motion.div key={s.label} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} custom={i} className="text-center">
              <p className="font-display font-800 text-3xl md:text-4xl" style={{ color: 'var(--accent)' }}>{s.value}</p>
              <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="text-center mb-14">
            <h2 className="font-display font-700 text-3xl md:text-4xl mb-4" style={{ color: 'var(--text-primary)' }}>
              Everything you need
            </h2>
            <p className="text-base" style={{ color: 'var(--text-secondary)' }}>
              Built for real communities. Packed with tools that actually matter.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <motion.div key={f.title} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} custom={i % 3}
                className="card-hover">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${f.color}`}>
                  <f.icon size={20} className="text-white" />
                </div>
                <h3 className="font-display font-600 text-base mb-2" style={{ color: 'var(--text-primary)' }}>{f.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Who is it for */}
      <section className="py-20 px-6" style={{ background: 'var(--bg-secondary)' }}>
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2 variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
            className="font-display font-700 text-3xl mb-3" style={{ color: 'var(--text-primary)' }}>
            Built for every community
          </motion.h2>
          <motion.p variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} custom={1}
            className="text-base mb-10" style={{ color: 'var(--text-secondary)' }}>
            One platform. Multiple workspace types. Endless possibilities.
          </motion.p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {workspaceTypes.map((w, i) => (
              <motion.div key={w.label} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} custom={i}
                className="card-hover text-center py-6">
                <p className="text-3xl mb-3">{w.icon}</p>
                <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>{w.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.h2 variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
            className="font-display font-700 text-3xl text-center mb-12" style={{ color: 'var(--text-primary)' }}>
            How it works
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { step: '01', title: 'Join a Workspace', desc: 'Get the workspace code from your admin and sign up as a citizen.', icon: Users },
              { step: '02', title: 'Report an Issue', desc: 'Describe the problem, attach photos, pin the location — done in seconds.', icon: Zap },
              { step: '03', title: 'Track & Resolve', desc: 'Watch real-time status updates as staff resolve your complaint.', icon: CheckCircle },
            ].map((s, i) => (
              <motion.div key={s.step} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} custom={i}
                className="card relative">
                <span className="absolute -top-3 -left-3 w-8 h-8 rounded-xl bg-orange-500 text-white text-xs font-display font-700 flex items-center justify-center shadow-md">
                  {s.step}
                </span>
                <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center mb-4">
                  <s.icon size={20} className="text-orange-500" />
                </div>
                <h3 className="font-display font-600 text-base mb-2" style={{ color: 'var(--text-primary)' }}>{s.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
          className="max-w-2xl mx-auto text-center rounded-3xl p-12"
          style={{ background: 'linear-gradient(135deg, #ea580c 0%, #9a3412 100%)' }}>
          <h2 className="font-display font-700 text-3xl text-white mb-3">Ready to get started?</h2>
          <p className="text-orange-100 mb-8">Join thousands of communities already using ResolveX</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button onClick={() => openAuthModal?.('user')}
              className="flex items-center justify-center gap-2 bg-white text-orange-600 font-medium py-3 px-7 rounded-xl hover:bg-orange-50 transition-colors">
              Sign Up Free <ArrowRight size={16} />
            </button>
            <button onClick={() => openAuthModal?.('admin')}
              className="flex items-center justify-center gap-2 bg-white/10 text-white font-medium py-3 px-7 rounded-xl hover:bg-white/20 transition-colors border border-white/20">
              <Building2 size={16} /> Create Workspace
            </button>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 text-center" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
            <span className="text-white font-display font-700 text-xs">R</span>
          </div>
          <span className="font-display font-600" style={{ color: 'var(--text-primary)' }}>ResolveX</span>
        </div>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Smart complaint management for modern communities.</p>
      </footer>
    </div>
  );
}
