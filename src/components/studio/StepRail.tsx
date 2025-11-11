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
  Copy,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useBiGeniusStore } from '@/store/useBiGeniusStore';
import { toast } from 'sonner';
import { AgentStatus } from '../../../lib/types';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface Step {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
}

export function StepRail() {
  const pathname = usePathname();
  const {
    getCurrentAgent,
    agentConfigs,
    currentAgentId,
    setCurrentAgentId,
    cloneAgentConfig,
    updateAgentConfig,
  } = useBiGeniusStore();
  const currentAgent = getCurrentAgent();
  const currentModelId = currentAgent?.modelId;
  const relatedConfigs = currentModelId
    ? agentConfigs.filter((config) => config.modelId === currentModelId)
    : agentConfigs;
  const [renameConfigId, setRenameConfigId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');

  const handleDuplicate = (configId: string) => {
    const clone = cloneAgentConfig(configId as any);
    toast.success(`Created ${clone.name}`);
    setCurrentAgentId(clone.id);
  };

  const handleRenameOpen = (configId: string) => {
    const config = agentConfigs.find((entry) => entry.id === configId);
    if (!config) return;
    setRenameConfigId(configId);
    setRenameValue(config.name);
  };

  const handleRenameSave = () => {
    if (!renameConfigId) return;
    const trimmed = renameValue.trim();
    if (!trimmed) {
      toast.error('Name cannot be empty');
      return;
    }
    updateAgentConfig(renameConfigId as any, { name: trimmed });
    toast.success('Model name updated');
    setRenameConfigId(null);
  };

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
      label: 'Summary',
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

      {pathname === '/model' && relatedConfigs.length > 0 && (
        <div className="mt-6 space-y-1">
          <div className="px-2 text-[10px] font-semibold uppercase text-muted-foreground tracking-wider">
            Model Versions
          </div>
          <div className="flex flex-col gap-0.5 pr-1">
            {relatedConfigs.map((config) => {
              const isActiveConfig = config.id === currentAgentId;
              const isPrimary = config.status === AgentStatus.Live;
              return (
                <div
                  key={config.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => setCurrentAgentId(config.id)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      setCurrentAgentId(config.id);
                    }
                  }}
                  className={cn(
                    'mx-2 rounded-md px-2 py-2 text-left text-xs transition',
                    isActiveConfig ? 'bg-primary/10 text-foreground' : 'hover:bg-muted/40'
                  )}
                >
                  <div className="flex items-center gap-2">
                    <div className="flex-1 min-w-0 flex items-center gap-2">
                      <button
                        type="button"
                        className="truncate font-medium hover:underline"
                        onClick={(event) => {
                          event.stopPropagation();
                          handleRenameOpen(config.id);
                        }}
                      >
                        {config.name}
                      </button>
                      {isPrimary && (
                        <span className="flex-shrink-0 rounded-full bg-primary/10 px-1 py-0.5 text-[10px] text-primary">
                          Primary
                        </span>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="ml-auto h-6 w-6"
                      onClick={(event) => {
                        event.stopPropagation();
                        handleDuplicate(config.id);
                      }}
                      title="Duplicate configuration"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <Dialog open={renameConfigId !== null} onOpenChange={(open) => (!open ? setRenameConfigId(null) : null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Model Version</DialogTitle>
            <DialogDescription>Update the display name for this model configuration.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <Input
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              placeholder="Enter model name"
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameConfigId(null)}>
              Cancel
            </Button>
            <Button onClick={handleRenameSave}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </nav>
  );
}

