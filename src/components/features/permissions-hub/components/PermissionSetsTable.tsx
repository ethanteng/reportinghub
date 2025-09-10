import React, { useState } from 'react'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Table, TableHeader, TableRow, TableHead, TableCell, TableBody } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { usePermissionsStore, getPermissionSetUsage, isPermissionSetInUse } from '@/store/usePermissionsStore'
import { EditPermissionSetModal } from '../modals/EditPermissionSetModal'
import { PermissionSet } from '@/types/mockAzureAD'
import { 
  Edit3, 
  Save, 
  Download, 
  Share2, 
  RefreshCw, 
  Mail, 
  MessageCircle, 
  Code2
} from 'lucide-react'

export function PermissionSetsTable() {
  const { 
    permissionSets, 
    assignments, 
    addPermissionSet, 
    updatePermissionSet, 
    deletePermissionSet 
  } = usePermissionsStore()
  
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editingPermissionSet, setEditingPermissionSet] = useState<PermissionSet | null>(null)

  const capabilityDefinitions = {
    allowEditAndSave: { label: 'Edit & Save', icon: Edit3, color: 'bg-muted text-muted-foreground' },
    allowEditAndSaveAs: { label: 'Edit & Save As', icon: Save, color: 'bg-muted text-muted-foreground' },
    allowExportReport: { label: 'Export', icon: Download, color: 'bg-muted text-muted-foreground' },
    allowSharingReport: { label: 'Share', icon: Share2, color: 'bg-muted text-muted-foreground' },
    allowSemanticModelRefresh: { label: 'Model Refresh', icon: RefreshCw, color: 'bg-muted text-muted-foreground' },
    allowSchedulingTasks: { label: 'Schedule', icon: Mail, color: 'bg-muted text-muted-foreground' },
    allowAccessToBIGenius: { label: 'BI Genius', icon: MessageCircle, color: 'bg-muted text-muted-foreground' },
    allowAccessToBIGeniusQueryDeepDive: { label: 'Query Deep Dive', icon: Code2, color: 'bg-muted text-muted-foreground' }
  }

  const handleAddNew = () => {
    setEditingPermissionSet(null)
    setEditModalOpen(true)
  }

  const handleEdit = (permissionSet: PermissionSet) => {
    setEditingPermissionSet(permissionSet)
    setEditModalOpen(true)
  }

  const handleDelete = (permissionSet: PermissionSet) => {
    if (isPermissionSetInUse(permissionSet.id, assignments)) {
      alert('Cannot delete permission set that is currently in use. Please reassign or remove all assignments first.')
      return
    }
    
    if (confirm(`Are you sure you want to delete "${permissionSet.name}"?`)) {
      deletePermissionSet(permissionSet.id)
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Permission Sets</h3>
            <Button onClick={handleAddNew}>
              + Add New Set
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Capabilities</TableHead>
                <TableHead>Usage</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {permissionSets.map((ps) => {
                const usage = getPermissionSetUsage(ps.id, assignments)
                const inUse = isPermissionSetInUse(ps.id, assignments)
                
                return (
                  <TableRow key={ps.id}>
                    <TableCell className="font-medium">{ps.name}</TableCell>
                    <TableCell>{ps.description}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-0.5">
                        {Object.entries(ps.capabilities)
                          .filter(([, enabled]) => enabled)
                          .map(([capabilityKey]) => {
                            const capability = capabilityDefinitions[capabilityKey as keyof typeof capabilityDefinitions]
                            if (!capability) return null
                            
                            const IconComponent = capability.icon
                            return (
                              <Badge 
                                key={capabilityKey} 
                                variant="secondary" 
                                className={`text-xs px-1.5 py-0.5 ${capability.color} border-0 font-normal`}
                              >
                                <IconComponent className="h-2.5 w-2.5 mr-1" />
                                {capability.label}
                              </Badge>
                            )
                          })}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {usage} assignment{usage !== 1 ? 's' : ''}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleEdit(ps)}
                        >
                          Edit
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleDelete(ps)}
                          disabled={inUse}
                        >
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
          
          {permissionSets.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No permission sets created yet. Click "Add New Set" to get started.
            </div>
          )}
        </CardContent>
      </Card>

      <EditPermissionSetModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        permissionSet={editingPermissionSet}
        onSave={(permissionSet) => {
          if (editingPermissionSet) {
            updatePermissionSet(editingPermissionSet.id, permissionSet)
          } else {
            addPermissionSet(permissionSet)
          }
          setEditModalOpen(false)
        }}
      />
    </>
  )
}
