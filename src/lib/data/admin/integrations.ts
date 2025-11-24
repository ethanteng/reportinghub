export interface Integration {
  id: string;
  name: string;
  description: string;
  status: 'Connected' | 'Disconnected' | 'Error';
  config?: Record<string, any>;
}

export const integrations: Integration[] = [
  {
    id: 'powerbi',
    name: 'Power BI',
    description: 'Connect to Power BI workspaces and datasets',
    status: 'Connected',
    config: {
      tenantId: 'contoso.onmicrosoft.com',
      workspaceId: 'workspace-123',
    },
  },
  {
    id: 'smtp',
    name: 'SMTP',
    description: 'Configure email notifications and alerts',
    status: 'Connected',
    config: {
      host: 'smtp.example.com',
      port: 587,
      from: 'noreply@reportinghub.com',
    },
  },
  {
    id: 'webhooks',
    name: 'Webhooks',
    description: 'Set up webhook endpoints for event notifications',
    status: 'Disconnected',
  },
  {
    id: 'snowflake',
    name: 'Snowflake',
    description: 'Connect to Snowflake data warehouse',
    status: 'Disconnected',
  },
];

