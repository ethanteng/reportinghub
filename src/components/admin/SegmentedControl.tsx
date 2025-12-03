'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SegmentedControlOption {
  value: string;
  label: string;
}

interface SegmentedControlProps {
  options: SegmentedControlOption[];
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
}

export function SegmentedControl({
  options,
  value,
  onValueChange,
  className,
}: SegmentedControlProps) {
  return (
    <div
      className={cn(
        'inline-flex rounded-md border border-input bg-muted p-1',
        className
      )}
      role="tablist"
      aria-label="View selection"
    >
      {options.map((option, index) => {
        const isActive = value === option.value;
        const isFirst = index === 0;
        const isLast = index === options.length - 1;

        return (
          <Button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-controls={`panel-${option.value}`}
            onClick={() => onValueChange(option.value)}
            variant="ghost"
            className={cn(
              'relative px-3 py-1.5 text-sm font-medium transition-all',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              'border-0 shadow-none',
              // Rounded corners
              isFirst && !isLast && 'rounded-l-md rounded-r-none',
              !isFirst && !isLast && 'rounded-none',
              isLast && !isFirst && 'rounded-r-md rounded-l-none',
              options.length === 1 && 'rounded-md',
              // Active state
              isActive
                ? 'bg-background text-foreground shadow-sm'
                : 'bg-transparent text-muted-foreground hover:text-foreground hover:bg-transparent',
              // Remove left margin for seamless connection (except first)
              !isFirst && '-ml-[1px]'
            )}
          >
            {option.label}
          </Button>
        );
      })}
    </div>
  );
}

