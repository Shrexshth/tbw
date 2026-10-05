import { useState, useEffect, useRef, useMemo } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import ToastContainer from './ToastContainer';

export default function Layout() {
  const navigate = useNavigate();
  const currentUser = useStore((s) => s.currentUser);
  const notifications = useStore((s) => s.notifications);
  const markNotificationRead = useStore((s) => s.markNotificationRead);
  const markAllNotificationsRead = useStore((s) => s.markAllNotificationsRead);
  const logout = useStore((s) => s.logout);
  const getPendingApprovals = useStore((s) => s.getPendingApprovals);
  const pendingApprovals = getPendingApprovals();

  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const role = currentUser?.role || 'partner';

  // ─── Compliance countdown ───
  const complianceInfo = useMemo(() => {
    const now = new Date();
    // GSTR-2B lock date: 14th of next month
    const lockDate = new Date(now.getFullYear(), now.getMonth() + 1, 14);
    const diffMs = lockDate.getTime() - now.getTime();
    const daysLeft = Math.max(0, Math.ceil(diffMs / 86400000));
    const isUrgent = daysLeft <= 3;
    const dateStr = lockDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    return { daysLeft, isUrgent, dateStr };
  }, []);

  // Nav items based on role
  const navItems = useMemo(() => {
    const base = [
      { path: '/dashboard', label: 'Dashboard', icon: 'grid_view' },
      { path: '/approvals', label: 'Approval Queue', icon: 'verified_user' },
      { path: '/data', label: 'Data', icon: 'folder_open' },
      { path: '/reports', label: 'Reports', icon: 'stacked_bar_chart' },
    ];
    // Only partner gets Settings
    if (role === 'partner') {
      base.push({ path: '/settings', label: 'Settings', icon: 'settings' });
    }
    return base;
  }, [role]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setNotifOpen(false); setProfileOpen(false); }
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleEsc);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const formatTime = (ts: string) => {
    const d = new Date(ts);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const hours = Math.floor(diff / 3600000);
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const roleLabel = role === 'partner' ? 'Senior Partner' : role === 'associate' ? 'Associate' : 'Trial Account';

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar — 220px fixed, pure black */}
      <aside className="w-[220px] min-w-[220px] max-w-[220px] bg-black flex flex-col justify-between border-r border-[#1f1f1f]">
        <div className="flex flex-col">
          <div className="h-16 px-4 flex items-center gap-2.5 border-b border-[#1f1f1f]">
            <div className="w-7 h-7 rounded-lg bg-[#6D4FF0] flex items-center justify-center text-white font-bold text-[13px]">R</div>
            <span className="text-[19px] font-bold tracking-tight text-white">Recon</span>
          </div>
          <div className="p-3">
            <nav className="flex flex-col gap-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-3 py-2 text-[13px] font-medium transition-all ${
                      isActive
                        ? 'bg-[#6D4FF0] text-white font-semibold rounded-lg shadow-sm'
                        : 'text-[#9ca3af] hover:text-white hover:bg-[#1a1a1a] rounded-lg'
                    }`
                  }
                >
                  <span className="material-symbols-outlined text-[19px]">{item.icon}</span>
                  <span>{item.label}</span>
                  {item.path === '/approvals' && pendingApprovals > 0 && (
                    <span className="ml-auto px-1.5 py-0.5 rounded-full bg-[#6D4FF0]/20 text-[#c9beff] text-[10px] font-semibold min-w-[20px] text-center">
                      {pendingApprovals}
                    </span>
                  )}
                </NavLink>
              ))}
            </nav>
          </div>
        </div>

        {/* Partner Info Footer */}
        <div className="p-3 border-t border-[#1f1f1f]">
          <div
            className="flex items-center justify-between p-2 rounded-lg hover:bg-[#1a1a1a] cursor-pointer transition-colors"
            onClick={() => setProfileOpen(!profileOpen)}
          >
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-[#6D4FF0] flex-shrink-0 flex items-center justify-center text-white">
                <span className="material-symbols-outlined text-[18px]">person</span>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[13px] font-semibold text-white truncate">{currentUser?.name || 'User'}</span>
                <span className="text-[11px] text-zinc-400 truncate">{currentUser?.firmName || ''}</span>
              </div>
            </div>
            <span className="material-symbols-outlined text-zinc-500 text-[18px]">unfold_more</span>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Fixed Top Bar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 flex-shrink-0">
          <div className="flex items-center gap-6">
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-3.5 text-slate-400 text-[18px]">search</span>
              <input
                className="w-80 h-9 pl-9 pr-4 rounded-full bg-slate-50 border border-slate-200 text-slate-800 placeholder:text-slate-400 text-[13px] focus:outline-none focus:border-[#6D4FF0] focus:ring-2 focus:ring-[#6D4FF0]/20 transition-all"
                placeholder="Search invoices, vendors, clients"
                type="text"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Compliance Countdown Widget */}
            {role !== 'trial' && (
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${
                complianceInfo.isUrgent
                  ? 'bg-red-50 border-red-200'
                  : 'bg-amber-50 border-amber-200'
              }`}>
                <span className={`material-symbols-outlined text-[14px] ${
                  complianceInfo.isUrgent ? 'text-red-600' : 'text-amber-600'
                }`}>schedule</span>
                <span className={`text-[11px] font-semibold tracking-wide ${
                  complianceInfo.isUrgent ? 'text-red-700' : 'text-amber-700'
                }`}>
                  GSTR-2B locks in {complianceInfo.daysLeft}d
                </span>
                <span className={`text-[10px] ${
                  complianceInfo.isUrgent ? 'text-red-500' : 'text-amber-500'
                }`}>({complianceInfo.dateStr})</span>
              </div>
            )}

            {/* Live Sync pill */}
            {role !== 'trial' && (
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                <span className="text-[11px] font-semibold text-emerald-700 tracking-wide">Live Sync</span>
              </div>
            )}

            {/* Role badge */}
            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider border ${
              role === 'partner' ? 'bg-[#6D4FF0]/10 text-[#6D4FF0] border-[#6D4FF0]/20' :
              role === 'associate' ? 'bg-blue-50 text-blue-600 border-blue-200' :
              'bg-amber-50 text-amber-600 border-amber-200'
            }`}>
              {roleLabel}
            </span>

            {/* Notification bell */}
            <div ref={notifRef} className="relative">
              <button
                onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); }}
                className="relative p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">notifications</span>
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#6D4FF0] ring-2 ring-white" />
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 top-12 w-80 bg-white rounded-xl shadow-xl border border-slate-200 z-50 animate-slide-up overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                    <h3 className="text-[13px] font-semibold text-slate-900">Notifications</h3>
                    {unreadCount > 0 && (
                      <button
                        onClick={() => markAllNotificationsRead()}
                        className="text-[11px] text-[#6D4FF0] hover:text-[#5B3BDC] font-medium"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.map((n) => (
                      <button
                        key={n.id}
                        onClick={() => markNotificationRead(n.id)}
                        className={`w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors border-b border-slate-50 ${!n.read ? 'bg-[#E6DEFF]/30' : ''}`}
                      >
                        <div className="flex items-start gap-2">
                          {!n.read && <span className="w-2 h-2 rounded-full bg-[#6D4FF0] mt-1.5 flex-shrink-0" />}
                          <div className={!n.read ? '' : 'ml-4'}>
                            <p className="text-[13px] text-slate-700 leading-snug">{n.message}</p>
                            <p className="text-[11px] text-slate-400 mt-1">{formatTime(n.timestamp)}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Profile avatar */}
            <div ref={profileRef} className="relative">
              <button
                onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); }}
                className="w-8 h-8 rounded-full bg-[#6D4FF0] flex items-center justify-center text-white font-medium text-xs shadow-sm"
              >
                <span className="material-symbols-outlined text-[18px]">person</span>
              </button>

              {profileOpen && (
                <div className="absolute right-0 top-12 w-56 bg-white rounded-xl shadow-xl border border-slate-200 z-50 animate-slide-up overflow-hidden">
                  <div className="px-4 py-3 border-b border-slate-100">
                    <p className="text-[13px] font-semibold text-slate-900">{currentUser?.name}</p>
                    <p className="text-[11px] text-slate-500">{currentUser?.firmName} · {roleLabel}</p>
                  </div>
                  <div className="py-1">
                    {role === 'partner' && (
                      <button
                        onClick={() => { navigate('/settings'); setProfileOpen(false); }}
                        className="w-full text-left px-4 py-2.5 text-[13px] text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2"
                      >
                        <span className="material-symbols-outlined text-[18px]">settings</span>
                        Settings
                      </button>
                    )}
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2.5 text-[13px] text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                    >
                      <span className="material-symbols-outlined text-[18px]">logout</span>
                      Log out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-[#f8fafc]">
          <div className="p-8 max-w-7xl mx-auto w-full">
            <Outlet />
          </div>
        </main>
      </div>

      <ToastContainer />
    </div>
  );
}
