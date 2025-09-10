import React, { useState } from 'react'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Table, TableHeader, TableRow, TableHead, TableCell, TableBody } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  getEffectivePermissionSetId, 
  Tenant, 
  ReportRef, 
  AadGroup, 
  Guid 
} from '@/types/mockAzureAD'
import { usePermissionsStore } from '@/store/usePermissionsStore'
import { OverrideReportAccessModal } from '../modals/OverrideReportAccessModal'
import { AuditViewModal } from '../modals/AuditViewModal'

interface ReportAccessMatrixProps {
  tenant: Tenant
  reports: ReportRef[]
}

export function ReportAccessMatrix({ tenant, reports }: ReportAccessMatrixProps) {
  const { 
    assignments, 
    permissionSets, 
    selectedReports, 
    setSelectedReports, 
    toggleReportSelection,
    auditReportId,
    setAuditReportId
  } = usePermissionsStore()
  
  const [overrideModalOpen, setOverrideModalOpen] = useState(false)
  const [selectedCell, setSelectedCell] = useState<{reportId: string, groupId: Guid} | null>(null)
  const [bulkGroupId, setBulkGroupId] = useState<Guid>('')
  const [bulkPermissionSetId, setBulkPermissionSetId] = useState<string>('')
  const [bulkRlsRole, setBulkRlsRole] = useState<string>('')

  const psById = new Map(permissionSets.map(ps => [ps.id, ps]))

  const handleCellClick = (reportId: string, groupId: Guid) => {
    setSelectedCell({ reportId, groupId })
    setOverrideModalOpen(true)
  }

  const handleBulkAssign = () => {
    if (!bulkGroupId || !bulkPermissionSetId || selectedReports.length === 0) {
      alert('Please select a group, permission set, and at least one report.')
      return
    }

    // This would be implemented in the store
    console.log('Bulk assign:', {
      groupId: bulkGroupId,
      permissionSetId: bulkPermissionSetId,
      rlsRole: bulkRlsRole || undefined,
      reportIds: selectedReports
    })
  }

  const handleSelectAllReports = (checked: boolean) => {
    if (checked) {
      setSelectedReports(reports.map(r => r.id))
    } else {
      setSelectedReports([])
    }
  }

  const allReportsSelected = selectedReports.length === reports.length
  const someReportsSelected = selectedReports.length > 0

  return (
    <>
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Report Access Matrix</h3>
        </CardHeader>
        <CardContent>
          {/* Bulk Actions Bar */}
          <div className="mb-4 p-4 border rounded-lg bg-muted/50">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={allReportsSelected}
                  onCheckedChange={handleSelectAllReports}
                />
                <span className="text-sm font-medium">
                  {allReportsSelected ? 'Deselect All' : 'Select All'} Reports
                </span>
                {someReportsSelected && (
                  <Badge variant="secondary">
                    {selectedReports.length} selected
                  </Badge>
                )}
              </div>
              
              {someReportsSelected && (
                <>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">Group:</span>
                    <Select value={bulkGroupId} onValueChange={setBulkGroupId}>
                      <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Select group" />
                      </SelectTrigger>
                      <SelectContent>
                        {tenant.groups.map(group => (
                          <SelectItem key={group.id} value={group.id}>
                            {group.displayName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-sm">Permission Set:</span>
                    <Select value={bulkPermissionSetId} onValueChange={setBulkPermissionSetId}>
                      <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Select set" />
                      </SelectTrigger>
                      <SelectContent>
                        {permissionSets.map(ps => (
                          <SelectItem key={ps.id} value={ps.id}>
                            {ps.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Button onClick={handleBulkAssign} size="sm">
                    Apply to Selected
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Matrix Table */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[220px] sticky left-0 bg-background z-10">
                    Report
                  </TableHead>
                  {tenant.groups.map((group) => (
                    <TableHead key={group.id} className="min-w-[150px]">
                      <div className="flex flex-col">
                        <span className="font-medium">{group.displayName}</span>
                        {group.description && (
                          <span className="text-xs text-muted-foreground">
                            {group.description}
                          </span>
                        )}
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell className="font-medium sticky left-0 bg-background z-10">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          checked={selectedReports.includes(report.id)}
                          onCheckedChange={() => toggleReportSelection(report.id)}
                        />
                        <div className="flex items-center gap-2">
                          <div className="flex flex-col">
                            <span>{report.name}</span>
                            <span className="text-xs text-muted-foreground">{report.path}</span>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setAuditReportId(report.id)}
                          >
                            Audit
                          </Button>
                        </div>
                      </div>
                    </TableCell>
                    {tenant.groups.map((group) => {
                      const eff = getEffectivePermissionSetId(tenant.tenantId, group.id, report.id)
                      const ps = eff.permissionSetId ? psById.get(eff.permissionSetId) : null
                      
                      return (
                        <TableCell key={`${report.id}-${group.id}`}>
                          {ps ? (
                            <Badge 
                              variant="secondary"
                              className="cursor-pointer hover:bg-opacity-80"
                              onClick={() => handleCellClick(report.id, group.id)}
                            >
                              {ps.name}
                            </Badge>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCellClick(report.id, group.id)}
                              className="text-muted-foreground"
                            >
                              Assign
                            </Button>
                          )}
                        </TableCell>
                      )
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {selectedCell && (
        <OverrideReportAccessModal
          open={overrideModalOpen}
          onOpenChange={setOverrideModalOpen}
          report={reports.find(r => r.id === selectedCell.reportId)!}
          group={tenant.groups.find(g => g.id === selectedCell.groupId)!}
          tenant={tenant}
        />
      )}

      {auditReportId && (
        <AuditViewModal
          open={!!auditReportId}
          onOpenChange={(open) => setAuditReportId(open ? auditReportId : null)}
          report={reports.find(r => r.id === auditReportId)!}
          tenant={tenant}
        />
      )}
    </>
  )
}
