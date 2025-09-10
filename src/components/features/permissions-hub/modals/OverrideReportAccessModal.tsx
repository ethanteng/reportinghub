import React, { useState, useEffect, useMemo } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { AadGroup, Tenant, ReportRef, PermissionSet } from '@/types/mockAzureAD'
import { usePermissionsStore } from '@/store/usePermissionsStore'
import { Search, ChevronDown, ChevronRight } from 'lucide-react'

interface OverrideReportAccessModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  report: ReportRef
  group: AadGroup
  tenant: Tenant
}

// Helper function to group capabilities by category
const groupCapabilities = (capabilities: PermissionSet['capabilities']) => {
  const groups = {
    'Edit & Save': [] as string[],
    'Export & Share': [] as string[],
    'Admin & Management': [] as string[],
    'BI Features': [] as string[]
  }

  if (capabilities.allowEditAndSave) groups['Edit & Save'].push('Edit and Save')
  if (capabilities.allowEditAndSaveAs) groups['Edit & Save'].push('Edit and Save As')
  if (capabilities.allowExportReport) groups['Export & Share'].push('Export Reports')
  if (capabilities.allowSharingReport) groups['Export & Share'].push('Share Reports')
  if (capabilities.allowSemanticModelRefresh) groups['Admin & Management'].push('Refresh Models')
  if (capabilities.allowSchedulingTasks) groups['Admin & Management'].push('Schedule Tasks')
  if (capabilities.allowAccessToBIGenius) groups['BI Features'].push('BI Genius')
  if (capabilities.allowAccessToBIGeniusQueryDeepDive) groups['BI Features'].push('Query Deep Dive')

  return groups
}

