'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Database,
  Network,
  CheckCircle2,
  Rocket,
  LucideIcon,
  ChevronLeft,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useBiGeniusStore } from '@/store/useBiGeniusStore';

interface Step {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
}

export function StepRail() {
  const pathname = usePathname();
  const { getCurrentAgent } = useBiGeniusStore();
  const currentAgent = getCurrentAgent();

  const steps: Step[] = [
    {
      id: 'sources',
      label: 'Data Sources',
      href: '/sources',
      icon: Database,
    },
    {
      id: 'model',
      label: 'Model & Instructions',
      href: '/model',
      icon: Network,
    },
    {
      id: 'readiness',
      label: 'Readiness',
      href: '/readiness',
      icon: CheckCircle2,
    },
    {
      id: 'publish',
      label: 'Publish',
      href: '/publish',
      icon: Rocket,
    },
  ];

  return (
    <nav className="flex flex-col gap-1 p-4 bg-muted/30 border-r min-h-screen w-56">
      <Link href="/agents" className="mb-4">
        <Button variant="ghost" size="sm" className="w-full justify-start">
          <ChevronLeft className="h-4 w-4 mr-2" />
          All Agents
        </Button>
      </Link>

      <div className="mb-6 px-2">
        <h2 className="text-lg font-semibold truncate" title={currentAgent?.name || 'BI Genius Studio'}>
          {currentAgent?.name || 'BI Genius Studio'}
        </h2>
        <p className="text-xs text-muted-foreground mt-1">
          {currentAgent ? `Version ${currentAgent.versionTag.replace('v', '')}` : 'Agent Configuration'}
        </p>
      </div>

      {steps.map((step) => {
        const isActive = pathname === step.href;
        const Icon = step.icon;

        return (
          <Link
            key={step.id}
            href={step.href}
            className={cn(
              'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-muted text-muted-foreground hover:text-foreground'
            )}
          >
            <Icon className="h-4 w-4" />
            <span>{step.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

