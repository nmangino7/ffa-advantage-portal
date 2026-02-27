export function SkeletonCard({ variant = 'card' }: { variant?: 'stat' | 'card' | 'row' }) {
  if (variant === 'stat') {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl animate-shimmer" />
          <div className="flex-1 space-y-2">
            <div className="h-6 w-16 rounded-lg animate-shimmer" />
            <div className="h-3 w-24 rounded animate-shimmer" />
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'row') {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full animate-shimmer flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-32 rounded animate-shimmer" />
          <div className="h-3 w-48 rounded animate-shimmer" />
        </div>
        <div className="h-7 w-20 rounded-lg animate-shimmer flex-shrink-0" />
      </div>
    );
  }

  // Default 'card'
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl animate-shimmer" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-28 rounded animate-shimmer" />
          <div className="h-3 w-20 rounded animate-shimmer" />
        </div>
      </div>
      <div className="h-2 w-full rounded-full animate-shimmer" />
      <div className="flex gap-4">
        <div className="h-3 w-16 rounded animate-shimmer" />
        <div className="h-3 w-16 rounded animate-shimmer" />
        <div className="h-3 w-20 rounded animate-shimmer" />
      </div>
    </div>
  );
}
