import React, { useState } from 'react'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Table, TableHeader, TableRow, TableHead, TableCell, TableBody } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
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

  const getGroupTypeBadge = (group: AadGroup) => {
    if (group.groupTypes.includes('Unified')) {
      return <Badge variant="secondary">Microsoft 365</Badge>
    }
    return <Badge variant="outline">Security</Badge>
  }

  const getGroupFeatures = (group: AadGroup) => {
    const features = []
    if (group.membershipRule) {
      features.push(
        <TooltipProvider key="dynamic">
          <Tooltip>
            <TooltipTrigger>
              <Badge variant="secondary">Dynamic</Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>Rule: {group.membershipRule}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    }
    return features
  }

  const hasGuestUsers = (group: AadGroup) => {
    const members = resolveTransitiveMembers(tenant, group.id)
    return members.some(member => member.userPrincipalName.includes('#EXT#'))
  }

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
                <TableHead>Type</TableHead>
                <TableHead>Members</TableHead>
                <TableHead>Features</TableHead>
                <TableHead>Assigned Set</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tenant.groups.map((group) => {
                const members = resolveTransitiveMembers(tenant, group.id)
                const guestCount = members.filter(m => m.userPrincipalName.includes('#EXT#')).length
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
                      {getGroupTypeBadge(group)}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span>{members.length} total</span>
                        {guestCount > 0 && (
                          <span className="text-xs text-muted-foreground">
                            {guestCount} guest{guestCount !== 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {getGroupFeatures(group)}
                        {hasGuestUsers(group) && (
                          <Badge variant="outline">Guest</Badge>
                        )}
                      </div>
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
