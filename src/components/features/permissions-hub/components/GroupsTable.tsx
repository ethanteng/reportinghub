import React, { useState } from 'react'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Table, TableHeader, TableRow, TableHead, TableCell, TableBody } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { 
  resolveTransitiveMembers, 
  getEffectivePermissionSetId, 
  AadGroup, 
  AadUser,
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
  const [selectedUser, setSelectedUser] = useState<AadUser | null>(null)

  const psById = new Map(permissionSets.map(ps => [ps.id, ps]))

  const handleAssignClick = (group: AadGroup) => {
    setSelectedGroup(group)
    setSelectedUser(null)
    setAssignModalOpen(true)
  }

  const handleUserOverrideClick = (user: AadUser) => {
    setSelectedUser(user)
    setSelectedGroup(null)
    setAssignModalOpen(true)
  }

  // Helper function to get groups a user belongs to
  const getUserGroups = (userId: Guid) => {
    return tenant.groups.filter(group => 
      group.members.some(member => member.id === userId)
    )
  }

  // Helper function to get effective permission set for a user
  const getUserEffectivePermissionSet = (userId: Guid) => {
    // Find assignments for this user (direct or through groups)
    const userAssignments = assignments.filter(a => 
      a.tenantId === tenant.tenantId && 
      a.scope === 'Tenant' &&
      // Check if user is a member of the assigned group
      tenant.groups.some(g => 
        g.id === a.aadGroupId && 
        g.members.some(m => m.id === userId)
      )
    )
    
    if (userAssignments.length === 0) return null
    
    // For simplicity, return the first assignment's permission set
    // In a real app, you might want to handle multiple assignments differently
    const firstAssignment = userAssignments[0]
    return psById.get(firstAssignment.permissionSetId)
  }


  return (
    <>
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Users & Groups from Identity Provider</h3>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="groups" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="groups">Groups</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
            </TabsList>
            
            <TabsContent value="groups">
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
                            <Badge variant="secondary">{ps.name}</Badge>
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
            </TabsContent>
            
            <TabsContent value="users">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Groups</TableHead>
                    <TableHead>Effective Permission Set</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tenant.users.map((user) => {
                    const userGroups = getUserGroups(user.id)
                    const effectivePs = getUserEffectivePermissionSet(user.id)
                    
                    return (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          <div className="flex flex-col">
                            <span>{user.displayName}</span>
                            <span className="text-xs text-muted-foreground">
                              {user.userPrincipalName}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">
                            {user.mail || 'No email'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={user.accountEnabled ? "default" : "secondary"}
                            className={user.accountEnabled ? "bg-green-100 text-green-800" : ""}
                          >
                            {user.accountEnabled ? 'Active' : 'Disabled'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {userGroups.length > 0 ? (
                              userGroups.map((group) => (
                                <Badge 
                                  key={group.id} 
                                  variant="outline" 
                                  className="text-xs"
                                >
                                  {group.displayName}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-muted-foreground text-sm">No groups</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {effectivePs ? (
                            <Badge variant="secondary">{effectivePs.name}</Badge>
                          ) : (
                            <span className="text-muted-foreground">No permissions</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleUserOverrideClick(user)}
                          >
                            Override
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {(selectedGroup || selectedUser) && (
        <AssignTenantSetModal
          open={assignModalOpen}
          onOpenChange={setAssignModalOpen}
          group={selectedGroup}
          user={selectedUser}
          tenant={tenant}
        />
      )}
    </>
  )
}
