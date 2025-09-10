import React from 'react'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { tenants, byTenantId } from '@/types/mockAzureAD'
import { usePermissionsStore } from '@/store/usePermissionsStore'

export function TenantSwitcher() {
  const { currentTenantId, setCurrentTenantId } = usePermissionsStore()
  
  const currentTenant = currentTenantId ? byTenantId.get(currentTenantId) : null

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium">Tenant:</span>
      <Select
        value={currentTenantId || ''}
        onValueChange={(value) => setCurrentTenantId(value as any)}
      >
        <SelectTrigger className="w-[280px]">
          <SelectValue placeholder="Select a tenant" />
        </SelectTrigger>
        <SelectContent>
          {tenants.map((tenant) => (
            <SelectItem key={tenant.tenantId} value={tenant.tenantId}>
              <div className="flex flex-col">
                <span className="font-medium">{tenant.displayName}</span>
                <span className="text-xs text-muted-foreground">
                  {tenant.defaultDomainName}
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
