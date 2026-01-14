'use client';

import { NavigationItem } from '@/types/manageContent';
import { Button } from '@/components/ui/button';
import { Plus, ChevronUp, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface MenuStructureProps {
  items: NavigationItem[];
  selectedItemId?: string;
  onItemSelect: (itemId: string) => void;
}

export function MenuStructure({
  items,
  selectedItemId,
  onItemSelect,
}: MenuStructureProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(
    new Set(items.filter((item) => item.children && item.children.length > 0).map((item) => item.id))
  );

  const toggleExpanded = (itemId: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  };

  const renderItem = (item: NavigationItem, level: number = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.has(item.id);
    const isSelected = selectedItemId === item.id;
    const isParent = hasChildren;

    return (
      <div key={item.id}>
        <div
          className={cn(
            'flex items-center gap-2 px-3 py-2 rounded cursor-pointer transition-colors',
            isSelected
              ? 'bg-primary/10 text-primary'
              : 'hover:bg-muted text-foreground',
            level > 0 && 'ml-6'
          )}
          onClick={() => {
            if (hasChildren) {
              toggleExpanded(item.id);
            } else {
              onItemSelect(item.id);
            }
          }}
        >
          {hasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleExpanded(item.id);
              }}
              className="p-0.5 hover:bg-muted rounded"
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>
          )}
          {item.icon && <span className="text-base">{item.icon}</span>}
          <span className="flex-1 text-sm">{item.name}</span>
        </div>
        {hasChildren && isExpanded && (
          <div className="ml-2">
            {item.children!.map((child) => renderItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold">Menu Structure</h3>
          <Button size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Add New
          </Button>
        </div>
        <button className="text-sm text-primary hover:underline">
          Change Sort Order
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {items.map((item) => renderItem(item))}
      </div>
    </div>
  );
}
