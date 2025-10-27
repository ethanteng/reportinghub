'use client';

import { useState, useEffect } from 'react';
import { ChevronRight, ChevronDown, Database, Table2, Columns, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { SemanticModel, Table, Column } from '../../../lib/types';
import { useBiGeniusStore } from '@/store/useBiGeniusStore';

interface TreeViewProps {
  model: SemanticModel;
  showInstructionBadges?: boolean;
  filterWithInstructions?: boolean;
}

export function TreeView({ model, showInstructionBadges, filterWithInstructions }: TreeViewProps) {
  const [expandedTables, setExpandedTables] = useState<Set<string>>(new Set());
  const [expandedModel, setExpandedModel] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { selectedEntity, setSelectedEntity } = useBiGeniusStore();

  const toggleTable = (tableId: string) => {
    setExpandedTables((prev) => {
      const next = new Set(prev);
      if (next.has(tableId)) {
        next.delete(tableId);
      } else {
        next.add(tableId);
      }
      return next;
    });
  };

  const expandAll = () => {
    setExpandedModel(true);
    setExpandedTables(new Set(model.tables.map((t) => t.id)));
  };

  const collapseAll = () => {
    setExpandedModel(false);
    setExpandedTables(new Set());
  };

  const filterTable = (table: Table): boolean => {
    if (!searchQuery && !filterWithInstructions) return true;

    if (filterWithInstructions) {
      const hasInstructions =
        (table.instructions?.length || 0) > 0 ||
        table.columns.some((col) => (col.instructions?.length || 0) > 0);
      if (!hasInstructions) return false;
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        table.name.toLowerCase().includes(query) ||
        table.columns.some((col) => col.name.toLowerCase().includes(query))
      );
    }

    return true;
  };

  const filterColumn = (column: Column): boolean => {
    if (!searchQuery && !filterWithInstructions) return true;

    if (filterWithInstructions && (column.instructions?.length || 0) === 0) {
      return false;
    }

    if (searchQuery) {
      return column.name.toLowerCase().includes(searchQuery.toLowerCase());
    }

    return true;
  };

  const isSelected = (type: 'model' | 'table' | 'column', id: string): boolean => {
    if (!selectedEntity) return false;
    if (selectedEntity.type !== type) return false;
    return selectedEntity.data.id === id;
  };

  const handleModelClick = () => {
    setSelectedEntity({ type: 'model', data: model });
    setExpandedModel(!expandedModel);
  };

  const handleTableClick = (table: Table) => {
    setSelectedEntity({ type: 'table', data: table, modelId: model.id });
    toggleTable(table.id);
  };

  const handleColumnClick = (column: Column, tableId: string) => {
    setSelectedEntity({ type: 'column', data: column, tableId, modelId: model.id });
  };

  const filteredTables = model.tables.filter(filterTable);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K to focus search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        document.querySelector<HTMLInputElement>('input[placeholder*="Search"]')?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="p-4 border-b space-y-3">
        <Input
          placeholder="Search tables and columns... (⌘K)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-9"
          aria-label="Search model structure"
        />
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={expandAll} aria-label="Expand all tables">
            Expand All
          </Button>
          <Button variant="outline" size="sm" onClick={collapseAll} aria-label="Collapse all tables">
            Collapse All
          </Button>
        </div>
      </div>

      {/* Tree */}
      <div className="flex-1 overflow-y-auto p-4" role="tree" aria-label="Data model structure">
        {/* Model Level */}
        <div
          className={cn(
            'flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer hover:bg-muted',
            isSelected('model', model.id) && 'bg-primary/10 text-primary'
          )}
          onClick={handleModelClick}
          role="treeitem"
          aria-expanded={expandedModel}
          aria-label={`${model.name} model`}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleModelClick();
            }
          }}
        >
          {expandedModel ? (
            <ChevronDown className="h-4 w-4 flex-shrink-0" />
          ) : (
            <ChevronRight className="h-4 w-4 flex-shrink-0" />
          )}
          <Database className="h-4 w-4 flex-shrink-0" />
          <span className="text-sm font-medium">{model.name}</span>
          {showInstructionBadges && (model.instructions?.length || 0) > 0 && (
            <span title="Has instructions">
              <Brain className="h-3 w-3 text-purple-500 flex-shrink-0" />
            </span>
          )}
        </div>

        {/* Tables */}
        {expandedModel && (
          <div className="ml-4 mt-1 space-y-1">
            {filteredTables.map((table) => {
              const isTableExpanded = expandedTables.has(table.id);
              const filteredColumns = table.columns.filter(filterColumn);

              return (
                <div key={table.id}>
                  <div
                    className={cn(
                      'flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer hover:bg-muted',
                      isSelected('table', table.id) && 'bg-primary/10 text-primary'
                    )}
                    onClick={() => handleTableClick(table)}
                  >
                    {isTableExpanded ? (
                      <ChevronDown className="h-4 w-4 flex-shrink-0" />
                    ) : (
                      <ChevronRight className="h-4 w-4 flex-shrink-0" />
                    )}
                    <Table2 className="h-4 w-4 flex-shrink-0" />
                    <span className="text-sm">{table.name}</span>
                    {showInstructionBadges && (table.instructions?.length || 0) > 0 && (
                      <span title="Has instructions">
                        <Brain className="h-3 w-3 text-purple-500 flex-shrink-0" />
                      </span>
                    )}
                  </div>

                  {/* Columns */}
                  {isTableExpanded && (
                    <div className="ml-4 mt-1 space-y-1">
                      {filteredColumns.map((column) => (
                        <div
                          key={column.id}
                          className={cn(
                            'flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer hover:bg-muted',
                            isSelected('column', column.id) && 'bg-primary/10 text-primary'
                          )}
                          onClick={() => handleColumnClick(column, table.id)}
                        >
                          <div className="w-4 flex-shrink-0" />
                          <Columns className="h-4 w-4 flex-shrink-0" />
                          <span className="text-sm">{column.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {column.dataType}
                          </span>
                          {showInstructionBadges && (column.instructions?.length || 0) > 0 && (
                            <span title="Has instructions">
                              <Brain className="h-3 w-3 text-purple-500 flex-shrink-0" />
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

