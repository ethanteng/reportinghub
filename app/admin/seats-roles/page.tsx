'use client';

import { useEffect } from 'react';

// Legacy route redirect → New: /admin/users-access
export default function SeatsRolesPage() {
  useEffect(() => {
    window.location.href = '/admin/users-access';
  }, []);
  return null;
}
