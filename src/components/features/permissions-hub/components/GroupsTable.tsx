import React, { useState, useMemo, useEffect } from 'react'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Table, TableHeader, TableRow, TableHead, TableCell, TableBody } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
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
import { Search, Plus, X, Settings, Users, UserCheck, Filter, ChevronLeft, ChevronRight, RefreshCw, Loader2 } from 'lucide-react'

interface GroupsTableProps {
  tenant: Tenant
}

// Mock large dataset simulating 10K+ groups
const generateMockGroups = (count: number): AadGroup[] => {
  const departments = ['IT', 'Sales', 'Marketing', 'HR', 'Finance', 'Operations', 'Legal', 'Engineering', 'Support', 'Executive']
  const roles = ['Administrators', 'Managers', 'Specialists', 'Analysts', 'Coordinators', 'Directors', 'Leads', 'Associates']
  const locations = ['North', 'South', 'East', 'West', 'Central', 'Global', 'Regional', 'Local']
  
  return Array.from({ length: count }, (_, i) => ({
    "@odata.type": "#microsoft.graph.group",
    id: `mock-group-${i + 1}` as Guid,
    displayName: `${departments[i % departments.length]} ${roles[i % roles.length]} ${locations[i % locations.length]}`,
    description: `${departments[i % departments.length]} team members with ${roles[i % roles.length].toLowerCase()} responsibilities`,
    securityEnabled: Math.random() > 0.2,
    groupTypes: Math.random() > 0.7 ? ['Unified'] : [],
    members: []
  }))
}

