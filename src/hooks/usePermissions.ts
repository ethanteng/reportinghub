import { usePermissionsStore } from '@/store/usePermissionsStore'
import { useMemo } from 'react'
import { Tenant, ReportRef, AadGroup, Guid } from '../types'
import { getEffectivePermissionSetId, resolveTransitiveMembers } from '../types/mockAzureAD'

export function usePermissions() {
  const store = usePermissionsStore()
  
  return {
    ...store,
    // Add computed values and helper functions
    getCurrentTenant: () => {
      if (!store.currentTenantId) return null
      // This would need to be passed from parent or stored differently
      return null
    }
  }
}

export function useGroupMembers(tenant: Tenant, groupId: Guid) {
  return useMemo(() => {
    return resolveTransitiveMembers(tenant, groupId)
  }, [tenant, groupId])
}

export function useEffectivePermission(tenantId: Guid, groupId: Guid, reportId?: string) {
  const { assignments, permissionSets } = usePermissionsStore()
  
  return useMemo(() => {
    const eff = getEffectivePermissionSetId(tenantId, groupId, reportId)
    const ps = permissionSets.find(p => p.id === eff.permissionSetId)
    return {
      ...eff,
      permissionSet: ps
    }
  }, [tenantId, groupId, reportId, assignments, permissionSets])
}

export function usePermissionSetUsage(permissionSetId: string) {
  const { assignments } = usePermissionsStore()
  
  return useMemo(() => {
    return assignments.filter(a => a.permissionSetId === permissionSetId).length
  }, [permissionSetId, assignments])
}
