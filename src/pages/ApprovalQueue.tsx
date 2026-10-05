import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { SkeletonTable } from '../components/Skeleton';
import { ConfidencePill, StatusBadge, EmptyState } from '../components/UIComponents';
import type { MismatchItem, MatchStatus } from '../data/types';

type FilterType = MatchStatus | 'all';

export default function ApprovalQueue() {
  const [searchParams] = useSearchParams();
  const clientFilter = searchParams.get('client') || undefined;

  const getScopedMismatches = useStore((s) => s.getScopedMismatches);
  const mismatches = getScopedMismatches();
  
  const invoices = useStore((s) => s.invoices);
  const clients = useStore((s) => s.clients);
  const approveItems = useStore((s) => s.approveItems);
  const resolveItem = useStore((s) => s.resolveItem);
  const contactVendor = useStore((s) => s.contactVendor);
  const addToast = useStore((s) => s.addToast);
  const getVendorRisk = useStore((s) => s.getVendorRisk);
  const canApproveItem = useStore((s) => s.canApproveItem);

  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [detailItem, setDetailItem] = useState<MismatchItem | null>(null);
  const [showMessageComposer, setShowMessageComposer] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [fadingIds, setFadingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(t);
  }, []);

  const pendingItems = useMemo(() => {
    return mismatches.filter((m) => {
      if (m.resolved) return false;
      if (clientFilter && m.clientId !== clientFilter) return false;
      if (filter !== 'all' && m.matchStatus !== filter) return false;
      return true;
    });
  }, [mismatches, clientFilter, filter]);

  const getInvoice = (invoiceId: string) => invoices.find((i) => i.id === invoiceId);
  const getClient = (clientId: string) => clients.find((c) => c.id === clientId);

  const filters: { label: string; value: FilterType; count: number }[] = [
    { label: 'All', value: 'all', count: mismatches.filter((m) => !m.resolved && (!clientFilter || m.clientId === clientFilter)).length },
    { label: 'Matched', value: 'matched', count: mismatches.filter((m) => !m.resolved && m.matchStatus === 'matched' && (!clientFilter || m.clientId === clientFilter)).length },
    { label: 'Mismatch', value: 'mismatch', count: mismatches.filter((m) => !m.resolved && m.matchStatus === 'mismatch' && (!clientFilter || m.clientId === clientFilter)).length },
    { label: 'Needs Review', value: 'needs_review', count: mismatches.filter((m) => !m.resolved && m.matchStatus === 'needs_review' && (!clientFilter || m.clientId === clientFilter)).length },
  ];

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === pendingItems.length && pendingItems.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(pendingItems.filter(canApproveItem).map((m) => m.id)));
    }
  };

  const handleApproveSelected = () => {
    const ids = Array.from(selectedIds);
    setFadingIds(new Set(ids));
    setTimeout(() => {
      approveItems(ids);
      setSelectedIds(new Set());
      setFadingIds(new Set());
    }, 300);
  };

  const handleResolve = (id: string, action: 'confirm_match' | 'confirm_mismatch') => {
    setFadingIds(new Set([id]));
    setTimeout(() => {
      resolveItem(id, action);
      setDetailItem(null);
      setFadingIds(new Set());
    }, 300);
  };

  const handleSendMessage = (item: MismatchItem) => {
    const inv = getInvoice(item.invoiceId);
    const vendorName = inv?.vendorName || 'Vendor';
    contactVendor(item.id);
    addToast(`Message sent to ${vendorName}`);
    setShowMessageComposer(false);
    setMessageText('');
  };

  const openDetail = (item: MismatchItem) => {
    setDetailItem(item);
    setShowMessageComposer(false);
    const inv = getInvoice(item.invoiceId);
    if (inv) {
      setMessageText(
        `Dear Sir/Madam,\n\nWe are writing regarding Invoice ${inv.invoiceNumber} dated ${new Date(inv.uploadedAt).toLocaleDateString('en-IN')}. Our records show a discrepancy of ₹${item.variance.toLocaleString('en-IN')} in the tax amounts.\n\nCould you please verify and share the corrected invoice at your earliest convenience?\n\nRegards,\nK.S. Rao & Co.`
      );
    }
  };

  // Close modal with Escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && detailItem) {
        setDetailItem(null);
        setShowMessageComposer(false);
      }
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [detailItem]);

  const clientName = clientFilter ? getClient(clientFilter)?.name : undefined;

  if (loading) {
    return (
      <div>
        <h1 className="text-[22px] font-bold text-slate-900 tracking-[-0.025em] mb-6">Approval Queue</h1>
        <SkeletonTable rows={8} cols={6} />
      </div>
    );
  }

  return (
    <div className="flex gap-6 h-[calc(100vh-9rem)]">
      {/* Main list */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-[22px] font-bold text-slate-900 tracking-[-0.025em]">Approval Queue</h1>
            {clientName && (
              <p className="text-[13px] text-slate-500 mt-0.5">Filtered: {clientName}</p>
            )}
          </div>
          <button
            onClick={handleApproveSelected}
            disabled={selectedIds.size === 0}
            className={`px-4 py-2 rounded-lg text-[13px] font-semibold transition-all flex items-center gap-2 ${
              selectedIds.size > 0
                ? 'bg-[#6D4FF0] hover:bg-[#5B3BDC] text-white shadow-sm'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">done_all</span>
            Approve Selected{selectedIds.size > 0 && ` (${selectedIds.size})`}
          </button>
        </div>

        {/* Filter chips */}
        <div className="flex gap-2 mb-4">
          {filters.map((f) => (
            <button
              key={f.value}
              onClick={() => { setFilter(f.value); setSelectedIds(new Set()); }}
              className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all border ${
                filter === f.value
                  ? 'bg-[#6D4FF0] text-white border-[#5B3BDC] shadow-sm'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-[#6D4FF0]/40 hover:text-[#6D4FF0]'
              }`}
            >
              {f.label}
              <span className={`ml-1.5 px-1.5 py-0.5 rounded text-[10px] font-bold ${
                filter === f.value ? 'bg-white/20' : 'bg-slate-100'
              }`}>
                {f.count}
              </span>
            </button>
          ))}
        </div>

        {/* Table */}
        {pendingItems.length === 0 ? (
          <EmptyState
            title="All caught up!"
            subtitle="No pending items in this view. Great work!"
            icon="celebration"
          />
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex-1 overflow-y-auto">
            <table className="w-full">
              <thead className="sticky top-0 z-10">
                <tr className="bg-slate-50/80 text-left border-b border-slate-200">
                  <th className="px-4 py-3 w-10">
                    <input
                      type="checkbox"
                      checked={selectedIds.size > 0 && selectedIds.size === pendingItems.filter(canApproveItem).length}
                      onChange={toggleSelectAll}
                      className="w-3.5 h-3.5 rounded border-slate-300 text-[#6D4FF0] focus:ring-[#6D4FF0]"
                    />
                  </th>
                  <th className="px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Vendor</th>
                  <th className="px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Invoice</th>
                  <th className="px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Type</th>
                  <th className="px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider text-right">Variance</th>
                  <th className="px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Confidence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pendingItems.map((item) => {
                  const inv = getInvoice(item.invoiceId);
                  const isFading = fadingIds.has(item.id);
                  const canApprove = canApproveItem(item);
                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-slate-50 cursor-pointer transition-all h-[44px] ${
                        detailItem?.id === item.id ? 'bg-[#E6DEFF]/30' : ''
                      } ${isFading ? 'animate-fade-out' : ''} ${
                        item.vendorContacted ? 'opacity-70' : ''
                      }`}
                      onClick={() => openDetail(item)}
                    >
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedIds.has(item.id)}
                          disabled={!canApprove}
                          onChange={() => toggleSelect(item.id)}
                          className="w-3.5 h-3.5 rounded border-slate-300 text-[#6D4FF0] focus:ring-[#6D4FF0] disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-[13px] font-medium text-slate-900 flex items-center gap-1.5">
                          {inv?.vendorName || '—'}
                          {!canApprove && (
                            <span className="material-symbols-outlined text-[14px] text-slate-400" title="Requires partner approval">lock</span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">{inv?.vendorGstin}</div>
                      </td>
                      <td className="px-4 py-3 text-[13px] text-slate-600 font-mono">{inv?.invoiceNumber || '—'}</td>
                      <td className="px-4 py-3">
                        {item.vendorContacted ? <StatusBadge status="vendor_contacted" /> : <StatusBadge status={item.matchStatus} />}
                      </td>
                      <td className="px-4 py-3"><StatusBadge status={item.mismatchType} /></td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-[13px] font-medium text-slate-700 tabular-nums">
                          {item.variance > 0 ? `₹${item.variance.toLocaleString('en-IN')}` : '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3"><ConfidencePill value={item.confidence} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Panel */}
      {detailItem && (
        <div className="w-[400px] bg-white rounded-2xl border border-slate-200 shadow-sm animate-slide-in-right flex flex-col overflow-hidden flex-shrink-0">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
            <h3 className="text-[14px] font-semibold text-slate-900">Mismatch Inspector</h3>
            <button
              onClick={() => { setDetailItem(null); setShowMessageComposer(false); }}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {(() => {
              const inv = getInvoice(detailItem.invoiceId);
              const client = getClient(detailItem.clientId);
              const riskProfile = inv ? getVendorRisk(inv.vendorGstin) : undefined;
              
              return (
                <>
                  <div>
                    <p className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold mb-1">Client</p>
                    <p className="text-[13px] font-medium text-slate-900">{client?.name}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold mb-1">Vendor</p>
                      <div className="flex items-center gap-2">
                        <p className="text-[13px] font-medium text-slate-900">{inv?.vendorName}</p>
                        {riskProfile && (
                          <div className="group relative">
                            <span className={`w-2 h-2 rounded-full inline-block ${
                              riskProfile.riskLevel === 'reliable' ? 'bg-emerald-500' :
                              riskProfile.riskLevel === 'occasional_delays' ? 'bg-amber-500' : 'bg-red-500'
                            }`} />
                            <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block w-max px-2 py-1 bg-slate-800 text-white text-[11px] rounded whitespace-nowrap z-50">
                              {riskProfile.tooltip}
                              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
                            </div>
                          </div>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5 font-mono">{inv?.vendorGstin}</p>
                    </div>
                    <div>
                      <p className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold mb-1">Invoice #</p>
                      <p className="text-[13px] font-medium text-slate-900 font-mono">{inv?.invoiceNumber}</p>
                    </div>
                  </div>

                  {/* Amount comparison */}
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                    <h4 className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-3">Amount Breakdown</h4>
                    <div className="space-y-2">
                      {[
                        { label: 'Taxable Value', val: inv?.taxableValue || 0 },
                        { label: 'CGST', val: inv?.cgst || 0 },
                        { label: 'SGST', val: inv?.sgst || 0 },
                        { label: 'IGST', val: inv?.igst || 0 },
                        { label: 'Total', val: inv?.total || 0 },
                      ].map((row) => (
                        <div key={row.label} className="flex items-center justify-between text-[13px]">
                          <span className="text-slate-500">{row.label}</span>
                          <span className="font-medium text-slate-900 tabular-nums">₹{row.val.toLocaleString('en-IN')}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Confidence */}
                  <div>
                    <h4 className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Match Confidence</h4>
                    <div className="flex items-center gap-3">
                      <ConfidencePill value={detailItem.confidence} />
                      <span className="text-[13px] text-slate-500">
                        {detailItem.confidence >= 0.9 ? 'High' : detailItem.confidence >= 0.7 ? 'Medium' : 'Low'} confidence
                      </span>
                    </div>
                  </div>

                  {detailItem.variance > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-2">
                      <span className="material-symbols-outlined text-red-500 text-[18px]">warning</span>
                      <span className="text-[13px] font-semibold text-red-700">Variance: ₹{detailItem.variance.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                </>
              );
            })()}
          </div>

          {/* Actions */}
          <div className="border-t border-slate-200 p-4 space-y-2 bg-white">
            {!showMessageComposer ? (
              <>
                {!detailItem.vendorContacted && (
                  <>
                    <div className="flex gap-2">
                      {canApproveItem(detailItem) ? (
                        <>
                          <button
                            onClick={() => handleResolve(detailItem.id, 'confirm_match')}
                            className="flex-1 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[13px] font-semibold transition-colors flex items-center justify-center gap-1.5"
                          >
                            <span className="material-symbols-outlined text-[16px]">check</span>
                            Accept Books
                          </button>
                          <button
                            onClick={() => handleResolve(detailItem.id, 'confirm_mismatch')}
                            className="flex-1 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-[13px] font-semibold transition-colors flex items-center justify-center gap-1.5"
                          >
                            <span className="material-symbols-outlined text-[16px]">close</span>
                            Reject
                          </button>
                        </>
                      ) : (
                        <div className="flex-1 flex flex-col items-center justify-center py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-500">
                          <span className="material-symbols-outlined text-[18px] mb-1">lock</span>
                          <span className="text-[11px] font-semibold uppercase tracking-wider text-center">Requires Partner Approval</span>
                          <span className="text-[10px] text-slate-400 mt-0.5 text-center">Variance exceeds your ₹10,000 limit</span>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => setShowMessageComposer(true)}
                      className="w-full py-2 rounded-lg border border-slate-200 text-slate-700 text-[13px] font-medium hover:bg-slate-50 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-[16px]">mail</span>
                      Draft Vendor Message
                    </button>
                  </>
                )}
                {detailItem.vendorContacted && (
                  <div className="text-center py-2">
                    <StatusBadge status="vendor_contacted" size="md" />
                    <p className="text-[12px] text-slate-400 mt-2">Awaiting vendor response</p>
                  </div>
                )}
              </>
            ) : (
              <div className="space-y-3">
                <textarea
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  rows={6}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#6D4FF0]/20 focus:border-[#6D4FF0] resize-none"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSendMessage(detailItem)}
                    className="flex-1 py-2 rounded-lg bg-[#6D4FF0] hover:bg-[#5B3BDC] text-white text-[13px] font-semibold transition-colors"
                  >
                    Send Message
                  </button>
                  <button
                    onClick={() => setShowMessageComposer(false)}
                    className="py-2 px-4 rounded-lg border border-slate-200 text-slate-600 text-[13px] hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
