'use client';

import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { FormField } from '@/components/admin/FormField';

interface DisplayOptionsProps {
  showFilterPane: boolean;
  showContentPane: boolean;
  showTitleAndDescription: boolean;
  onShowFilterPaneChange: (value: boolean) => void;
  onShowContentPaneChange: (value: boolean) => void;
  onShowTitleAndDescriptionChange: (value: boolean) => void;
}

export function DisplayOptions({
  showFilterPane,
  showContentPane,
  showTitleAndDescription,
  onShowFilterPaneChange,
  onShowContentPaneChange,
  onShowTitleAndDescriptionChange,
}: DisplayOptionsProps) {
  return (
    <FormField label="Report Display Options">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="filter-pane" className="font-normal cursor-pointer">
            Show Filter Pane
          </Label>
          <Switch
            id="filter-pane"
            checked={showFilterPane}
            onCheckedChange={onShowFilterPaneChange}
          />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="content-pane" className="font-normal cursor-pointer">
            Show Content Pane
          </Label>
          <Switch
            id="content-pane"
            checked={showContentPane}
            onCheckedChange={onShowContentPaneChange}
          />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="title-desc" className="font-normal cursor-pointer">
            Show Title and Description
          </Label>
          <Switch
            id="title-desc"
            checked={showTitleAndDescription}
            onCheckedChange={onShowTitleAndDescriptionChange}
          />
        </div>
      </div>
    </FormField>
  );
}
