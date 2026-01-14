'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FormField } from '@/components/admin/FormField';
import { SemanticModel } from '@/types/manageContent';
import { formatModelDisplay } from '@/lib/data/manageContent';

interface ModelSelectorProps {
  models: SemanticModel[];
  value?: string;
  onChange: (modelId: string) => void;
}

export function ModelSelector({ models, value, onChange }: ModelSelectorProps) {
  return (
    <div className="space-y-2">
      <FormField
        label="Select Dynamic Semantic Model"
        description="Choose the semantic model for dynamic binding"
      >
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select a model..." />
          </SelectTrigger>
          <SelectContent>
            {models.map((model) => (
              <SelectItem key={model.id} value={model.id}>
                {formatModelDisplay(model)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormField>
      <p className="text-sm text-muted-foreground">
        Note: not all semantic models support roles. Once you select a user or group, only roles supported by the selected semantic model are shown.
      </p>
    </div>
  );
}
