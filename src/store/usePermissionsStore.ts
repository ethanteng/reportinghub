import { create } from 'zustand'
import { 
  Tenant, 
  PermissionSet, 
  GroupAssignment, 
  ReportRef, 
  Guid 
} from '@/types/mockAzureAD'

interface PermissionsState {
  // Current tenant
  currentTenantId: Guid | null
  setCurrentTenantId: (tenantId: Guid) => void
  
  // Permission sets (can be modified)
  permissionSets: PermissionSet[]
  addPermissionSet: (permissionSet: PermissionSet) => void
  updatePermissionSet: (id: string, updates: Partial<PermissionSet>) => void
  deletePermissionSet: (id: string) => void
  
  // Group assignments (can be modified)
  assignments: GroupAssignment[]
  addAssignment: (assignment: GroupAssignment) => void
  updateAssignment: (assignment: GroupAssignment) => void
  removeAssignment: (tenantId: Guid, aadGroupId: Guid, scope: 'Tenant' | 'Report', targetId?: string) => void
  
  // Selected items for bulk operations
  selectedReports: string[]
  setSelectedReports: (reportIds: string[]) => void
  toggleReportSelection: (reportId: string) => void
  
  // Audit view
  auditReportId: string | null
  setAuditReportId: (reportId: string | null) => void
  
  // Setup wizard state
  setupWizardOpen: boolean
  setSetupWizardOpen: (open: boolean) => void
  setupStep: number
  setSetupStep: (step: number) => void
  setupSelectedGroups: Guid[]
  setSetupSelectedGroups: (groupIds: Guid[]) => void
  setupGroupAssignments: Record<Guid, string> // groupId -> permissionSetId
  setSetupGroupAssignment: (groupId: Guid, permissionSetId: string) => void
  setSetupGroupAssignments: (assignments: Record<Guid, string>) => void
}

export const usePermissionsStore = create<PermissionsState>((set, get) => ({
  // Current tenant
  currentTenantId: null,
  setCurrentTenantId: (tenantId) => set({ currentTenantId: tenantId }),
  
  // Permission sets
  permissionSets: [],
  addPermissionSet: (permissionSet) => 
    set((state) => ({ 
      permissionSets: [...state.permissionSets, permissionSet] 
    })),
  updatePermissionSet: (id, updates) =>
    set((state) => ({
      permissionSets: state.permissionSets.map(ps => 
        ps.id === id ? { ...ps, ...updates } : ps
      )
    })),
  deletePermissionSet: (id) =>
    set((state) => ({
      permissionSets: state.permissionSets.filter(ps => ps.id !== id)
    })),
  
  // Group assignments
  assignments: [],
  addAssignment: (assignment) =>
    set((state) => ({
      assignments: [...state.assignments, assignment]
    })),
  updateAssignment: (assignment) =>
    set((state) => ({
      assignments: state.assignments.map(a => 
        a.tenantId === assignment.tenantId && 
        a.aadGroupId === assignment.aadGroupId && 
        a.scope === assignment.scope && 
        a.targetId === assignment.targetId
          ? assignment 
          : a
      )
    })),
  removeAssignment: (tenantId, aadGroupId, scope, targetId) =>
    set((state) => ({
      assignments: state.assignments.filter(a => 
        !(a.tenantId === tenantId && 
          a.aadGroupId === aadGroupId && 
          a.scope === scope && 
          a.targetId === targetId)
      )
    })),
  
  // Selected items
  selectedReports: [],
  setSelectedReports: (reportIds) => set({ selectedReports: reportIds }),
  toggleReportSelection: (reportId) =>
    set((state) => ({
      selectedReports: state.selectedReports.includes(reportId)
        ? state.selectedReports.filter(id => id !== reportId)
        : [...state.selectedReports, reportId]
    })),
  
  // Audit view
  auditReportId: null,
  setAuditReportId: (reportId) => set({ auditReportId: reportId }),
  
  // Setup wizard
  setupWizardOpen: false,
  setSetupWizardOpen: (open) => set({ setupWizardOpen: open }),
  setupStep: 1,
  setSetupStep: (step) => set({ setupStep: step }),
  setupSelectedGroups: [],
  setSetupSelectedGroups: (groupIds) => set({ setupSelectedGroups: groupIds }),
  setupGroupAssignments: {},
  setSetupGroupAssignment: (groupId, permissionSetId) =>
    set((state) => ({
      setupGroupAssignments: {
        ...state.setupGroupAssignments,
        [groupId]: permissionSetId
      }
    })),
  setSetupGroupAssignments: (assignments) =>
    set({ setupGroupAssignments: assignments }),
}))

// Helper functions
export const getPermissionSetUsage = (permissionSetId: string, assignments: GroupAssignment[]): number => {
  return assignments.filter(a => a.permissionSetId === permissionSetId).length
}

export const isPermissionSetInUse = (permissionSetId: string, assignments: GroupAssignment[]): boolean => {
  return getPermissionSetUsage(permissionSetId, assignments) > 0
}
