import React, { useState } from 'react'
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
import { AadGroup, Tenant } from '@/types/mockAzureAD'
import { usePermissionsStore } from '@/store/usePermissionsStore'

interface AssignTenantSetModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  group: AadGroup
  tenant: Tenant
}

export function AssignTenantSetModal({ 
  open, 
  onOpenChange, 
  group, 
  tenant 
}: AssignTenantSetModalProps) {
  const { permissionSets, assignments, addAssignment, updateAssignment, removeAssignment } = usePermissionsStore()
  const [selectedPermissionSetId, setSelectedPermissionSetId] = useState<string>('')

  // Find existing tenant-level assignment for this group
  const existingAssignment = assignments.find(
    a => a.tenantId === tenant.tenantId && 
         a.aadGroupId === group.id && 
         a.scope === 'Tenant'
  )

  React.useEffect(() => {
    if (existingAssignment) {
      setSelectedPermissionSetId(existingAssignment.permissionSetId)
    } else {
      setSelectedPermissionSetId('')
    }
  }, [existingAssignment, open])

  const handleSave = () => {
    if (selectedPermissionSetId) {
      const assignment = {
        tenantId: tenant.tenantId,
        aadGroupId: group.id,
        permissionSetId: selectedPermissionSetId,
        scope: 'Tenant' as const,
        inherited: false
      }

      if (existingAssignment) {
        updateAssignment(assignment)
      } else {
        addAssignment(assignment)
      }
    } else if (existingAssignment) {
      // Remove existing assignment if no permission set selected
      removeAssignment(tenant.tenantId, group.id, 'Tenant')
    }

    onOpenChange(false)
  }

  const handleCancel = () => {
    setSelectedPermissionSetId(existingAssignment?.permissionSetId || '')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Assign Permission Set</DialogTitle>
          <DialogDescription>
            Assign a tenant-level permission set to <strong>{group.displayName}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-auto">
          <div className="space-y-4">
            <div>
              <Label className="text-base font-medium">Select Permission Set</Label>
              <RadioGroup
                value={selectedPermissionSetId}
                onValueChange={setSelectedPermissionSetId}
                className="mt-2 space-y-3"
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
                <div className="flex items-start space-x-3">
                  <RadioGroupItem value="" id="none" />
                  <Label htmlFor="none" className="flex-1 cursor-pointer">
                    <span className="text-muted-foreground">No permission set (remove assignment)</span>
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-shrink-0">
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
