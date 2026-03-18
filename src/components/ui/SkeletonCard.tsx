export function SkeletonCard({ variant = 'card' }: { variant?: 'stat' | 'card' | 'row' }) {
  if (variant === 'stat') {
    return (
      <div className="bg-white border border-neutral-200 rounded-xl p-5 overflow-hidden">
        <div className="h-3 w-20 rounded-md animate-shimmer mb-3" />
        <div className="h-8 w-24 rounded-md animate-shimmer mb-2" />
        <div className="h-2.5 w-14 rounded-md animate-shimmer" />
      </div>
    );
  }

  if (variant === 'row') {
    return (
      <div className="flex items-center gap-4 py-3.5 px-4">
        <div className="w-9 h-9 rounded-full animate-shimmer shrink-0" />
        <div className="flex-1 space-y-2.5">
          <div className="h-3.5 w-36 rounded-md animate-shimmer" />
          <div className="h-2.5 w-28 rounded-md animate-shimmer" />
        </div>
        <div className="h-7 w-20 rounded-lg animate-shimmer" />
      </div>
    );
  }

  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-5 space-y-4 overflow-hidden">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg animate-shimmer shrink-0" />
        <div className="space-y-2 flex-1">
          <div className="h-3.5 w-28 rounded-md animate-shimmer" />
          <div className="h-2.5 w-20 rounded-md animate-shimmer" />
        </div>
      </div>
      <div className="space-y-2.5">
        <div className="h-3 w-full rounded-md animate-shimmer" />
        <div className="h-3 w-5/6 rounded-md animate-shimmer" />
        <div className="h-3 w-3/4 rounded-md animate-shimmer" />
      </div>
      <div className="flex gap-2 pt-1">
        <div className="h-7 w-20 rounded-lg animate-shimmer" />
        <div className="h-7 w-24 rounded-lg animate-shimmer" />
      </div>
    </div>
  );
}
