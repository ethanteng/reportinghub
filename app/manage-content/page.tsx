'use client';

import { useState, useCallback } from 'react';
import { ConfigurationPanel } from '@/components/manage-content/ConfigurationPanel';
import { mockMenuItemConfigs } from '@/lib/data/manageContent';
import { MenuItemConfig, ReportType, DynamicBindingScope } from '@/types/manageContent';

export default function ManageContentPage() {
  const [config, setConfig] = useState<MenuItemConfig>(
    mockMenuItemConfigs['nav-1'] || {
      id: 'config-default',
      navigationItemId: 'nav-default',
      reportType: ReportType.Paginated,
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
    }
  );

  const handleConfigChange = useCallback((updatedConfig: MenuItemConfig) => {
    setConfig(updatedConfig);
  }, []);

  return (
    <div className="h-full p-6">
      <ConfigurationPanel config={config} onConfigChange={handleConfigChange} />
    </div>
  );
}
