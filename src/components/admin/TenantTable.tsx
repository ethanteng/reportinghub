'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { DataTable, Column, SortDirection } from './DataTable';
import { StatusBadge } from './StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tenant } from '@/lib/data/admin/tenants';
import { MoreHorizontal, Eye, CreditCard, Ban } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface TenantTableProps {
  tenants: Tenant[];
}

export function TenantTable({ tenants }: TenantTableProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [environmentFilter, setEnvironmentFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [planFilter, setPlanFilter] = useState<string>('all');
  const [sortKey, setSortKey] = useState<keyof Tenant | string>('lastActive');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const filteredAndSortedTenants = useMemo(() => {
    let filtered = tenants.filter((tenant) => {
      const matchesSearch =
        searchQuery === '' ||
        tenant.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesEnvironment =
        environmentFilter === 'all' || tenant.environment === environmentFilter;
      const matchesStatus =
        statusFilter === 'all' || tenant.status === statusFilter;
      const matchesPlan = planFilter === 'all' || tenant.plan === planFilter;

      return matchesSearch && matchesEnvironment && matchesStatus && matchesPlan;
    });

    // Sort
    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      if (sortKey === 'lastActive') {
        aValue = new Date(a.lastActive).getTime();
        bValue = new Date(b.lastActive).getTime();
      } else if (sortKey === 'name') {
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
      } else if (sortKey === 'createdAt') {
        aValue = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        bValue = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      } else {
        aValue = a[sortKey as keyof Tenant];
        bValue = b[sortKey as keyof Tenant];
      }

      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [tenants, searchQuery, environmentFilter, statusFilter, planFilter, sortKey, sortDirection]);

  const handleSort = (key: keyof Tenant | string) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('desc');
    }
  };

  const handleRowClick = (tenant: Tenant) => {
    router.push(`/admin/tenants/${tenant.id}`);
  };

  const columns: Column<Tenant>[] = [
    {
      key: 'name',
      header: 'Tenant Name',
      sortable: true,
      render: (tenant) => (
        <span className="font-medium">{tenant.name}</span>
      ),
    },
    {
      key: 'environment',
      header: 'Environment',
      render: (tenant) => tenant.environment,
    },
    {
      key: 'plan',
      header: 'License Plan',
      render: (tenant) => tenant.plan,
    },
    {
      key: 'status',
      header: 'Status',
      render: (tenant) => <StatusBadge status={tenant.status} />,
    },
    {
      key: 'lastActive',
      header: 'Last Active Date',
      sortable: true,
      render: (tenant) => new Date(tenant.lastActive).toLocaleDateString(),
    },
    {
      key: 'users',
      header: 'User Count',
      render: (tenant) => tenant.users,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (tenant) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={(e) => {
              e.stopPropagation();
              handleRowClick(tenant);
            }}>
              <Eye className="mr-2 h-4 w-4" />
              Manage
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => {
              e.stopPropagation();
              router.push(`/admin/subscription-billing?tenant=${tenant.id}`);
            }}>
              <CreditCard className="mr-2 h-4 w-4" />
              View Billing
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
              <Ban className="mr-2 h-4 w-4" />
              Disable
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <Input
                placeholder="Search tenants..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Environment</label>
              <Select value={environmentFilter} onValueChange={setEnvironmentFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Environments</SelectItem>
                  <SelectItem value="Global">Global</SelectItem>
                  <SelectItem value="Production">Production</SelectItem>
                  <SelectItem value="UAT">UAT</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Plan</label>
              <Select value={planFilter} onValueChange={setPlanFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Plans</SelectItem>
                  <SelectItem value="Commercial">Commercial</SelectItem>
                  <SelectItem value="Pro">Pro</SelectItem>
                  <SelectItem value="Standard">Standard</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <DataTable
        data={filteredAndSortedTenants}
        columns={columns}
        sortKey={sortKey}
        sortDirection={sortDirection}
        onSort={handleSort}
        onRowClick={handleRowClick}
      />
    </div>
  );
}

