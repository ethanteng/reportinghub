'use client';

import { Badge } from '@/components/ui/badge';
import { useBiGeniusStore } from '@/store/useBiGeniusStore';
import { Filter } from 'lucide-react';
import { ID } from '../../../lib/types';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface SmartSelectSummaryProps {
  agentId: ID;
  showLink?: boolean;
}

export function SmartSelectSummary({ agentId, showLink = true }: SmartSelectSummaryProps) {
  const { getSmartSelectSummary } = useBiGeniusStore();
  const summary = getSmartSelectSummary(agentId);

  if (!summary) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      <Filter className="h-4 w-4 text-muted-foreground" />
      <Badge variant="secondary" className="text-xs font-medium">
        Smart Select: {summary.includedTables} tables, {summary.includedColumns} columns included
      </Badge>
      {showLink && (
        <Link href="/model?tab=smart-select">
          <Button variant="ghost" size="sm" className="h-6 text-xs">
            Configure
          </Button>
        </Link>
      )}
    </div>
  );
}

