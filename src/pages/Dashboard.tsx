import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { SkeletonCard, SkeletonTable } from '../components/Skeleton';
import { StatusBadge } from '../components/UIComponents';

export default function Dashboard() {
  const navigate = useNavigate();
  const currentUser = useStore((s) => s.currentUser);
  const getScopedClients = useStore((s) => s.getScopedClients);
  const getScopedInvoices = useStore((s) => s.getScopedInvoices);
  const getScopedMismatches = useStore((s) => s.getScopedMismatches);
  const getPendingApprovals = useStore((s) => s.getPendingApprovals);
  const onboardingSteps = useStore((s) => s.onboardingSteps);

  const clients = getScopedClients();
  const invoices = getScopedInvoices();
  const mismatches = getScopedMismatches();
  const pendingApprovals = getPendingApprovals();
  const toggleOnboardingStep = useStore((s) => s.toggleOnboardingStep);
  const onboardingDismissed = useStore((s) => s.onboardingDismissed);
  const dismissOnboarding = useStore((s) => s.dismissOnboarding);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  const totalITC = invoices.reduce((sum, inv) => sum + inv.cgst + inv.sgst + inv.igst, 0);
  const itcAtRisk = mismatches.filter(m => m.matchStatus === 'mismatch' && !m.resolved).reduce((sum, m) => sum + m.variance, 0);
  const resolvedCount = mismatches.filter((m) => m.resolved).length;
  const vendorsAwaiting = mismatches.filter(m => m.vendorContacted).length;

  const formatINR = (v: number) => {
    if (v >= 100000) return `₹${(v / 100000).toFixed(2).replace(/\.?0+$/, '')}L`;
    return `₹${v.toLocaleString('en-IN')}`;
  };

  const formatDate = (ts: string) => {
    const d = new Date(ts);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const role = currentUser?.role || 'partner';
  const isTrial = role === 'trial';

  // Multi-client rollup for Partner
  const rankedClients = clients.map(client => {
    const clientMismatches = mismatches.filter(m => m.clientId === client.id && !m.resolved && m.matchStatus !== 'matched');
    const risk = clientMismatches.reduce((sum, m) => sum + m.variance, 0);
    return { ...client, risk, pending: clientMismatches.length };
  }).sort((a, b) => b.risk - a.risk);

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-[22px] font-bold text-slate-900 tracking-[-0.025em]">Dashboard</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
        <SkeletonTable rows={6} cols={5} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-[22px] font-bold text-slate-900 tracking-[-0.025em] leading-tight">Dashboard</h1>
        <div className="flex items-center gap-2 text-[12px] text-slate-500">
          <span className="uppercase tracking-wider font-semibold">Financial Year 2026–27</span>
          <span className="w-1 h-1 rounded-full bg-slate-300" />
          <span className="font-medium">Q2 Sep Tax Period</span>
        </div>
      </div>

      {isTrial && !onboardingDismissed && (
        <div className="bg-white rounded-2xl p-6 border border-[#6D4FF0]/30 shadow-sm relative">
          <button 
            onClick={dismissOnboarding}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
          <h2 className="text-[16px] font-bold text-slate-900 mb-2">Welcome to Recon</h2>
          <p className="text-[13px] text-slate-600 mb-6">Complete these steps to set up your workspace.</p>
          <div className="space-y-3 max-w-md">
            {onboardingSteps.map(step => (
              <div 
                key={step.id} 
                className="flex items-center gap-3 cursor-pointer group"
                onClick={() => toggleOnboardingStep(step.id)}
              >
                <div className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${
                  step.completed ? 'bg-[#6D4FF0] border-[#6D4FF0] text-white' : 'border-slate-300 group-hover:border-[#6D4FF0]'
                }`}>
                  {step.completed && <span className="material-symbols-outlined text-[14px]">check</span>}
                </div>
                <span className={`text-[14px] ${step.completed ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {isTrial ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-center items-center h-[152px] text-slate-400">
              <span className="material-symbols-outlined text-[24px] mb-2 opacity-50">hourglass_empty</span>
              <span className="text-[12px] font-medium">No data yet</span>
            </div>
          ))
        ) : (
          <>
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between h-[152px]">
              <div>
                <span className="text-[12px] font-semibold uppercase tracking-wider text-slate-500">ITC at Risk</span>
                <div className="text-[24px] font-bold text-slate-900 tracking-[-0.025em] mt-1 tabular-nums">{formatINR(itcAtRisk)}</div>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-50 text-red-700 text-[11px] font-semibold">
                  <span className="material-symbols-outlined text-[13px]">arrow_upward</span>
                  {mismatches.filter(m => m.matchStatus === 'mismatch' && !m.resolved).length} mismatched
                </span>
                <span className="text-[12px] text-slate-500">{mismatches.filter(m => !m.resolved).length} open</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between h-[152px]">
              <div>
                <span className="text-[12px] font-semibold uppercase tracking-wider text-slate-500">ITC Recovered This Month</span>
                <div className="text-[24px] font-bold text-slate-900 tracking-[-0.025em] mt-1 tabular-nums">{formatINR(totalITC)}</div>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-semibold">
                  <span className="material-symbols-outlined text-[13px]">arrow_upward</span>
                  12.4% velocity
                </span>
                <div className="w-14 h-5 flex items-center">
                  <svg className="w-full h-full text-emerald-600" fill="none" preserveAspectRatio="none" viewBox="0 0 64 24">
                    <path d="M0 20 L12 16 L24 18 L36 9 L48 12 L64 2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                    <path d="M0 20 L12 16 L24 18 L36 9 L48 12 L64 2 L64 24 L0 24 Z" fill="currentColor" fillOpacity="0.1" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between h-[152px]">
              <div>
                <span className="text-[12px] font-semibold uppercase tracking-wider text-slate-500">Pending Approvals</span>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <span className="text-[24px] font-bold text-slate-900 tracking-[-0.025em] tabular-nums">{pendingApprovals}</span>
                  <span className="text-[12px] text-slate-500 font-normal">invoices</span>
                </div>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#6D4FF0]" />
                  {resolvedCount} resolved
                </span>
                <span className="text-[12px] text-slate-500">{clients.length} clients</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between h-[152px]">
              <div>
                <span className="text-[12px] font-semibold uppercase tracking-wider text-slate-500">Vendors Awaiting Response</span>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <span className="text-[24px] font-bold text-slate-900 tracking-[-0.025em] tabular-nums">{vendorsAwaiting}</span>
                  <span className="text-[12px] text-slate-500 font-normal">entities</span>
                </div>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <span className="inline-flex items-center gap-1 text-[11px] text-slate-600 font-medium">
                  <span className="material-symbols-outlined text-[13px]">schedule</span>
                  1.8d avg turnaround
                </span>
                <span className="text-[12px] text-slate-500">3 urgent</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Multi-Client Rollup for Partner */}
      {role === 'partner' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mt-2">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
            <div>
              <h2 className="text-[14px] font-semibold text-slate-900">Firm Overview: Clients by ITC at Risk</h2>
              <p className="text-[12px] text-slate-500 mt-0.5">Showing all {clients.length} active clients across the firm</p>
            </div>
            <button className="text-[13px] text-[#6D4FF0] font-medium hover:text-[#5B3BDC]">View Full Roster</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50/80 text-left border-b border-slate-200">
                  <th className="px-6 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Client Name</th>
                  <th className="px-6 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider text-right">ITC at Risk</th>
                  <th className="px-6 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider text-right">Pending Items</th>
                  <th className="px-6 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Last Synced</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rankedClients.map((client) => (
                  <tr
                    key={client.id}
                    onClick={() => navigate(`/approvals?client=${client.id}`)}
                    className="hover:bg-slate-50 cursor-pointer transition-colors h-[44px]"
                  >
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#6D4FF0]/10 flex items-center justify-center text-[#6D4FF0] font-semibold text-[13px]">
                          {client.name.charAt(0)}
                        </div>
                        <span className="text-[13px] font-medium text-slate-900">{client.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-[13px] font-medium text-slate-900 text-right tabular-nums">
                      {client.risk > 0 ? (
                        <span className="text-red-600">{formatINR(client.risk)}</span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-3 text-right">
                      {client.pending > 0 ? (
                        <span className="inline-flex items-center justify-center min-w-[24px] h-6 px-2 rounded-md bg-amber-50 text-amber-700 text-[12px] font-semibold border border-amber-200 tabular-nums">
                          {client.pending}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[13px]">—</span>
                      )}
                    </td>
                    <td className="px-6 py-3">
                      <StatusBadge status={client.status} />
                    </td>
                    <td className="px-6 py-3 text-[13px] text-slate-500">{formatDate(client.lastSynced)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Regular Client table (for Associate / non-partner) */}
      {role !== 'partner' && !isTrial && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-[14px] font-semibold text-slate-900">Your Assigned Clients</h2>
            <span className="text-[12px] text-slate-500">{clients.length} active clients</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50/80 text-left border-b border-slate-200">
                  <th className="px-6 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Client</th>
                  <th className="px-6 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">GSTINs</th>
                  <th className="px-6 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Open Items</th>
                  <th className="px-6 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Last Synced</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {clients.map((client) => {
                  const openItems = mismatches.filter((m) => m.clientId === client.id && !m.resolved && !m.vendorContacted).length;
                  return (
                    <tr
                      key={client.id}
                      onClick={() => navigate(`/approvals?client=${client.id}`)}
                      className="hover:bg-slate-50 cursor-pointer transition-colors h-[44px]"
                    >
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-[#6D4FF0]/10 flex items-center justify-center text-[#6D4FF0] font-semibold text-[13px]">
                            {client.name.charAt(0)}
                          </div>
                          <span className="text-[13px] font-medium text-slate-900">{client.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-3 text-[13px] text-slate-600 tabular-nums">{client.gstinCount}</td>
                      <td className="px-6 py-3">
                        <StatusBadge status={client.status} />
                      </td>
                      <td className="px-6 py-3">
                        {openItems > 0 ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[11px] font-semibold border border-amber-200">
                            {openItems} pending
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-semibold border border-emerald-200">
                            All clear
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-3 text-[13px] text-slate-500">{formatDate(client.lastSynced)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
