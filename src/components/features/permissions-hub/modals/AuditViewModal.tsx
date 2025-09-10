import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Table, TableHeader, TableRow, TableHead, TableCell, TableBody } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  getEffectivePermissionSetId, 
  resolveTransitiveMembers,
  Tenant, 
  ReportRef, 
  AadGroup 
} from '@/types/mockAzureAD'
import { usePermissionsStore } from '@/store/usePermissionsStore'

interface AuditViewModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  report: ReportRef
  tenant: Tenant
}

export function AuditViewModal({ 
  open, 
  onOpenChange, 
  report, 
  tenant 
}: AuditViewModalProps) {
  const { permissionSets, assignments } = usePermissionsStore()
  
  const psById = new Map(permissionSets.map(ps => [ps.id, ps]))

  // Get all groups that have access to this report
  const groupsWithAccess = tenant.groups
    .map(group => {
      const eff = getEffectivePermissionSetId(tenant.tenantId, group.id, report.id)
      const members = resolveTransitiveMembers(tenant, group.id)
      
      return {
        group,
        effectivePermission: eff,
        memberCount: members.length,
        hasAccess: !!eff.permissionSetId
      }
    })
    .filter(item => item.hasAccess)
    .sort((a, b) => b.memberCount - a.memberCount) // Sort by member count


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Audit: Who can access "{report.name}"?</DialogTitle>
          <DialogDescription>
            Groups and users with access to this report, including their effective permissions and inheritance source.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-auto">
          <div className="space-y-4">
            {/* Report Info */}
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">Report Details</h4>
              <div className="space-y-1 text-sm">
                <div><strong>Name:</strong> {report.name}</div>
                <div><strong>Path:</strong> {report.path}</div>
                {report.dataset && <div><strong>Dataset:</strong> {report.dataset}</div>}
                {report.rlsRoles && report.rlsRoles.length > 0 && (
                  <div>
                    <strong>Available RLS Roles:</strong> {report.rlsRoles.join(', ')}
                  </div>
                )}
              </div>
            </div>

            {/* Access Summary */}
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">Access Summary</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>{groupsWithAccess.length}</strong> groups have access
                </div>
                <div>
                  <strong>
                    {groupsWithAccess.reduce((sum, item) => sum + item.memberCount, 0)}
                  </strong> total users
                </div>
              </div>
            </div>

            {/* Groups Table */}
            <div>
              <h4 className="font-medium mb-3">Groups with Access</h4>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Group</TableHead>
                    <TableHead>Members</TableHead>
                    <TableHead>Effective Permission</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {groupsWithAccess.map(({ group, effectivePermission, memberCount }) => {
                    const ps = psById.get(effectivePermission.permissionSetId!)
                    
                    return (
                      <TableRow key={group.id}>
                        <TableCell className="font-medium">
                          <div className="flex flex-col">
                            <span>{group.displayName}</span>
                            {group.description && (
                              <span className="text-xs text-muted-foreground">
                                {group.description}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span>{memberCount} total</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <Badge variant="secondary">
                              {ps?.name || 'Unknown'}
                            </Badge>
                            {effectivePermission.rlsRole && (
                              <span className="text-xs text-muted-foreground">
                                RLS: {effectivePermission.rlsRole}
                              </span>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
