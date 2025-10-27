import { cn } from '@/lib/utils';

interface LoadingSkeletonProps {
  className?: string;
}

export function LoadingSkeleton({ className }: LoadingSkeletonProps) {
  return (
    <div className={cn('animate-pulse bg-muted rounded', className)} aria-label="Loading..." />
  );
}

export function SourceCardSkeleton() {
  return (
    <div className="p-4 border rounded-lg space-y-3">
      <div className="flex items-start gap-3">
        <LoadingSkeleton className="h-10 w-10 rounded-lg" />
        <div className="flex-1 space-y-2">
          <LoadingSkeleton className="h-4 w-3/4" />
          <LoadingSkeleton className="h-3 w-1/2" />
          <LoadingSkeleton className="h-7 w-20" />
        </div>
      </div>
    </div>
  );
}

export function TreeSkeleton() {
  return (
    <div className="p-4 space-y-2">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="space-y-2">
          <LoadingSkeleton className="h-8 w-full" />
          <div className="ml-4 space-y-1">
            <LoadingSkeleton className="h-6 w-5/6" />
            <LoadingSkeleton className="h-6 w-4/6" />
          </div>
        </div>
      ))}
    </div>
  );
}

