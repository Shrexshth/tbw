export function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm h-[152px]">
      <div className="space-y-3">
        <div className="h-3 w-32 bg-slate-200 rounded animate-skeleton" />
        <div className="h-7 w-28 bg-slate-200 rounded animate-skeleton" />
      </div>
      <div className="mt-6 pt-2 border-t border-slate-100 flex justify-between">
        <div className="h-5 w-20 bg-slate-200 rounded-full animate-skeleton" />
        <div className="h-3 w-16 bg-slate-200 rounded animate-skeleton" />
      </div>
    </div>
  );
}

export function SkeletonTable({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="bg-slate-50/80 border-b border-slate-200 px-5 py-3 flex gap-6">
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} className="h-3 bg-slate-200 rounded animate-skeleton" style={{ width: `${60 + Math.random() * 60}px` }} />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="px-5 py-4 flex gap-6 border-b border-slate-100 last:border-0">
          {Array.from({ length: cols }).map((_, c) => (
            <div key={c} className="h-3 bg-slate-200 rounded animate-skeleton" style={{ width: `${40 + Math.random() * 80}px`, animationDelay: `${(r * cols + c) * 50}ms` }} />
          ))}
        </div>
      ))}
    </div>
  );
}
