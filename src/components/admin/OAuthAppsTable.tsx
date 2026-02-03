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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { OAuthApp } from '@/types/apiKeys';
import { StatusBadge } from './StatusBadge';
import { MoreHorizontal, Copy, Ban, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface OAuthAppsTableProps {
  apps: OAuthApp[];
  onRevoke: (appId: string) => void;
  onDelete: (appId: string) => void;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function formatLastUsed(lastUsed: string | null): string {
  if (!lastUsed) {
    return 'Never';
  }

  const lastUsedDate = new Date(lastUsed);
  const now = new Date();
  const diffMs = now.getTime() - lastUsedDate.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffHours < 24) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  } else if (diffDays < 7) {
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  } else {
    return formatDate(lastUsed);
  }
}

export function OAuthAppsTable({ apps, onRevoke, onDelete }: OAuthAppsTableProps) {
  const handleCopyClientId = (app: OAuthApp) => {
    navigator.clipboard.writeText(app.clientId);
    toast.success('Client ID copied to clipboard');
  };

  const handleRevoke = (appId: string) => {
    onRevoke(appId);
    toast.success('OAuth application revoked');
  };

  const handleDelete = (appId: string) => {
    onDelete(appId);
    toast.success('OAuth application deleted');
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>App Name</TableHead>
            <TableHead>Client ID</TableHead>
            <TableHead>Redirect URIs</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Last Used</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {apps.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                No OAuth applications found. Create your first OAuth app to get started.
              </TableCell>
            </TableRow>
          ) : (
            apps.map((app) => (
              <TableRow key={app.id}>
                <TableCell className="font-medium">{app.name}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <code className="text-xs bg-muted px-2 py-1 rounded">
                      {app.clientId}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => handleCopyClientId(app)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {app.redirectUris.map((uri, idx) => (
                      <code key={idx} className="text-xs bg-muted px-2 py-1 rounded">
                        {uri}
                      </code>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDate(app.createdAt)}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatLastUsed(app.lastUsed)}
                </TableCell>
                <TableCell>
                  <StatusBadge status={app.status === 'Active' ? 'Active' : 'Error'} />
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleCopyClientId(app)}>
                        <Copy className="mr-2 h-4 w-4" />
                        Copy Client ID
                      </DropdownMenuItem>
                      {app.status !== 'Revoked' && (
                        <DropdownMenuItem
                          onClick={() => handleRevoke(app.id)}
                          className="text-orange-600"
                        >
                          <Ban className="mr-2 h-4 w-4" />
                          Revoke
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleDelete(app.id)}
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
