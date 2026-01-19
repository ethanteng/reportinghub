// Types for Manage Content page

export type ID = string;

export interface NavigationItem {
  id: ID;
  name: string;
  icon?: string;
  parentId?: ID;
  order: number;
  children?: NavigationItem[];
}

export enum DynamicBindingScope {
  Report = 'report',
  Group = 'group',
}

export enum ReportType {
  Paginated = 'paginated',
  BiGenius = 'bi-genius',
}

export interface Role {
  id: ID;
  name: string;
  modelId: ID;
}

export interface SemanticModel {
  id: ID;
  name: string;
  workspace: string;
  supportsRLS: boolean;
  roles?: Role[];
}

export interface DynamicBindingConfig {
  scope: DynamicBindingScope;
  modelId?: ID;
  roleIds?: ID[];
}

export interface MenuItemConfig {
  id: ID;
  navigationItemId: ID;
  dynamicSemanticModel?: string; // Format: "Workspace/Model Name"
  reportType: ReportType;
  displayOptions: {
    showFilterPane: boolean;
    showContentPane: boolean;
    showTitleAndDescription: boolean;
  };
  permissions: {
    users: string[];
    groups: string[];
    userRoles?: Record<string, string>; // Map of user/group name to role ID
    userPages?: Record<string, string[]>; // Map of user/group name to selected pages
    userActions?: Record<string, string[]>; // Map of user/group name to selected actions
  };
  dynamicBinding?: DynamicBindingConfig;
}

export interface MenuConfig {
  navigationItems: NavigationItem[];
  selectedItemId?: ID;
  itemConfigs: Record<ID, MenuItemConfig>;
}
