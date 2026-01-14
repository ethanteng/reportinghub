'use client';

import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ReportType } from '@/types/manageContent';
import { Sparkles } from 'lucide-react';

interface ReportTypeSelectorProps {
  value: ReportType;
  onChange: (value: ReportType) => void;
}

export function ReportTypeSelector({ value, onChange }: ReportTypeSelectorProps) {
  return (
    <div className="space-y-3">
      <Label>Report Type</Label>
      <RadioGroup value={value} onValueChange={onChange} className="flex gap-6">
        <div className="flex items-center space-x-2">
          <RadioGroupItem value={ReportType.Paginated} id="paginated" />
          <Label htmlFor="paginated" className="font-normal cursor-pointer">
            Paginated Report Visual
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value={ReportType.BiGenius} id="bi-genius" />
          <Label htmlFor="bi-genius" className="font-normal cursor-pointer flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            BI Genius
          </Label>
        </div>
      </RadioGroup>
    </div>
  );
}
