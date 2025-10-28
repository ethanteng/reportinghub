'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
  ChevronDown,
  ChevronUp,
  Plus,
  X,
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
  onTest: (agentId: string) => void;
  onUpdatePrompts: (agentId: string, prompts: string[]) => void;
}

export function AgentCard({
  agent,
  onConfigure,
  onRename,
  onClone,
  onDelete,
  onPublish,
  onTest,
  onUpdatePrompts,
}: AgentCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showPrompts, setShowPrompts] = useState(false);
  const [prompts, setPrompts] = useState<string[]>(agent.suggestedPrompts || []);
  const [editingPrompts, setEditingPrompts] = useState(false);

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

  const handleAddPrompt = () => {
    if (prompts.length < 3) {
      setPrompts([...prompts, '']);
      setEditingPrompts(true);
    }
  };

  const handleUpdatePrompt = (index: number, value: string) => {
    const updated = [...prompts];
    updated[index] = value;
    setPrompts(updated);
  };

  const handleRemovePrompt = (index: number) => {
    const updated = prompts.filter((_, i) => i !== index);
    setPrompts(updated);
  };

  const handleSavePrompts = () => {
    const filtered = prompts.filter(p => p.trim() !== '');
    setPrompts(filtered);
    onUpdatePrompts(agent.id, filtered);
    setEditingPrompts(false);
  };

  const handleCancelEdit = () => {
    setPrompts(agent.suggestedPrompts || []);
    setEditingPrompts(false);
  };

  return (
    <>
      <Card className="p-6 hover:shadow-lg transition-shadow flex flex-col">
        <div className="flex flex-col h-full space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold truncate">{agent.name}</h3>
              <p className="text-sm text-muted-foreground truncate mt-0.5 h-5">
                {agent.subheader || '\u00A0'}
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

          {/* Metadata */}
          <div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Version</span>
                <span>{agent.versionTag}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created</span>
                <span suppressHydrationWarning>
                  {new Date(agent.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Updated</span>
                <span suppressHydrationWarning>
                  {agent.updatedAt ? new Date(agent.updatedAt).toLocaleDateString() : '-'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Published</span>
                <span suppressHydrationWarning>
                  {agent.publishedAt ? new Date(agent.publishedAt).toLocaleDateString() : '-'}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button
              onClick={() => onConfigure(agent.id)}
              variant="outline"
              size="sm"
              className="flex-1"
            >
              <FileEdit className="h-4 w-4 mr-2" />
              Configure
            </Button>
            <Button onClick={() => onTest(agent.id)} size="sm" className="flex-1">
              <Play className="h-4 w-4 mr-2" />
              Test
            </Button>
            <Button
              onClick={() => onPublish(agent.id)}
              size="sm"
              className="flex-1"
              disabled={agent.status === AgentStatus.Live}
            >
              <Rocket className="h-4 w-4 mr-2" />
              Publish
            </Button>
          </div>

          {/* Suggested Prompts Expandable Section */}
          <div className="border-t pt-2 mt-2">
            <button
              onClick={() => setShowPrompts(!showPrompts)}
              className="flex items-center justify-between w-full text-xs font-medium hover:text-primary transition-colors py-1"
            >
              <span>Suggested Prompts ({prompts.length}/3)</span>
              {showPrompts ? (
                <ChevronUp className="h-3 w-3" />
              ) : (
                <ChevronDown className="h-3 w-3" />
              )}
            </button>

            {showPrompts && (
              <div className="mt-3 space-y-2">
                {prompts.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic">
                    No prompts added yet
                  </p>
                ) : (
                  prompts.map((prompt, index) => (
                    <div key={index} className="flex items-start gap-2">
                      {editingPrompts ? (
                        <>
                          <Input
                            value={prompt}
                            onChange={(e) => handleUpdatePrompt(index, e.target.value)}
                            placeholder="Enter a suggested prompt..."
                            className="text-xs flex-1"
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 flex-shrink-0"
                            onClick={() => handleRemovePrompt(index)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </>
                      ) : (
                        <p className="text-xs text-muted-foreground flex-1">
                          {prompt}
                        </p>
                      )}
                    </div>
                  ))
                )}

                <div className="flex gap-2 pt-2">
                  {editingPrompts ? (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCancelEdit}
                        className="flex-1 text-xs"
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleSavePrompts}
                        className="flex-1 text-xs"
                      >
                        Save
                      </Button>
                    </>
                  ) : (
                    <>
                      {prompts.length < 3 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleAddPrompt}
                          className="flex-1 text-xs"
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Add Prompt
                        </Button>
                      )}
                      {prompts.length > 0 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingPrompts(true)}
                          className="flex-1 text-xs"
                        >
                          <Edit2 className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </div>
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

