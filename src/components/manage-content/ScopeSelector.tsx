'use client';

import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { FormField } from '@/components/admin/FormField';
import { DynamicBindingScope } from '@/types/manageContent';

interface ScopeSelectorProps {
  value: DynamicBindingScope;
  onChange: (value: DynamicBindingScope) => void;
}

export function ScopeSelector({ value, onChange }: ScopeSelectorProps) {
  return (
    <FormField
      label="Dynamic Binding Scope"
      description="Select whether dynamic binding applies at the report level or group level"
    >
      <RadioGroup value={value} onValueChange={onChange} className="space-y-3">
        <div className="flex items-center space-x-2">
          <RadioGroupItem value={DynamicBindingScope.Report} id="scope-report" />
          <Label htmlFor="scope-report" className="font-normal cursor-pointer">
            Report-level (default)
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value={DynamicBindingScope.Group} id="scope-group" />
          <Label htmlFor="scope-group" className="font-normal cursor-pointer">
            Group-level
          </Label>
        </div>
      </RadioGroup>
    </FormField>
  );
}
