import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, KeyRound, ArrowRight, Plus } from 'lucide-react';
import api from '../../api/axios';
import { errMsg } from '../../utils/helpers';

export default function AdminAuthForm({ onSuccess, onCreateWorkspace }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ email: '', password: '', otp: '' });
  const [showPw, setShowPw] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(0);

  const f = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));
  const startTimer = () => {
    setTimer(60);
    const t = setInterval(() => setTimer(v => { if (v <= 1) { clearInterval(t); return 0; } return v - 1; }), 1000);
  };

  const handleLogin = async () => {
    setLoading(true); setError('');
    try {
      const res = await api.post('/api/admin/login', { adminId: form.email, password: form.password });
      const accessToken = res.data?.accessToken || res.data?.data?.accessToken;
      const admin = res.data?.admin || res.data?.data?.admin;
      if (!accessToken || !admin) throw new Error('Invalid admin login response from server');
      localStorage.setItem('adminToken', accessToken);
      localStorage.setItem('adminData', JSON.stringify(admin));
      window.dispatchEvent(new Event('userLogin'));
      onSuccess('admin');
    } catch (e) { setError(errMsg(e)); } finally { setLoading(false); }
  };

  const sendOtp = async () => {
    setLoading(true); setError('');
    try {
      await api.post('/api/otp/request', { identifier: form.email, purpose: 'login', type: 'email', userType: 'admin' });
      setOtpSent(true); startTimer();
    } catch (e) { setError(errMsg(e)); } finally { setLoading(false); }
  };

  const handleOtpLogin = async () => {
    setLoading(true); setError('');
    try {
      const res = await api.post('/api/otp/login/admin', { identifier: form.email, otp: form.otp });
      const accessToken = res.data?.accessToken || res.data?.data?.accessToken;
      const admin = res.data?.admin || res.data?.data?.admin;
      if (!accessToken || !admin) throw new Error('Invalid admin login response from server');
      localStorage.setItem('adminToken', accessToken);
      localStorage.setItem('adminData', JSON.stringify(admin));
      window.dispatchEvent(new Event('userLogin'));
      onSuccess('admin');
    } catch (e) { setError(errMsg(e)); } finally { setLoading(false); }
  };

  return (
    <div className="space-y-4 pt-2">
      {error && <div className="p-3 rounded-xl text-sm text-red-600 bg-red-50 dark:bg-red-950/30">{error}</div>}

      <div className="flex gap-2 text-xs">
        {[['login','Password'],['otp-login','OTP']].map(([m,l]) => (
          <button key={m} onClick={() => { setMode(m); setError(''); setOtpSent(false); }}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${mode === m ? 'bg-orange-100 dark:bg-orange-900/30' : ''}`}
            style={{ color: mode === m ? 'var(--accent)' : 'var(--text-muted)' }}>{l}
          </button>
        ))}
      </div>

      {mode === 'login' && (
        <>
          <div className="space-y-3">
            <div className="relative"><Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} /><input className="input pl-10" placeholder="Admin email" value={form.email} onChange={f('email')} type="email" /></div>
            <div className="relative"><Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} /><input className="input pl-10 pr-10" placeholder="Password" value={form.password} onChange={f('password')} type={showPw ? 'text' : 'password'} /><button onClick={() => setShowPw(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }}>{showPw ? <EyeOff size={16} /> : <Eye size={16} />}</button></div>
          </div>
          <button onClick={handleLogin} disabled={loading || !form.email || !form.password} className="btn-primary w-full justify-center disabled:opacity-50">{loading ? 'Signing in…' : 'Sign In'} {!loading && <ArrowRight size={16} />}</button>
        </>
      )}

      {mode === 'otp-login' && (
        <>
          <div className="relative"><Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} /><input className="input pl-10" placeholder="Admin email" value={form.email} onChange={f('email')} type="email" /></div>
          {otpSent && <div className="relative"><KeyRound size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} /><input className="input pl-10" placeholder="Enter OTP" value={form.otp} onChange={f('otp')} maxLength={6} /></div>}
          {!otpSent
            ? <button onClick={sendOtp} disabled={loading || !form.email} className="btn-primary w-full justify-center disabled:opacity-50">{loading ? 'Sending…' : 'Send OTP'}</button>
            : <div className="space-y-2">
                <button onClick={handleOtpLogin} disabled={loading || !form.otp} className="btn-primary w-full justify-center disabled:opacity-50">{loading ? 'Verifying…' : 'Verify & Sign In'}</button>
                <button onClick={sendOtp} disabled={timer > 0 || loading} className="btn-ghost w-full justify-center text-xs disabled:opacity-50">{timer > 0 ? `Resend in ${timer}s` : 'Resend OTP'}</button>
              </div>
          }
        </>
      )}

      <div className="pt-2" style={{ borderTop: '1px solid var(--border)' }}>
        <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>Don't have a workspace yet?</p>
        <button onClick={onCreateWorkspace} className="btn-secondary w-full justify-center text-sm">
          <Plus size={15} /> Create New Workspace
        </button>
      </div>
    </div>
  );
}
