'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useBiGeniusStore, SelectedEntity } from '@/store/useBiGeniusStore';
import { addInstruction } from '../../../lib/mockServices';
import { InstructionScope, Instruction } from '../../../lib/types';

interface InstructionEditorProps {
  entity: SelectedEntity;
}

export function InstructionEditor({ entity }: InstructionEditorProps) {
  const { models, setModels } = useBiGeniusStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newContent, setNewContent] = useState('');

  if (!entity) {
    return null;
  }

  // Find the model this entity belongs to
  const getModel = () => {
    if (entity.type === 'model') {
      return models.find((m) => m.id === entity.data.id);
    } else if (entity.type === 'table') {
      return models.find((m) => m.id === entity.modelId);
    } else if (entity.type === 'column') {
      return models.find((m) => m.id === entity.modelId);
    }
    return null;
  };

  const currentModel = getModel();

  const getInstructions = (): Instruction[] => {
    if (!currentModel) return [];

    // Get fresh data from the store instead of stale entity prop
    if (entity.type === 'model') {
      return currentModel.instructions || [];
    } else if (entity.type === 'table') {
      const table = currentModel.tables.find((t) => t.id === entity.data.id);
      return table?.instructions || [];
    } else if (entity.type === 'column') {
      const table = currentModel.tables.find((t) => t.id === entity.tableId);
      const column = table?.columns.find((c) => c.id === entity.data.id);
      return column?.instructions || [];
    }
    return [];
  };

  const getScope = (): InstructionScope => {
    if (entity.type === 'model') return InstructionScope.Model;
    if (entity.type === 'table') return InstructionScope.Table;
    return InstructionScope.Column;
  };

  const getTargetId = (): string => {
    return entity.data.id;
  };

  const handleAdd = () => {
    if (!newContent.trim() || !currentModel) {
      toast.error('Instruction cannot be empty');
      return;
    }

    const instruction = addInstruction(getScope(), getTargetId(), newContent.trim());

    // Update the model in store
    const updatedModels = models.map((m) => {
      if (m.id !== currentModel.id) return m;

      const updatedModel = { ...m };

      if (entity.type === 'model') {
        updatedModel.instructions = [...(updatedModel.instructions || []), instruction];
      } else if (entity.type === 'table') {
        const table = updatedModel.tables.find((t) => t.id === entity.data.id);
        if (table) {
          table.instructions = [...(table.instructions || []), instruction];
        }
      } else if (entity.type === 'column') {
        const table = updatedModel.tables.find((t) => t.id === entity.tableId);
        if (table) {
          const column = table.columns.find((c) => c.id === entity.data.id);
          if (column) {
            column.instructions = [...(column.instructions || []), instruction];
          }
        }
      }

      return updatedModel;
    });

    setModels(updatedModels);
    setNewContent('');
    toast.success('Instruction added');
  };

  const handleDelete = (instructionId: string) => {
    if (!currentModel) return;

    const updatedModels = models.map((m) => {
      if (m.id !== currentModel.id) return m;

      const updatedModel = { ...m };

      if (entity.type === 'model') {
        updatedModel.instructions = updatedModel.instructions?.filter(
          (i) => i.id !== instructionId
        );
      } else if (entity.type === 'table') {
        const table = updatedModel.tables.find((t) => t.id === entity.data.id);
        if (table) {
          table.instructions = table.instructions?.filter((i) => i.id !== instructionId);
        }
      } else if (entity.type === 'column') {
        const table = updatedModel.tables.find((t) => t.id === entity.tableId);
        if (table) {
          const column = table.columns.find((c) => c.id === entity.data.id);
          if (column) {
            column.instructions = column.instructions?.filter((i) => i.id !== instructionId);
          }
        }
      }

      return updatedModel;
    });

    setModels(updatedModels);
    toast.success('Instruction deleted');
  };

  const instructions = getInstructions();

  return (
    <div className="space-y-4">
      {/* Existing Instructions */}
      {instructions.length > 0 ? (
        <div className="space-y-3">
          {instructions.map((instruction) => (
            <div
              key={instruction.id}
              className="p-3 bg-muted rounded-lg border space-y-2"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm flex-1">{instruction.content}</p>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 flex-shrink-0"
                  onClick={() => handleDelete(instruction.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
              <div className="text-xs text-muted-foreground" suppressHydrationWarning>
                {new Date(instruction.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No instructions yet</p>
      )}

      {/* Add New Instruction */}
      <div className="space-y-2">
        <label className="text-xs font-medium">Add Instruction</label>
        <Textarea
          placeholder="Enter instruction for the AI agent..."
          value={newContent}
          onChange={(e) => setNewContent(e.target.value)}
          rows={4}
          className="text-sm"
        />
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {newContent.length} characters
          </span>
          <Button onClick={handleAdd} size="sm" disabled={!newContent.trim()}>
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
        </div>
      </div>
    </div>
  );
}

