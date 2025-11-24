'use client';

import { useEffect } from 'react';

// Legacy route redirect → New: /admin/subscription-billing
export default function BillingPage() {
  useEffect(() => {
    window.location.href = '/admin/subscription-billing';
  }, []);
  return null;
}
