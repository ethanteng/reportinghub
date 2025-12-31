import React, { useEffect } from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { GroupsTable } from './GroupsTable'
import { PermissionSetsTable } from './PermissionSetsTable'
import { ReportAccessMatrix } from './ReportAccessMatrix'
import { ReportAccessMatrixSidebar } from './ReportAccessMatrixSidebar'
import { SetupWizard } from './SetupWizard'
import { GroupRoleWizard } from './GroupRoleWizard'
import { 
  tenantContoso, 
  reports, 
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
    setSetupWizardOpen,
    groupRoleWizardOpen,
    setGroupRoleWizardOpen
  } = usePermissionsStore()

  // Store is now initialized with default tenant

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
          <Button 
            variant="outline"
            onClick={() => setGroupRoleWizardOpen(true)}
          >
            Permissions Setup Wizard
          </Button>
          {/* Permissions Setup Wizard button temporarily hidden */}
          {/* <Button 
            variant="outline"
            onClick={() => setSetupWizardOpen(true)}
          >
            Permissions Setup Wizard
          </Button> */}
        </div>
      </header>

      <Tabs defaultValue="groups" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          {/* Report Access tab temporarily hidden */}
          {/* <TabsTrigger value="reports">Report Access</TabsTrigger> */}
          <TabsTrigger value="groups">Users & Groups</TabsTrigger>
          <TabsTrigger value="sets">Permission Sets</TabsTrigger>
        </TabsList>

        {/* Report Access tab content - temporarily hidden */}
        {/* <TabsContent value="reports">
          <ReportAccessMatrixSidebar tenant={currentTenant} reports={reports} />
        </TabsContent> */}

        <TabsContent value="groups">
          <GroupsTable tenant={currentTenant} />
        </TabsContent>

        <TabsContent value="sets">
          <PermissionSetsTable />
        </TabsContent>
      </Tabs>

      <SetupWizard 
        open={setupWizardOpen} 
        onOpenChange={setSetupWizardOpen}
        tenant={currentTenant}
      />
      
      <GroupRoleWizard 
        open={groupRoleWizardOpen} 
        onOpenChange={setGroupRoleWizardOpen}
        tenant={currentTenant}
      />
    </div>
  )
}
