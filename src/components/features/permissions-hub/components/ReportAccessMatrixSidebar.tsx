import React, { useState } from 'react'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { 
  getEffectivePermissionSetId, 
  Tenant, 
  ReportRef, 
  AadGroup, 
  AadUser,
  Guid 
} from '@/types/mockAzureAD'
import { usePermissionsStore } from '@/store/usePermissionsStore'
import { OverrideReportAccessModal } from '../modals/OverrideReportAccessModal'
import { AuditViewModal } from '../modals/AuditViewModal'

interface ReportAccessMatrixSidebarProps {
  tenant: Tenant
  reports: ReportRef[]
}

interface Assignment {
  id: string
  type: 'user' | 'group'
  name: string
  email?: string
  description?: string
  memberCount?: number
}

interface ReportSummary {
  report: ReportRef
  assignments: {
    user: Assignment
    permissionSet: string
  }[]
  groupAssignments: {
    group: Assignment
    permissionSet: string
  }[]
}

export function ReportAccessMatrixSidebar({ tenant, reports }: ReportAccessMatrixSidebarProps) {
  const { 
    assignments, 
    permissionSets, 
    selectedReports, 
    setSelectedReports, 
    toggleReportSelection,
    auditReportId,
    setAuditReportId,
    addAssignment
  } = usePermissionsStore()
  
  const [overrideModalOpen, setOverrideModalOpen] = useState(false)
  const [selectedCell, setSelectedCell] = useState<{reportId: string, assigneeId: string, assigneeType: 'user' | 'group'} | null>(null)
  const [assignModalOpen, setAssignModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTab, setSelectedTab] = useState<'users' | 'groups'>('users')
  const [selectedAssignees, setSelectedAssignees] = useState<Set<string>>(new Set())
  const [selectedPermissionSet, setSelectedPermissionSet] = useState<string>('ps_viewer')
  const [expandedReports, setExpandedReports] = useState<Set<string>>(new Set())

  const psById = new Map(permissionSets.map(ps => [ps.id, ps]))

  // Convert users and groups to unified assignment format
  const allAssignees: Assignment[] = [
    ...tenant.users.map(user => ({
      id: user.id,
      type: 'user' as const,
      name: user.displayName,
      email: user.mail || user.userPrincipalName,
      description: user.userPrincipalName.includes('#EXT#') ? 'Guest user' : 'Active user'
    })),
    ...tenant.groups.map(group => ({
      id: group.id,
      type: 'group' as const,
      name: group.displayName,
      description: group.description,
      memberCount: group.members.length
    }))
  ]

  // Filter assignees based on search and tab
  const filteredAssignees = allAssignees.filter(assignee => {
    const matchesSearch = assignee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         assignee.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         assignee.description?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesTab = selectedTab === 'users' ? assignee.type === 'user' : assignee.type === 'group'
    return matchesSearch && matchesTab
  })

  // Get assigned permission set for each assignee
  const getAssignedPermissionSet = (assigneeId: string) => {
    // Check if this assignee has any assignments to the selected reports
    const hasAssignment = selectedReports.some(reportId => {
      const assignment = assignments.find(a => 
        a.tenantId === tenant.tenantId && 
        a.aadGroupId === assigneeId as Guid && 
        a.scope === "Report" && 
        a.targetId === reportId
      )
      return !!assignment
    })
    
    if (hasAssignment) {
      // Find the first assignment to get the permission set
      const assignment = assignments.find(a => 
        a.tenantId === tenant.tenantId && 
        a.aadGroupId === assigneeId as Guid && 
        a.scope === "Report" && 
        selectedReports.includes(a.targetId!)
      )
      
      if (assignment) {
        const ps = psById.get(assignment.permissionSetId)
        return ps?.name || 'Unknown'
      }
    }
    
    return null
  }

  // Create report summaries with current assignments
  const reportSummaries: ReportSummary[] = reports.map(report => {
    const userAssignments: { user: Assignment, permissionSet: string }[] = []
    const groupAssignments: { group: Assignment, permissionSet: string }[] = []

    // Check for direct user assignments
    tenant.users.forEach(user => {
      const userAssignment = assignments.find(a => 
        a.tenantId === tenant.tenantId && 
        a.aadGroupId === user.id && 
        a.scope === "Report" && 
        a.targetId === report.id
      )
      
      if (userAssignment) {
        const ps = psById.get(userAssignment.permissionSetId)
        if (ps) {
          userAssignments.push({ 
            user: {
              id: user.id,
              type: 'user' as const,
              name: user.displayName,
              email: user.mail || user.userPrincipalName,
              description: user.userPrincipalName.includes('#EXT#') ? 'Guest user' : 'Active user'
            }, 
            permissionSet: ps.name 
          })
        }
      }
    })

    // Check for group assignments
    tenant.groups.forEach(group => {
      const eff = getEffectivePermissionSetId(tenant.tenantId, group.id, report.id)
      if (eff.permissionSetId) {
        const ps = psById.get(eff.permissionSetId)
        if (ps) {
          groupAssignments.push({ 
            group: {
              id: group.id,
              type: 'group' as const,
              name: group.displayName,
              description: group.description,
              memberCount: group.members.length
            }, 
            permissionSet: ps.name 
          })
        }
      }
    })

    return {
      report,
      assignments: userAssignments,
      groupAssignments
    }
  })

  const handleCellClick = (reportId: string, assigneeId: string, assigneeType: 'user' | 'group') => {
    setSelectedCell({ reportId, assigneeId, assigneeType })
    setOverrideModalOpen(true)
  }

  const handleAssigneeToggle = (assigneeId: string) => {
    const newSelected = new Set(selectedAssignees)
    if (newSelected.has(assigneeId)) {
      newSelected.delete(assigneeId)
    } else {
      newSelected.add(assigneeId)
    }
    setSelectedAssignees(newSelected)
  }

  const handleBulkAssign = () => {
    if (selectedAssignees.size === 0 || selectedReports.length === 0) {
      alert('Please select at least one user/group and at least one report.')
      return
    }

    // Apply bulk assignment
    selectedAssignees.forEach(assigneeId => {
      const assignee = allAssignees.find(a => a.id === assigneeId)
      if (!assignee) return

      selectedReports.forEach(reportId => {
        addAssignment({
          tenantId: tenant.tenantId,
          aadGroupId: assigneeId as Guid, // Using same field for both users and groups
          permissionSetId: selectedPermissionSet,
          scope: 'Report',
          targetId: reportId,
          rlsRole: undefined,
          inherited: false
        })
      })
    })

    // Reset selections
    setSelectedAssignees(new Set())
    setAssignModalOpen(false)
  }

  const handleSelectAllReports = (checked: boolean) => {
    if (checked) {
      setSelectedReports(reports.map(r => r.id))
    } else {
      setSelectedReports([])
    }
  }

  const handleSelectAllAssignees = (checked: boolean) => {
    if (checked) {
      setSelectedAssignees(new Set(filteredAssignees.map(a => a.id)))
    } else {
      setSelectedAssignees(new Set())
    }
  }

  const allReportsSelected = selectedReports.length === reports.length
  const someReportsSelected = selectedReports.length > 0
  const allAssigneesSelected = selectedAssignees.size === filteredAssignees.length && filteredAssignees.length > 0
  const someAssigneesSelected = selectedAssignees.size > 0

  const toggleReportExpansion = (reportId: string) => {
    const newExpanded = new Set(expandedReports)
    if (newExpanded.has(reportId)) {
      newExpanded.delete(reportId)
    } else {
      newExpanded.add(reportId)
    }
    setExpandedReports(newExpanded)
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold">Report Access Matrix</h3>
      </div>

      {/* Main Summary View */}
      <Card className="h-[600px]">
        <CardContent className="p-6 h-full flex flex-col">
          {/* Report Selection with Assign Button */}
          <div className="mb-4 p-4 border rounded-lg bg-muted/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={allReportsSelected}
                  onCheckedChange={handleSelectAllReports}
                />
                <span className="text-sm font-medium">
                  {allReportsSelected ? 'Deselect All' : 'Select All'} Reports
                </span>
                {someReportsSelected && (
                  <Badge variant="secondary">
                    {selectedReports.length} selected
                  </Badge>
                )}
              </div>
              <Button
                variant="default"
                size="sm"
                onClick={() => setAssignModalOpen(true)}
              >
                Assign Users & Groups
              </Button>
            </div>
          </div>

          {/* Report Summaries */}
          <div className="flex-1 overflow-y-auto space-y-4">
            {reportSummaries.map((summary) => {
              const isExpanded = expandedReports.has(summary.report.id)
              const totalAssignments = summary.assignments.length + summary.groupAssignments.length
              
              return (
                <Card key={summary.report.id} className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2 flex-1">
                      <Checkbox
                        checked={selectedReports.includes(summary.report.id)}
                        onCheckedChange={() => toggleReportSelection(summary.report.id)}
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{summary.report.name}</h4>
                          {totalAssignments > 0 && (
                            <Badge variant="outline" className="text-xs">
                              {totalAssignments} assignment{totalAssignments !== 1 ? 's' : ''}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{summary.report.path}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleReportExpansion(summary.report.id)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        {isExpanded ? 'Hide Details' : 'Show Details'}
                        <svg
                          className={`w-4 h-4 ml-1 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setAuditReportId(summary.report.id)}
                      >
                        Audit
                      </Button>
                    </div>
                  </div>

                  {/* Collapsible Content */}
                  {isExpanded && (
                    <div className="space-y-3">
                      {/* User Assignments */}
                      {summary.assignments.length > 0 && (
                        <div>
                          <h5 className="text-sm font-medium text-muted-foreground mb-2">
                            Users ({summary.assignments.length})
                          </h5>
                          <div className="flex flex-wrap gap-2">
                            {summary.assignments.map((assignment, index) => (
                              <div
                                key={index}
                                className="flex items-center gap-2 px-2 py-1 bg-blue-50 border border-blue-200 rounded text-sm cursor-pointer hover:bg-blue-100"
                                onClick={() => handleCellClick(summary.report.id, assignment.user.id, 'user')}
                              >
                                <span className="text-xs font-medium">{assignment.user.name}</span>
                                <Badge variant="secondary" className="text-xs">
                                  {assignment.permissionSet}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Group Assignments */}
                      {summary.groupAssignments.length > 0 && (
                        <div>
                          <h5 className="text-sm font-medium text-muted-foreground mb-2">
                            Groups ({summary.groupAssignments.length})
                          </h5>
                          <div className="flex flex-wrap gap-2">
                            {summary.groupAssignments.map((assignment, index) => (
                              <div
                                key={index}
                                className="flex items-center gap-2 px-2 py-1 bg-green-50 border border-green-200 rounded text-sm cursor-pointer hover:bg-green-100"
                                onClick={() => handleCellClick(summary.report.id, assignment.group.id, 'group')}
                              >
                                <span className="text-xs font-medium">{assignment.group.name}</span>
                                <Badge variant="secondary" className="text-xs">
                                  {assignment.permissionSet}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* No Assignments */}
                      {summary.assignments.length === 0 && summary.groupAssignments.length === 0 && (
                        <div className="text-sm text-muted-foreground italic py-4 text-center">
                          No users or groups assigned. Click "Assign Users & Groups" to add permissions.
                        </div>
                      )}
                    </div>
                  )}

                  {/* Summary when collapsed */}
                  {!isExpanded && totalAssignments > 0 && (
                    <div className="text-sm text-muted-foreground">
                      {summary.assignments.length > 0 && (
                        <span className="inline-flex items-center gap-1 mr-4">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          {summary.assignments.length} user{summary.assignments.length !== 1 ? 's' : ''}
                        </span>
                      )}
                      {summary.groupAssignments.length > 0 && (
                        <span className="inline-flex items-center gap-1">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          {summary.groupAssignments.length} group{summary.groupAssignments.length !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  )}
                </Card>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Assignment Modal */}
      <Dialog open={assignModalOpen} onOpenChange={setAssignModalOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Assign Users & Groups</DialogTitle>
            <DialogDescription>
              Select users and groups to assign permissions to the selected reports.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-hidden flex flex-col space-y-4">
            {/* Search */}
            <div className="space-y-2">
              <Input
                placeholder="Search users and groups..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Tabs */}
            <Tabs value={selectedTab} onValueChange={(value) => setSelectedTab(value as 'users' | 'groups')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="users">Users</TabsTrigger>
                <TabsTrigger value="groups">Groups</TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Assignee List */}
            <div className="space-y-2 flex-1 overflow-hidden flex flex-col">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={allAssigneesSelected}
                    onCheckedChange={handleSelectAllAssignees}
                  />
                  <span className="text-sm font-medium">
                    {allAssigneesSelected ? 'Deselect All' : 'Select All'}
                  </span>
                </div>
                {someAssigneesSelected && (
                  <Badge variant="secondary">
                    {selectedAssignees.size} selected
                  </Badge>
                )}
              </div>

              <div className="flex-1 overflow-y-auto space-y-1">
                {filteredAssignees.map((assignee) => {
                  const assignedPermissionSet = getAssignedPermissionSet(assignee.id)
                  
                  return (
                    <div
                      key={assignee.id}
                      className="flex items-center gap-2 p-2 rounded hover:bg-muted"
                    >
                      <Checkbox
                        checked={selectedAssignees.has(assignee.id)}
                        onCheckedChange={(checked) => handleAssigneeToggle(assignee.id)}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium truncate">
                            {assignee.name}
                          </span>
                          {assignee.type === 'user' && assignee.email?.includes('#EXT#') && (
                            <Badge variant="outline" className="text-xs">
                              Guest
                            </Badge>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          {assignee.email || assignee.description}
                        </div>
                        {assignee.memberCount && (
                          <div className="text-xs text-muted-foreground">
                            {assignee.memberCount} members
                          </div>
                        )}
                      </div>
                      {assignedPermissionSet && (
                        <Badge variant="secondary" className="text-xs">
                          {assignedPermissionSet}
                        </Badge>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Bulk Actions */}
            {someAssigneesSelected && someReportsSelected && (
              <div className="pt-4 border-t">
                <Button 
                  onClick={handleBulkAssign} 
                  className="w-full"
                >
                  Assign to {selectedReports.length} Report{selectedReports.length !== 1 ? 's' : ''}
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {selectedCell && (
        <OverrideReportAccessModal
          open={overrideModalOpen}
          onOpenChange={setOverrideModalOpen}
          report={reports.find(r => r.id === selectedCell.reportId)!}
          group={tenant.groups.find(g => g.id === selectedCell.assigneeId) || tenant.users.find(u => u.id === selectedCell.assigneeId) as any}
          tenant={tenant}
        />
      )}

      {auditReportId && (
        <AuditViewModal
          open={!!auditReportId}
          onOpenChange={(open) => setAuditReportId(open ? auditReportId : null)}
          report={reports.find(r => r.id === auditReportId)!}
          tenant={tenant}
        />
      )}
    </div>
  )
}