'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ScopeSelector } from './ScopeSelector';
import { ModelSelector } from './ModelSelector';
import { RoleSelector } from './RoleSelector';
import { PermissionsSelector } from './PermissionsSelector';
import { ReportPagesSelector, REPORT_PAGES } from './ReportPagesSelector';
import {
  DynamicBindingScope,
  MenuItemConfig,
} from '@/types/manageContent';
import { mockSemanticModels, getRolesForModel, modelSupportsRLS } from '@/lib/data/manageContent';
import { useState, useEffect, useRef } from 'react';

interface ConfigurationPanelProps {
  config?: MenuItemConfig;
  onConfigChange: (config: MenuItemConfig) => void;
}

export function ConfigurationPanel({ config, onConfigChange }: ConfigurationPanelProps) {
  const configIdRef = useRef<string | undefined>(config?.id);
  const isInitialMount = useRef(true);

  const [dynamicBindingEnabled, setDynamicBindingEnabled] = useState<boolean>(
    config?.dynamicBinding !== undefined
  );
  const [choosePagesEnabled, setChoosePagesEnabled] = useState<boolean>(false);
  const [selectedPages, setSelectedPages] = useState<string[]>(REPORT_PAGES);
  const [pagePermissions, setPagePermissions] = useState({
    users: [] as string[],
    groups: [] as string[],
    userRoles: {} as Record<string, string>,
    userPages: {} as Record<string, string[]>,
  });

  const handleChoosePagesToggle = (enabled: boolean) => {
    setChoosePagesEnabled(enabled);
    if (enabled && selectedPages.length === 0) {
      // Set default to all pages when first enabled
      setSelectedPages(REPORT_PAGES);
    } else if (!enabled) {
      // Reset to all pages when disabled
      setSelectedPages(REPORT_PAGES);
    }
  };
  const [scope, setScope] = useState<DynamicBindingScope>(
    config?.dynamicBinding?.scope || DynamicBindingScope.Report
  );
  const [selectedModelId, setSelectedModelId] = useState<string | undefined>(
    config?.dynamicBinding?.modelId
  );
  const [selectedRoleId, setSelectedRoleId] = useState<string | undefined>(
    config?.dynamicBinding?.roleIds?.[0]
  );
  const [permissions, setPermissions] = useState({
    users: config?.permissions?.users || [],
    groups: config?.permissions?.groups || [],
    userRoles: config?.permissions?.userRoles || {},
  });

  // Sync state when config prop changes (e.g., when selecting a different menu item)
  useEffect(() => {
    if (config && config.id !== configIdRef.current) {
      configIdRef.current = config.id;
      setDynamicBindingEnabled(config.dynamicBinding !== undefined);
      setScope(config.dynamicBinding?.scope || DynamicBindingScope.Report);
      setSelectedModelId(config.dynamicBinding?.modelId);
      setSelectedRoleId(config.dynamicBinding?.roleIds?.[0]);
      setPermissions({
        users: config.permissions?.users || [],
        groups: config.permissions?.groups || [],
        userRoles: config.permissions?.userRoles || {},
      });
      isInitialMount.current = true;
    }
  }, [config?.id]);

  // Reset role selection when model changes or doesn't support RLS
  useEffect(() => {
    if (selectedModelId && !modelSupportsRLS(selectedModelId)) {
      setSelectedRoleId(undefined);
    }
  }, [selectedModelId]);

  // Reset role when switching back to Report-level scope (but keep model)
  useEffect(() => {
    if (scope === DynamicBindingScope.Report) {
      setSelectedRoleId(undefined);
    }
  }, [scope]);

  // Update config when any field changes (but skip initial mount and sync operations to prevent loop)
  useEffect(() => {
    if (!config || isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    // Only update if config ID matches (to avoid updating during sync)
    if (config.id !== configIdRef.current) {
      return;
    }

    const updatedConfig: MenuItemConfig = {
      ...config,
      permissions: {
        users: permissions.users,
        groups: permissions.groups,
        userRoles: permissions.userRoles,
      },
      dynamicBinding: dynamicBindingEnabled
        ? {
            scope,
            modelId: selectedModelId,
            roleIds:
              scope === DynamicBindingScope.Group && selectedRoleId
                ? [selectedRoleId]
                : undefined,
          }
        : undefined,
    };

    onConfigChange(updatedConfig);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    dynamicBindingEnabled,
    scope,
    selectedModelId,
    selectedRoleId,
    permissions,
    // Don't include config or onConfigChange to prevent infinite loops
  ]);

  const selectedModel = selectedModelId
    ? mockSemanticModels.find((m) => m.id === selectedModelId)
    : undefined;
  const availableRoles =
    scope === DynamicBindingScope.Group &&
    selectedModelId &&
    modelSupportsRLS(selectedModelId)
      ? getRolesForModel(selectedModelId)
      : [];

  const showModelSelector = true; // Always show model selector
  const hasSelectedUsersOrGroups = (permissions.users.length > 0 || permissions.groups.length > 0);
  const showRoleSelector =
    scope === DynamicBindingScope.Group &&
    hasSelectedUsersOrGroups &&
    selectedModelId !== undefined &&
    modelSupportsRLS(selectedModelId);

  return (
    <div className="h-full flex flex-col">
      <Card className="flex-1 flex flex-col overflow-hidden">
        <CardHeader>
          <CardTitle>Configuration</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto space-y-6">
          {/* Enable Dynamic Binding Toggle */}
          <div className="flex items-center justify-between pb-4 border-b">
            <Label htmlFor="enable-dynamic-binding" className="text-sm font-medium">
              Enable Dynamic Binding
            </Label>
            <Switch
              id="enable-dynamic-binding"
              checked={dynamicBindingEnabled}
              onCheckedChange={setDynamicBindingEnabled}
            />
          </div>

          {/* Dynamic Binding Configuration - Only visible when enabled */}
          {dynamicBindingEnabled && (
            <>
              {/* Dynamic Binding Scope */}
              <ScopeSelector value={scope} onChange={setScope} />

              {/* Model Selector */}
              <ModelSelector
                models={mockSemanticModels}
                value={selectedModelId}
                onChange={setSelectedModelId}
              />
            </>
          )}

          {/* Permissions - Only visible for Group-level scope and when dynamic binding is enabled */}
          {dynamicBindingEnabled && scope === DynamicBindingScope.Group && (
            <div className="space-y-4">
              <PermissionsSelector
                users={permissions.users}
                groups={permissions.groups}
                onUsersChange={(users) => setPermissions((prev) => ({ ...prev, users }))}
                onGroupsChange={(groups) => setPermissions((prev) => ({ ...prev, groups }))}
                availableRoles={availableRoles}
                userRoles={permissions.userRoles}
                onUserRoleChange={(userOrGroup, roleId) => {
                  setPermissions((prev) => {
                    const newUserRoles = { ...prev.userRoles };
                    if (roleId) {
                      newUserRoles[userOrGroup] = roleId;
                    } else {
                      delete newUserRoles[userOrGroup];
                    }
                    return {
                      ...prev,
                      userRoles: newUserRoles,
                    };
                  });
                }}
                hasSelectedModel={selectedModelId !== undefined}
                modelSupportsRLS={selectedModelId ? modelSupportsRLS(selectedModelId) : false}
              />
            </div>
          )}

          {/* Choose Pages to Show - Independent section */}
          <div className="pt-6 mt-6 border-t-2">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="choose-pages" className="text-sm font-medium">
                    Choose report pages to show
                  </Label>
                </div>
                <Switch
                  id="choose-pages"
                  checked={choosePagesEnabled}
                  onCheckedChange={handleChoosePagesToggle}
                />
              </div>
              {choosePagesEnabled && (
                <div className="space-y-6">
                  <ReportPagesSelector
                    selectedPages={selectedPages}
                    onSelectedPagesChange={setSelectedPages}
                  />
                  
                  {/* User/Group Permissions for Pages */}
                  <PermissionsSelector
                    users={pagePermissions.users}
                    groups={pagePermissions.groups}
                    onUsersChange={(users) => {
                      setPagePermissions((prev) => {
                        const newUserPages = { ...prev.userPages };
                        // Initialize pages for new users/groups with default selected pages
                        users.forEach((user) => {
                          if (!newUserPages[user]) {
                            newUserPages[user] = [...selectedPages];
                          }
                        });
                        // Remove pages for removed users
                        Object.keys(newUserPages).forEach((key) => {
                          if (!users.includes(key) && !pagePermissions.groups.includes(key)) {
                            delete newUserPages[key];
                          }
                        });
                        return { ...prev, users, userPages: newUserPages };
                      });
                    }}
                    onGroupsChange={(groups) => {
                      setPagePermissions((prev) => {
                        const newUserPages = { ...prev.userPages };
                        // Initialize pages for new groups with default selected pages
                        groups.forEach((group) => {
                          if (!newUserPages[group]) {
                            newUserPages[group] = [...selectedPages];
                          }
                        });
                        // Remove pages for removed groups
                        Object.keys(newUserPages).forEach((key) => {
                          if (!pagePermissions.users.includes(key) && !groups.includes(key)) {
                            delete newUserPages[key];
                          }
                        });
                        return { ...prev, groups, userPages: newUserPages };
                      });
                    }}
                    availableRoles={availableRoles}
                    userRoles={pagePermissions.userRoles}
                    onUserRoleChange={(userOrGroup, roleId) => {
                      setPagePermissions((prev) => {
                        const newUserRoles = { ...prev.userRoles };
                        if (roleId) {
                          newUserRoles[userOrGroup] = roleId;
                        } else {
                          delete newUserRoles[userOrGroup];
                        }
                        return {
                          ...prev,
                          userRoles: newUserRoles,
                        };
                      });
                    }}
                    hasSelectedModel={selectedModelId !== undefined}
                    modelSupportsRLS={selectedModelId ? modelSupportsRLS(selectedModelId) : false}
                    availablePages={REPORT_PAGES}
                    userPages={pagePermissions.userPages}
                    onUserPagesChange={(userOrGroup, pages) => {
                      setPagePermissions((prev) => ({
                        ...prev,
                        userPages: {
                          ...prev.userPages,
                          [userOrGroup]: pages,
                        },
                      }));
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <Button variant="outline" className="flex-1">
              Cancel
            </Button>
            <Button className="flex-1">Save</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
