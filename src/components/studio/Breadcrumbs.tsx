'use client';

import { ChevronRight } from 'lucide-react';
import { SelectedEntity } from '@/store/useBiGeniusStore';

interface BreadcrumbsProps {
  selectedEntity: SelectedEntity;
}

export function Breadcrumbs({ selectedEntity }: BreadcrumbsProps) {
  if (!selectedEntity) {
    return null;
  }

  const parts: string[] = [];

  if (selectedEntity.type === 'source') {
    parts.push(selectedEntity.data.alias || selectedEntity.data.name);
  } else if (selectedEntity.type === 'model') {
    parts.push(selectedEntity.data.name);
  } else if (selectedEntity.type === 'table') {
    parts.push('Model', selectedEntity.data.name);
  } else if (selectedEntity.type === 'column') {
    parts.push('Model', 'Table', selectedEntity.data.name);
  }

  if (parts.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground px-6 py-2 border-b bg-muted/30">
      {parts.map((part, idx) => (
        <div key={idx} className="flex items-center gap-2">
          {idx > 0 && <ChevronRight className="h-4 w-4" />}
          <span className={idx === parts.length - 1 ? 'text-foreground font-medium' : ''}>
            {part}
          </span>
        </div>
      ))}
    </div>
  );
}

