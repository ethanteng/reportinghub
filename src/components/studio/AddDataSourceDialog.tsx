'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DataSource, DataSourceType, SyncStatus, ID } from '../../../lib/types';

interface AddDataSourceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (source: DataSource) => void;
}

export function AddDataSourceDialog({ open, onOpenChange, onAdd }: AddDataSourceDialogProps) {
  const [type, setType] = useState<DataSourceType>(DataSourceType.PowerBI);
  const [name, setName] = useState('');
  const [alias, setAlias] = useState('');
  const [details, setDetails] = useState({
    workspace: '',
    dataset: '',
    host: '',
    db: '',
    schema: '',
    url: '',
    path: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) return;

    // Build type-specific details
    let sourceDetails: Record<string, any> = {};
    if (type === DataSourceType.PowerBI) {
      sourceDetails = { workspace: details.workspace, dataset: details.dataset };
    } else if (type === DataSourceType.SQL) {
      sourceDetails = { host: details.host, db: details.db, schema: details.schema };
    } else if (type === DataSourceType.URL) {
      sourceDetails = { url: details.url };
    } else if (type === DataSourceType.File) {
      sourceDetails = { path: details.path };
    }

    const newSource: DataSource = {
      id: `ds_${Date.now()}` as ID,
      type,
      name: name.trim(),
      alias: alias.trim() || undefined,
      details: sourceDetails,
      status: SyncStatus.Idle,
    };

    onAdd(newSource);
    handleClose();
  };

  const handleClose = () => {
    setName('');
    setAlias('');
    setDetails({
      workspace: '',
      dataset: '',
      host: '',
      db: '',
      schema: '',
      url: '',
      path: '',
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add Data Source</DialogTitle>
            <DialogDescription>
              Connect a new data source to your agent configuration.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Type */}
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select value={type} onValueChange={(value) => setType(value as DataSourceType)}>
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={DataSourceType.PowerBI}>Power BI</SelectItem>
                  <SelectItem value={DataSourceType.SQL}>SQL Database</SelectItem>
                  <SelectItem value={DataSourceType.File}>File</SelectItem>
                  <SelectItem value={DataSourceType.URL}>URL</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Sales Data Warehouse"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            {/* Alias */}
            <div className="space-y-2">
              <Label htmlFor="alias">Alias (optional)</Label>
              <Input
                id="alias"
                placeholder="e.g., Sales DW"
                value={alias}
                onChange={(e) => setAlias(e.target.value)}
              />
            </div>

            {/* Type-specific fields */}
            {type === DataSourceType.PowerBI && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="workspace">Workspace</Label>
                  <Input
                    id="workspace"
                    placeholder="e.g., Sales"
                    value={details.workspace}
                    onChange={(e) =>
                      setDetails({ ...details, workspace: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dataset">Dataset</Label>
                  <Input
                    id="dataset"
                    placeholder="e.g., Sales Core"
                    value={details.dataset}
                    onChange={(e) =>
                      setDetails({ ...details, dataset: e.target.value })
                    }
                  />
                </div>
              </>
            )}

            {type === DataSourceType.SQL && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="host">Host</Label>
                  <Input
                    id="host"
                    placeholder="e.g., sql.example.com"
                    value={details.host}
                    onChange={(e) => setDetails({ ...details, host: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="db">Database</Label>
                  <Input
                    id="db"
                    placeholder="e.g., dwh"
                    value={details.db}
                    onChange={(e) => setDetails({ ...details, db: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="schema">Schema</Label>
                  <Input
                    id="schema"
                    placeholder="e.g., dbo"
                    value={details.schema}
                    onChange={(e) =>
                      setDetails({ ...details, schema: e.target.value })
                    }
                  />
                </div>
              </>
            )}

            {type === DataSourceType.URL && (
              <div className="space-y-2">
                <Label htmlFor="url">URL</Label>
                <Input
                  id="url"
                  type="url"
                  placeholder="https://example.com"
                  value={details.url}
                  onChange={(e) => setDetails({ ...details, url: e.target.value })}
                />
              </div>
            )}

            {type === DataSourceType.File && (
              <div className="space-y-2">
                <Label htmlFor="path">File Path</Label>
                <Input
                  id="path"
                  placeholder="e.g., /data/sales.csv"
                  value={details.path}
                  onChange={(e) => setDetails({ ...details, path: e.target.value })}
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!name.trim()}>
              Add Data Source
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

