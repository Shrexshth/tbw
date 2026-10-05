import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';

const DEMO_ACCOUNTS = [
  { label: 'Partner / Admin', email: 'priya@sharmaassociates.in', password: 'demo1234', desc: 'Priya Sharma — Full access, all clients' },
  { label: 'Associate / Staff', email: 'rahul@sharmaassociates.in', password: 'demo1234', desc: 'Rahul Mehta — 3 clients, ₹10K approval cap' },
  { label: 'Trial / New Firm', email: 'demo@newfirm.in', password: 'demo1234', desc: 'Ankit Verma — Empty state, onboarding' },
];

export default function Login() {
  const navigate = useNavigate();
  const loginWithCredentials = useStore((s) => s.loginWithCredentials);
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string; name?: string; auth?: string }>({});
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showDemoPanel, setShowDemoPanel] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: typeof errors = {};
    if (!email.trim()) newErrors.email = 'Email is required';
    if (!password.trim()) newErrors.password = 'Password is required';
    if (isSignup && !name.trim()) newErrors.name = 'Firm name is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setLoading(true);
    setTimeout(() => {
      const user = loginWithCredentials(email.trim(), password.trim());
      if (user) {
        navigate('/dashboard');
      } else {
        setErrors({ auth: 'Invalid email or password. Try a demo account below.' });
        setLoading(false);
      }
    }, 800);
  };

  const handleGoogleLogin = () => {
    setGoogleLoading(true);
    setTimeout(() => {
      // Default to partner account for Google login
      loginWithCredentials('priya@sharmaassociates.in', 'demo1234');
      navigate('/dashboard');
    }, 1200);
  };

  const handleUseDemoAccount = (account: typeof DEMO_ACCOUNTS[0]) => {
    setEmail(account.email);
    setPassword(account.password);
    setErrors({});
    setIsSignup(false);
  };

  return (
    <div className="bg-[#F8F9FA] text-[#111111] antialiased min-h-screen flex items-center justify-center p-0 md:p-6 lg:p-10">
      <main className="w-full max-w-7xl">
        <div className="w-full min-h-[640px] lg:min-h-[760px] flex flex-col lg:flex-row rounded-2xl overflow-hidden shadow-2xl border border-neutral-200/70 bg-white">

          {/* LEFT PANEL: Pure Black */}
          <div className="w-full lg:w-1/2 bg-[#000000] text-white p-8 lg:p-14 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#6D4FF0]/15 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute top-1/2 -right-20 w-80 h-80 bg-[#6D4FF0]/10 rounded-full blur-[90px] pointer-events-none" />

            <div className="relative z-10 space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#111111] border border-[#222222]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#6D4FF0] animate-pulse" />
                <span className="text-[12px] text-neutral-300 font-medium tracking-wide">Human-approved reconciliation</span>
              </div>
              <div className="space-y-3 max-w-md">
                <h1 className="text-[30px] font-bold text-white tracking-[-0.03em] leading-[1.2]">
                  Turn every mismatch into <span className="text-[#6D4FF0]">recovered ITC.</span>
                </h1>
                <p className="text-[14px] text-neutral-400 font-normal leading-relaxed">
                  Recon drafts the reconciliation. You approve what matters.
                </p>
              </div>
            </div>

            <div className="relative z-10 my-10 max-w-sm w-full">
              <div className="bg-[#0D0D0D] border border-[#1F1F1F] rounded-xl p-4 shadow-xl backdrop-blur-sm">
                <div className="flex items-center justify-between pb-3 border-b border-[#1A1A1A]">
                  <div className="flex flex-col">
                    <span className="text-[11px] text-neutral-500 uppercase font-medium tracking-wider">Live Queue</span>
                    <span className="text-[14px] font-bold text-neutral-100">Latest review · Sharma Enterprises</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-[#6D4FF0]/20 text-[#c9beff] text-[11px] font-medium">2 ready</span>
                </div>
                <div className="pt-3 space-y-2">
                  {[
                    { icon: 'receipt_long', title: 'Invoice #INV-2291', sub: '₹42,850 · Eligible GSTR-2B' },
                    { icon: 'verified_user', title: 'Vendor filing status', sub: 'Return filed on-time' },
                  ].map((row, i) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-[#141414] border border-transparent">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-md bg-[#202020] flex items-center justify-center text-neutral-300">
                          <span className="material-symbols-outlined text-[15px]">{row.icon}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[13px] text-neutral-200 font-medium leading-tight">{row.title}</span>
                          <span className="text-[11px] text-neutral-500">{row.sub}</span>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-md bg-[#222222] text-neutral-300 text-[11px] font-medium">Approve</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="relative z-10 pt-4 border-t border-[#181818] flex items-center justify-between text-neutral-500 text-[11px]">
              <span className="tracking-wide uppercase">RECON AUDIT SYSTEM v4.2</span>
              <span className="flex items-center gap-1.5 text-neutral-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                256-bit State Bank grade security
              </span>
            </div>
          </div>

          {/* RIGHT PANEL: White form */}
          <div className="w-full lg:w-1/2 bg-[#FFFFFF] p-8 lg:p-14 flex flex-col justify-center items-center overflow-y-auto">
            <div className="w-full max-w-sm flex flex-col justify-center">
              {/* Segmented Tab Switcher */}
              <div className="bg-neutral-100 p-1 rounded-xl flex items-center mb-7 border border-neutral-200/80">
                <button
                  onClick={() => { setIsSignup(false); setErrors({}); }}
                  className={`w-1/2 py-1.5 text-center rounded-[9px] text-[13px] transition-all ${
                    !isSignup ? 'shadow-sm bg-white text-neutral-900 font-semibold' : 'text-neutral-500 hover:text-neutral-800 font-medium'
                  }`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => { setIsSignup(true); setErrors({}); }}
                  className={`w-1/2 py-1.5 text-center rounded-[9px] text-[13px] transition-all ${
                    isSignup ? 'shadow-sm bg-white text-neutral-900 font-semibold' : 'text-neutral-500 hover:text-neutral-800 font-medium'
                  }`}
                >
                  Create Account
                </button>
              </div>

              <div className="mb-5 space-y-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 block">
                  {isSignup ? 'Get started' : 'Welcome back'}
                </span>
                <h2 className="text-[20px] font-bold text-neutral-950 tracking-[-0.03em]">
                  {isSignup ? 'Create your workspace' : 'Sign in to your workspace'}
                </h2>
              </div>

              {errors.auth && (
                <div className="mb-4 px-3 py-2.5 rounded-lg bg-red-50 border border-red-200 text-[13px] text-red-700 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px]">error</span>
                  {errors.auth}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3.5">
                {isSignup && (
                  <div className="space-y-1">
                    <label className="text-[13px] font-medium text-neutral-800 block">Firm name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => { setName(e.target.value); setErrors((p) => ({ ...p, name: undefined })); }}
                      placeholder="e.g. K.S. Rao & Co."
                      className={`w-full h-10 px-3 bg-white border ${errors.name ? 'border-red-400' : 'border-neutral-300'} rounded-[10px] text-[14px] text-neutral-900 placeholder:text-neutral-400 focus:border-[#6D4FF0] focus:outline-none focus:ring-2 focus:ring-[#6D4FF0]/15 transition-all`}
                    />
                    {errors.name && <p className="text-[11px] text-red-500 mt-0.5">{errors.name}</p>}
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-[13px] font-medium text-neutral-800 block">Work email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: undefined, auth: undefined })); }}
                    placeholder="you@firm.in"
                    className={`w-full h-10 px-3 bg-white border ${errors.email ? 'border-red-400' : 'border-neutral-300'} rounded-[10px] text-[14px] text-neutral-900 placeholder:text-neutral-400 focus:border-[#6D4FF0] focus:outline-none focus:ring-2 focus:ring-[#6D4FF0]/15 transition-all`}
                  />
                  {errors.email && <p className="text-[11px] text-red-500 mt-0.5">{errors.email}</p>}
                </div>

                <div className="space-y-1">
                  <label className="text-[13px] font-medium text-neutral-800 block">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: undefined, auth: undefined })); }}
                    placeholder="••••••••"
                    className={`w-full h-10 px-3 bg-white border ${errors.password ? 'border-red-400' : 'border-neutral-300'} rounded-[10px] text-[14px] text-neutral-900 placeholder:text-neutral-400 focus:border-[#6D4FF0] focus:outline-none focus:ring-2 focus:ring-[#6D4FF0]/15 transition-all`}
                  />
                  {errors.password && <p className="text-[11px] text-red-500 mt-0.5">{errors.password}</p>}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-10 rounded-[10px] bg-[#6D4FF0] hover:bg-[#5B3BDC] text-white font-semibold text-[14px] transition-all shadow-sm disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin-slow" />
                      {isSignup ? 'Creating...' : 'Signing in...'}
                    </>
                  ) : (
                    isSignup ? 'Create workspace' : 'Sign in'
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="relative my-5">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-neutral-200" />
                </div>
                <div className="relative flex justify-center text-[11px]">
                  <span className="bg-white px-3 text-neutral-400 uppercase tracking-wider font-medium">or</span>
                </div>
              </div>

              {/* Google */}
              <button
                onClick={handleGoogleLogin}
                disabled={googleLoading}
                className="w-full h-10 rounded-[10px] border border-neutral-300 bg-white text-neutral-800 font-medium text-[14px] hover:bg-neutral-50 transition-all flex items-center justify-center gap-3 disabled:opacity-60"
              >
                {googleLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-neutral-300 border-t-neutral-600 rounded-full animate-spin-slow" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Continue with Google
                  </>
                )}
              </button>

              {/* Demo Accounts Panel */}
              <div className="mt-6">
                <button
                  onClick={() => setShowDemoPanel(!showDemoPanel)}
                  className="flex items-center gap-1.5 text-[12px] text-neutral-400 hover:text-neutral-600 transition-colors mx-auto"
                >
                  <span className="material-symbols-outlined text-[14px]">{showDemoPanel ? 'expand_less' : 'expand_more'}</span>
                  Demo accounts
                </button>

                {showDemoPanel && (
                  <div className="mt-3 space-y-2 animate-slide-up">
                    {DEMO_ACCOUNTS.map((account) => (
                      <button
                        key={account.email}
                        onClick={() => handleUseDemoAccount(account)}
                        className={`w-full text-left px-3 py-2.5 rounded-xl border transition-all ${
                          email === account.email
                            ? 'border-[#6D4FF0]/40 bg-[#6D4FF0]/5'
                            : 'border-neutral-200 hover:border-neutral-300 bg-neutral-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-[12px] font-semibold text-neutral-800">{account.label}</p>
                            <p className="text-[11px] text-neutral-500 mt-0.5">{account.desc}</p>
                          </div>
                          <span className="text-[11px] text-[#6D4FF0] font-medium">Use →</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <p className="mt-4 text-center text-[12px] text-neutral-400">
                By continuing, you agree to Recon's Terms of Service
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
