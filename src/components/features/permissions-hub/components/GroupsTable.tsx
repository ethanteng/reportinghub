import React, { useState, useMemo } from 'react'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Table, TableHeader, TableRow, TableHead, TableCell, TableBody } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
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
import { Search, Plus, X } from 'lucide-react'

interface GroupsTableProps {
  tenant: Tenant
}

// Fake data for search functionality
const fakeGroups: AadGroup[] = [
  {
    "@odata.type": "#microsoft.graph.group",
    id: "fake-group-1" as Guid,
    displayName: "IT Administrators",
    description: "IT department administrators",
    securityEnabled: true,
    groupTypes: [],
    members: []
  },
  {
    "@odata.type": "#microsoft.graph.group",
    id: "fake-group-2" as Guid,
    displayName: "Sales Team",
    description: "Sales and marketing team members",
    securityEnabled: true,
    groupTypes: [],
    members: []
  },
  {
    "@odata.type": "#microsoft.graph.group",
    id: "fake-group-3" as Guid,
    displayName: "HR Department",
    description: "Human resources department",
    securityEnabled: true,
    groupTypes: [],
    members: []
  },
  {
    "@odata.type": "#microsoft.graph.group",
    id: "fake-group-4" as Guid,
    displayName: "Executive Team",
    description: "C-level executives and senior management",
    securityEnabled: true,
    groupTypes: [],
    members: []
  }
]

const fakeUsers: AadUser[] = [
  {
    "@odata.type": "#microsoft.graph.user",
    id: "fake-user-1" as Guid,
    displayName: "Sarah Johnson",
    mail: "sarah.johnson@contoso.com",
    userPrincipalName: "sarah.johnson@contoso.com",
    givenName: "Sarah",
    surname: "Johnson",
    accountEnabled: true,
  },
  {
    "@odata.type": "#microsoft.graph.user",
    id: "fake-user-2" as Guid,
    displayName: "Michael Chen",
    mail: "michael.chen@contoso.com",
    userPrincipalName: "michael.chen@contoso.com",
    givenName: "Michael",
    surname: "Chen",
    accountEnabled: true,
  },
  {
    "@odata.type": "#microsoft.graph.user",
    id: "fake-user-3" as Guid,
    displayName: "Emily Rodriguez",
    mail: "emily.rodriguez@contoso.com",
    userPrincipalName: "emily.rodriguez@contoso.com",
    givenName: "Emily",
    surname: "Rodriguez",
    accountEnabled: true,
  },
  {
    "@odata.type": "#microsoft.graph.user",
    id: "fake-user-4" as Guid,
    displayName: "David Kim",
    mail: "david.kim@contoso.com",
    userPrincipalName: "david.kim@contoso.com",
    givenName: "David",
    surname: "Kim",
    accountEnabled: false,
  }
]

export function GroupsTable({ tenant }: GroupsTableProps) {
  const { assignments, permissionSets } = usePermissionsStore()
  const [assignModalOpen, setAssignModalOpen] = useState(false)
  const [selectedGroup, setSelectedGroup] = useState<AadGroup | null>(null)
  const [selectedUser, setSelectedUser] = useState<AadUser | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [searchResults, setSearchResults] = useState<{groups: AadGroup[], users: AadUser[]}>({groups: [], users: []})

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

  // Search functionality
  const handleSearch = (query: string) => {
    setSearchQuery(query)
    if (query.trim().length < 2) {
      setSearchResults({groups: [], users: []})
      return
    }

    const filteredGroups = fakeGroups.filter(group => 
      group.displayName.toLowerCase().includes(query.toLowerCase()) ||
      (group.description && group.description.toLowerCase().includes(query.toLowerCase()))
    )

    const filteredUsers = fakeUsers.filter(user => 
      user.displayName.toLowerCase().includes(query.toLowerCase()) ||
      user.mail?.toLowerCase().includes(query.toLowerCase()) ||
      user.userPrincipalName.toLowerCase().includes(query.toLowerCase())
    )

    setSearchResults({groups: filteredGroups, users: filteredUsers})
  }

  const handleAddGroup = (group: AadGroup) => {
    // In a real app, this would add the group to the tenant
    console.log('Adding group:', group.displayName)
    setShowSearch(false)
    setSearchQuery('')
    setSearchResults({groups: [], users: []})
  }

  const handleAddUser = (user: AadUser) => {
    // In a real app, this would add the user to the tenant
    console.log('Adding user:', user.displayName)
    setShowSearch(false)
    setSearchQuery('')
    setSearchResults({groups: [], users: []})
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
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Users & Groups from Identity Provider</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSearch(!showSearch)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Users & Groups
            </Button>
          </div>
          
          {showSearch && (
            <div className="mt-4 space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search for users and groups to add..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              {(searchResults.groups.length > 0 || searchResults.users.length > 0) && (
                <div className="space-y-4">
                  {searchResults.groups.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">Groups</h4>
                      <div className="space-y-2">
                        {searchResults.groups.map((group) => (
                          <div key={group.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                              <div className="font-medium">{group.displayName}</div>
                              {group.description && (
                                <div className="text-sm text-muted-foreground">{group.description}</div>
                              )}
                            </div>
                            <Button
                              size="sm"
                              onClick={() => handleAddGroup(group)}
                              className="flex items-center gap-1"
                            >
                              <Plus className="h-3 w-3" />
                              Add
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {searchResults.users.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">Users</h4>
                      <div className="space-y-2">
                        {searchResults.users.map((user) => (
                          <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                              <div className="font-medium">{user.displayName}</div>
                              <div className="text-sm text-muted-foreground">{user.mail || user.userPrincipalName}</div>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => handleAddUser(user)}
                              className="flex items-center gap-1"
                            >
                              <Plus className="h-3 w-3" />
                              Add
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {searchQuery.length >= 2 && searchResults.groups.length === 0 && searchResults.users.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Search className="h-8 w-8 mx-auto mb-2" />
                  <p>No users or groups found matching "{searchQuery}"</p>
                </div>
              )}
            </div>
          )}
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
