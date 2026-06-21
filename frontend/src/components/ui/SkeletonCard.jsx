/**
 * SkeletonCard — Shimmer loading placeholder
 */
export function SkeletonCard({ className = '', rows = 3, showHeader = true }) {
  return (
    <div className={`glass rounded-xl p-5 ${className}`}>
      {showHeader && (
        <div className="flex items-start justify-between mb-4">
          <div className="skeleton skeleton-text w-28 h-3" />
          <div className="skeleton w-8 h-8 skeleton-avatar" />
        </div>
      )}
      <div className="skeleton skeleton-title w-16 h-8 mb-2" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="skeleton skeleton-text mb-2" style={{ width: `${70 + i * 10}%` }} />
      ))}
    </div>
  );
}

export function SkeletonText({ lines = 2, className = '' }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="skeleton skeleton-text" style={{ width: i === lines - 1 ? '60%' : '100%' }} />
      ))}
    </div>
  );
}

export function SkeletonAvatar({ size = 40, className = '' }) {
  return (
    <div
      className={`skeleton skeleton-avatar flex-shrink-0 ${className}`}
      style={{ width: size, height: size }}
    />
  );
}

export function SkeletonDashboard() {
  return (
    <div className="flex gap-6 w-full pt-6 animate-fade-in">
      <div className="flex-1 flex flex-col gap-6">
        {/* Stats row */}
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <SkeletonCard key={i} rows={1} />)}
        </div>
        {/* Mid row */}
        <div className="grid grid-cols-2 gap-6">
          <SkeletonCard rows={4} />
          <SkeletonCard rows={4} />
        </div>
        {/* Bottom row */}
        <div className="grid grid-cols-2 gap-6">
          <div className="glass rounded-xl p-5">
            <div className="skeleton skeleton-text w-32 h-3 mb-6" />
            <div className="skeleton w-full h-40 rounded-lg" />
          </div>
          <SkeletonCard rows={5} />
        </div>
      </div>
      {/* Right sidebar */}
      <div className="w-80 flex flex-col gap-6">
        <div className="glass rounded-xl p-5 h-72">
          <div className="skeleton skeleton-text w-24 h-3 mb-4" />
          <div className="skeleton w-40 h-40 skeleton-avatar mx-auto mt-4" />
        </div>
        <SkeletonCard rows={3} />
      </div>
    </div>
  );
}
