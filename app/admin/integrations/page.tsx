'use client';

import { useEffect } from 'react';

// Legacy route redirect → New: /admin/integrations-system
export default function IntegrationsPage() {
  useEffect(() => {
    window.location.href = '/admin/integrations-system';
  }, []);
  return null;
}
