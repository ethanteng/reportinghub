'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import {
  MoreVertical,
  Play,
  Copy,
  Edit2,
  Trash2,
  Rocket,
  FileEdit,
} from 'lucide-react';
import { AgentConfig, AgentStatus } from '../../../lib/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface AgentCardProps {
  agent: AgentConfig;
  onConfigure: (agentId: string) => void;
  onRename: (agentId: string) => void;
  onClone: (agentId: string) => void;
  onDelete: (agentId: string) => void;
  onPublish: (agentId: string) => void;
}

export function AgentCard({
  agent,
  onConfigure,
  onRename,
  onClone,
  onDelete,
  onPublish,
}: AgentCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const getStatusBadge = (status: AgentStatus) => {
    switch (status) {
      case AgentStatus.Live:
        return <Badge className="bg-green-600">Live</Badge>;
      case AgentStatus.Draft:
        return <Badge variant="secondary">Draft</Badge>;
      case AgentStatus.Archived:
        return <Badge variant="outline">Archived</Badge>;
    }
  };

  return (
    <>
      <Card className="p-6 hover:shadow-lg transition-shadow flex flex-col h-full">
        <div className="flex flex-col h-full space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold truncate">{agent.name}</h3>
              <p className="text-sm text-muted-foreground">
                Version {agent.versionTag}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {getStatusBadge(agent.status)}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onRename(agent.id)}>
                    <Edit2 className="h-4 w-4 mr-2" />
                    Rename
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onClone(agent.id)}>
                    <Copy className="h-4 w-4 mr-2" />
                    Clone
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => setShowDeleteDialog(true)}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Metadata - Fixed height to align buttons */}
          <div className="flex-1">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created</span>
                <span suppressHydrationWarning>
                  {new Date(agent.createdAt).toLocaleDateString()}
                </span>
              </div>
              {agent.updatedAt && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Updated</span>
                  <span suppressHydrationWarning>
                    {new Date(agent.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              )}
              {agent.publishedAt && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Published</span>
                  <span suppressHydrationWarning>
                    {new Date(agent.publishedAt).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button
              onClick={() => onConfigure(agent.id)}
              variant="outline"
              size="sm"
              className="flex-1"
            >
              <FileEdit className="h-4 w-4 mr-2" />
              Configure
            </Button>
            {agent.status === AgentStatus.Draft && (
              <Button
                onClick={() => onPublish(agent.id)}
                size="sm"
                className="flex-1"
              >
                <Rocket className="h-4 w-4 mr-2" />
                Publish
              </Button>
            )}
            {agent.status === AgentStatus.Live && (
              <Button size="sm" className="flex-1">
                <Play className="h-4 w-4 mr-2" />
                Test
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Agent</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{agent.name}"? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onDelete(agent.id);
                setShowDeleteDialog(false);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

