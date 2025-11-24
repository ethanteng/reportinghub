'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { ReactNode } from 'react';

export type SortDirection = 'asc' | 'desc' | null;

export interface Column<T> {
  key: keyof T | string;
  header: string;
  render?: (row: T) => ReactNode;
  sortable?: boolean;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  sortKey?: keyof T | string;
  sortDirection?: SortDirection;
  onSort?: (key: keyof T | string) => void;
  onRowClick?: (row: T) => void;
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  sortKey,
  sortDirection,
  onSort,
  onRowClick,
}: DataTableProps<T>) {
  const handleSort = (key: keyof T | string) => {
    if (onSort) {
      onSort(key);
    }
  };

  const getSortIcon = (columnKey: keyof T | string) => {
    if (!sortKey || sortKey !== columnKey) {
      return <ArrowUpDown className="ml-2 h-4 w-4" />;
    }
    if (sortDirection === 'asc') {
      return <ArrowUp className="ml-2 h-4 w-4" />;
    }
    if (sortDirection === 'desc') {
      return <ArrowDown className="ml-2 h-4 w-4" />;
    }
    return <ArrowUpDown className="ml-2 h-4 w-4" />;
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead key={String(column.key)}>
                {column.sortable ? (
                  <Button
                    variant="ghost"
                    className="h-8 -ml-3 hover:bg-transparent"
                    onClick={() => handleSort(column.key)}
                  >
                    {column.header}
                    {getSortIcon(column.key)}
                  </Button>
                ) : (
                  column.header
                )}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="text-center text-muted-foreground">
                No data available
              </TableCell>
            </TableRow>
          ) : (
            data.map((row, idx) => (
              <TableRow
                key={idx}
                className={onRowClick ? 'cursor-pointer' : ''}
                onClick={() => onRowClick?.(row)}
              >
                {columns.map((column) => (
                  <TableCell key={String(column.key)}>
                    {column.render ? column.render(row) : String(row[column.key] ?? '')}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

