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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { PermissionSet } from '@/types/mockAzureAD'

interface EditPermissionSetModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  permissionSet: PermissionSet | null
  onSave: (permissionSet: PermissionSet) => void
}

export function EditPermissionSetModal({ 
  open, 
  onOpenChange, 
  permissionSet, 
  onSave 
}: EditPermissionSetModalProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [capabilities, setCapabilities] = useState({
    viewReports: false,
    managePermissions: false,
    manageContentPages: false,
    exportData: false,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (permissionSet) {
      setName(permissionSet.name)
      setDescription(permissionSet.description)
      setCapabilities(permissionSet.capabilities)
    } else {
      setName('')
      setDescription('')
      setCapabilities({
        viewReports: false,
        managePermissions: false,
        manageContentPages: false,
        exportData: false,
      })
    }
    setErrors({})
  }, [permissionSet, open])

  const handleCapabilityChange = (capability: keyof typeof capabilities, checked: boolean) => {
    setCapabilities(prev => ({
      ...prev,
      [capability]: checked
    }))
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}
    
    if (!name.trim()) {
      newErrors.name = 'Name is required'
    }
    
    if (!description.trim()) {
      newErrors.description = 'Description is required'
    }
    
    const hasAnyCapability = Object.values(capabilities).some(Boolean)
    if (!hasAnyCapability) {
      newErrors.capabilities = 'At least one capability must be selected'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = () => {
    if (!validate()) return

    const newPermissionSet: PermissionSet = {
      id: permissionSet?.id || `ps_${Date.now()}`,
      name: name.trim() as any, // Type assertion for now
      description: description.trim(),
      capabilities
    }

    onSave(newPermissionSet)
  }

  const handleCancel = () => {
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {permissionSet ? 'Edit Permission Set' : 'Create Permission Set'}
          </DialogTitle>
          <DialogDescription>
            {permissionSet 
              ? 'Update the permission set details and capabilities.'
              : 'Create a new permission set with specific capabilities.'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Viewer, Editor, Admin"
              className={errors.name ? 'border-destructive' : ''}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what this permission set allows"
              className={errors.description ? 'border-destructive' : ''}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description}</p>
            )}
          </div>

          <div className="space-y-3">
            <Label>Capabilities *</Label>
            <div className="space-y-2">
              {Object.entries(capabilities).map(([key, enabled]) => (
                <div key={key} className="flex items-center space-x-2">
                  <Checkbox
                    id={key}
                    checked={enabled}
                    onCheckedChange={(checked: boolean) => 
                      handleCapabilityChange(key as keyof typeof capabilities, checked)
                    }
                  />
                  <Label htmlFor={key} className="text-sm font-normal">
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </Label>
                </div>
              ))}
            </div>
            {errors.capabilities && (
              <p className="text-sm text-destructive">{errors.capabilities}</p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            {permissionSet ? 'Update' : 'Create'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
