'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PageMultiSelectProps {
  availablePages: string[];
  selectedPages: string[];
  onSelectedPagesChange: (pages: string[]) => void;
}

export function PageMultiSelect({
  availablePages,
  selectedPages,
  onSelectedPagesChange,
}: PageMultiSelectProps) {
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

  const allSelected = availablePages.length > 0 && selectedPages.length === availablePages.length;
  const someSelected = selectedPages.length > 0 && selectedPages.length < availablePages.length;

  const handleToggleAll = () => {
    if (allSelected) {
      onSelectedPagesChange([]);
    } else {
      onSelectedPagesChange([...availablePages]);
    }
  };

  const handleTogglePage = (page: string) => {
    if (selectedPages.includes(page)) {
      onSelectedPagesChange(selectedPages.filter((p) => p !== page));
    } else {
      onSelectedPagesChange([...selectedPages, page]);
    }
  };

  const displayText =
    selectedPages.length === 0
      ? 'Select pages...'
      : selectedPages.length === availablePages.length
      ? 'All pages'
      : `${selectedPages.length} page${selectedPages.length > 1 ? 's' : ''} selected`;

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
          <div className="p-2 border-b">
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={allSelected}
                onCheckedChange={handleToggleAll}
                className={someSelected && !allSelected ? 'data-[state=checked]:bg-muted' : ''}
              />
              <label className="text-sm font-medium cursor-pointer">
                {allSelected ? 'Deselect all' : 'Select all'}
              </label>
            </div>
          </div>
          <div className="p-1">
            {availablePages.map((page) => (
              <div
                key={page}
                className="flex items-center space-x-2 p-2 hover:bg-accent rounded-sm cursor-pointer"
                onClick={() => handleTogglePage(page)}
              >
                <Checkbox
                  checked={selectedPages.includes(page)}
                  onCheckedChange={() => handleTogglePage(page)}
                />
                <span className="text-sm">{page}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
