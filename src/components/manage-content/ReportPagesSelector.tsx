'use client';

import { Label } from '@/components/ui/label';
import { PageMultiSelect } from './PageMultiSelect';

export const REPORT_PAGES = [
  'All Pages',
  'Market Growth',
  'Product Sales',
  'Sales Performance',
  'Revenue Streams',
  'Operating Profit',
  'Financial KPIs',
  'Annual Sales Trends',
];

interface ReportPagesSelectorProps {
  selectedPages: string[];
  onSelectedPagesChange: (pages: string[]) => void;
}

export function ReportPagesSelector({
  selectedPages,
  onSelectedPagesChange,
}: ReportPagesSelectorProps) {
  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">Select Report Page</Label>
      <PageMultiSelect
        availablePages={REPORT_PAGES}
        selectedPages={selectedPages}
        onSelectedPagesChange={onSelectedPagesChange}
      />
    </div>
  );
}
