'use client';

import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronDown, Database, Table2, Columns, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Breadcrumbs } from './Breadcrumbs';
import { cn } from '@/lib/utils';
import { SemanticModel, Table, Column } from '../../../lib/types';
import { useBiGeniusStore } from '@/store/useBiGeniusStore';

interface MultiModelTreeViewProps {
  models: SemanticModel[];
  showInstructionBadges?: boolean;
  filterWithInstructions?: boolean;
  onFilterChange?: (checked: boolean) => void;
  initialExpandedModels?: Set<string>;
  initialExpandedTables?: Set<string>;
}

export function MultiModelTreeView({
  models,
  showInstructionBadges,
  filterWithInstructions,
  onFilterChange,
  initialExpandedModels,
  initialExpandedTables,
}: MultiModelTreeViewProps) {
  const [expandedModels, setExpandedModels] = useState<Set<string>>(initialExpandedModels || new Set());
  const [expandedTables, setExpandedTables] = useState<Set<string>>(initialExpandedTables || new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const { selectedEntity, setSelectedEntity } = useBiGeniusStore();

  // Update expansion state when initial props change (e.g., from navigation)
  useEffect(() => {
    if (initialExpandedModels && initialExpandedModels.size > 0) {
      setExpandedModels(initialExpandedModels);
    }
    if (initialExpandedTables && initialExpandedTables.size > 0) {
      setExpandedTables(initialExpandedTables);
    }
  }, [initialExpandedModels, initialExpandedTables]);

  const toggleModel = (modelId: string) => {
    setExpandedModels((prev) => {
      const next = new Set(prev);
      if (next.has(modelId)) {
        next.delete(modelId);
      } else {
        next.add(modelId);
      }
      return next;
    });
  };

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
    setExpandedModels(new Set(models.map((m) => m.id)));
    const allTableIds: string[] = [];
    models.forEach((model) => {
      model.tables.forEach((t) => allTableIds.push(t.id));
    });
    setExpandedTables(new Set(allTableIds));
  };

  const collapseAll = () => {
    setExpandedModels(new Set());
    setExpandedTables(new Set());
  };

  const isSelected = (type: 'model' | 'table' | 'column', id: string): boolean => {
    if (!selectedEntity) return false;
    if (selectedEntity.type !== type) return false;
    return selectedEntity.data.id === id;
  };

  const handleModelClick = (model: SemanticModel) => {
    setSelectedEntity({ type: 'model', data: model });
    toggleModel(model.id);
  };

  const handleTableClick = (table: Table, modelId: string) => {
    setSelectedEntity({ type: 'table', data: table, modelId });
    toggleTable(table.id);
  };

  const handleColumnClick = (column: Column, tableId: string, modelId: string) => {
    setSelectedEntity({ type: 'column', data: column, tableId, modelId });
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        document.querySelector<HTMLInputElement>('input[placeholder*="Search"]')?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const filteredModels = models.filter((model) => {
    if (filterWithInstructions) {
      const hasInstructions =
        (model.instructions?.length || 0) > 0 ||
        model.tables.some(
          (t) =>
            (t.instructions?.length || 0) > 0 ||
            t.columns.some((c) => (c.instructions?.length || 0) > 0)
        );
      if (!hasInstructions) return false;
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        model.name.toLowerCase().includes(query) ||
        model.tables.some(
          (t) =>
            t.name.toLowerCase().includes(query) ||
            t.columns.some((c) => c.name.toLowerCase().includes(query))
        )
      );
    }

    return true;
  });

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="border-b">
        <div className="p-4 space-y-3">
          <Input
            placeholder="Search tables and columns... (⌘K)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9"
            aria-label="Search model structure"
          />
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={expandAll} aria-label="Expand all models and tables">
                Expand All
              </Button>
              <Button variant="outline" size="sm" onClick={collapseAll} aria-label="Collapse all models and tables">
                Collapse All
              </Button>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="filter-instructions"
                checked={filterWithInstructions}
                onCheckedChange={(checked) => onFilterChange?.(checked as boolean)}
              />
              <Label htmlFor="filter-instructions" className="text-sm cursor-pointer">
                Show only items with instructions
              </Label>
            </div>
          </div>
        </div>
        <Breadcrumbs selectedEntity={selectedEntity} />
      </div>

      {/* Tree */}
      <div className="flex-1 overflow-y-auto p-4" role="tree" aria-label="Data models structure">
        {filteredModels.map((model) => {
          const isModelExpanded = expandedModels.has(model.id);

          return (
            <div key={model.id} className="mb-2">
              {/* Model Level */}
              <div
                className={cn(
                  'flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer hover:bg-muted',
                  isSelected('model', model.id) && 'bg-primary/10 text-primary'
                )}
                onClick={() => handleModelClick(model)}
                role="treeitem"
                aria-expanded={isModelExpanded}
                aria-label={`${model.name} model`}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleModelClick(model);
                  }
                }}
              >
                {isModelExpanded ? (
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
              {isModelExpanded && (
                <div className="ml-4 mt-1 space-y-1">
                  {model.tables
                    .filter((table) => {
                      // If filterWithInstructions is enabled, only show tables that have instructions
                      // or have columns with instructions
                      if (filterWithInstructions) {
                        const hasTableInstructions = (table.instructions?.length || 0) > 0;
                        const hasColumnInstructions = table.columns.some(
                          (c) => (c.instructions?.length || 0) > 0
                        );
                        return hasTableInstructions || hasColumnInstructions;
                      }
                      return true;
                    })
                    .map((table) => {
                      const isTableExpanded = expandedTables.has(table.id);

                      return (
                        <div key={table.id}>
                          <div
                            className={cn(
                              'flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer hover:bg-muted',
                              isSelected('table', table.id) && 'bg-primary/10 text-primary'
                            )}
                            onClick={() => handleTableClick(table, model.id)}
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
                              {table.columns
                                .filter((column) => {
                                  // If filterWithInstructions is enabled, only show columns with instructions
                                  if (filterWithInstructions) {
                                    return (column.instructions?.length || 0) > 0;
                                  }
                                  return true;
                                })
                                .map((column) => (
                                  <div
                                    key={column.id}
                                    className={cn(
                                      'flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer hover:bg-muted',
                                      isSelected('column', column.id) && 'bg-primary/10 text-primary'
                                    )}
                                    onClick={() => handleColumnClick(column, table.id, model.id)}
                                  >
                                    <div className="w-4 flex-shrink-0" />
                                    <Columns className="h-4 w-4 flex-shrink-0" />
                                    <span className="text-sm">{column.name}</span>
                                    <span className="text-xs text-muted-foreground">
                                      {column.dataType}
                                    </span>
                                    {showInstructionBadges &&
                                      (column.instructions?.length || 0) > 0 && (
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
          );
        })}
      </div>
    </div>
  );
}

