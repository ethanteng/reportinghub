import React, { useEffect } from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { TenantSwitcher } from './TenantSwitcher'
import { GroupsTable } from './GroupsTable'
import { PermissionSetsTable } from './PermissionSetsTable'
import { ReportAccessMatrix } from './ReportAccessMatrix'
import { SetupWizard } from './SetupWizard'
import { 
  tenantContoso, 
  reports, 
  byTenantId 
} from '@/types/mockAzureAD'
import { usePermissionsStore } from '@/store/usePermissionsStore'
import { 
  Search, 
  MoreHorizontal, 
  Bookmark, 
  User, 
  Settings, 
  FolderOpen, 
  Users, 
  Palette, 
  BarChart3, 
  HelpCircle, 
  MessageCircle, 
  ArrowLeft,
  Plus,
  FileText,
  Link,
  Edit3,
  Save,
  Download,
  Share2,
  RefreshCw,
  Mail,
  Lightbulb,
  Search as SearchIcon
} from 'lucide-react'

export function PermissionsHub() {
  const { 
    currentTenantId, 
    setCurrentTenantId, 
    permissionSets: storePermissionSets,
    assignments: storeAssignments,
    setupWizardOpen,
    setSetupWizardOpen
  } = usePermissionsStore()

  // Initialize with default tenant
  useEffect(() => {
    console.log('PermissionsHub useEffect - currentTenantId:', currentTenantId)
    if (!currentTenantId) {
      console.log('Setting tenant to:', tenantContoso.tenantId)
      setCurrentTenantId(tenantContoso.tenantId)
    }
  }, [currentTenantId, setCurrentTenantId])

  const currentTenant = currentTenantId ? byTenantId.get(currentTenantId) : null
  console.log('PermissionsHub render - currentTenantId:', currentTenantId, 'currentTenant:', currentTenant)

  if (!currentTenant) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Permissions Hub</h1>
          <p className="text-muted-foreground">Please select a tenant to continue.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">the reporting HUB</h1>
            </div>
            
            {/* Right side controls */}
            <div className="flex items-center space-x-4">
              <Search className="h-5 w-5 text-gray-500" />
              <MoreHorizontal className="h-5 w-5 text-gray-500" />
              <div className="flex items-center space-x-1">
                <Bookmark className="h-5 w-5 text-gray-500" />
                <span className="text-sm text-gray-600">Quick Links</span>
              </div>
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-gray-500" />
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">Minimal Tenant</div>
                  <div className="text-xs text-gray-500">TENANT</div>
                </div>
              </div>
              <div className="h-8 w-8 bg-gray-300 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-gray-600" />
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-screen">
        {/* Left Sidebar - Admin Settings */}
        <div className="w-64 bg-white border-r border-gray-200">
          <div className="p-6">
            <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">
              ADMIN SETTINGS
            </h2>
            <nav className="space-y-2">
              <div className="flex items-center space-x-3 px-3 py-2 bg-blue-50 text-blue-700 rounded-md">
                <FolderOpen className="h-5 w-5" />
                <span className="text-sm font-medium">Manage Content</span>
              </div>
              <div className="flex items-center space-x-3 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-md cursor-pointer">
                <Users className="h-5 w-5" />
                <span className="text-sm">Manage Groups</span>
              </div>
              <div className="flex items-center space-x-3 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-md cursor-pointer">
                <Palette className="h-5 w-5" />
                <span className="text-sm">Edit Theme</span>
              </div>
              <div className="flex items-center space-x-3 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-md cursor-pointer">
                <BarChart3 className="h-5 w-5" />
                <span className="text-sm">Power BI Settings</span>
              </div>
              <div className="flex items-center space-x-3 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-md cursor-pointer">
                <Settings className="h-5 w-5" />
                <span className="text-sm">App Settings</span>
              </div>
              <div className="flex items-center space-x-3 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-md cursor-pointer">
                <HelpCircle className="h-5 w-5" />
                <span className="text-sm">Help</span>
              </div>
              <div className="flex items-center space-x-3 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-md cursor-pointer">
                <MessageCircle className="h-5 w-5" />
                <span className="text-sm">Community</span>
              </div>
              <div className="flex items-center space-x-3 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-md cursor-pointer">
                <ArrowLeft className="h-5 w-5" />
                <span className="text-sm">Exit Settings</span>
              </div>
            </nav>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex">
          {/* Left Panel - Menu Structure */}
          <div className="w-80 bg-white border-r border-gray-200">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Menu Structure</h3>
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </div>
              
              <div className="space-y-2">
                {/* Menu Items */}
                <div className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                  <FolderOpen className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-900">Home</span>
                  <div className="flex items-center space-x-1 ml-auto">
                    <Plus className="h-3 w-3 text-gray-400" />
                    <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                  <Users className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-900">Executive Dashboards</span>
                  <div className="w-2 h-2 bg-gray-300 rounded-full ml-auto"></div>
                </div>
                
                <div className="ml-6 space-y-1">
                  <div className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                    <FolderOpen className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-700">CEO Weekly Reports</span>
                  </div>
                  <div className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                    <FolderOpen className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-700">Power BI Enhanced Reports</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                  <Link className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-900">Monthly ROI</span>
                </div>
                
                <div className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                  <Users className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-900">Sub Dashboards</span>
                  <div className="w-2 h-2 bg-gray-300 rounded-full ml-auto"></div>
                </div>
                
                <div className="ml-6 space-y-1">
                  <div className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                    <FolderOpen className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-700">Sub Annual Reports</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                  <Link className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-900">Daily Activities</span>
                </div>
                
                <div className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                  <FolderOpen className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-900">Site Usage</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Content Item */}
          <div className="flex-1 bg-white">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Content Item</h3>
                <div className="flex space-x-4">
                  <Button variant="outline" size="sm">
                    Back to Layout
                  </Button>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">Save as Draft</Button>
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                      Save
                    </Button>
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                      Save & Open page
                    </Button>
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                      Save & Preview
                    </Button>
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                      Save & Close
                    </Button>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <Tabs defaultValue="permissions" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="content">Content</TabsTrigger>
                  <TabsTrigger value="layout">Layout</TabsTrigger>
                  <TabsTrigger value="permissions">Permissions</TabsTrigger>
                </TabsList>
                
                <TabsContent value="permissions" className="mt-6">
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">Assign Permissions</h4>
                      <p className="text-sm text-gray-600 mb-4">
                        Enter a Security Group name, or the User's email to verify and add.
                      </p>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Users/ Security Groups *
                          </label>
                          <Input 
                            placeholder="The Reporting Hub Admin, UAT Admin"
                            className="w-full"
                          />
                        </div>
                        
                        {/* Permissions Table */}
                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                            <div className="grid grid-cols-3 gap-4 text-sm font-medium text-gray-700">
                              <div>Users/ Security Groups</div>
                              <div>Report Options</div>
                              <div>Row Level Security</div>
                            </div>
                          </div>
                          
                          <div className="divide-y divide-gray-200">
                            {/* Reporting Hub Admin Row */}
                            <div className="px-4 py-4">
                              <div className="grid grid-cols-3 gap-4 items-center">
                                <div className="flex items-center space-x-2">
                                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                                    Reporting Hub Admin
                                    <button className="ml-2 text-blue-600 hover:text-blue-800">
                                      ×
                                    </button>
                                  </Badge>
                                </div>
                                
                                <div className="flex items-center space-x-4">
                                  <div className="flex space-x-2">
                                    <Edit3 className="h-5 w-5 text-green-600" />
                                    <Save className="h-5 w-5 text-green-600" />
                                    <Download className="h-5 w-5 text-green-600" />
                                    <Share2 className="h-5 w-5 text-green-600" />
                                    <RefreshCw className="h-5 w-5 text-green-600" />
                                    <Mail className="h-5 w-5 text-green-600" />
                                    <Lightbulb className="h-5 w-5 text-green-600" />
                                    <SearchIcon className="h-5 w-5 text-green-600" />
                                  </div>
                                  <Button variant="outline" size="sm">
                                    Edit →
                                  </Button>
                                </div>
                                
                                <div>
                                  <Select>
                                    <SelectTrigger className="w-full">
                                      <SelectValue placeholder="DynamicRLS" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="dynamic">DynamicRLS</SelectItem>
                                      <SelectItem value="static">StaticRLS</SelectItem>
                                      <SelectItem value="none">None</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                            </div>
                            
                            {/* UAT Admin Row */}
                            <div className="px-4 py-4">
                              <div className="grid grid-cols-3 gap-4 items-center">
                                <div className="flex items-center space-x-2">
                                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                                    UAT Admin
                                    <button className="ml-2 text-blue-600 hover:text-blue-800">
                                      ×
                                    </button>
                                  </Badge>
                                </div>
                                
                                <div className="flex items-center space-x-4">
                                  <div className="flex space-x-2">
                                    <Edit3 className="h-5 w-5 text-green-600" />
                                    <Save className="h-5 w-5 text-green-600" />
                                    <Download className="h-5 w-5 text-green-600" />
                                    <Share2 className="h-5 w-5 text-green-600" />
                                    <RefreshCw className="h-5 w-5 text-gray-300" />
                                    <Mail className="h-5 w-5 text-gray-300" />
                                    <Lightbulb className="h-5 w-5 text-gray-300" />
                                    <SearchIcon className="h-5 w-5 text-gray-300" />
                                  </div>
                                  <Button variant="outline" size="sm">
                                    Edit →
                                  </Button>
                                </div>
                                
                                <div>
                                  <Select>
                                    <SelectTrigger className="w-full">
                                      <SelectValue placeholder="Not available" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="none">Not available</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>

      <SetupWizard 
        open={setupWizardOpen} 
        onOpenChange={setSetupWizardOpen}
        tenant={currentTenant}
      />
    </div>
  )
}
