export const APP_CONFIG = {
  name: 'ReportingHub',
  version: '1.0.0',
  description: 'Multi-tenant BI permissions management'
} as const

export const PERMISSION_LEVELS = {
  VIEWER: 'Viewer',
  EDITOR: 'Editor', 
  ADMIN: 'Admin'
} as const

export const GROUP_TYPES = {
  SECURITY: 'Security',
  M365: 'Microsoft 365'
} as const

export const ASSIGNMENT_SCOPES = {
  TENANT: 'Tenant',
  REPORT: 'Report',
  FOLDER: 'Folder'
} as const

export const CAPABILITIES = {
  VIEW_REPORTS: 'viewReports',
  MANAGE_PERMISSIONS: 'managePermissions',
  MANAGE_CONTENT_PAGES: 'manageContentPages',
  EXPORT_DATA: 'exportData'
} as const

export const ROUTES = {
  HOME: '/',
  GROUPS: '/groups',
  PERMISSION_SETS: '/permission-sets',
  REPORTS: '/reports',
  AUDIT: '/audit'
} as const
