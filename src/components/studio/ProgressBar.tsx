import { Progress } from '@/components/ui/progress';

interface ProgressBarProps {
  value: number; // 0-100
  label?: string;
  eta?: string;
  className?: string;
}

export function ProgressBar({ value, label, eta, className }: ProgressBarProps) {
  return (
    <div className={className}>
      {(label || eta) && (
        <div className="flex justify-between items-center mb-2 text-sm">
          {label && <span className="text-muted-foreground">{label}</span>}
          {eta && <span className="text-xs text-muted-foreground">{eta}</span>}
        </div>
      )}
      <Progress value={value} className="h-2" />
      <div className="text-xs text-muted-foreground mt-1 text-right">{Math.round(value)}%</div>
    </div>
  );
}

