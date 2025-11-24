'use client';

import { TenantDetailTabs } from '@/components/admin/TenantDetailTabs';
import { tenants } from '@/lib/data/admin/tenants';
import { getUsersForTenant } from '@/lib/data/admin/users';
import { notFound, useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function TenantDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const tenant = tenants.find((t) => t.id === id);

  if (!tenant) {
    notFound();
  }

  const users = getUsersForTenant(tenant.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push('/admin/tenants-workspaces')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{tenant.name}</h2>
          <p className="text-muted-foreground">Tenant details and configuration</p>
        </div>
      </div>

      <TenantDetailTabs tenant={tenant} users={users} />
    </div>
  );
}

