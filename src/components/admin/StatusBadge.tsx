import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: 'Active' | 'Inactive' | 'Paid' | 'Failed' | 'Upcoming' | 'Connected' | 'Disconnected' | 'Error';
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const variantMap = {
    Active: 'bg-green-100 text-green-800 border-green-200',
    Inactive: 'bg-gray-100 text-gray-800 border-gray-200',
    Paid: 'bg-green-100 text-green-800 border-green-200',
    Failed: 'bg-red-100 text-red-800 border-red-200',
    Upcoming: 'bg-blue-100 text-blue-800 border-blue-200',
    Connected: 'bg-green-100 text-green-800 border-green-200',
    Disconnected: 'bg-gray-100 text-gray-800 border-gray-200',
    Error: 'bg-red-100 text-red-800 border-red-200',
  };

  return (
    <Badge
      variant="outline"
      className={cn(variantMap[status], className)}
    >
      {status}
    </Badge>
  );
}

