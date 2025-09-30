import React, { useState, useMemo } from 'react'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Table, TableHeader, TableRow, TableHead, TableCell, TableBody } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { 
  resolveTransitiveMembers, 
  getEffectivePermissionSetId, 
  AadGroup, 
  AadUser,
  Tenant, 
  Guid,
  reports
} from '@/types/mockAzureAD'
import { usePermissionsStore } from '@/store/usePermissionsStore'
import { AssignTenantSetModal } from '../modals/AssignTenantSetModal'
import { Search, Plus, X, Settings, Users, UserCheck, Filter, ChevronLeft, ChevronRight } from 'lucide-react'

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
  const { assignments, permissionSets, addAssignment } = usePermissionsStore()
  const [assignModalOpen, setAssignModalOpen] = useState(false)
  const [selectedGroup, setSelectedGroup] = useState<AadGroup | null>(null)
  const [selectedUser, setSelectedUser] = useState<AadUser | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [searchResults, setSearchResults] = useState<{groups: AadGroup[], users: AadUser[]}>({groups: [], users: []})
  
  // New state for enhanced functionality
  const [selectedItems, setSelectedItems] = useState<Set<Guid>>(new Set())
  const [bulkPermissionSet, setBulkPermissionSet] = useState<string>('')
  const [showBulkAssign, setShowBulkAssign] = useState(false)
  const [reportAssignMode, setReportAssignMode] = useState<'group' | 'user' | null>(null)
  const [reportAssignTarget, setReportAssignTarget] = useState<AadGroup | AadUser | null>(null)
  const [selectedReports, setSelectedReports] = useState<Set<string>>(new Set())
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [activeTab, setActiveTab] = useState<'groups' | 'users'>('groups')

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

  // New handlers for enhanced functionality
  const handleItemSelect = (itemId: Guid, checked: boolean) => {
    const newSelected = new Set(selectedItems)
    if (checked) {
      newSelected.add(itemId)
    } else {
      newSelected.delete(itemId)
    }
    setSelectedItems(newSelected)
  }

  const handleSelectAll = (checked: boolean, items: (AadGroup | AadUser)[]) => {
    if (checked) {
      const allIds = new Set([...selectedItems, ...items.map(item => item.id)])
      setSelectedItems(allIds)
    } else {
      const itemIds = new Set(items.map(item => item.id))
      const newSelected = new Set([...selectedItems].filter(id => !itemIds.has(id)))
      setSelectedItems(newSelected)
    }
  }

  const handleBulkAssign = () => {
    if (!bulkPermissionSet) return
    
    selectedItems.forEach(itemId => {
      // Check if it's a group or user
      const isGroup = tenant.groups.some(g => g.id === itemId)
      const isUser = tenant.users.some(u => u.id === itemId)
      
      if (isGroup || isUser) {
        addAssignment({
          tenantId: tenant.tenantId,
          aadGroupId: itemId,
          permissionSetId: bulkPermissionSet,
          scope: 'Tenant',
          inherited: false
        })
      }
    })
    
    setShowBulkAssign(false)
    setBulkPermissionSet('')
    setSelectedItems(new Set())
  }

  const handleReportAssign = () => {
    if (!reportAssignTarget || selectedReports.size === 0) return
    
    // For each selected report, create a report-level assignment
    selectedReports.forEach(reportId => {
      addAssignment({
        tenantId: tenant.tenantId,
        aadGroupId: reportAssignTarget.id,
        permissionSetId: 'ps_viewer', // Default to viewer for report assignments
        scope: 'Report',
        inherited: false,
        targetId: reportId
      })
    })
    
    setReportAssignMode(null)
    setReportAssignTarget(null)
    setSelectedReports(new Set())
  }

  const openReportAssign = (item: AadGroup | AadUser, type: 'group' | 'user') => {
    setReportAssignTarget(item)
    setReportAssignMode(type)
    setSelectedReports(new Set())
  }

  const handleReportToggle = (reportId: string, checked: boolean) => {
    const newSelected = new Set(selectedReports)
    if (checked) {
      newSelected.add(reportId)
    } else {
      newSelected.delete(reportId)
    }
    setSelectedReports(newSelected)
  }

  // Pagination logic
  const getPaginatedData = (data: (AadGroup | AadUser)[]) => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return {
      items: data.slice(startIndex, endIndex),
      totalItems: data.length,
      totalPages: Math.ceil(data.length / itemsPerPage),
      hasNextPage: endIndex < data.length,
      hasPrevPage: currentPage > 1
    }
  }

  const paginatedGroups = getPaginatedData(tenant.groups)
  const paginatedUsers = getPaginatedData(tenant.users)

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
            <div className="flex items-center gap-2">
              {selectedItems.size > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowBulkAssign(true)}
                  className="flex items-center gap-2"
                >
                  <Filter className="h-4 w-4" />
                  Bulk Assign ({selectedItems.size})
                </Button>
              )}
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

          {/* Bulk Assignment Modal */}
          {showBulkAssign && (
            <div className="mt-4 p-4 border rounded-lg bg-muted/50">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium">Bulk Assign Permission Set</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowBulkAssign(false)}
                >
                  ×
                </Button>
              </div>
              <div className="space-y-3">
                <div>
                  <Label>Permission Set</Label>
                  <RadioGroup
                    value={bulkPermissionSet}
                    onValueChange={setBulkPermissionSet}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="ps_viewer" id="bulk-viewer" />
                        <Label htmlFor="bulk-viewer">Viewer</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="ps_editor" id="bulk-editor" />
                        <Label htmlFor="bulk-editor">Editor</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="ps_admin" id="bulk-admin" />
                        <Label htmlFor="bulk-admin">Admin</Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleBulkAssign} disabled={!bulkPermissionSet}>
                    Apply to {selectedItems.size} items
                  </Button>
                  <Button variant="outline" onClick={() => setShowBulkAssign(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Report Assignment Modal */}
          {reportAssignMode && reportAssignTarget && (
            <div className="mt-4 p-4 border rounded-lg bg-blue-50">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium">
                  Assign Reports to {reportAssignMode === 'group' ? 'Group' : 'User'}: {reportAssignTarget.displayName}
                </h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setReportAssignMode(null)
                    setReportAssignTarget(null)
                    setSelectedReports(new Set())
                  }}
                >
                  ×
                </Button>
              </div>
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Select one or more reports to assign to this {reportAssignMode}. The {reportAssignMode} will have viewer access to selected reports.
                </p>
                
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {reports.map((report) => (
                    <div key={report.id} className="flex items-center space-x-2">
                      <Checkbox
                        checked={selectedReports.has(report.id)}
                        onCheckedChange={(checked: boolean) => handleReportToggle(report.id, checked)}
                      />
                      <Label className="flex-1 cursor-pointer">
                        <div className="flex flex-col">
                          <span className="font-medium">{report.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {report.description || 'No description'}
                          </span>
                        </div>
                      </Label>
                    </div>
                  ))}
                </div>
                
                <div className="flex gap-2 pt-2">
                  <Button 
                    onClick={handleReportAssign} 
                    disabled={selectedReports.size === 0}
                    size="sm"
                  >
                    Assign {selectedReports.size} Report{selectedReports.size !== 1 ? 's' : ''}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setReportAssignMode(null)
                      setReportAssignTarget(null)
                      setSelectedReports(new Set())
                    }}
                    size="sm"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(value) => {
            setActiveTab(value as 'groups' | 'users')
            setCurrentPage(1)
            setSelectedItems(new Set())
          }} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="groups">Groups ({tenant.groups.length})</TabsTrigger>
              <TabsTrigger value="users">Users ({tenant.users.length})</TabsTrigger>
            </TabsList>
            
            <TabsContent value="groups">
              <div className="space-y-4">
                {/* Select All Header */}
                {paginatedGroups.items.length > 0 && (
                  <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/30">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={paginatedGroups.items.every(group => selectedItems.has(group.id))}
                        onCheckedChange={(checked: boolean) => handleSelectAll(checked, paginatedGroups.items)}
                      />
                      <span className="text-sm font-medium">
                        Select all on this page ({paginatedGroups.items.length})
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {selectedItems.size} total selected • Page {currentPage} of {paginatedGroups.totalPages}
                    </div>
                  </div>
                )}

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12"></TableHead>
                      <TableHead>Group Name</TableHead>
                      <TableHead>Members</TableHead>
                      <TableHead>Assigned Set</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedGroups.items.map((group) => {
                      const members = resolveTransitiveMembers(tenant, group.id)
                      const eff = getEffectivePermissionSetId(tenant.tenantId, group.id)
                      const ps = eff.permissionSetId ? psById.get(eff.permissionSetId) : null
                      
                      return (
                        <TableRow key={group.id}>
                          <TableCell>
                            <Checkbox
                              checked={selectedItems.has(group.id)}
                              onCheckedChange={(checked: boolean) => handleItemSelect(group.id, checked)}
                            />
                          </TableCell>
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
                            <div className="flex items-center gap-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => openReportAssign(group, 'group')}
                              >
                                <Settings className="h-3 w-3 mr-1" />
                                Assign Reports
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleAssignClick(group)}
                              >
                                Change
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>

                {/* Pagination Controls for Groups */}
                {paginatedGroups.totalPages > 1 && (
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="text-sm text-muted-foreground">
                      Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, paginatedGroups.totalItems)} of {paginatedGroups.totalItems} groups
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={!paginatedGroups.hasPrevPage}
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Previous
                      </Button>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, paginatedGroups.totalPages) }, (_, i) => {
                          const pageNum = i + 1
                          return (
                            <Button
                              key={pageNum}
                              variant={currentPage === pageNum ? "default" : "outline"}
                              size="sm"
                              onClick={() => setCurrentPage(pageNum)}
                              className="w-8 h-8 p-0"
                            >
                              {pageNum}
                            </Button>
                          )
                        })}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.min(paginatedGroups.totalPages, prev + 1))}
                        disabled={!paginatedGroups.hasNextPage}
                      >
                        Next
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="users">
              <div className="space-y-4">
                {/* Select All Header */}
                {paginatedUsers.items.length > 0 && (
                  <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/30">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={paginatedUsers.items.every(user => selectedItems.has(user.id))}
                        onCheckedChange={(checked: boolean) => handleSelectAll(checked, paginatedUsers.items)}
                      />
                      <span className="text-sm font-medium">
                        Select all on this page ({paginatedUsers.items.length})
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {selectedItems.size} total selected • Page {currentPage} of {paginatedUsers.totalPages}
                    </div>
                  </div>
                )}

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12"></TableHead>
                      <TableHead>User Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Groups</TableHead>
                      <TableHead>Effective Permission Set</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedUsers.items.map((user) => {
                      const userGroups = getUserGroups(user.id)
                      const effectivePs = getUserEffectivePermissionSet(user.id)
                      
                      return (
                        <TableRow key={user.id}>
                          <TableCell>
                            <Checkbox
                              checked={selectedItems.has(user.id)}
                              onCheckedChange={(checked: boolean) => handleItemSelect(user.id, checked)}
                            />
                          </TableCell>
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
                            <div className="flex items-center gap-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => openReportAssign(user, 'user')}
                              >
                                <Settings className="h-3 w-3 mr-1" />
                                Assign Reports
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleUserOverrideClick(user)}
                              >
                                Override
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>

                {/* Pagination Controls for Users */}
                {paginatedUsers.totalPages > 1 && (
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="text-sm text-muted-foreground">
                      Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, paginatedUsers.totalItems)} of {paginatedUsers.totalItems} users
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={!paginatedUsers.hasPrevPage}
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Previous
                      </Button>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, paginatedUsers.totalPages) }, (_, i) => {
                          const pageNum = i + 1
                          return (
                            <Button
                              key={pageNum}
                              variant={currentPage === pageNum ? "default" : "outline"}
                              size="sm"
                              onClick={() => setCurrentPage(pageNum)}
                              className="w-8 h-8 p-0"
                            >
                              {pageNum}
                            </Button>
                          )
                        })}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.min(paginatedUsers.totalPages, prev + 1))}
                        disabled={!paginatedUsers.hasNextPage}
                      >
                        Next
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {(selectedGroup || selectedUser) && (
        <AssignTenantSetModal
          open={assignModalOpen}
          onOpenChange={setAssignModalOpen}
          group={selectedGroup || undefined}
          user={selectedUser || undefined}
          tenant={tenant}
        />
      )}
    </>
  )
}
