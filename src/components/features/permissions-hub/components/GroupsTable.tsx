import React, { useState } from 'react'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Table, TableHeader, TableRow, TableHead, TableCell, TableBody } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  resolveTransitiveMembers, 
  getEffectivePermissionSetId, 
  AadGroup, 
  Tenant, 
  Guid 
} from '@/types/mockAzureAD'
import { usePermissionsStore } from '@/store/usePermissionsStore'
import { AssignTenantSetModal } from '../modals/AssignTenantSetModal'

interface GroupsTableProps {
  tenant: Tenant
}

export function GroupsTable({ tenant }: GroupsTableProps) {
  const { assignments, permissionSets } = usePermissionsStore()
  const [assignModalOpen, setAssignModalOpen] = useState(false)
  const [selectedGroup, setSelectedGroup] = useState<AadGroup | null>(null)

  const psById = new Map(permissionSets.map(ps => [ps.id, ps]))


  const handleAssignClick = (group: AadGroup) => {
    setSelectedGroup(group)
    setAssignModalOpen(true)
  }

  return (
    <>
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Groups from Identity Provider</h3>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Group Name</TableHead>
                <TableHead>Members</TableHead>
                <TableHead>Assigned Set</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tenant.groups.map((group) => {
                const members = resolveTransitiveMembers(tenant, group.id)
                const eff = getEffectivePermissionSetId(tenant.tenantId, group.id)
                const ps = eff.permissionSetId ? psById.get(eff.permissionSetId) : null
                
                return (
                  <TableRow key={group.id}>
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <span>{group.displayName}</span>
                        {group.description && (
                          <span className="text-xs text-muted-foreground">
                            {group.description}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span>{members.length} total</span>
                    </TableCell>
                    <TableCell>
                      {ps ? (
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">{ps.name}</Badge>
                          <Badge variant="outline">
                            {eff.inheritedFrom === 'Tenant' ? 'Tenant' : 'Override'}
                          </Badge>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Not assigned</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleAssignClick(group)}
                      >
                        Change
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {selectedGroup && (
        <AssignTenantSetModal
          open={assignModalOpen}
          onOpenChange={setAssignModalOpen}
          group={selectedGroup}
          tenant={tenant}
        />
      )}
    </>
  )
}
