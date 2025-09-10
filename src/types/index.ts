// Re-export all types from mockAzureAD for easier imports
export * from './mockAzureAD'

// Additional types for the application
export interface AppConfig {
  version: string
  environment: 'development' | 'production' | 'test'
}

export interface NotificationState {
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
  duration?: number
}

export interface BreadcrumbItem {
  label: string
  href?: string
}
