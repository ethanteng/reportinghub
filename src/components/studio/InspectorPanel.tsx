'use client';

import { Suspense, useState } from 'react';
import { X, AlertCircle, AlertTriangle, Info, Edit3, Check, Plus, Trash2, Filter, EyeOff, Eye } from 'lucide-react';
import { useSearchParams, usePathname } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useBiGeniusStore, SelectedEntity } from '@/store/useBiGeniusStore';
import { InstructionEditor } from './InstructionEditor';
import { InstructionHistoryView } from './InstructionHistory';
import { DataSource, Table, Column, ReadinessSeverity } from '../../../lib/types';
import { toast } from 'sonner';

function InspectorPanelContent() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { selectedEntity, setInspectorOpen, setSelectedEntity } = useBiGeniusStore();
  
  const recommendation = searchParams.get('recommendation');
  const findingTitle = searchParams.get('findingTitle');
  const severity = searchParams.get('severity') as ReadinessSeverity | null;
  const tabParam = searchParams.get('tab');
  const isSmartSelectMode = pathname === '/model' && tabParam === 'smart-select';

  if (!selectedEntity) {
    return null;
  }

  const handleClose = () => {
    setSelectedEntity(null);
    setInspectorOpen(false);
  };

  // Get styling based on severity
  const getSeverityStyle = () => {
    switch (severity) {
      case ReadinessSeverity.Blocker:
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          icon: AlertCircle,
          iconColor: 'text-red-600',
          titleColor: 'text-red-900',
          textColor: 'text-red-700',
        };
      case ReadinessSeverity.Warn:
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          icon: AlertTriangle,
          iconColor: 'text-yellow-600',
          titleColor: 'text-yellow-900',
          textColor: 'text-yellow-700',
        };
      case ReadinessSeverity.Info:
      default:
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          icon: Info,
          iconColor: 'text-blue-600',
          titleColor: 'text-blue-900',
          textColor: 'text-blue-700',
        };
    }
  };

  const severityStyle = getSeverityStyle();
  const SeverityIcon = severityStyle.icon;

  return (
    <div className="w-96 border-l bg-background flex flex-col max-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="font-semibold text-sm">Inspector</h3>
        <Button variant="ghost" size="icon" onClick={handleClose} className="h-8 w-8">
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Readiness Recommendation Banner */}
      {recommendation && findingTitle && (
        <div className={`mx-4 mt-4 p-3 ${severityStyle.bg} border ${severityStyle.border} rounded-lg`}>
          <div className="flex items-start gap-2">
            <SeverityIcon className={`h-4 w-4 ${severityStyle.iconColor} flex-shrink-0 mt-0.5`} />
            <div className="flex-1 min-w-0">
              <div className={`text-xs font-semibold ${severityStyle.titleColor} mb-1`}>
                From Readiness Analysis
              </div>
              <div className={`text-xs font-medium ${severityStyle.titleColor} mb-1`}>
                {decodeURIComponent(findingTitle)}
              </div>
              <div className={`text-xs ${severityStyle.textColor}`}>
                {decodeURIComponent(recommendation)}
              </div>
            </div>
          </div>
        </div>
      )}

          {/* Content */}
          <Tabs 
            defaultValue={isSmartSelectMode && selectedEntity.type !== 'source' ? 'smart-select' : selectedEntity.type === 'source' ? 'summary' : 'instructions'} 
            className="flex-1 flex flex-col overflow-hidden"
          >
            <TabsList className="mx-4 mt-2">
              <TabsTrigger value="summary" className="text-xs">
                Summary
              </TabsTrigger>
              {isSmartSelectMode && selectedEntity.type !== 'source' && (
                <TabsTrigger value="smart-select" className="text-xs">
                  <Filter className="h-3 w-3 mr-1" />
                  Smart Select
                </TabsTrigger>
              )}
              {selectedEntity.type !== 'source' && (
                <TabsTrigger value="instructions" className="text-xs">
                  Instructions
                </TabsTrigger>
              )}
              {selectedEntity.type !== 'source' && (
                <TabsTrigger value="history" className="text-xs">
                  History
                </TabsTrigger>
              )}
            </TabsList>

            <div className="flex-1 overflow-y-auto">
              <TabsContent value="summary" className="p-4 mt-0">
                <SummaryTab entity={selectedEntity} />
              </TabsContent>

              {isSmartSelectMode && selectedEntity.type !== 'source' && (
                <TabsContent value="smart-select" className="p-4 mt-0">
                  <SmartSelectTab entity={selectedEntity} />
                </TabsContent>
              )}

              {selectedEntity.type !== 'source' && (
                <TabsContent value="instructions" className="p-4 mt-0">
                  <InstructionEditor entity={selectedEntity} />
                </TabsContent>
              )}

              {selectedEntity.type !== 'source' && (
                <TabsContent value="history" className="p-4 mt-0">
                  <InstructionHistoryView entity={selectedEntity} />
                </TabsContent>
              )}
            </div>
          </Tabs>
    </div>
  );
}

