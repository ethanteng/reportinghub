import { NavigationItem, SemanticModel, Role, MenuItemConfig, DynamicBindingScope, ReportType } from '@/types/manageContent';

// Mock semantic models - some with RLS, some without
export const mockSemanticModels: SemanticModel[] = [
  {
    id: 'model-1',
    name: 'Admin Dashboard',
    workspace: 'RH UAT Workspace',
    supportsRLS: true,
    roles: [
      { id: 'role-1', name: 'eastern_division', modelId: 'model-1' },
      { id: 'role-2', name: 'small_and_mid_custom', modelId: 'model-1' },
      { id: 'role-3', name: 'strategic_custom', modelId: 'model-1' },
      { id: 'role-4', name: 'western_division', modelId: 'model-1' },
    ],
  },
  {
    id: 'model-2',
    name: 'Sales Analytics',
    workspace: 'RH UAT Workspace',
    supportsRLS: true,
    roles: [
      { id: 'role-5', name: 'eastern_division', modelId: 'model-2' },
      { id: 'role-6', name: 'small_and_mid_custom', modelId: 'model-2' },
      { id: 'role-7', name: 'strategic_custom', modelId: 'model-2' },
      { id: 'role-8', name: 'western_division', modelId: 'model-2' },
    ],
  },
  {
    id: 'model-3',
    name: 'Financial Reports',
    workspace: 'Production Workspace',
    supportsRLS: false,
  },
  {
    id: 'model-4',
    name: 'Marketing Dashboard',
    workspace: 'RH UAT Workspace',
    supportsRLS: true,
    roles: [
      { id: 'role-9', name: 'eastern_division', modelId: 'model-4' },
      { id: 'role-10', name: 'small_and_mid_custom', modelId: 'model-4' },
      { id: 'role-11', name: 'strategic_custom', modelId: 'model-4' },
      { id: 'role-12', name: 'western_division', modelId: 'model-4' },
    ],
  },
];

// Mock navigation items matching screenshot structure
export const mockNavigationItems: NavigationItem[] = [
  {
    id: 'nav-1',
    name: 'Welcome to UAT',
    icon: '🚀',
    order: 1,
  },
  {
    id: 'nav-2',
    name: 'Getting Started',
    icon: '🚩',
    order: 2,
  },
  {
    id: 'nav-3',
    name: 'GS Background',
    icon: '🎵',
    order: 3,
  },
  {
    id: 'nav-4',
    name: 'GS No Background',
    icon: '🌙',
    order: 4,
  },
  {
    id: 'nav-5',
    name: 'Test Storage Pages',
    icon: '📁',
    order: 5,
    children: [
      {
        id: 'nav-5-1',
        name: 'Multiple Groups Query ID',
        parentId: 'nav-5',
        order: 1,
      },
      {
        id: 'nav-5-2',
        name: 'Empty Path',
        parentId: 'nav-5',
        order: 2,
      },
      {
        id: 'nav-5-3',
        name: 'One File',
        parentId: 'nav-5',
        order: 3,
      },
    ],
  },
];

// Helper functions
export function getRolesForModel(modelId: string): Role[] {
  const model = mockSemanticModels.find((m) => m.id === modelId);
  return model?.roles || [];
}

export function modelSupportsRLS(modelId: string): boolean {
  const model = mockSemanticModels.find((m) => m.id === modelId);
  return model?.supportsRLS || false;
}

export function getModelById(modelId: string): SemanticModel | undefined {
  return mockSemanticModels.find((m) => m.id === modelId);
}

export function formatModelDisplay(model: SemanticModel): string {
  return `${model.workspace}/${model.name}`;
}

// Available users and groups for permissions
export const availableUsersAndGroups = [
  'admin',
  'Acme Corp 2 Admins for Reporting Hub 2',
  'Acme Corp 2 Content Admins for Reporting Hub',
  'Acme Corporation Admin group for Reportinghub',
  'Acme Corporation Content Admin Group for Reportinghub',
  'autocreatetest Admins for Reporting Hub',
];

// Mock menu item configs
export const mockMenuItemConfigs: Record<string, MenuItemConfig> = {
  'nav-1': {
    id: 'config-1',
    navigationItemId: 'nav-1',
    dynamicSemanticModel: 'RH UAT Workspace/Admin Dashboard',
    reportType: ReportType.BiGenius,
    displayOptions: {
      showFilterPane: true,
      showContentPane: true,
      showTitleAndDescription: true,
    },
    permissions: {
      users: [],
      groups: [],
      userRoles: {},
    },
    dynamicBinding: {
      scope: DynamicBindingScope.Report,
    },
  },
};