export function OverrideReportAccessModal({ 
  open, 
  onOpenChange, 
  report, 
  group, 
  tenant 
}: OverrideReportAccessModalProps) {
  const { 
    permissionSets, 
    assignments, 
    addAssignment, 
    updateAssignment, 
    removeAssignment 
  } = usePermissionsStore()
  
  const [selectedPermissionSetId, setSelectedPermissionSetId] = useState<string>('')
  const [selectedRlsRole, setSelectedRlsRole] = useState<string>('none')
  const [noAccess, setNoAccess] = useState<boolean>(false)
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [expandedSets, setExpandedSets] = useState<Set<string>>(new Set())

  // Find existing report-level assignment for this group
  const existingAssignment = assignments.find(
    a => a.tenantId === tenant.tenantId && 
         a.aadGroupId === group.id && 
         a.scope === 'Report' &&
         a.targetId === report.id
  )

  // Filter permission sets based on search query
  const filteredPermissionSets = useMemo(() => {
    if (!searchQuery.trim()) return permissionSets
    
    return permissionSets.filter(ps => 
      ps.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ps.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [permissionSets, searchQuery])

  const toggleExpanded = (permissionSetId: string) => {
    const newExpanded = new Set(expandedSets)
    if (newExpanded.has(permissionSetId)) {
      newExpanded.delete(permissionSetId)
    } else {
      newExpanded.add(permissionSetId)
    }
    setExpandedSets(newExpanded)
  }


  useEffect(() => {
    if (existingAssignment) {
      setSelectedPermissionSetId(existingAssignment.permissionSetId)
      setSelectedRlsRole(existingAssignment.rlsRole || 'none')
      setNoAccess(false)
    } else {
      setSelectedPermissionSetId('')
      setSelectedRlsRole('none')
      setNoAccess(true)
    }
  }, [existingAssignment, open])

  const handleSave = () => {
    if (noAccess) {
      // Remove existing assignment if revoke access is checked
      if (existingAssignment) {
        removeAssignment(tenant.tenantId, group.id, 'Report', report.id)
      }
    } else if (selectedPermissionSetId) {
      const assignment = {
        tenantId: tenant.tenantId,
        aadGroupId: group.id,
        permissionSetId: selectedPermissionSetId,
        scope: 'Report' as const,
        targetId: report.id,
        rlsRole: selectedRlsRole === 'none' ? undefined : selectedRlsRole,
        inherited: false
      }

      if (existingAssignment) {
        updateAssignment(assignment)
      } else {
        addAssignment(assignment)
      }
    }

    onOpenChange(false)
  }


  const handleCancel = () => {
    setSelectedPermissionSetId(existingAssignment?.permissionSetId || '')
    setSelectedRlsRole(existingAssignment?.rlsRole || 'none')
    setNoAccess(false)
    onOpenChange(false)
  }

  const psById = new Map(permissionSets.map(ps => [ps.id, ps]))

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Change Report Access</DialogTitle>
          <DialogDescription>
            Change access for <strong>{group.displayName}</strong> to <strong>{report.name}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-auto">
          <div className="space-y-6">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search permission sets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                disabled={noAccess}
              />
            </div>

            {/* No Access Option */}
            <div className="border rounded-lg p-3">
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="no-access"
                  checked={noAccess}
                  onCheckedChange={(checked: boolean) => {
                    setNoAccess(checked)
                    if (checked) {
                      setSelectedPermissionSetId('')
                    }
                  }}
                />
                <Label htmlFor="no-access" className="flex-1 cursor-pointer">
                  <div className="flex flex-col">
                    <span className="font-medium text-base">No Access</span>
                    <span className="text-sm text-muted-foreground">
                      Remove all permissions for this report
                    </span>
                  </div>
                </Label>
              </div>
            </div>

            {/* Permission Set Selection */}
            <div className="space-y-2">
              <Label className="text-base font-medium">Select Permission Set</Label>
              <RadioGroup
                value={selectedPermissionSetId}
                onValueChange={(value) => {
                  setSelectedPermissionSetId(value)
                  if (value) {
                    setNoAccess(false)
                  }
                }}
                className="space-y-2"
                disabled={noAccess}
              >
                {filteredPermissionSets.map((ps) => {
                  const isExpanded = expandedSets.has(ps.id)
                  const capabilities = groupCapabilities(ps.capabilities)
                  const hasAnyCapabilities = Object.values(capabilities).some(group => group.length > 0)
                  
                  return (
                    <div key={ps.id} className="border rounded-lg p-3 hover:bg-muted/50 transition-colors">
                      <div className="flex items-start space-x-3">
                        <RadioGroupItem value={ps.id} id={ps.id} className="mt-1" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <Label htmlFor={ps.id} className="cursor-pointer flex-1">
                              <div className="flex flex-col">
                                <span className="font-medium text-base">{ps.name}</span>
                                <span className="text-sm text-muted-foreground mt-1">
                                  {ps.description}
                                </span>
                              </div>
                            </Label>
                            {hasAnyCapabilities && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleExpanded(ps.id)}
                                className="h-6 w-6 p-0"
                              >
                                {isExpanded ? (
                                  <ChevronDown className="h-4 w-4" />
                                ) : (
                                  <ChevronRight className="h-4 w-4" />
                                )}
                              </Button>
                            )}
                          </div>
                          
                          {/* Expanded capabilities view */}
                          {isExpanded && hasAnyCapabilities && (
                            <div className="mt-3 space-y-3">
                              {Object.entries(capabilities).map(([category, permissions]) => 
                                permissions.length > 0 && (
                                  <div key={category} className="space-y-1">
                                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                      {category}
                                    </span>
                                    <div className="flex flex-wrap gap-1">
                                      {permissions.map((permission) => (
                                        <Badge key={permission} variant="default" className="text-xs">
                                          {permission}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                )
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </RadioGroup>
            </div>

            {/* RLS Role Selection */}
            {selectedPermissionSetId && report.rlsRoles && report.rlsRoles.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="rls-role">Row-Level Security Role (Optional)</Label>
                <Select value={selectedRlsRole} onValueChange={setSelectedRlsRole}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select RLS role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No RLS role</SelectItem>
                    {report.rlsRoles.map(role => (
                      <SelectItem key={role} value={role}>
                        {role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="flex justify-end gap-2 flex-shrink-0">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
