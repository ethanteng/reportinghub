'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { StepRail } from '@/components/studio/StepRail';
import { InspectorPanel } from '@/components/studio/InspectorPanel';
import { Toaster } from '@/components/ui/sonner';
import { useBiGeniusStore } from '@/store/useBiGeniusStore';

export default function StudioLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { setSelectedEntity } = useBiGeniusStore();

  // Auto-close inspector when navigating away from Model & Instructions page
  useEffect(() => {
    if (pathname !== '/model') {
      setSelectedEntity(null);
    }
  }, [pathname, setSelectedEntity]);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Left: Step Navigation */}
      <StepRail />

      {/* Center: Main Content */}
      <main className="flex-1 overflow-y-auto">{children}</main>

      {/* Right: Inspector Panel */}
      <InspectorPanel />

      {/* Toast Notifications */}
      <Toaster />
    </div>
  );
}

