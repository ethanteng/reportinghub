import React, { useState, useEffect } from 'react'
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
import { AadGroup, Tenant, ReportRef } from '@/types/mockAzureAD'
import { usePermissionsStore } from '@/store/usePermissionsStore'

interface OverrideReportAccessModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  report: ReportRef
  group: AadGroup
  tenant: Tenant
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

  // Find existing report-level assignment for this group
  const existingAssignment = assignments.find(
    a => a.tenantId === tenant.tenantId && 
         a.aadGroupId === group.id && 
         a.scope === 'Report' &&
         a.targetId === report.id
  )


  useEffect(() => {
    if (existingAssignment) {
      setSelectedPermissionSetId(existingAssignment.permissionSetId)
      setSelectedRlsRole(existingAssignment.rlsRole || 'none')
      setRevokeAccess(false)
    } else {
      setSelectedPermissionSetId('')
      setSelectedRlsRole('none')
      setRevokeAccess(false)
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
    setRevokeAccess(false)
    onOpenChange(false)
  }

  const psById = new Map(permissionSets.map(ps => [ps.id, ps]))

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Change Report Access</DialogTitle>
          <DialogDescription>
            Change access for <strong>{group.displayName}</strong> to <strong>{report.name}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Permission Set Selection */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Select Permission Set</Label>
            <RadioGroup
              value={selectedPermissionSetId}
              onValueChange={(value) => {
                setSelectedPermissionSetId(value)
                if (value) {
                  setRevokeAccess(false)
                }
              }}
              className="space-y-3"
              disabled={noAccess}
            >
              {permissionSets.map((ps) => (
                <div key={ps.id} className="flex items-start space-x-3">
                  <RadioGroupItem value={ps.id} id={ps.id} />
                  <Label htmlFor={ps.id} className="flex-1 cursor-pointer">
                    <div className="flex flex-col">
                      <span className="font-medium">{ps.name}</span>
                      <span className="text-sm text-muted-foreground">
                        {ps.description}
                      </span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {Object.entries(ps.capabilities)
                          .filter(([, enabled]) => enabled)
                          .map(([capability]) => (
                            <Badge key={capability} variant="secondary" className="text-xs">
                              {capability}
                            </Badge>
                          ))}
                      </div>
                    </div>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* No Access Option */}
          <div className="flex items-center space-x-2">
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
            <Label htmlFor="no-access" className="text-sm">
              No access (remove all permissions for this report)
            </Label>
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

        <DialogFooter className="flex justify-end gap-2">
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
