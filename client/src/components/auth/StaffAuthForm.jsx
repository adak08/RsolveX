import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, User, Hash, Phone, KeyRound, ArrowRight } from 'lucide-react';
import api from '../../api/axios';
import { errMsg } from '../../utils/helpers';

export default function StaffAuthForm({ onSuccess }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({
    name: '', email: '', password: '', phone: '', staffId: '', workspaceCode: '', otp: '',
  });
  const [showPw, setShowPw]         = useState(false);
  const [otpSent, setOtpSent]       = useState(false); // login OTP flow
  const [regOtpSent, setRegOtpSent] = useState(false); // register OTP flow
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');
  const [timer, setTimer]           = useState(0);
  const [regTimer, setRegTimer]     = useState(0);

  const f = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  const startTimer = (setter) => {
    setter(60);
    const t = setInterval(() => setter(v => {
      if (v <= 1) { clearInterval(t); return 0; }
      return v - 1;
    }), 1000);
  };

  const switchMode = (m) => {
    setMode(m); setError('');
    setOtpSent(false); setRegOtpSent(false);
    setForm(p => ({ ...p, otp: '' }));
  };

  // ── Password login ────────────────────────────────────────────────────────────
  const handleLogin = async () => {
    setLoading(true); setError('');
    try {
      const res = await api.post('/api/staff/login', {
        staffIdOrEmail: form.staffId || form.email,
        password: form.password,
      });
      localStorage.setItem('staffToken', res.data.accessToken);
      localStorage.setItem('staffData', JSON.stringify(res.data.staff));
      window.dispatchEvent(new Event('userLogin'));
      onSuccess('staff');
    } catch (e) { setError(errMsg(e)); } finally { setLoading(false); }
  };

  // ── OTP login ─────────────────────────────────────────────────────────────────
  const sendLoginOtp = async () => {
    setLoading(true); setError('');
    try {
      await api.post('/api/otp/request', {
        identifier: form.email, purpose: 'login', type: 'email', userType: 'staff',
      });
      setOtpSent(true);
      startTimer(setTimer);
    } catch (e) { setError(errMsg(e)); } finally { setLoading(false); }
  };

  const handleOtpLogin = async () => {
    setLoading(true); setError('');
    try {
      // Backend expects { identifier, otp } — not { email, otp }
      const res = await api.post('/api/otp/login/staff', { identifier: form.email, otp: form.otp });
      localStorage.setItem('staffToken', res.data.accessToken);
      localStorage.setItem('staffData', JSON.stringify(res.data.staff));
      window.dispatchEvent(new Event('userLogin'));
      onSuccess('staff');
    } catch (e) { setError(errMsg(e)); } finally { setLoading(false); }
  };

  // ── Register ──────────────────────────────────────────────────────────────────
  const sendRegisterOtp = async () => {
    setLoading(true); setError('');
    try {
      await api.post('/api/otp/request', {
        identifier: form.email, purpose: 'signup', type: 'email', userType: 'staff',
      });
      setRegOtpSent(true);
      startTimer(setRegTimer);
    } catch (e) { setError(errMsg(e)); } finally { setLoading(false); }
  };

  const handleRegister = async () => {
    setLoading(true); setError('');
    try {
      // Backend requires: name, email, password, staffId, otp (phone optional)
      const res = await api.post('/api/staff/register', {
        name:     form.name,
        email:    form.email,
        password: form.password,
        phone:    form.phone,
        staffId:  form.staffId,
        otp:      form.otp,
      });
      localStorage.setItem('staffToken', res.data.accessToken);
      localStorage.setItem('staffData', JSON.stringify(res.data.staff));
      // Join workspace after we have a valid token
      if (form.workspaceCode) {
        try { await api.post('/api/workspace/join/staff', { workspaceCode: form.workspaceCode }); } catch {}
      }
      window.dispatchEvent(new Event('userLogin'));
      onSuccess('staff');
    } catch (e) { setError(errMsg(e)); } finally { setLoading(false); }
  };

  return (
    <div className="space-y-4 pt-2">
      {error && (
        <div className="p-3 rounded-xl text-sm text-red-600 bg-red-50 dark:bg-red-950/30">{error}</div>
      )}

      {/* Mode tabs */}
      <div className="flex gap-2 text-xs">
        {[['login', 'Staff Login'], ['otp-login', 'OTP Login'], ['register', 'Register']].map(([m, l]) => (
          <button
            key={m}
            onClick={() => switchMode(m)}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${mode === m ? 'bg-orange-100 dark:bg-orange-900/30' : ''}`}
            style={{ color: mode === m ? 'var(--accent)' : 'var(--text-muted)' }}
          >{l}</button>
        ))}
      </div>

      {/* ── Password Login ── */}
      {mode === 'login' && (
        <>
          <div className="space-y-3">
            <div className="relative">
              <Hash size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
              <input className="input pl-10" placeholder="Staff ID or Email" value={form.staffId} onChange={f('staffId')} />
            </div>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
              <input className="input pl-10 pr-10" placeholder="Password" value={form.password} onChange={f('password')} type={showPw ? 'text' : 'password'} />
              <button onClick={() => setShowPw(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }}>
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <button
            onClick={handleLogin}
            disabled={loading || !form.staffId || !form.password}
            className="btn-primary w-full justify-center disabled:opacity-50"
          >
            {loading ? 'Signing in…' : 'Sign In'} {!loading && <ArrowRight size={16} />}
          </button>
        </>
      )}

      {/* ── OTP Login ── */}
      {mode === 'otp-login' && (
        <>
          <div className="relative">
            <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
            <input className="input pl-10" placeholder="Registered email" value={form.email} onChange={f('email')} type="email" />
          </div>
          {otpSent && (
            <div className="relative">
              <KeyRound size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
              <input className="input pl-10" placeholder="Enter OTP" value={form.otp} onChange={f('otp')} maxLength={6} />
            </div>
          )}
          {!otpSent ? (
            <button onClick={sendLoginOtp} disabled={loading || !form.email} className="btn-primary w-full justify-center disabled:opacity-50">
              {loading ? 'Sending…' : 'Send OTP'}
            </button>
          ) : (
            <div className="space-y-2">
              <button onClick={handleOtpLogin} disabled={loading || !form.otp} className="btn-primary w-full justify-center disabled:opacity-50">
                {loading ? 'Verifying…' : 'Verify & Sign In'}
              </button>
              <button onClick={sendLoginOtp} disabled={timer > 0 || loading} className="btn-ghost w-full justify-center text-xs disabled:opacity-50">
                {timer > 0 ? `Resend in ${timer}s` : 'Resend OTP'}
              </button>
            </div>
          )}
        </>
      )}

      {/* ── Register ── */}
      {mode === 'register' && (
        <>
          <div className="space-y-3">
            <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
              <input className="input pl-10" placeholder="Full name" value={form.name} onChange={f('name')} />
            </div>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
              <input className="input pl-10" placeholder="Email" value={form.email} onChange={f('email')} type="email" />
            </div>
            <div className="relative">
              <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
              <input className="input pl-10" placeholder="Phone (10 digits)" value={form.phone} onChange={f('phone')} maxLength={10} />
            </div>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
              <input className="input pl-10 pr-10" placeholder="Password" value={form.password} onChange={f('password')} type={showPw ? 'text' : 'password'} />
              <button onClick={() => setShowPw(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }}>
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <div className="relative">
              <Hash size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
              <input className="input pl-10" placeholder="Staff ID (e.g. STAFF001)" value={form.staffId} onChange={f('staffId')} />
            </div>
            <div className="relative">
              <Hash size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
              <input className="input pl-10" placeholder="Workspace code (from admin)" value={form.workspaceCode} onChange={f('workspaceCode')} />
            </div>
          </div>

          {/* Step 1 — verify email with OTP before creating account */}
          {!regOtpSent ? (
            <button
              onClick={sendRegisterOtp}
              disabled={loading || !form.email || !form.name || !form.password || !form.staffId}
              className="btn-secondary w-full justify-center disabled:opacity-50"
            >
              {loading ? 'Sending OTP…' : 'Send Verification OTP'}
            </button>
          ) : (
            <>
              <div className="relative">
                <KeyRound size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                <input className="input pl-10" placeholder="Enter OTP from email" value={form.otp} onChange={f('otp')} maxLength={6} />
              </div>
              <div className="space-y-2">
                <button
                  onClick={handleRegister}
                  disabled={loading || !form.otp}
                  className="btn-primary w-full justify-center disabled:opacity-50"
                >
                  {loading ? 'Registering…' : 'Complete Registration'} {!loading && <ArrowRight size={16} />}
                </button>
                <button
                  onClick={sendRegisterOtp}
                  disabled={regTimer > 0 || loading}
                  className="btn-ghost w-full justify-center text-xs disabled:opacity-50"
                >
                  {regTimer > 0 ? `Resend in ${regTimer}s` : 'Resend OTP'}
                </button>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
