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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { PermissionSet } from '@/types/mockAzureAD'
import { 
  Edit3, 
  Save, 
  Download, 
  Share2, 
  RefreshCw, 
  Mail, 
  MessageCircle, 
  Code2,
  Info
} from 'lucide-react'

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
    allowEditAndSave: false,
    allowEditAndSaveAs: false,
    allowExportReport: false,
    allowSharingReport: false,
    allowSemanticModelRefresh: false,
    allowSchedulingTasks: false,
    allowAccessToBIGenius: false,
    allowAccessToBIGeniusQueryDeepDive: false,
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
        allowEditAndSave: false,
        allowEditAndSaveAs: false,
        allowExportReport: false,
        allowSharingReport: false,
        allowSemanticModelRefresh: false,
        allowSchedulingTasks: false,
        allowAccessToBIGenius: false,
        allowAccessToBIGeniusQueryDeepDive: false,
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

  const capabilityDefinitions = [
    {
      key: 'allowEditAndSave' as keyof typeof capabilities,
      label: 'Allow Edit and Save',
      icon: Edit3,
      description: 'Allows users to edit and save changes to reports'
    },
    {
      key: 'allowEditAndSaveAs' as keyof typeof capabilities,
      label: 'Allow Edit and Save As',
      icon: Save,
      description: 'Allows users to edit and save reports with a new name'
    },
    {
      key: 'allowExportReport' as keyof typeof capabilities,
      label: 'Allow export of the report',
      icon: Download,
      description: 'Allows users to export reports to various formats'
    },
    {
      key: 'allowSharingReport' as keyof typeof capabilities,
      label: 'Allow sharing of the report',
      icon: Share2,
      description: 'Allows users to share reports with others'
    },
    {
      key: 'allowSemanticModelRefresh' as keyof typeof capabilities,
      label: 'Allow semantic model refresh for the report',
      icon: RefreshCw,
      description: 'Allows users to refresh the underlying data model'
    },
    {
      key: 'allowSchedulingTasks' as keyof typeof capabilities,
      label: 'Allow scheduling of tasks for the report',
      icon: Mail,
      description: 'Allows users to schedule automated tasks and notifications'
    },
    {
      key: 'allowAccessToBIGenius' as keyof typeof capabilities,
      label: 'Allow access to BI Genius',
      icon: MessageCircle,
      description: 'Allows users to access AI-powered BI assistance'
    },
    {
      key: 'allowAccessToBIGeniusQueryDeepDive' as keyof typeof capabilities,
      label: 'Allow access to BI Genius query deep dive',
      icon: Code2,
      description: 'Allows users to access advanced query analysis features'
    }
  ]

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
            <div className="space-y-3">
              {capabilityDefinitions.map((capability) => {
                const IconComponent = capability.icon
                return (
                  <div key={capability.key} className="flex items-center space-x-3">
                    <Checkbox
                      id={capability.key}
                      checked={capabilities[capability.key]}
                      onCheckedChange={(checked: boolean) => 
                        handleCapabilityChange(capability.key, checked)
                      }
                    />
                    <IconComponent className="h-4 w-4 text-muted-foreground" />
                    <Label htmlFor={capability.key} className="text-sm font-normal flex-1">
                      {capability.label}
                    </Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">{capability.description}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                )
              })}
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
