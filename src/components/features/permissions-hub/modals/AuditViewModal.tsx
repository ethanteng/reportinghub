import React, { useState } from 'react'
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
import { Card, CardContent } from '@/components/ui/card'
import { 
  getEffectivePermissionSetId, 
  resolveTransitiveMembers,
  Tenant, 
  ReportRef, 
  AadGroup,
  AadUser,
  Guid
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
  const [expandedGroups, setExpandedGroups] = useState<Set<Guid>>(new Set())
  
  const psById = new Map(permissionSets.map(ps => [ps.id, ps]))

  // Get individual users with direct access
  const usersWithAccess = tenant.users
    .map(user => {
      const userAssignment = assignments.find(a => 
        a.tenantId === tenant.tenantId && 
        a.aadGroupId === user.id && 
        a.scope === "Report" && 
        a.targetId === report.id
      )
      
      if (userAssignment) {
        const ps = psById.get(userAssignment.permissionSetId)
        return {
          user,
          effectivePermission: {
            permissionSetId: userAssignment.permissionSetId,
            inheritedFrom: "Report" as const,
            rlsRole: userAssignment.rlsRole
          },
          hasAccess: true
        }
      }
      return null
    })
    .filter((item): item is NonNullable<typeof item> => item !== null)
    .sort((a, b) => a.user.displayName.localeCompare(b.user.displayName))

  // Get all groups that have access to this report
  const groupsWithAccess = tenant.groups
    .map(group => {
      const eff = getEffectivePermissionSetId(tenant.tenantId, group.id, report.id)
      const members = resolveTransitiveMembers(tenant, group.id)
      
      return {
        group,
        effectivePermission: eff,
        memberCount: members.length,
        members: members,
        hasAccess: !!eff.permissionSetId
      }
    })
    .filter(item => item.hasAccess)
    .sort((a, b) => b.memberCount - a.memberCount) // Sort by member count

  const toggleGroupExpansion = (groupId: Guid) => {
    const newExpanded = new Set(expandedGroups)
    if (newExpanded.has(groupId)) {
      newExpanded.delete(groupId)
    } else {
      newExpanded.add(groupId)
    }
    setExpandedGroups(newExpanded)
  }

  const totalUsers = usersWithAccess.length + groupsWithAccess.reduce((sum, item) => sum + item.memberCount, 0)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[80vh] overflow-hidden flex flex-col">
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
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <strong>{usersWithAccess.length}</strong> individual users
                </div>
                <div>
                  <strong>{groupsWithAccess.length}</strong> groups have access
                </div>
                <div>
                  <strong>{totalUsers}</strong> total users
                </div>
              </div>
            </div>

            {/* Individual Users */}
            {usersWithAccess.length > 0 && (
              <div>
                <h4 className="font-medium mb-3">Individual Users with Direct Access</h4>
                <Card>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[200px]">User</TableHead>
                          <TableHead className="w-[250px]">Email</TableHead>
                          <TableHead>Effective Permission</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {usersWithAccess.map(({ user, effectivePermission }) => {
                          const ps = psById.get(effectivePermission.permissionSetId!)
                          
                          return (
                            <TableRow key={user.id}>
                              <TableCell className="font-medium">
                                <div className="flex items-center gap-2">
                                  <span>{user.displayName}</span>
                                  {user.userPrincipalName.includes('#EXT#') && (
                                    <Badge variant="outline" className="text-xs">
                                      Guest
                                    </Badge>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <span className="text-sm text-muted-foreground">
                                  {user.mail || user.userPrincipalName}
                                </span>
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-col gap-1">
                                  <Badge variant="secondary" className="w-fit">
                                    {ps?.name || 'Unknown'}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground">
                                    Direct assignment
                                  </span>
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
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Groups Table */}
            <div>
              <h4 className="font-medium mb-3">Groups with Access</h4>
              <Card>
                <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[200px]">Group</TableHead>
                          <TableHead className="w-[250px]">Members</TableHead>
                          <TableHead>Effective Permission</TableHead>
                        </TableRow>
                      </TableHeader>
                    <TableBody>
                      {groupsWithAccess.map(({ group, effectivePermission, memberCount, members }) => {
                        const ps = psById.get(effectivePermission.permissionSetId!)
                        const isExpanded = expandedGroups.has(group.id)
                        
                        return (
                          <React.Fragment key={group.id}>
                            <TableRow>
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
                                <button
                                  onClick={() => toggleGroupExpansion(group.id)}
                                  className="flex items-center gap-2 text-left hover:text-blue-600 transition-colors"
                                >
                                  <span>{memberCount} total</span>
                                  <svg
                                    className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                  </svg>
                                </button>
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-col gap-1">
                                  <Badge variant="secondary" className="w-fit">
                                    {ps?.name || 'Unknown'}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground">
                                    {effectivePermission.inheritedFrom === 'Tenant' ? 'Tenant default' : 'Report override'}
                                  </span>
                                  {effectivePermission.rlsRole && (
                                    <span className="text-xs text-muted-foreground">
                                      RLS: {effectivePermission.rlsRole}
                                    </span>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                            
                            {/* Expanded Group Members */}
                            {isExpanded && (
                              <TableRow>
                                <TableCell colSpan={3} className="p-0">
                                  <div className="bg-muted/30 p-3">
                                    <div className="text-xs text-muted-foreground mb-2">Members:</div>
                                    <div className="space-y-1">
                                      {members.map((member, index) => (
                                        <div key={member.id} className="text-xs text-foreground">
                                          {member.displayName}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </TableCell>
                              </TableRow>
                            )}
                          </React.Fragment>
                        )
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
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