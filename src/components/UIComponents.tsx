export function ConfidencePill({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  const color =
    pct >= 90
      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
      : pct >= 70
      ? 'bg-amber-50 text-amber-700 border-amber-200'
      : 'bg-red-50 text-red-700 border-red-200';

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border tabular-nums ${color}`}>
      {pct}%
    </span>
  );
}

export function StatusBadge({ status, size = 'sm' }: { status: string; size?: 'sm' | 'md' }) {
  const config: Record<string, { bg: string; text: string; border: string }> = {
    matched: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
    reconciled: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
    processed: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
    valid: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
    mismatch: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
    failed: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
    error: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
    needs_review: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
    extracting: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
    duplicate: { bg: 'bg-slate-50', text: 'text-slate-500', border: 'border-slate-200' },
    vendor_contacted: { bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200' },
    vendor_not_filed: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
    amount_mismatch: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
    rate_mismatch: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  };

  const c = config[status] || { bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-200' };
  const label = status.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  const padding = size === 'md' ? 'px-2.5 py-1 text-[12px]' : 'px-2 py-0.5 text-[11px]';

  return (
    <span className={`inline-flex items-center rounded font-semibold border ${c.bg} ${c.text} ${c.border} ${padding}`}>
      {label}
    </span>
  );
}

export function EmptyState({ title, subtitle, icon }: { title: string; subtitle?: string; icon?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
        <span className="material-symbols-outlined text-[32px] text-slate-400">{icon || 'check_circle'}</span>
      </div>
      <h3 className="text-[16px] font-semibold text-slate-900 mb-1">{title}</h3>
      {subtitle && <p className="text-[13px] text-slate-500">{subtitle}</p>}
    </div>
  );
}
