import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Tenant, 
  AadGroup, 
  Guid,
  PermissionSet
} from '@/types/mockAzureAD'
import { usePermissionsStore } from '@/store/usePermissionsStore'

interface GroupRoleWizardProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tenant: Tenant
}

interface GroupAssignment {
  groupId: Guid
  role: string
  groupName: string
}

export function GroupRoleWizard({ open, onOpenChange, tenant }: GroupRoleWizardProps) {
  const { addAssignment, setSetupWizardOpen } = usePermissionsStore()
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedGroups, setSelectedGroups] = useState<Guid[]>([])
  const [groupAssignments, setGroupAssignments] = useState<Record<Guid, string>>({})
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
  const [isSyncing, setIsSyncing] = useState(false)
  const [lastSynced, setLastSynced] = useState<Date | null>(null)
  const [syncSuccess, setSyncSuccess] = useState(false)
  const [hasSynced, setHasSynced] = useState(false)
  const [expandedGroups, setExpandedGroups] = useState<Set<Guid>>(new Set())
  const [viewMode, setViewMode] = useState<'groups' | 'users'>('groups')
  const [selectedUsers, setSelectedUsers] = useState<Guid[]>([])
  const [userAssignments, setUserAssignments] = useState<Record<Guid, string>>({})

  const steps = [
    { id: 1, title: 'Select Users & Groups', description: 'Choose users or groups from your directory' },
    { id: 2, title: 'Assign Roles', description: 'Set permission levels for each selection' },
    { id: 3, title: 'Review Setup', description: 'Confirm your tenant configuration' }
  ]


  const handleNext = () => {
    if (currentStep < 3) {
      setCompletedSteps(prev => [...prev, currentStep])
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = () => {
    // Apply all group assignments
    Object.entries(groupAssignments).forEach(([groupId, permissionSetId]) => {
      if (permissionSetId) {
        addAssignment({
          tenantId: tenant.tenantId,
          aadGroupId: groupId as Guid,
          permissionSetId,
          scope: 'Tenant',
          inherited: false
        })
      }
    })

    // Apply all user assignments (for demo purposes, we'll treat users as groups)
    Object.entries(userAssignments).forEach(([userId, permissionSetId]) => {
      if (permissionSetId) {
        addAssignment({
          tenantId: tenant.tenantId,
          aadGroupId: userId as Guid, // Using userId as groupId for simplicity
          permissionSetId,
          scope: 'Tenant',
          inherited: false
        })
      }
    })

    // Reset wizard state
    setCurrentStep(1)
    setSelectedGroups([])
    setGroupAssignments({})
    setSelectedUsers([])
    setUserAssignments({})
    setViewMode('groups')
    setCompletedSteps([])
    onOpenChange(false)
  }

  const handleGroupToggle = (groupId: Guid, checked: boolean) => {
    if (checked) {
      setSelectedGroups([...selectedGroups, groupId])
    } else {
      setSelectedGroups(selectedGroups.filter(id => id !== groupId))
      // Remove assignment if group is deselected
      const newAssignments = { ...groupAssignments }
      delete newAssignments[groupId]
      setGroupAssignments(newAssignments)
    }
  }

  const handleUserToggle = (userId: Guid, checked: boolean) => {
    if (checked) {
      setSelectedUsers([...selectedUsers, userId])
    } else {
      setSelectedUsers(selectedUsers.filter(id => id !== userId))
      // Remove assignment if user is deselected
      const newAssignments = { ...userAssignments }
      delete newAssignments[userId]
      setUserAssignments(newAssignments)
    }
  }

  const toggleGroupExpansion = (groupId: Guid) => {
    const newExpanded = new Set(expandedGroups)
    if (newExpanded.has(groupId)) {
      newExpanded.delete(groupId)
    } else {
      newExpanded.add(groupId)
    }
    setExpandedGroups(newExpanded)
  }

  const getGroupMembers = (group: AadGroup) => {
    // For simplicity, we'll show a few sample names based on the group
    // In a real app, this would resolve the actual member IDs to user names
    const sampleNames = [
      "Alice Wong", "Ben King", "Sarah Chen", "Michael Rodriguez", 
      "Jennifer Liu", "David Thompson", "Emily Johnson", "Robert Kim",
      "Lisa Martinez", "James Wilson", "Amanda Davis", "Christopher Brown"
    ]
    
    // Return a subset based on group size
    const memberCount = group.members.length
    return sampleNames.slice(0, Math.min(memberCount, 8)) // Show up to 8 names
  }

  const handleSync = async () => {
    setIsSyncing(true)
    setSyncSuccess(false)
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500))
    setLastSynced(new Date())
    setSyncSuccess(true)
    setHasSynced(true)
    setIsSyncing(false)
    // Hide success message after 3 seconds
    setTimeout(() => setSyncSuccess(false), 3000)
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return selectedGroups.length > 0 || selectedUsers.length > 0
      case 2:
        const allGroupAssignments = selectedGroups.every(groupId => groupAssignments[groupId])
        const allUserAssignments = selectedUsers.every(userId => userAssignments[userId])
        return allGroupAssignments && allUserAssignments
      case 3:
        return true
      default:
        return false
    }
  }

  const renderStep1 = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Select users or groups you want to set up for <strong>{tenant.displayName}</strong>. Data is imported from your Azure AD or Okta directory.
        </p>
        <div className="flex flex-col items-end gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSync}
            disabled={isSyncing}
          >
            {isSyncing ? (
              <>
                <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin mr-2" />
                Syncing...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Sync Users & Groups
              </>
            )}
          </Button>
          {lastSynced && (
            <span className="text-xs text-muted-foreground">
              Last synced: {lastSynced.toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>
      
      {syncSuccess && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center">
            <svg className="w-4 h-4 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-sm text-green-800">Data synced successfully!</span>
          </div>
        </div>
      )}

      {hasSynced && (
        <div className="flex items-center gap-2 mb-4">
          <div className="flex bg-muted rounded-lg p-1">
            <button
              onClick={() => setViewMode('users')}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                viewMode === 'users' 
                  ? 'bg-background text-foreground shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Users
            </button>
            <button
              onClick={() => setViewMode('groups')}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                viewMode === 'groups' 
                  ? 'bg-background text-foreground shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Groups
            </button>
          </div>
          <div className="text-xs text-muted-foreground">
            {viewMode === 'users' 
              ? `${tenant.users.length} user${tenant.users.length !== 1 ? 's' : ''} synced`
              : `${tenant.groups.length} group${tenant.groups.length !== 1 ? 's' : ''} synced`
            }
          </div>
        </div>
      )}
      
      {!hasSynced ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="text-lg font-medium mb-2">No data loaded</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Click "Sync Groups" to load users and groups from your directory
          </p>
        </div>
      ) : viewMode === 'users' ? (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {tenant.users.map((user) => (
            <Card key={user.id} className="hover:bg-muted/50 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    checked={selectedUsers.includes(user.id)}
                    onCheckedChange={(checked: boolean) => 
                      handleUserToggle(user.id, checked)
                    }
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{user.displayName}</span>
                      {user.userPrincipalName.includes('#EXT#') && (
                        <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
                          Guest
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {user.mail || user.userPrincipalName}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {user.accountEnabled ? 'Active' : 'Inactive'}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {tenant.groups.map((group) => {
            const isExpanded = expandedGroups.has(group.id)
            const members = getGroupMembers(group)
            const hasMoreMembers = group.members.length > members.length
            
            return (
              <Card key={group.id} className="hover:bg-muted/50 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      checked={selectedGroups.includes(group.id)}
                      onCheckedChange={(checked: boolean) => 
                        handleGroupToggle(group.id, checked)
                      }
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{group.displayName}</span>
                      </div>
                      {group.description && (
                        <p className="text-sm text-muted-foreground">
                          {group.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between mt-2">
                        <div className="text-xs text-muted-foreground">
                          {group.members.length} member{group.members.length !== 1 ? 's' : ''}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleGroupExpansion(group.id)
                          }}
                          className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                        >
                          {isExpanded ? 'Hide members' : 'Show members'}
                          <svg 
                            className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      </div>
                      
                      {isExpanded && (
                        <div className="mt-3 pt-3 border-t border-muted">
                          <div className="text-xs text-muted-foreground mb-2">Members:</div>
                          <div className="space-y-1">
                            {members.map((member, index) => (
                              <div key={index} className="text-xs text-foreground">
                                {member}
                              </div>
                            ))}
                            {hasMoreMembers && (
                              <div className="text-xs text-muted-foreground italic">
                                ... and {group.members.length - members.length} more
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )

  const renderStep2 = () => (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Assign default roles for <strong>{tenant.displayName}</strong>. These will be applied at the tenant level. <span className="text-green-600 font-medium">Safe to assign — you can change this anytime.</span>
      </p>
      
      <div className="space-y-4">
        {/* Selected Users */}
        {selectedUsers.map((userId) => {
          const user = tenant.users.find(u => u.id === userId)!
          return (
            <Card key={userId}>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{user.displayName}</span>
                  {user.userPrincipalName.includes('#EXT#') && (
                    <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
                      Guest
                    </span>
                  )}
                </div>
                <div className="text-sm text-muted-foreground">
                  {user.mail || user.userPrincipalName}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Label>Select Role</Label>
                  <RadioGroup
                    value={userAssignments[userId] || ''}
                    onValueChange={(value) => setUserAssignments(prev => ({ ...prev, [userId]: value }))}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50">
                        <RadioGroupItem value="ps_viewer" id={`${userId}-viewer`} />
                        <Label htmlFor={`${userId}-viewer`} className="flex-1 cursor-pointer">
                          <div className="flex flex-col">
                            <span className="font-medium">Viewer</span>
                            <span className="text-sm text-muted-foreground">
                              Read-only access to reports and dashboards
                            </span>
                          </div>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50">
                        <RadioGroupItem value="ps_editor" id={`${userId}-editor`} />
                        <Label htmlFor={`${userId}-editor`} className="flex-1 cursor-pointer">
                          <div className="flex flex-col">
                            <span className="font-medium">Editor</span>
                            <span className="text-sm text-muted-foreground">
                              View and customize reports (no admin access)
                            </span>
                          </div>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50">
                        <RadioGroupItem value="ps_admin" id={`${userId}-admin`} />
                        <Label htmlFor={`${userId}-admin`} className="flex-1 cursor-pointer">
                          <div className="flex flex-col">
                            <span className="font-medium">Admin</span>
                            <span className="text-sm text-muted-foreground">
                              Full access including permissions management
                            </span>
                          </div>
                        </Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>
              </CardContent>
            </Card>
          )
        })}

        {/* Selected Groups */}
        {selectedGroups.map((groupId) => {
          const group = tenant.groups.find(g => g.id === groupId)!
          return (
            <Card key={groupId}>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{group.displayName}</span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Label>Select Role</Label>
                  <RadioGroup
                    value={groupAssignments[groupId] || ''}
                    onValueChange={(value) => setGroupAssignments(prev => ({ ...prev, [groupId]: value }))}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50">
                        <RadioGroupItem value="ps_viewer" id={`${groupId}-viewer`} />
                        <Label htmlFor={`${groupId}-viewer`} className="flex-1 cursor-pointer">
                          <div className="flex flex-col">
                            <span className="font-medium">Viewer</span>
                            <span className="text-sm text-muted-foreground">
                              Read-only access to reports and dashboards
                            </span>
                          </div>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50">
                        <RadioGroupItem value="ps_editor" id={`${groupId}-editor`} />
                        <Label htmlFor={`${groupId}-editor`} className="flex-1 cursor-pointer">
                          <div className="flex flex-col">
                            <span className="font-medium">Editor</span>
                            <span className="text-sm text-muted-foreground">
                              View and customize reports (no admin access)
                            </span>
                          </div>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50">
                        <RadioGroupItem value="ps_admin" id={`${groupId}-admin`} />
                        <Label htmlFor={`${groupId}-admin`} className="flex-1 cursor-pointer">
                          <div className="flex flex-col">
                            <span className="font-medium">Admin</span>
                            <span className="text-sm text-muted-foreground">
                              Full access including permissions management
                            </span>
                          </div>
                        </Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )

  const renderStep3 = () => {
    const groupAssignmentList: GroupAssignment[] = selectedGroups.map(groupId => {
      const group = tenant.groups.find(g => g.id === groupId)!
      const role = groupAssignments[groupId]
      const roleName = role?.replace('ps_', '').replace('_', ' ') || 'Not assigned'
      
      return {
        groupId,
        role: roleName,
        groupName: group.displayName
      }
    })

    const userAssignmentList: GroupAssignment[] = selectedUsers.map(userId => {
      const user = tenant.users.find(u => u.id === userId)!
      const role = userAssignments[userId]
      const roleName = role?.replace('ps_', '').replace('_', ' ') || 'Not assigned'
      
      return {
        groupId: userId,
        role: roleName,
        groupName: user.displayName
      }
    })

    const allAssignments = [...groupAssignmentList, ...userAssignmentList]

    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Review your tenant setup for <strong>{tenant.displayName}</strong> before applying these assignments and roles.
        </p>
        
        <div className="space-y-4">
          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">Summary</h4>
            <div className="space-y-1 text-sm">
              <div><strong>Users selected:</strong> {selectedUsers.length}</div>
              <div><strong>Groups selected:</strong> {selectedGroups.length}</div>
              <div><strong>Total assignments:</strong> {allAssignments.length}</div>
              <div><strong>Tenant:</strong> {tenant.displayName}</div>
            </div>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-medium">Assignments</h4>
            {allAssignments.map((assignment) => (
              <div key={assignment.groupId} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{assignment.groupName}</span>
                </div>
                <Badge variant="secondary" className="capitalize">
                  {assignment.role}
                </Badge>
              </div>
            ))}
          </div>

          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Next steps:</strong> After completing this wizard, you can fine-tune access to specific reports in the{' '}
              <Button 
                variant="link" 
                className="p-0 h-auto text-blue-800 underline"
                onClick={() => {
                  onOpenChange(false)
                  // This would ideally switch to the Report Access tab
                  // For now, we'll just close the wizard
                }}
              >
                Report Access tab
              </Button>
              .
            </p>
          </div>
        </div>
      </div>
    )
  }

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderStep1()
      case 2:
        return renderStep2()
      case 3:
        return renderStep3()
      default:
        return null
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Tenant Setup Wizard</DialogTitle>
          <DialogDescription>
            Set up permissions for {tenant.displayName} by assigning roles to groups from your directory. Simple, safe, and reversible.
          </DialogDescription>
        </DialogHeader>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            {steps.map((step) => (
              <div key={step.id} className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                  completedSteps.includes(step.id) 
                    ? 'bg-green-500 text-white' 
                    : currentStep === step.id 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {completedSteps.includes(step.id) ? '✓' : step.id}
                </div>
                <span className={currentStep === step.id ? 'font-medium' : ''}>
                  {step.title}
                </span>
              </div>
            ))}
          </div>
          <Progress value={(currentStep / 3) * 100} className="h-2" />
        </div>

        {/* Step Content */}
        <div className="flex-1 overflow-auto py-4">
          {renderCurrentStep()}
        </div>

        {/* Navigation */}
        <div className="flex justify-between pt-4 border-t">
          <Button 
            variant="outline" 
            onClick={handleBack}
            disabled={currentStep === 1}
          >
            Back
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleNext} disabled={!canProceed()}>
              {currentStep === 3 ? 'Complete Setup' : 'Next'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
