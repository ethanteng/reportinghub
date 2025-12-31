'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { SourceCard } from '@/components/studio/SourceCard';
import { EmptyState } from '@/components/studio/EmptyState';
import { AddDataSourceDialog } from '@/components/studio/AddDataSourceDialog';
import { VersionContext } from '@/components/studio/VersionContext';
import { useBiGeniusStore } from '@/store/useBiGeniusStore';
import { syncDataSource } from '../../../lib/mockServices';
import { toast } from 'sonner';
import { Database, RefreshCw, Plus, Trash2 } from 'lucide-react';
import { SyncStatus } from '../../../lib/types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function DataSourcesPage() {
  const {
    dataSources,
    selectedSourceIds,
    toggleSourceSelection,
    clearSourceSelection,
    updateDataSource,
    addDataSource,
    removeDataSource,
    setSelectedEntity,
    getCurrentAgent,
    updateAgentConfig,
  } = useBiGeniusStore();
  
  const currentAgent = getCurrentAgent();
  
  // Filter data sources to only show those associated with the current agent
  const agentDataSources = currentAgent 
    ? dataSources.filter((ds) => currentAgent.sourceIds.includes(ds.id))
    : [];
  
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [sourceToDelete, setSourceToDelete] = useState<string | null>(null);

  const handleSync = async (id: string) => {
    try {
      updateDataSource(id, { status: SyncStatus.Syncing });
      toast.loading('Syncing data source...', { id: `sync-${id}` });

      const updated = await syncDataSource(id);
      updateDataSource(id, updated);

      toast.success('Data source synced successfully', { id: `sync-${id}` });
    } catch (error) {
      updateDataSource(id, { status: SyncStatus.Error });
      toast.error('Failed to sync data source', { id: `sync-${id}` });
    }
  };

  const handleBulkSync = async () => {
    if (selectedSourceIds.length === 0) return;

    toast.loading(`Syncing ${selectedSourceIds.length} data sources...`, { id: 'bulk-sync' });

    try {
      await Promise.all(selectedSourceIds.map((id) => handleSync(id)));
      toast.success('All data sources synced', { id: 'bulk-sync' });
      clearSourceSelection();
    } catch (error) {
      toast.error('Some sources failed to sync', { id: 'bulk-sync' });
    }
  };

  const handleAliasUpdate = (id: string, alias: string) => {
    updateDataSource(id, { alias });
    toast.success('Alias updated');
  };

  const handleCardClick = (source: typeof dataSources[0]) => {
    setSelectedEntity({ type: 'source', data: source });
  };

  const handleAddSource = (source: typeof dataSources[0]) => {
    addDataSource(source);
    
    // Associate the data source with the current agent
    if (currentAgent) {
      updateAgentConfig(currentAgent.id, {
        sourceIds: [...currentAgent.sourceIds, source.id],
      });
    }
    
    toast.success('Data source added');
  };

  const handleDeleteClick = (id: string) => {
    setSourceToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (sourceToDelete) {
      removeDataSource(sourceToDelete);
      
      // Remove the data source from the current agent's sourceIds
      if (currentAgent) {
        updateAgentConfig(currentAgent.id, {
          sourceIds: currentAgent.sourceIds.filter((id) => id !== sourceToDelete),
        });
      }
      
      toast.success('Data source removed');
      setSourceToDelete(null);
    }
    setDeleteDialogOpen(false);
  };

  const handleBulkDelete = () => {
    if (selectedSourceIds.length === 0) return;
    
    selectedSourceIds.forEach((id) => removeDataSource(id));
    
    // Remove the data sources from the current agent's sourceIds
    if (currentAgent) {
      updateAgentConfig(currentAgent.id, {
        sourceIds: currentAgent.sourceIds.filter((id) => !selectedSourceIds.includes(id)),
      });
    }
    
    toast.success(`Removed ${selectedSourceIds.length} data source${selectedSourceIds.length !== 1 ? 's' : ''}`);
    clearSourceSelection();
  };

  if (agentDataSources.length === 0) {
    const isNewAgent = currentAgent?.sourceIds.length === 0;
    return (
      <div className="h-full flex items-center justify-center">
        <EmptyState
          icon={Database}
          title={isNewAgent ? "Welcome! Let's set up your AI agent" : "No data sources"}
          description={
            isNewAgent
              ? "Connect your first data source to begin building your AI agent. You can add Power BI datasets, SQL databases, or other data sources."
              : "Add a data source to get started"
          }
          action={
            <Button onClick={() => setAddDialogOpen(true)} size={isNewAgent ? "lg" : "default"}>
              <Plus className="h-4 w-4 mr-2" />
              {isNewAgent ? "Add Your First Data Source" : "Add Data Source"}
            </Button>
          }
        />
        <AddDataSourceDialog
          open={addDialogOpen}
          onOpenChange={setAddDialogOpen}
          onAdd={handleAddSource}
        />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b bg-background sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold">Data Sources</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Connect and sync your data sources
              </p>
              <div className="mt-3">
                <VersionContext />
              </div>
            </div>
            <div className="flex items-center gap-2">
              {selectedSourceIds.length > 0 ? (
                <>
                  <Button variant="outline" size="sm" onClick={clearSourceSelection}>
                    Clear ({selectedSourceIds.length})
                  </Button>
                  <Button size="sm" onClick={handleBulkSync}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Sync Selected
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={handleBulkDelete}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Selected
                  </Button>
                </>
              ) : (
                <Button size="sm" onClick={() => setAddDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Data Source
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {agentDataSources.map((source) => (
            <SourceCard
              key={source.id}
              source={source}
              selected={selectedSourceIds.includes(source.id)}
              onSelect={toggleSourceSelection}
              onSync={handleSync}
              onAliasUpdate={handleAliasUpdate}
              onClick={() => handleCardClick(source)}
            />
          ))}
        </div>
      </div>

      {/* Dialogs */}
      <AddDataSourceDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onAdd={handleAddSource}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Data Source</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this data source? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

