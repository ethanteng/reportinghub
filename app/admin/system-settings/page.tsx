'use client';

import { useEffect } from 'react';

// Legacy route redirect → New: /admin/integrations-system/app-settings
export default function SystemSettingsPage() {
  useEffect(() => {
    window.location.href = '/admin/integrations-system/app-settings';
  }, []);
  return null;
}
