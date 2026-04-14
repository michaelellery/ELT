import { clsx } from "clsx";

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
}

export function Skeleton({ className, width, height }: SkeletonProps) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={clsx("shimmer rounded-md", className)}
      style={{ width, height }}
    />
  );
}

export function MessageSkeleton() {
  return (
    <div className="flex flex-col gap-4 p-4" role="status" aria-label="Loading chat">
      {/* Bot message skeleton */}
      <div className="flex gap-3">
        <Skeleton className="shrink-0 rounded-full" width={32} height={32} />
        <div className="flex flex-col gap-2 flex-1 max-w-xs">
          <Skeleton height={16} className="w-3/4" />
          <Skeleton height={16} className="w-full" />
          <Skeleton height={16} className="w-1/2" />
        </div>
      </div>

      {/* User message skeleton */}
      <div className="flex justify-end">
        <div className="flex flex-col gap-2 max-w-xs items-end">
          <Skeleton height={16} className="w-2/3" />
          <Skeleton height={16} className="w-1/2" />
        </div>
      </div>

      {/* Bot message skeleton */}
      <div className="flex gap-3">
        <Skeleton className="shrink-0 rounded-full" width={32} height={32} />
        <div className="flex flex-col gap-2 flex-1 max-w-sm">
          <Skeleton height={16} className="w-full" />
          <Skeleton height={16} className="w-5/6" />
          <Skeleton height={16} className="w-3/4" />
        </div>
      </div>
    </div>
  );
}
