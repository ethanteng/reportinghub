'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ApiKey } from '@/types/apiKeys';
import { StatusBadge } from './StatusBadge';
import { MoreHorizontal, Copy, RotateCw, Ban, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { availableScopes } from '@/lib/data/admin/scopes';

interface ApiKeyTableProps {
  apiKeys: ApiKey[];
  onRotate: (keyId: string) => void;
  onRevoke: (keyId: string) => void;
  onDelete: (keyId: string) => void;
}

function formatExpiration(expirationDate: string): string {
  const expiration = new Date(expirationDate);
  const now = new Date();
  const diffMs = expiration.getTime() - now.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return 'Expired';
  } else if (diffDays === 0) {
    return 'Expires today';
  } else if (diffDays === 1) {
    return 'Expires tomorrow';
  } else if (diffDays < 30) {
    return `${diffDays} days remaining`;
  } else {
    const months = Math.floor(diffDays / 30);
    return `${months} month${months > 1 ? 's' : ''} remaining`;
  }
}

function formatLastUsed(lastUsed: string | null): string {
  if (!lastUsed) {
    return 'Never';
  }

  const lastUsedDate = new Date(lastUsed);
  const now = new Date();
  const diffMs = now.getTime() - lastUsedDate.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) {
    return 'Just now';
  } else if (diffMinutes < 60) {
    return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  } else if (diffDays < 7) {
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  } else {
    return lastUsedDate.toLocaleDateString();
  }
}

function getScopeDisplayName(scopeId: string): string {
  const scope = availableScopes.find((s) => s.id === scopeId);
  return scope?.name || scopeId;
}

function getStatusBadgeStatus(status: string): 'Active' | 'Inactive' | 'Error' {
  if (status === 'Active') return 'Active';
  if (status === 'Revoked') return 'Error';
  return 'Inactive';
}

export function ApiKeyTable({ apiKeys, onRotate, onRevoke, onDelete }: ApiKeyTableProps) {
  const handleCopy = (key: ApiKey) => {
    if (key.status !== 'Active') {
      toast.error('Only active keys can be copied');
      return;
    }
    // In a real app, this would copy the token, but we don't store tokens after creation
    toast.success('API key copied to clipboard');
  };

  const handleRotate = (keyId: string) => {
    onRotate(keyId);
    toast.success('API key rotated successfully');
  };

  const handleRevoke = (keyId: string) => {
    onRevoke(keyId);
    toast.success('API key revoked');
  };

  const handleDelete = (keyId: string) => {
    onDelete(keyId);
    toast.success('API key deleted');
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Key Name</TableHead>
            <TableHead>Scopes</TableHead>
            <TableHead>Expiration</TableHead>
            <TableHead>Last Used</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {apiKeys.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                No API keys found. Create your first API key to get started.
              </TableCell>
            </TableRow>
          ) : (
            apiKeys.map((key) => (
              <TableRow key={key.id}>
                <TableCell className="font-medium">{key.name}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {key.scopes.map((scope) => (
                      <Badge key={scope} variant="outline" className="text-xs">
                        {getScopeDisplayName(scope)}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatExpiration(key.expiration)}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatLastUsed(key.lastUsed)}
                </TableCell>
                <TableCell>
                  <StatusBadge status={getStatusBadgeStatus(key.status)} />
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {key.status === 'Active' && (
                        <DropdownMenuItem onClick={() => handleCopy(key)}>
                          <Copy className="mr-2 h-4 w-4" />
                          Copy
                        </DropdownMenuItem>
                      )}
                      {key.status === 'Active' && (
                        <DropdownMenuItem onClick={() => handleRotate(key.id)}>
                          <RotateCw className="mr-2 h-4 w-4" />
                          Rotate
                        </DropdownMenuItem>
                      )}
                      {key.status !== 'Revoked' && (
                        <DropdownMenuItem
                          onClick={() => handleRevoke(key.id)}
                          className="text-orange-600"
                        >
                          <Ban className="mr-2 h-4 w-4" />
                          Revoke
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleDelete(key.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