// Simulate large dataset - 12,500 groups total
const mockGroups: AadGroup[] = generateMockGroups(12500)

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
  const [showSearch, setShowSearch] = useState(true) // Always show search by default
  const [searchResults, setSearchResults] = useState<{groups: AadGroup[], users: AadUser[]}>({groups: [], users: []})
  const [searchPage, setSearchPage] = useState(1)
  const [searchPageSize] = useState(50)
  const [totalAvailableGroups] = useState(mockGroups.length)
  const [isSearching, setIsSearching] = useState(false)
  const [searchMode, setSearchMode] = useState<'groups' | 'users'>('groups')
  const [userAdded, setUserAdded] = useState(false)
  const [isAddingUser, setIsAddingUser] = useState(false)
  
  // New state for enhanced functionality
  const [selectedItems, setSelectedItems] = useState<Set<Guid>>(new Set())
  const [showBulkAssign, setShowBulkAssign] = useState(false)
  const [reportAssignMode, setReportAssignMode] = useState<'group' | 'user' | null>(null)
  const [reportAssignTarget, setReportAssignTarget] = useState<AadGroup | AadUser | null>(null)
  const [selectedReports, setSelectedReports] = useState<Set<string>>(new Set())
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [activeTab, setActiveTab] = useState<'groups' | 'users'>('groups')
  
  // Update search mode when active tab changes
  useEffect(() => {
    setSearchMode(activeTab)
    setSearchQuery('')
    setSearchResults({groups: [], users: []})
  }, [activeTab])
  
  // Sync state
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncProgress, setSyncProgress] = useState(0)
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(new Date('2024-12-19T14:30:45')) // Mock timestamp for prototyping

  const psById = new Map(permissionSets.map(ps => [ps.id, ps]))

  // Mock sync function to simulate fetching groups from Azure AD
  const mockSyncGroups = async () => {
    setIsSyncing(true)
    setSyncProgress(0)
    
    // Simulate progressive sync with 1000 groups
    const totalGroups = 1000
    const batchSize = 50
    
    for (let i = 0; i < totalGroups; i += batchSize) {
      await new Promise(resolve => setTimeout(resolve, 30)) // Simulate network delay
      
      const progress = Math.round(((i + batchSize) / totalGroups) * 100)
      setSyncProgress(Math.min(progress, 100))
    }
    
    setLastSyncTime(new Date())
    setIsSyncing(false)
  }

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

  // Debounced search functionality
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null)
  
  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setSearchPage(1) // Reset to first page on new search
    
    // Clear existing timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout)
    }
    
    if (query.trim().length < 2) {
      setSearchResults({groups: [], users: []})
      setIsSearching(false)
      return
    }

    setIsSearching(true)
    
    // Debounce search by 300ms
    const timeout = setTimeout(() => {
      const filteredGroups = mockGroups.filter(group => 
        group.displayName.toLowerCase().includes(query.toLowerCase()) ||
        (group.description && group.description.toLowerCase().includes(query.toLowerCase()))
      )

      const filteredUsers = fakeUsers.filter(user => 
        user.displayName.toLowerCase().includes(query.toLowerCase()) ||
        user.mail?.toLowerCase().includes(query.toLowerCase()) ||
        user.userPrincipalName.toLowerCase().includes(query.toLowerCase())
      )

      setSearchResults({groups: filteredGroups, users: filteredUsers})
      setIsSearching(false)
    }, 300)
    
    setSearchTimeout(timeout)
  }

  // Get paginated search results
  const getPaginatedSearchResults = () => {
    const startIndex = (searchPage - 1) * searchPageSize
    const endIndex = startIndex + searchPageSize
    return {
      groups: searchResults.groups.slice(startIndex, endIndex),
      users: searchResults.users.slice(startIndex, endIndex),
      totalGroups: searchResults.groups.length,
      totalUsers: searchResults.users.length,
      totalPages: Math.ceil(Math.max(searchResults.groups.length, searchResults.users.length) / searchPageSize),
      hasNextPage: endIndex < Math.max(searchResults.groups.length, searchResults.users.length),
      hasPrevPage: searchPage > 1
    }
  }

  const handleAddGroup = (group: AadGroup) => {
    // Set the selected group and open the assign modal
    setSelectedGroup(group)
    setSelectedUser(null)
    setAssignModalOpen(true)
    setShowSearch(false)
    setSearchQuery('')
    setSearchResults({groups: [], users: []})
  }

  const handleAddUser = (user: AadUser) => {
    // In a real app, this would add the user to the tenant
    console.log('Adding user:', user.displayName)
    setIsAddingUser(true)
    
    // Simulate searching for the user with a delay
    setTimeout(() => {
      setIsAddingUser(false)
      setUserAdded(true)
      
      // After showing success, open the assign permission modal
      setTimeout(() => {
        setUserAdded(false)
        setShowSearch(false)
        setSearchQuery('')
        setSearchResults({groups: [], users: []})
        
        // Open the assign permission modal for the user
        setSelectedUser(user)
        setSelectedGroup(null)
        setAssignModalOpen(true)
      }, 2000) // 2 second delay to show success message
    }, 1500) // 1.5 second delay to simulate searching
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
      const currentSelectedArray = Array.from(selectedItems)
      const newItemsArray = items.map(item => item.id)
      const allIds = Array.from(new Set([...currentSelectedArray, ...newItemsArray]))
      setSelectedItems(new Set(allIds))
    } else {
      const itemIds = new Set(items.map(item => item.id))
      const currentSelectedArray = Array.from(selectedItems)
      const newSelected = currentSelectedArray.filter(id => !itemIds.has(id))
      setSelectedItems(new Set(newSelected))
    }
  }

  const handleBulkReportAssign = () => {
    if (selectedReports.size === 0) return
    
    selectedItems.forEach(itemId => {
      // Check if it's a group or user
      const isGroup = tenant.groups.some(g => g.id === itemId)
      const isUser = tenant.users.some(u => u.id === itemId)
      
      if (isGroup || isUser) {
        // Assign each selected report to this group/user
        selectedReports.forEach(reportId => {
          addAssignment({
            tenantId: tenant.tenantId,
            aadGroupId: itemId,
            permissionSetId: 'ps_viewer', // Default to viewer for bulk assignment
            scope: 'Report',
            targetId: reportId,
            inherited: false
          })
        })
      }
    })
    
    setShowBulkAssign(false)
    setSelectedReports(new Set())
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
          </div>

          {/* Sync Groups Section - temporarily hidden */}
          {/* <div className="mt-4 p-4 border rounded-lg bg-muted/50">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                <div>
                  <span className="font-medium">Sync Groups from Azure AD</span>
                  {lastSyncTime && (
                    <div className="text-xs text-muted-foreground mt-1">
                      Last sync: {lastSyncTime.toLocaleString()}
                      {totalAvailableGroups > 0 && (
                        <span className="ml-2">• {totalAvailableGroups.toLocaleString()} groups found</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <Button 
                onClick={mockSyncGroups} 
                disabled={isSyncing}
                size="sm"
              >
                {isSyncing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Syncing...
                  </>
                ) : (
                  'Sync Groups'
                )}
              </Button>
            </div>
            
            {isSyncing && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Syncing groups...</span>
                  <span>{syncProgress}%</span>
                </div>
                <Progress value={syncProgress} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  This may take a few moments for large directories
                </p>
              </div>
            )}
          </div> */}
          
          <div className="mt-4 space-y-4">
            {/* Mode-specific header */}
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                {searchMode === 'groups' 
                  ? `${totalAvailableGroups.toLocaleString()} groups available • Start typing to search`
                  : 'Add a user by entering their email address'
                }
              </div>
            </div>
              
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={searchMode === 'groups' 
                    ? "Search for groups to add..." 
                    : "Enter user email address..."
                  }
                  value={searchQuery}
                  onChange={(e) => {
                    if (searchMode === 'groups') {
                      handleSearch(e.target.value)
                    } else {
                      setSearchQuery(e.target.value)
                    }
                  }}
                  className="pl-10"
                />
                {isSearching && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                  </div>
                )}
              </div>
              
              {/* Mode-specific content */}
              {searchMode === 'groups' ? (
                /* Groups search results */
                (searchResults.groups.length > 0 || searchResults.users.length > 0) && (
                  <div className="space-y-4">
                    {(() => {
                      const paginatedResults = getPaginatedSearchResults()
                      return (
                        <>
                          {paginatedResults.groups.length > 0 && (
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="text-sm font-medium text-muted-foreground">
                                  Groups ({paginatedResults.totalGroups.toLocaleString()} found)
                                </h4>
                                {paginatedResults.totalPages > 1 && (
                                  <div className="text-xs text-muted-foreground">
                                    Page {searchPage} of {paginatedResults.totalPages}
                                  </div>
                                )}
                              </div>
                              <div className="space-y-2">
                                {paginatedResults.groups.map((group) => (
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
                          
                          {/* Pagination controls */}
                          {paginatedResults.totalPages > 1 && (
                            <div className="flex items-center justify-between pt-4 border-t">
                              <div className="text-sm text-muted-foreground">
                                Showing {((searchPage - 1) * searchPageSize) + 1} to {Math.min(searchPage * searchPageSize, paginatedResults.totalGroups)} of {paginatedResults.totalGroups.toLocaleString()} results
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setSearchPage(prev => Math.max(1, prev - 1))}
                                  disabled={!paginatedResults.hasPrevPage}
                                >
                                  <ChevronLeft className="w-4 h-4" />
                                  Previous
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setSearchPage(prev => Math.min(paginatedResults.totalPages, prev + 1))}
                                  disabled={!paginatedResults.hasNextPage}
                                >
                                  Next
                                  <ChevronRight className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          )}
                        </>
                      )
                    })()}
                  </div>
                )
              ) : (
                /* User email input mode */
                <div className="space-y-4">
                  {searchQuery.includes('@') ? (
                    <div className={`p-4 border rounded-lg ${
                      userAdded 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-blue-50 border-blue-200'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">
                            {isAddingUser 
                              ? 'Searching for user...' 
                              : userAdded 
                                ? 'User Added Successfully!' 
                                : `Add User: ${searchQuery}`
                            }
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {isAddingUser 
                              ? 'Looking up user in directory'
                              : userAdded 
                                ? 'The user has been added to your tenant'
                                : 'This will add the user to your tenant'
                            }
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => {
                            // Create a mock user from the email
                            const mockUser: AadUser = {
                              "@odata.type": "#microsoft.graph.user",
                              id: `mock-user-${Date.now()}` as Guid,
                              displayName: searchQuery.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                              mail: searchQuery,
                              userPrincipalName: searchQuery,
                              givenName: searchQuery.split('@')[0].split('.')[0],
                              surname: searchQuery.split('@')[0].split('.')[1] || '',
                              accountEnabled: true,
                            }
                            handleAddUser(mockUser)
                          }}
                          className={`flex items-center gap-1 ${
                            userAdded 
                              ? 'bg-green-600 hover:bg-green-700 text-white' 
                              : ''
                          }`}
                          disabled={isAddingUser || userAdded}
                        >
                          {isAddingUser ? (
                            <>
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-900"></div>
                              Searching...
                            </>
                          ) : userAdded ? (
                            <>
                              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              User Found & Added
                            </>
                          ) : (
                            <>
                              <Plus className="h-3 w-3" />
                              Add User
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  ) : searchQuery.length > 0 ? (
                    <div className="text-center py-4 text-muted-foreground">
                      <p>Please enter a valid email address</p>
                    </div>
                  ) : null}
                </div>
              )}
              
              {/* Empty states for groups mode */}
              {searchMode === 'groups' && searchQuery.length >= 2 && !isSearching && searchResults.groups.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Search className="h-8 w-8 mx-auto mb-2" />
                  <p>No groups found matching &ldquo;{searchQuery}&rdquo;</p>
                  <p className="text-xs mt-1">Try a different search term or check spelling</p>
                </div>
              )}
            </div>


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
                      <TableHead>Permission Set</TableHead>
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
                              <span>{(group as AadGroup).displayName}</span>
                              {(group as AadGroup).description && (
                                <span className="text-xs text-muted-foreground">
                                  {(group as AadGroup).description}
                                </span>
                              )}
                            </div>
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
                                onClick={() => handleAssignClick(group as AadGroup)}
                              >
                                Change Permissions
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
                      <TableHead>Permission Set</TableHead>
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
                              <span>{(user as AadUser).displayName}</span>
                              <span className="text-xs text-muted-foreground">
                                {(user as AadUser).userPrincipalName}
                              </span>
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
                                onClick={() => handleUserOverrideClick(user as AadUser)}
                              >
                                Change Permissions
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

      {/* Bulk Assign Reports Modal */}
      <Dialog open={showBulkAssign} onOpenChange={setShowBulkAssign}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Bulk Assign Reports</DialogTitle>
            <DialogDescription>
              Select reports to assign to {selectedItems.size} selected {activeTab === 'groups' ? 'groups' : 'users'}.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-auto">
            <div className="space-y-4">
              <div className="max-h-96 overflow-y-auto space-y-2">
                {reports.map((report) => (
                  <div key={report.id} className="flex items-center space-x-2 p-2 border rounded-lg hover:bg-muted/50">
                    <Checkbox
                      checked={selectedReports.has(report.id)}
                      onCheckedChange={(checked: boolean) => handleReportToggle(report.id, checked)}
                    />
                    <Label className="flex-1 cursor-pointer">
                      <div className="flex flex-col">
                        <span className="font-medium">{report.name}</span>
                        <span className="text-xs text-muted-foreground">
                          Path: {report.path}
                        </span>
                      </div>
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="flex-shrink-0">
            <Button variant="outline" onClick={() => setShowBulkAssign(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleBulkReportAssign} 
              disabled={selectedReports.size === 0}
            >
              Assign {selectedReports.size} Report{selectedReports.size !== 1 ? 's' : ''} to {selectedItems.size} {activeTab === 'groups' ? 'Groups' : 'Users'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Individual Report Assignment Modal */}
      <Dialog open={!!(reportAssignMode && reportAssignTarget)} onOpenChange={(open) => {
        if (!open) {
          setReportAssignMode(null)
          setReportAssignTarget(null)
          setSelectedReports(new Set())
        }
      }}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>
              Assign Reports to {reportAssignMode === 'group' ? 'Group' : 'User'}: {reportAssignTarget?.displayName}
            </DialogTitle>
            <DialogDescription>
              Select one or more reports to assign to this {reportAssignMode}. The {reportAssignMode} will have viewer access to selected reports.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-auto">
            <div className="space-y-4">
              <div className="max-h-96 overflow-y-auto space-y-2">
                {reports.map((report) => (
                  <div key={report.id} className="flex items-center space-x-2 p-2 border rounded-lg hover:bg-muted/50">
                    <Checkbox
                      checked={selectedReports.has(report.id)}
                      onCheckedChange={(checked: boolean) => handleReportToggle(report.id, checked)}
                    />
                    <Label className="flex-1 cursor-pointer">
                      <div className="flex flex-col">
                        <span className="font-medium">{report.name}</span>
                        <span className="text-xs text-muted-foreground">
                          Path: {report.path}
                        </span>
                      </div>
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="flex-shrink-0">
            <Button 
              variant="outline" 
              onClick={() => {
                setReportAssignMode(null)
                setReportAssignTarget(null)
                setSelectedReports(new Set())
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleReportAssign} 
              disabled={selectedReports.size === 0}
            >
              Assign {selectedReports.size} Report{selectedReports.size !== 1 ? 's' : ''}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
