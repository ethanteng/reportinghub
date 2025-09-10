import React, { useEffect } from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { TenantSwitcher } from './TenantSwitcher'
import { GroupsTable } from './GroupsTable'
import { PermissionSetsTable } from './PermissionSetsTable'
import { ReportAccessMatrix } from './ReportAccessMatrix'
import { SetupWizard } from './SetupWizard'
import { 
  tenants, 
  tenantContoso, 
  permissionSets, 
  reports, 
  assignments, 
  byTenantId 
} from '@/types/mockAzureAD'
import { usePermissionsStore } from '@/store/usePermissionsStore'

export function PermissionsHub() {
  const { 
    currentTenantId, 
    setCurrentTenantId, 
    permissionSets: storePermissionSets,
    assignments: storeAssignments,
    setupWizardOpen,
    setSetupWizardOpen
  } = usePermissionsStore()

  // Initialize with default tenant and data
  useEffect(() => {
    if (!currentTenantId) {
      setCurrentTenantId(tenantContoso.tenantId)
    }
    
    // Initialize store with mock data
    if (storePermissionSets.length === 0) {
      permissionSets.forEach(ps => {
        usePermissionsStore.getState().addPermissionSet(ps)
      })
    }
    
    if (storeAssignments.length === 0) {
      assignments.forEach(assignment => {
        usePermissionsStore.getState().addAssignment(assignment)
      })
    }
  }, [currentTenantId, setCurrentTenantId, storePermissionSets.length, storeAssignments.length])

  const currentTenant = currentTenantId ? byTenantId.get(currentTenantId) : null

  if (!currentTenant) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Permissions Hub</h1>
          <p className="text-muted-foreground">Please select a tenant to continue.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-4">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Permissions Hub</h1>
          <p className="text-sm text-muted-foreground">
            Tenant: {currentTenant.displayName} ({currentTenant.defaultDomainName})
          </p>
        </div>
        <div className="flex items-center gap-4">
          <TenantSwitcher />
          <Button 
            variant="outline" 
            onClick={() => setSetupWizardOpen(true)}
          >
            Setup Wizard
          </Button>
        </div>
      </header>

      <Tabs defaultValue="groups" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="groups">Users & Groups</TabsTrigger>
          <TabsTrigger value="sets">Permission Sets</TabsTrigger>
          <TabsTrigger value="reports">Report Access</TabsTrigger>
        </TabsList>

        <TabsContent value="groups">
          <GroupsTable tenant={currentTenant} />
        </TabsContent>

        <TabsContent value="sets">
          <PermissionSetsTable />
        </TabsContent>

        <TabsContent value="reports">
          <ReportAccessMatrix tenant={currentTenant} reports={reports} />
        </TabsContent>
      </Tabs>

      <SetupWizard 
        open={setupWizardOpen} 
        onOpenChange={setSetupWizardOpen}
        tenant={currentTenant}
      />
    </div>
  )
}
