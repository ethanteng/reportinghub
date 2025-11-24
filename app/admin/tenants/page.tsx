'use client';

import { redirect } from 'next/navigation';
import { useEffect } from 'react';

// Legacy route redirect → New: /admin/tenants-workspaces
export default function TenantsPage() {
  useEffect(() => {
    window.location.href = '/admin/tenants-workspaces';
  }, []);
  return null;
}
