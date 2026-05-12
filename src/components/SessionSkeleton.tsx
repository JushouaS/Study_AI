export default function SessionSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="p-2 space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg">
          <div className="h-4 bg-surface-container rounded animate-pulse flex-1" style={{ width: `${60 + Math.random() * 30}%` }} />
        </div>
      ))}
    </div>
  )
}