function SummaryTab({ entity }: { entity: NonNullable<SelectedEntity> }) {
  const { models, setModels } = useBiGeniusStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editDescription, setEditDescription] = useState('');
  const [editSynonyms, setEditSynonyms] = useState<string[]>([]);
  const [newSynonym, setNewSynonym] = useState('');

  // Initialize edit state when entity changes or editing mode starts
  const startEditing = () => {
    if (entity.type === 'model') {
      setEditDescription(entity.data.description || '');
      setEditSynonyms(entity.data.synonyms || []);
    } else if (entity.type === 'table') {
      setEditDescription(entity.data.description || '');
      setEditSynonyms(entity.data.synonyms || []);
    } else if (entity.type === 'column') {
      setEditDescription(entity.data.description || '');
      setEditSynonyms(entity.data.synonyms || []);
    }
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setNewSynonym('');
  };

  const saveChanges = () => {
    const updatedModels = models.map((m) => {
      if (entity.type === 'model' && m.id === entity.data.id) {
        return {
          ...m,
          description: editDescription.trim() || undefined,
          synonyms: editSynonyms.length > 0 ? editSynonyms : undefined,
        };
      } else if (entity.type === 'table' && m.id === entity.modelId) {
        return {
          ...m,
          tables: m.tables.map((t) =>
            t.id === entity.data.id
              ? {
                  ...t,
                  description: editDescription.trim() || undefined,
                  synonyms: editSynonyms.length > 0 ? editSynonyms : undefined,
                }
              : t
          ),
        };
      } else if (entity.type === 'column' && m.id === entity.modelId) {
        return {
          ...m,
          tables: m.tables.map((t) =>
            t.id === entity.tableId
              ? {
                  ...t,
                  columns: t.columns.map((c) =>
                    c.id === entity.data.id
                      ? {
                          ...c,
                          description: editDescription.trim() || undefined,
                          synonyms: editSynonyms.length > 0 ? editSynonyms : undefined,
                        }
                      : c
                  ),
                }
              : t
          ),
        };
      }
      return m;
    });

    setModels(updatedModels);
    setIsEditing(false);
    setNewSynonym('');
    toast.success('Description and synonyms updated');
  };

  const addSynonym = () => {
    if (newSynonym.trim() && !editSynonyms.includes(newSynonym.trim())) {
      setEditSynonyms([...editSynonyms, newSynonym.trim()]);
      setNewSynonym('');
    }
  };

  const removeSynonym = (synonym: string) => {
    setEditSynonyms(editSynonyms.filter((s) => s !== synonym));
  };

  if (entity.type === 'source') {
    const source = entity.data as DataSource;
    return (
      <div className="space-y-4">
        <div>
          <label className="text-xs font-medium text-muted-foreground">Name</label>
          <p className="text-sm mt-1">{source.name}</p>
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Alias</label>
          <p className="text-sm mt-1">{source.alias || '—'}</p>
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Type</label>
          <p className="text-sm mt-1 capitalize">{source.type}</p>
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Details</label>
          <pre className="text-xs mt-1 bg-muted p-2 rounded overflow-x-auto">
            {JSON.stringify(source.details, null, 2)}
          </pre>
        </div>
        {source.lastSyncAt && (
          <div>
            <label className="text-xs font-medium text-muted-foreground">Last Synced</label>
            <p className="text-sm mt-1" suppressHydrationWarning>
              {new Date(source.lastSyncAt).toLocaleString()}
            </p>
          </div>
        )}
      </div>
    );
  }

  if (entity.type === 'model') {
    const model = entity.data;
    return (
      <div className="space-y-4">
        <div>
          <label className="text-xs font-medium text-muted-foreground">Name</label>
          <p className="text-sm mt-1">{model.name}</p>
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Version</label>
          <p className="text-sm mt-1">{model.versionTag}</p>
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Tables</label>
          <p className="text-sm mt-1">{model.tables.length}</p>
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Total Columns</label>
          <p className="text-sm mt-1">
            {model.tables.reduce((sum, t) => sum + t.columns.length, 0)}
          </p>
        </div>

        {/* Description & Synonyms Section */}
        <div className="pt-4 border-t space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold">Description & Synonyms</h4>
            {!isEditing && (
              <Button variant="ghost" size="sm" onClick={startEditing} className="h-7 text-xs">
                <Edit3 className="h-3 w-3 mr-1" />
                Edit
              </Button>
            )}
          </div>

          {isEditing ? (
            <>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Description</label>
                <Textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="Add a description to help the AI understand this model..."
                  className="mt-1 text-sm min-h-[80px]"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground">Synonyms</label>
                <div className="mt-1 space-y-2">
                  {editSynonyms.map((synonym) => (
                    <div key={synonym} className="flex items-center gap-2 bg-muted px-2 py-1 rounded">
                      <span className="text-sm flex-1">{synonym}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => removeSynonym(synonym)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <Input
                      value={newSynonym}
                      onChange={(e) => setNewSynonym(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addSynonym();
                        }
                      }}
                      placeholder="Add synonym..."
                      className="text-sm"
                    />
                    <Button size="sm" onClick={addSynonym} disabled={!newSynonym.trim()}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 justify-end">
                <Button variant="outline" size="sm" onClick={cancelEditing}>
                  <X className="h-3 w-3 mr-1" />
                  Cancel
                </Button>
                <Button size="sm" onClick={saveChanges}>
                  <Check className="h-3 w-3 mr-1" />
                  Save
                </Button>
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Description</label>
                <p className="text-sm mt-1 text-muted-foreground">
                  {model.description || 'No description added'}
                </p>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground">Synonyms</label>
                {model.synonyms && model.synonyms.length > 0 ? (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {model.synonyms.map((synonym) => (
                      <span key={synonym} className="text-xs bg-muted px-2 py-1 rounded">
                        {synonym}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm mt-1 text-muted-foreground">No synonyms added</p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  if (entity.type === 'table') {
    const table = entity.data as Table;
    return (
      <div className="space-y-4">
        <div>
          <label className="text-xs font-medium text-muted-foreground">Table Name</label>
          <p className="text-sm mt-1">{table.name}</p>
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Columns</label>
          <p className="text-sm mt-1">{table.columns.length}</p>
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Column List</label>
          <div className="text-xs mt-1 space-y-1">
            {table.columns.map((col) => (
              <div key={col.id} className="flex items-center justify-between py-1 px-2 bg-muted rounded">
                <span>{col.name}</span>
                <span className="text-muted-foreground">{col.dataType}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Description & Synonyms Section */}
        <div className="pt-4 border-t space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold">Description & Synonyms</h4>
            {!isEditing && (
              <Button variant="ghost" size="sm" onClick={startEditing} className="h-7 text-xs">
                <Edit3 className="h-3 w-3 mr-1" />
                Edit
              </Button>
            )}
          </div>

          {isEditing ? (
            <>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Description</label>
                <Textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="Add a description to help the AI understand this table..."
                  className="mt-1 text-sm min-h-[80px]"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground">Synonyms</label>
                <div className="mt-1 space-y-2">
                  {editSynonyms.map((synonym) => (
                    <div key={synonym} className="flex items-center gap-2 bg-muted px-2 py-1 rounded">
                      <span className="text-sm flex-1">{synonym}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => removeSynonym(synonym)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <Input
                      value={newSynonym}
                      onChange={(e) => setNewSynonym(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addSynonym();
                        }
                      }}
                      placeholder="Add synonym..."
                      className="text-sm"
                    />
                    <Button size="sm" onClick={addSynonym} disabled={!newSynonym.trim()}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 justify-end">
                <Button variant="outline" size="sm" onClick={cancelEditing}>
                  <X className="h-3 w-3 mr-1" />
                  Cancel
                </Button>
                <Button size="sm" onClick={saveChanges}>
                  <Check className="h-3 w-3 mr-1" />
                  Save
                </Button>
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Description</label>
                <p className="text-sm mt-1 text-muted-foreground">
                  {table.description || 'No description added'}
                </p>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground">Synonyms</label>
                {table.synonyms && table.synonyms.length > 0 ? (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {table.synonyms.map((synonym) => (
                      <span key={synonym} className="text-xs bg-muted px-2 py-1 rounded">
                        {synonym}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm mt-1 text-muted-foreground">No synonyms added</p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  if (entity.type === 'column') {
    const column = entity.data as Column;
    return (
      <div className="space-y-4">
        <div>
          <label className="text-xs font-medium text-muted-foreground">Column Name</label>
          <p className="text-sm mt-1">{column.name}</p>
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Data Type</label>
          <p className="text-sm mt-1 capitalize">{column.dataType}</p>
        </div>

        {/* Description & Synonyms Section */}
        <div className="pt-4 border-t space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold">Description & Synonyms</h4>
            {!isEditing && (
              <Button variant="ghost" size="sm" onClick={startEditing} className="h-7 text-xs">
                <Edit3 className="h-3 w-3 mr-1" />
                Edit
              </Button>
            )}
          </div>

          {isEditing ? (
            <>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Description</label>
                <Textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="Add a description to help the AI understand this column..."
                  className="mt-1 text-sm min-h-[80px]"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground">Synonyms</label>
                <div className="mt-1 space-y-2">
                  {editSynonyms.map((synonym) => (
                    <div key={synonym} className="flex items-center gap-2 bg-muted px-2 py-1 rounded">
                      <span className="text-sm flex-1">{synonym}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => removeSynonym(synonym)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <Input
                      value={newSynonym}
                      onChange={(e) => setNewSynonym(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addSynonym();
                        }
                      }}
                      placeholder="Add synonym..."
                      className="text-sm"
                    />
                    <Button size="sm" onClick={addSynonym} disabled={!newSynonym.trim()}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 justify-end">
                <Button variant="outline" size="sm" onClick={cancelEditing}>
                  <X className="h-3 w-3 mr-1" />
                  Cancel
                </Button>
                <Button size="sm" onClick={saveChanges}>
                  <Check className="h-3 w-3 mr-1" />
                  Save
                </Button>
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Description</label>
                <p className="text-sm mt-1 text-muted-foreground">
                  {column.description || 'No description added'}
                </p>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground">Synonyms</label>
                {column.synonyms && column.synonyms.length > 0 ? (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {column.synonyms.map((synonym) => (
                      <span key={synonym} className="text-xs bg-muted px-2 py-1 rounded">
                        {synonym}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm mt-1 text-muted-foreground">No synonyms added</p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  return null;
}

function SmartSelectTab({ entity }: { entity: NonNullable<SelectedEntity> }) {
  const { isTableIncluded, isColumnIncluded, setTableInclusion, setColumnInclusion, getCurrentAgent } = useBiGeniusStore();
  const currentAgent = getCurrentAgent();

  if (entity.type === 'model') {
    return (
      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-semibold mb-2">Smart Select</h4>
          <p className="text-xs text-muted-foreground">
            Use Smart Select to control which tables and columns the AI can access. 
            Exclude irrelevant data to improve performance and reduce costs.
          </p>
        </div>
        <div className="pt-2 border-t">
          <p className="text-xs text-muted-foreground">
            Select a table or column to configure its inclusion status.
          </p>
        </div>
      </div>
    );
  }

  if (entity.type === 'table') {
    const tableIncluded = isTableIncluded(entity.modelId, entity.data.id);
    
    return (
      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-semibold mb-2">Smart Select</h4>
          <div className="flex items-center gap-2 mb-3">
            <Checkbox
              checked={tableIncluded}
              onCheckedChange={(checked) =>
                setTableInclusion(entity.modelId, entity.data.id, checked === true)
              }
              disabled={!currentAgent}
            />
            <label className="text-sm font-medium cursor-pointer" onClick={() => setTableInclusion(entity.modelId, entity.data.id, !tableIncluded)}>
              Include this table
            </label>
          </div>
          <p className="text-xs text-muted-foreground">
            {tableIncluded 
              ? 'This table is included. The AI can access all columns in this table (unless individually excluded).'
              : 'This table is excluded. The AI cannot access any columns in this table.'}
          </p>
        </div>
        {tableIncluded && (
          <div className="pt-2 border-t">
            <p className="text-xs text-muted-foreground mb-2">
              Columns: {entity.data.columns.length} total
            </p>
            <p className="text-xs text-muted-foreground">
              Select individual columns to exclude specific fields while keeping the table included.
            </p>
          </div>
        )}
      </div>
    );
  }

  if (entity.type === 'column') {
    const columnIncluded = isColumnIncluded(entity.modelId, entity.tableId, entity.data.id);
    const tableIncluded = isTableIncluded(entity.modelId, entity.tableId);
    
    return (
      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-semibold mb-2">Smart Select</h4>
          <div className="flex items-center gap-2 mb-3">
            <Checkbox
              checked={columnIncluded}
              onCheckedChange={(checked) =>
                setColumnInclusion(entity.modelId, entity.tableId, entity.data.id, checked === true)
              }
              disabled={!currentAgent || !tableIncluded}
            />
            <label className="text-sm font-medium cursor-pointer" onClick={() => !(!currentAgent || !tableIncluded) && setColumnInclusion(entity.modelId, entity.tableId, entity.data.id, !columnIncluded)}>
              Include this column
            </label>
          </div>
          {!tableIncluded && (
            <p className="text-xs text-yellow-600 mb-2">
              The parent table is excluded, so this column cannot be included.
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            {columnIncluded 
              ? 'This column is included. The AI can use this column when answering questions.'
              : 'This column is excluded. The AI cannot access this column.'}
          </p>
        </div>
      </div>
    );
  }

  return null;
}

export function InspectorPanel() {
  return (
    <Suspense fallback={null}>
      <InspectorPanelContent />
    </Suspense>
  );
}

