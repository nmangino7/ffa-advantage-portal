export function SkeletonCard({ variant = 'card' }: { variant?: 'stat' | 'card' | 'row' }) {
  if (variant === 'stat') {
    return (
      <div className="bg-white border border-neutral-200 rounded-xl p-5">
        <div className="h-3 w-16 rounded animate-shimmer mb-3" />
        <div className="h-7 w-20 rounded animate-shimmer" />
      </div>
    );
  }

  if (variant === 'row') {
    return (
      <div className="flex items-center gap-3 py-3 px-4">
        <div className="w-8 h-8 rounded-full animate-shimmer shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-3 w-32 rounded animate-shimmer" />
          <div className="h-2.5 w-24 rounded animate-shimmer" />
        </div>
        <div className="h-6 w-16 rounded animate-shimmer" />
      </div>
    );
  }

  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-5 space-y-3">
      <div className="h-3 w-24 rounded animate-shimmer" />
      <div className="h-5 w-40 rounded animate-shimmer" />
      <div className="h-3 w-full rounded animate-shimmer" />
      <div className="h-3 w-3/4 rounded animate-shimmer" />
    </div>
  );
}
