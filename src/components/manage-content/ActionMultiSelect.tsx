'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ActionMultiSelectProps {
  availableActions: string[];
  selectedActions: string[];
  onSelectedActionsChange: (actions: string[]) => void;
}

export function ActionMultiSelect({
  availableActions,
  selectedActions,
  onSelectedActionsChange,
}: ActionMultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleToggleAction = (action: string) => {
    if (selectedActions.includes(action)) {
      onSelectedActionsChange(selectedActions.filter((a) => a !== action));
    } else {
      onSelectedActionsChange([...selectedActions, action]);
    }
  };

  const displayText =
    selectedActions.length === 0
      ? 'Select actions...'
      : selectedActions.length === availableActions.length
      ? 'All actions'
      : `${selectedActions.length} action${selectedActions.length > 1 ? 's' : ''} selected`;

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        type="button"
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="w-48 justify-between"
      >
        <span className="truncate">{displayText}</span>
        <ChevronDown className={cn('h-4 w-4 transition-transform', isOpen && 'rotate-180')} />
      </Button>
      {isOpen && (
        <div className="absolute z-50 mt-1 w-48 border rounded-md bg-popover shadow-md max-h-60 overflow-auto">
          <div className="p-1">
            {availableActions.map((action) => (
              <div
                key={action}
                className="flex items-center space-x-2 p-2 hover:bg-accent rounded-sm cursor-pointer"
                onClick={() => handleToggleAction(action)}
              >
                <Checkbox
                  checked={selectedActions.includes(action)}
                  onCheckedChange={() => handleToggleAction(action)}
                />
                <span className="text-sm">{action}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
