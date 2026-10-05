import { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { SkeletonCard, SkeletonTable } from '../components/Skeleton';
import { EmptyState } from '../components/UIComponents';

export default function Reports() {
  const getScopedInvoices = useStore((s) => s.getScopedInvoices);
  const getScopedMismatches = useStore((s) => s.getScopedMismatches);
  const getScopedClients = useStore((s) => s.getScopedClients);
  
  const invoices = getScopedInvoices();
  const mismatches = getScopedMismatches();
  const clients = getScopedClients();
  
  const currentUser = useStore((s) => s.currentUser);
  const addToast = useStore((s) => s.addToast);

  const [loading, setLoading] = useState(true);
  const [exportState, setExportState] = useState<'idle' | 'preparing' | 'ready'>('idle');

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(t);
  }, []);

  const handleExport = () => {
    if (exportState === 'ready') {
      addToast('Report downloaded');
      setExportState('idle');
      return;
    }
    setExportState('preparing');
    setTimeout(() => setExportState('ready'), 1500);
  };

  const totalITC = invoices.reduce((sum, inv) => sum + inv.cgst + inv.sgst + inv.igst, 0);
  const totalTaxable = invoices.reduce((sum, inv) => sum + inv.taxableValue, 0);
  const matchedCount = mismatches.filter((m) => m.matchStatus === 'matched' || m.resolved).length;
  const mismatchCount = mismatches.filter((m) => m.matchStatus === 'mismatch' && !m.resolved).length;
  const pendingCount = mismatches.filter((m) => m.matchStatus === 'needs_review' && !m.resolved).length;

  const clientStats = clients.map((c) => {
    const clientInvs = invoices.filter((i) => i.clientId === c.id);
    const clientTotal = clientInvs.reduce((s, i) => s + i.total, 0);
    return { name: c.name.split(' ')[0], total: clientTotal };
  });
  const maxClientTotal = Math.max(...clientStats.map((c) => c.total), 1);

  const formatINR = (v: number) => `₹${(v / 100000).toFixed(1)}L`;

  // ITC Aging Logic
  const unresolvedMismatches = mismatches.filter(m => !m.resolved && m.matchStatus !== 'matched');
  const agingTotal = unresolvedMismatches.reduce((s, m) => s + m.variance, 0);
  const aging0to30 = unresolvedMismatches.slice(0, Math.floor(unresolvedMismatches.length * 0.5)).reduce((s, m) => s + m.variance, 0);
  const aging30to60 = unresolvedMismatches.slice(Math.floor(unresolvedMismatches.length * 0.5), Math.floor(unresolvedMismatches.length * 0.8)).reduce((s, m) => s + m.variance, 0);
  const aging60plus = agingTotal - aging0to30 - aging30to60;

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-[22px] font-bold text-slate-900 tracking-[-0.025em]">Reports</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
        <SkeletonTable rows={5} cols={4} />
      </div>
    );
  }

  if (currentUser?.role === 'trial') {
    return (
      <div className="flex flex-col gap-6 h-[calc(100vh-9rem)]">
        <h1 className="text-[22px] font-bold text-slate-900 tracking-[-0.025em]">Reports & Statutory Audit</h1>
        <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center justify-center">
          <EmptyState 
            title="Not enough data yet" 
            subtitle="Upload invoices and GSTR-2B files to generate your first reconciliation report." 
            icon="bar_chart" 
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-[22px] font-bold text-slate-900 tracking-[-0.025em]">Reports & Statutory Audit</h1>
        <button
          onClick={handleExport}
          disabled={exportState === 'preparing'}
          className={`px-4 py-2 rounded-lg text-[13px] font-semibold transition-all flex items-center gap-2 border ${
            exportState === 'preparing'
              ? 'bg-slate-50 text-slate-500 cursor-wait border-slate-200'
              : exportState === 'ready'
              ? 'bg-emerald-600 text-white border-emerald-700 hover:bg-emerald-700 shadow-sm'
              : 'bg-[#6D4FF0] text-white border-[#5B3BDC] hover:bg-[#5B3BDC] shadow-sm'
          }`}
        >
          {exportState === 'preparing' ? (
            <>
              <span className="w-4 h-4 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin-slow" />
              Preparing file...
            </>
          ) : exportState === 'ready' ? (
            <>
              <span className="material-symbols-outlined text-[18px]">download</span>
              Download Ready
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-[18px]">download</span>
              Export to Excel
            </>
          )}
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between h-[132px]">
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-wider text-slate-500">Total Taxable Value</p>
            <p className="text-[24px] font-bold text-slate-900 tracking-[-0.025em] mt-1 tabular-nums">{formatINR(totalTaxable)}</p>
          </div>
          <p className="text-[12px] text-slate-400 pt-2 border-t border-slate-100">Across {invoices.length} invoices</p>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between h-[132px]">
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-wider text-slate-500">Total ITC Claimed</p>
            <p className="text-[24px] font-bold text-emerald-600 tracking-[-0.025em] mt-1 tabular-nums">{formatINR(totalITC)}</p>
          </div>
          <p className="text-[12px] text-slate-400 pt-2 border-t border-slate-100">CGST + SGST + IGST</p>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between h-[132px]">
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-wider text-slate-500">Reconciliation Rate</p>
            <p className="text-[24px] font-bold text-slate-900 tracking-[-0.025em] mt-1 tabular-nums">
              {mismatches.length > 0 ? Math.round((matchedCount / mismatches.length) * 100) : 0}%
            </p>
          </div>
          <p className="text-[12px] text-slate-400 pt-2 border-t border-slate-100">{matchedCount} of {mismatches.length} matched</p>
        </div>
      </div>

      {/* ITC Aging View (New Advanced Feature) */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[14px] font-semibold text-slate-900">Blocked ITC Aging</h3>
          <span className="text-[13px] text-slate-500">Total: <strong className="text-slate-900 tabular-nums">₹{agingTotal.toLocaleString('en-IN')}</strong></span>
        </div>
        
        <div className="flex w-full h-10 rounded-lg overflow-hidden border border-slate-200 mb-3">
          {agingTotal > 0 ? (
            <>
              <div 
                className="h-full bg-amber-200 border-r border-amber-300 transition-all flex items-center px-3"
                style={{ width: `${(aging0to30 / agingTotal) * 100}%` }}
                title={`0-30 days: ₹${aging0to30.toLocaleString('en-IN')}`}
              ></div>
              <div 
                className="h-full bg-orange-400 border-r border-orange-500 transition-all flex items-center px-3"
                style={{ width: `${(aging30to60 / agingTotal) * 100}%` }}
                title={`30-60 days: ₹${aging30to60.toLocaleString('en-IN')}`}
              ></div>
              <div 
                className="h-full bg-red-600 transition-all flex items-center px-3"
                style={{ width: `${(aging60plus / agingTotal) * 100}%` }}
                title={`60-90+ days: ₹${aging60plus.toLocaleString('en-IN')}`}
              ></div>
            </>
          ) : (
            <div className="w-full h-full bg-slate-100 flex items-center justify-center text-[12px] text-slate-400">
              No blocked ITC
            </div>
          )}
        </div>
        
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-amber-200"></span>
            <span className="text-[12px] text-slate-600">0-30 days (₹{aging0to30.toLocaleString('en-IN')})</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-orange-400"></span>
            <span className="text-[12px] text-slate-600">30-60 days (₹{aging30to60.toLocaleString('en-IN')})</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-red-600"></span>
            <span className="text-[12px] text-slate-600 font-medium">60-90+ days (₹{aging60plus.toLocaleString('en-IN')})</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Match breakdown */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <h3 className="text-[14px] font-semibold text-slate-900 mb-4">Match Status Breakdown</h3>
          <div className="space-y-4">
            {[
              { label: 'Matched', count: matchedCount, color: 'bg-emerald-500', pct: matchedCount },
              { label: 'Mismatch', count: mismatchCount, color: 'bg-red-500', pct: mismatchCount },
              { label: 'Needs Review', count: pendingCount, color: 'bg-amber-500', pct: pendingCount },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[13px] text-slate-600">{item.label}</span>
                  <span className="text-[13px] font-semibold text-slate-900 tabular-nums">{item.count}</span>
                </div>
                <div className="w-full bg-slate-100 rounded h-2 overflow-hidden">
                  <div
                    className={`h-full rounded ${item.color} transition-all duration-500`}
                    style={{ width: `${mismatches.length > 0 ? (item.pct / mismatches.length) * 100 : 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Client breakdown */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <h3 className="text-[14px] font-semibold text-slate-900 mb-4">Invoice Value by Client</h3>
          <div className="space-y-3">
            {clientStats.map((cs) => (
              <div key={cs.name}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[13px] text-slate-600">{cs.name}</span>
                  <span className="text-[12px] text-slate-400 tabular-nums">{formatINR(cs.total)}</span>
                </div>
                <div className="w-full bg-slate-100 rounded h-2.5 overflow-hidden">
                  <div
                    className="h-full rounded bg-[#6D4FF0] transition-all duration-500"
                    style={{ width: `${(cs.total / maxClientTotal) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
