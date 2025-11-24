'use client';

import { useEffect } from 'react';

// Legacy route redirect → New: /admin/integrations-system/auth
export default function AuthSecurityPage() {
  useEffect(() => {
    window.location.href = '/admin/integrations-system/auth';
  }, []);
  return null;
}
