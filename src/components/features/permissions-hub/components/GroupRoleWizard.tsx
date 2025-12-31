'use client'

import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { 
  ChevronLeft, 
  ChevronRight, 
  UserCheck, 
  CheckCircle2,
  Search,
  X,
  Loader2,
  RefreshCw,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import { 
  Tenant, 
  AadGroup, 
  Guid,
  PermissionSet,
  permissionSets
} from '@/types/mockAzureAD'

interface GroupRoleWizardProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tenant: Tenant
}

export function GroupRoleWizard({ open, onOpenChange, tenant }: GroupRoleWizardProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedGroups, setSelectedGroups] = useState<Guid[]>([])
  const [groupAssignments, setGroupAssignments] = useState<Record<Guid, string>>({})
  const [bulkPermissionSet, setBulkPermissionSet] = useState<string>('')
  const [bulkSelectedGroups, setBulkSelectedGroups] = useState<Guid[]>([])
  const [isQuickActionsExpanded, setIsQuickActionsExpanded] = useState(false)
  
  // Groups search and sync state
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<AadGroup[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncProgress, setSyncProgress] = useState(0)
  const [allGroups, setAllGroups] = useState<AadGroup[]>([])
  const [hasSynced, setHasSynced] = useState(false)
  
  // Hardcoded mock timestamp for prototyping
  const [lastGroupSyncTime, setLastGroupSyncTime] = useState<Date | null>(
    () => new Date('2024-12-19T14:30:45')
  )
  
  // If there's a previous sync, populate with mock groups for search
  useEffect(() => {
    if (lastGroupSyncTime && allGroups.length === 0) {
      const mockGroups = generateMockGroups(100) // Generate 100 groups for search
      setAllGroups(mockGroups)
    }
  }, [lastGroupSyncTime, allGroups.length])

  const steps = [
    { id: 1, title: 'Select Groups', description: 'Search and select groups from your directory' },
    { id: 2, title: 'Assign Permission Sets', description: 'Set permission levels for each selection' },
    { id: 3, title: 'Review Setup', description: 'Confirm your selections before applying' }
  ]

  // Generate mock groups for sync simulation
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

  // Mock sync function to simulate fetching groups from Azure AD
  const mockSyncGroups = async () => {
    setIsSyncing(true)
    setSyncProgress(0)
    
    // Simulate progressive sync with 1000 groups
    const totalGroups = 1000
    const batchSize = 50
    const allMockGroups: AadGroup[] = []
    
    for (let i = 0; i < totalGroups; i += batchSize) {
      await new Promise(resolve => setTimeout(resolve, 30)) // Simulate network delay
      
      const batch = generateMockGroups(Math.min(batchSize, totalGroups - i))
      allMockGroups.push(...batch)
      
      const progress = Math.round(((i + batchSize) / totalGroups) * 100)
      setSyncProgress(Math.min(progress, 100))
    }
    
    setAllGroups(allMockGroups)
    setHasSynced(true)
    // Mock timestamp update for prototyping
    setIsSyncing(false)
  }

  // Search groups with debouncing
  const searchGroups = (query: string) => {
    setSearchQuery(query)
    
    if (query.trim().length < 2) {
      setSearchResults([])
      setIsSearching(false)
      return
    }

    setIsSearching(true)
    
    // Simulate search delay
    setTimeout(() => {
      const filtered = allGroups.filter(group => 
        group.displayName.toLowerCase().includes(query.toLowerCase()) ||
        (group.description && group.description.toLowerCase().includes(query.toLowerCase()))
      )
      setSearchResults(filtered)
      setIsSearching(false)
    }, 300)
  }

  const handleGroupToggle = (groupId: Guid, checked: boolean) => {
    if (checked) {
      setSelectedGroups(prev => [...prev, groupId])
    } else {
      setSelectedGroups(prev => prev.filter(id => id !== groupId))
      // Remove assignment when unselected
      setGroupAssignments(prev => {
        const newAssignments = { ...prev }
        delete newAssignments[groupId]
        return newAssignments
      })
    }
  }

  const handleBulkGroupToggle = (groupId: Guid, checked: boolean) => {
    if (checked) {
      setBulkSelectedGroups(prev => [...prev, groupId])
      } else {
      setBulkSelectedGroups(prev => prev.filter(id => id !== groupId))
    }
  }

  const selectAllBulkGroups = () => {
    setBulkSelectedGroups(selectedGroups)
  }

  const deselectAllBulkGroups = () => {
    setBulkSelectedGroups([])
  }

  const handleBulkAssign = () => {
    if (!bulkPermissionSet || bulkSelectedGroups.length === 0) return

      const newAssignments = { ...groupAssignments }
    bulkSelectedGroups.forEach(groupId => {
        newAssignments[groupId] = bulkPermissionSet
      })
      setGroupAssignments(newAssignments)
    setBulkPermissionSet('')
  }

  const resetWizard = () => {
    setCurrentStep(1)
    setSelectedGroups([])
    setGroupAssignments({})
    setBulkPermissionSet('')
    setBulkSelectedGroups([])
    setIsQuickActionsExpanded(false)
    setSearchQuery('')
    setSearchResults([])
    setIsSearching(false)
    setIsSyncing(false)
    setSyncProgress(0)
    setAllGroups([])
    setHasSynced(false)
    setLastGroupSyncTime(null)
  }

  const handleClose = () => {
    resetWizard()
    onOpenChange(false)
  }

  const renderStep1 = () => {
    const visibleGroups = searchQuery.length >= 2 ? searchResults : allGroups.slice(0, 50)
    const allVisibleSelected = visibleGroups.every(group => selectedGroups.includes(group.id))
    const someVisibleSelected = visibleGroups.some(group => selectedGroups.includes(group.id))

    return (
      <div className="space-y-6">
        {/* Search and Selection */}
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Search Groups</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="group-search"
                placeholder="Type at least 2 characters to search groups..."
                value={searchQuery}
                onChange={(e) => searchGroups(e.target.value)}
                className="pl-10"
              />
              {isSearching && (
                <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Groups are being synced from Azure AD in the background. You can start typing to find the group(s) you want.
            </p>
          </div>

          {/* Select All Header */}
            {visibleGroups.length > 0 && (
            <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/30">
              <div className="flex items-center space-x-2">
                <Checkbox
                    checked={allVisibleSelected}
                    ref={(el) => {
                      if (el && el instanceof HTMLInputElement) {
                        el.indeterminate = someVisibleSelected && !allVisibleSelected
                      }
                    }}
                    onCheckedChange={(checked: boolean) => {
                      if (checked) {
                        const newSelections = Array.from(new Set([...selectedGroups, ...visibleGroups.map(g => g.id)]))
                        setSelectedGroups(newSelections)
                      } else {
                        const visibleIds = visibleGroups.map(g => g.id)
                        setSelectedGroups(selectedGroups.filter(id => !visibleIds.includes(id)))
                      }
                    }}
                />
                <span className="text-sm font-medium">
                    Select all visible ({visibleGroups.length})
                </span>
              </div>
              <div className="text-xs text-muted-foreground">
                  {selectedGroups.length} total selected
              </div>
            </div>
          )}
          
            {/* Groups List */}
            <div className="max-h-96 overflow-y-auto border rounded-lg">
              {visibleGroups.length > 0 ? (
                <div className="space-y-1">
                  {visibleGroups.map((group) => (
                    <div key={group.id} className="flex items-center space-x-3 p-3 hover:bg-muted/50 transition-colors">
                    <Checkbox
                        checked={selectedGroups.includes(group.id)}
                        onCheckedChange={(checked: boolean) => handleGroupToggle(group.id, checked)}
                    />
                    <div className="flex-1">
                        <div className="font-medium">{group.displayName}</div>
                        {group.description && (
                      <div className="text-sm text-muted-foreground">
                            {group.description}
                      </div>
                        )}
                      </div>
                    </div>
            ))}
          </div>
              ) : searchQuery.length >= 2 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Search className="h-8 w-8 mx-auto mb-2" />
                  <p>No groups found matching &ldquo;{searchQuery}&rdquo;</p>
                  <p className="text-xs mt-1">Try a different search term</p>
        </div>
      ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <UserCheck className="h-8 w-8 mx-auto mb-2" />
                  <p>Search for groups to get started</p>
                  <p className="text-xs mt-1">Type at least 2 characters to search</p>
                          </div>
                        )}
                        </div>

            {/* Selection Summary */}
            {selectedGroups.length > 0 && (
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Selected Groups</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{selectedGroups.length} groups</Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedGroups([])}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Clear All
                    </Button>
                        </div>
                                </div>
                                </div>
                              )}
                          </div>
                      </div>
    )
  }

  const renderStep2 = () => (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Assign default permission sets for <strong>{tenant.displayName}</strong>. These will be applied at the tenant level. <span className="text-green-600 font-medium">Safe to assign — you can change this anytime.</span>
      </p>
      
      {selectedGroups.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <UserCheck className="h-8 w-8 mx-auto mb-2" />
          <p>No groups selected</p>
          <p className="text-xs mt-1">Go back to step 1 to select groups</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Quick Actions */}
            <div className={`border rounded-lg transition-all duration-200 ${
              bulkSelectedGroups.length > 0 
                ? 'bg-blue-50 border-blue-200 shadow-sm' 
                : 'bg-muted/50'
            }`}>
              <div 
                className={`flex items-center justify-between p-4 cursor-pointer transition-colors ${
                  bulkSelectedGroups.length > 0
                    ? 'hover:bg-blue-100'
                    : 'hover:bg-muted/70'
                }`}
                onClick={() => setIsQuickActionsExpanded(!isQuickActionsExpanded)}
              >
              <div className="flex items-center gap-4">
                <h4 className={`font-medium ${
                  bulkSelectedGroups.length > 0 
                    ? 'text-blue-700' 
                    : ''
                }`}>Quick Actions</h4>
                <span className={`text-sm ${
                  bulkSelectedGroups.length > 0 
                    ? 'text-blue-600' 
                    : 'text-muted-foreground'
                }`}>
                  {bulkSelectedGroups.length} of {selectedGroups.length} selected
                </span>
                            </div>
                            <div className="flex items-center gap-2">
                <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      selectAllBulkGroups()
                    }}
                    disabled={bulkSelectedGroups.length === selectedGroups.length}
                  >
                    Select All
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      deselectAllBulkGroups()
                    }}
                    disabled={bulkSelectedGroups.length === 0}
                  >
                    Deselect All
                              </Button>
                            </div>
                  {isQuickActionsExpanded ? (
                    <ChevronUp className={`h-4 w-4 ${
                      bulkSelectedGroups.length > 0 
                        ? 'text-blue-600' 
                        : 'text-muted-foreground'
                    }`} />
                  ) : (
                    <ChevronDown className={`h-4 w-4 ${
                      bulkSelectedGroups.length > 0 
                        ? 'text-blue-600' 
                        : 'text-muted-foreground'
                    }`} />
                  )}
            </div>
        </div>

            {isQuickActionsExpanded && (
              <div className="px-4 pb-4 space-y-3">
                <div>
                  <Label>Apply Same Permission Set to Bulk Selected Groups</Label>
                  <RadioGroup
                    value={bulkPermissionSet}
                    onValueChange={setBulkPermissionSet}
                  >
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      {permissionSets.map((permissionSet) => (
                        <div key={permissionSet.id} className="flex items-center space-x-2 p-2 border rounded hover:bg-muted/50">
                          <RadioGroupItem value={permissionSet.id} id={`bulk-${permissionSet.id}`} />
                          <Label htmlFor={`bulk-${permissionSet.id}`} className="flex-1 cursor-pointer text-sm">
                            {permissionSet.name}
                          </Label>
          </div>
                      ))}
                    </div>
                  </RadioGroup>
                </div>
                <div className="flex gap-2">
            <Button
                    onClick={handleBulkAssign}
                    disabled={!bulkPermissionSet || bulkSelectedGroups.length === 0}
              size="sm"
            >
                    Apply to Bulk Selected ({bulkSelectedGroups.length})
            </Button>
            <Button
              variant="outline"
                    onClick={() => setBulkPermissionSet('')}
              size="sm"
            >
                    Clear
            </Button>
          </div>
        </div>
      )}
    </div>

          {/* Individual Assignments */}
    <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-lg">Group Assignments</h4>
                            <span className="text-sm text-muted-foreground">
                Assign permission sets to each group individually
                            </span>
                          </div>
            
            <div className="max-h-96 overflow-y-auto border rounded-lg p-4 bg-gray-50">
              <div className="space-y-3">
        {selectedGroups.map((groupId) => {
                  const group = allGroups.find(g => g.id === groupId)
                  if (!group) return null

          return (
                    <div key={groupId} className="p-4 border rounded bg-white">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <div className="font-medium">{group.displayName}</div>
                          {group.description && (
                            <div className="text-sm text-muted-foreground">
                              {group.description}
                </div>
                          )}
                        </div>
                        <Button
                          variant={bulkSelectedGroups.includes(groupId) ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleBulkGroupToggle(groupId, !bulkSelectedGroups.includes(groupId))}
                        >
                          {bulkSelectedGroups.includes(groupId) ? "Selected" : "Select"}
                        </Button>
                      </div>
                      
                  <RadioGroup
                    value={groupAssignments[groupId] || ''}
                    onValueChange={(value) => setGroupAssignments(prev => ({ ...prev, [groupId]: value }))}
                  >
                        <div className="grid grid-cols-2 gap-2">
                          {permissionSets.map((permissionSet) => (
                            <div key={permissionSet.id} className="flex items-center space-x-2 p-2 border rounded hover:bg-muted/50">
                              <RadioGroupItem value={permissionSet.id} id={`${groupId}-${permissionSet.id}`} />
                              <Label htmlFor={`${groupId}-${permissionSet.id}`} className="flex-1 cursor-pointer text-sm">
                                {permissionSet.name}
                        </Label>
                      </div>
                          ))}
                    </div>
                  </RadioGroup>
                </div>
          )
        })}
      </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )

  const renderStep3 = () => {
    const getPermissionSetName = (permissionSetId: string) => {
      const permissionSet = permissionSets.find(ps => ps.id === permissionSetId)
      return permissionSet?.name || 'Not assigned'
    }

    return (
      <div className="space-y-4">
        <div className="space-y-4">
          {/* Groups Summary */}
          {selectedGroups.length > 0 && (
            <div>
              <h4 className="font-medium mb-3">Groups ({selectedGroups.length})</h4>
              <div className="space-y-2">
                {selectedGroups.map((groupId) => {
                  const group = allGroups.find(g => g.id === groupId)
                  if (!group) return null
                  
                  return (
                    <div key={groupId} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <div className="font-medium">{group.displayName}</div>
                        {group.description && (
                          <div className="text-sm text-muted-foreground">
                            {group.description}
                </div>
                        )}
                      </div>
                      <Badge variant="outline">
                        {getPermissionSetName(groupAssignments[groupId])}
                </Badge>
              </div>
                  )
                })}
          </div>
          </div>
          )}
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
        return renderStep1()
    }
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return selectedGroups.length > 0
      case 2:
        return true
      case 3:
        return true
      default:
        return false
    }
  }

  const handleNext = () => {
    if (currentStep < 3 && canProceed()) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Report Permissions Setup Wizard</DialogTitle>
        </DialogHeader>

        {/* Progress Indicator */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                  currentStep >= step.id 
                    ? 'bg-primary border-primary text-primary-foreground' 
                    : 'border-muted-foreground text-muted-foreground'
                }`}>
                  {currentStep > step.id ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <span className="text-sm font-medium">{step.id}</span>
                  )}
                </div>
                <div className="ml-2">
                  <div className={`text-sm font-medium ${
                    currentStep >= step.id ? 'text-foreground' : 'text-muted-foreground'
                  }`}>
                  {step.title}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {step.description}
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className="w-8 h-0.5 bg-muted-foreground/20 mx-4" />
                )}
              </div>
            ))}
          </div>
          <Progress value={(currentStep / steps.length) * 100} className="h-2" />
        </div>

        {/* Step Content */}
        <div className="py-6">
          {renderCurrentStep()}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-4 border-t">
          <Button 
            variant="outline" 
            onClick={handleBack}
            disabled={currentStep === 1}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            {currentStep < 3 ? (
            <Button onClick={handleNext} disabled={!canProceed()}>
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
            ) : (
              <Button onClick={handleClose}>
                Complete Setup
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}