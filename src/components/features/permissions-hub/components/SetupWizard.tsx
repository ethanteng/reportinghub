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
  Guid 
} from '@/types/mockAzureAD'
import { usePermissionsStore } from '@/store/usePermissionsStore'

interface SetupWizardProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tenant: Tenant
}

export function SetupWizard({ open, onOpenChange, tenant }: SetupWizardProps) {
  const {
    setupStep,
    setSetupStep,
    setupSelectedGroups,
    setSetupSelectedGroups,
    setupGroupAssignments,
    setSetupGroupAssignment,
    setSetupGroupAssignments,
    addAssignment,
    setSetupWizardOpen
  } = usePermissionsStore()

  const [completedSteps, setCompletedSteps] = useState<number[]>([])

  const steps = [
    { id: 1, title: 'Select Groups', description: 'Choose which groups to manage' },
    { id: 2, title: 'Assign Permissions', description: 'Set default permission sets' },
    { id: 3, title: 'Review & Complete', description: 'Review your configuration' }
  ]

  const handleNext = () => {
    if (setupStep < 3) {
      setCompletedSteps(prev => [...prev, setupStep])
      setSetupStep(setupStep + 1)
    } else {
      handleComplete()
    }
  }

  const handleBack = () => {
    if (setupStep > 1) {
      setSetupStep(setupStep - 1)
    }
  }

  const handleComplete = () => {
    // Apply all group assignments
    Object.entries(setupGroupAssignments).forEach(([groupId, permissionSetId]) => {
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

    // Reset wizard state
    setSetupStep(1)
    setSetupSelectedGroups([])
    setSetupGroupAssignments({})
    setCompletedSteps([])
    setSetupWizardOpen(false)
  }

  const handleGroupToggle = (groupId: Guid, checked: boolean) => {
    if (checked) {
      setSetupSelectedGroups([...setupSelectedGroups, groupId])
    } else {
      setSetupSelectedGroups(setupSelectedGroups.filter(id => id !== groupId))
      // Remove assignment if group is deselected
      const newAssignments = { ...setupGroupAssignments }
      delete newAssignments[groupId]
      setSetupGroupAssignments(newAssignments)
    }
  }

  const canProceed = () => {
    switch (setupStep) {
      case 1:
        return setupSelectedGroups.length > 0
      case 2:
        return setupSelectedGroups.every(groupId => setupGroupAssignments[groupId])
      case 3:
        return true
      default:
        return false
    }
  }


  const renderStep1 = () => (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Select the groups you want to manage in this tenant. You can always add more later.
      </p>
      
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {tenant.groups.map((group) => (
          <Card key={group.id} className="cursor-pointer hover:bg-muted/50">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <Checkbox
                  checked={setupSelectedGroups.includes(group.id)}
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
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )

  const renderStep2 = () => (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Assign default permission sets to each selected group. These will be applied at the tenant level.
      </p>
      
      <div className="space-y-4">
        {setupSelectedGroups.map((groupId) => {
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
                  <Label>Select Permission Set</Label>
                  <RadioGroup
                    value={setupGroupAssignments[groupId] || ''}
                    onValueChange={(value) => setSetupGroupAssignment(groupId, value)}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="ps_viewer" id={`${groupId}-viewer`} />
                        <Label htmlFor={`${groupId}-viewer`} className="flex-1">
                          <div className="flex flex-col">
                            <span className="font-medium">Viewer</span>
                            <span className="text-sm text-muted-foreground">
                              Read-only access to reports
                            </span>
                          </div>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="ps_editor" id={`${groupId}-editor`} />
                        <Label htmlFor={`${groupId}-editor`} className="flex-1">
                          <div className="flex flex-col">
                            <span className="font-medium">Editor</span>
                            <span className="text-sm text-muted-foreground">
                              View and customize reports
                            </span>
                          </div>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="ps_admin" id={`${groupId}-admin`} />
                        <Label htmlFor={`${groupId}-admin`} className="flex-1">
                          <div className="flex flex-col">
                            <span className="font-medium">Admin</span>
                            <span className="text-sm text-muted-foreground">
                              Full admin access
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

  const renderStep3 = () => (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Review your configuration before applying it to the tenant.
      </p>
      
      <div className="space-y-4">
        <div className="p-4 bg-muted rounded-lg">
          <h4 className="font-medium mb-2">Summary</h4>
          <div className="space-y-1 text-sm">
            <div><strong>Groups selected:</strong> {setupSelectedGroups.length}</div>
            <div><strong>Assignments to create:</strong> {Object.keys(setupGroupAssignments).length}</div>
          </div>
        </div>
        
        <div className="space-y-2">
          <h4 className="font-medium">Group Assignments</h4>
          {setupSelectedGroups.map((groupId) => {
            const group = tenant.groups.find(g => g.id === groupId)!
            const permissionSetId = setupGroupAssignments[groupId]
            const permissionSetName = permissionSetId?.replace('ps_', '').replace('_', ' ') || 'Not assigned'
            
            return (
              <div key={groupId} className="flex items-center justify-between p-2 border rounded">
                <span className="font-medium">{group.displayName}</span>
                <Badge variant="secondary">{permissionSetName}</Badge>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )

  const renderCurrentStep = () => {
    switch (setupStep) {
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
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Setup Wizard</DialogTitle>
          <DialogDescription>
            Configure your tenant's permission structure in a few simple steps.
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
                    : setupStep === step.id 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {completedSteps.includes(step.id) ? '✓' : step.id}
                </div>
                <span className={setupStep === step.id ? 'font-medium' : ''}>
                  {step.title}
                </span>
              </div>
            ))}
          </div>
          <Progress value={(setupStep / 3) * 100} className="h-2" />
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
            disabled={setupStep === 1}
          >
            Back
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleNext} disabled={!canProceed()}>
              {setupStep === 3 ? 'Complete Setup' : 'Next'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
