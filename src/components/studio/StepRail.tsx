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
  Edit3,
  Check,
  X,
  Plus,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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
    addAgentConfig,
  } = useBiGeniusStore();
  const currentAgent = getCurrentAgent();
  const currentModelId = currentAgent?.modelId;
  // Get all versions for the current model (or all configs if no model selected)
  const availableVersions = currentModelId
    ? agentConfigs.filter((config) => config.modelId === currentModelId)
    : agentConfigs;
  const [renameVersionId, setRenameVersionId] = useState<string | null>(null);
  const [renameVersionValue, setRenameVersionValue] = useState('');
  const [isEditingAgentName, setIsEditingAgentName] = useState(false);
  const [agentNameValue, setAgentNameValue] = useState('');
  const [isVersionSelectOpen, setIsVersionSelectOpen] = useState(false);

  const handleDuplicate = (configId: string) => {
    const clone = cloneAgentConfig(configId as any);
    toast.success(`Created ${clone.name}`);
    setCurrentAgentId(clone.id);
  };

  const handleRenameVersionOpen = (configId: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    // Close dropdown first, then open dialog after a brief delay
    setIsVersionSelectOpen(false);
    setTimeout(() => {
      const config = agentConfigs.find((entry) => entry.id === configId);
      if (!config) return;
      setRenameVersionId(configId);
      setRenameVersionValue(config.versionTag);
    }, 100);
  };

  const handleRenameVersionSave = () => {
    if (!renameVersionId) return;
    const trimmed = renameVersionValue.trim();
    if (!trimmed) {
      toast.error('Version tag cannot be empty');
      return;
    }
    updateAgentConfig(renameVersionId as any, { versionTag: trimmed });
    toast.success('Version tag updated');
    setRenameVersionId(null);
  };

  const handleStartEditAgentName = () => {
    if (!currentAgent) return;
    setAgentNameValue(currentAgent.name);
    setIsEditingAgentName(true);
  };

  const handleSaveAgentName = () => {
    if (!currentAgent) return;
    const trimmed = agentNameValue.trim();
    if (!trimmed) {
      toast.error('Name cannot be empty');
      return;
    }
    updateAgentConfig(currentAgent.id, { name: trimmed });
    toast.success('Agent name updated');
    setIsEditingAgentName(false);
  };

  const handleCancelEditAgentName = () => {
    setIsEditingAgentName(false);
    setAgentNameValue('');
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

      <div className="mb-6 px-2 space-y-3">
        {isEditingAgentName && currentAgent ? (
          <div className="space-y-2">
            <Input
              value={agentNameValue}
              onChange={(e) => setAgentNameValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSaveAgentName();
                } else if (e.key === 'Escape') {
                  e.preventDefault();
                  handleCancelEditAgentName();
                }
              }}
              className="h-8 text-sm font-semibold"
              autoFocus
            />
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={handleSaveAgentName}
                title="Save"
              >
                <Check className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={handleCancelEditAgentName}
                title="Cancel"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 group">
            <h2 className="text-lg font-semibold truncate flex-1" title={currentAgent?.name || 'BI Genius Studio'}>
              {currentAgent?.name || 'BI Genius Studio'}
            </h2>
            {currentAgent && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={handleStartEditAgentName}
                title="Rename agent"
              >
                <Edit3 className="h-3 w-3" />
              </Button>
            )}
          </div>
        )}
        {currentAgent && availableVersions.length > 0 && (
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Version</label>
            <Select
              value={currentAgentId || ''}
              open={isVersionSelectOpen}
              onOpenChange={setIsVersionSelectOpen}
              onValueChange={(value) => {
                // Don't change selection if we're in the middle of renaming
                if (renameVersionId !== null) {
                  return;
                }
                setCurrentAgentId(value as any);
                toast.success(`Switched to ${availableVersions.find((v) => v.id === value)?.name || value}`);
                setIsVersionSelectOpen(false);
              }}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue>
                  {currentAgent ? (
                    <div className="flex items-center gap-2">
                      <span>{currentAgent.versionTag}</span>
                      <Badge
                        variant={currentAgent.status === AgentStatus.Live ? 'default' : 'secondary'}
                        className={cn(
                          "text-[10px] px-1.5 py-0 h-4",
                          currentAgent.status === AgentStatus.Live && "bg-green-600 text-white hover:bg-green-700 border-green-600"
                        )}
                      >
                        {currentAgent.status === AgentStatus.Live ? 'Live' : 'Draft'}
                      </Badge>
                    </div>
                  ) : (
                    'Select version'
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {availableVersions.map((config) => (
                  <SelectItem 
                    key={config.id} 
                    value={config.id} 
                    className="group pr-8"
                    onPointerDown={(e) => {
                      const target = e.target as HTMLElement;
                      if (target.closest('button[title="Rename version"]')) {
                        e.preventDefault();
                        e.stopPropagation();
                        return false;
                      }
                    }}
                  >
                    <div 
                      className="flex items-center gap-2 w-full min-w-0"
                      onPointerDown={(e) => {
                        const target = e.target as HTMLElement;
                        if (target.closest('button[title="Rename version"]')) {
                          e.stopPropagation();
                        }
                      }}
                    >
                      <span className="font-medium whitespace-nowrap">{config.versionTag}</span>
                      <Badge
                        variant={config.status === AgentStatus.Live ? 'default' : 'secondary'}
                        className={cn(
                          "text-[10px] px-1.5 py-0 h-4 flex-shrink-0 whitespace-nowrap",
                          config.status === AgentStatus.Live && "bg-green-600 text-white hover:bg-green-700 border-green-600"
                        )}
                      >
                        {config.status === AgentStatus.Live ? 'Live' : 'Draft'}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-auto"
                        title="Rename version"
                        type="button"
                        onPointerDown={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleRenameVersionOpen(config.id, e as any);
                        }}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 h-7 text-xs"
                onClick={() => {
                  if (currentAgent) {
                    const clone = cloneAgentConfig(currentAgent.id);
                    setCurrentAgentId(clone.id);
                    toast.success(`Created ${clone.name}`);
                  }
                }}
              >
                <Copy className="h-3 w-3 mr-1" />
                Duplicate
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 h-7 text-xs"
                onClick={() => {
                  if (currentAgent && currentModelId) {
                    // Create a new version from scratch
                    const versionNum = parseInt(currentAgent.versionTag.replace('v', ''), 10);
                    const newVersion = {
                      ...currentAgent,
                      id: `config_${Date.now()}` as any,
                      name: currentAgent.name,
                      versionTag: `v${versionNum + 1}`,
                      status: AgentStatus.Draft,
                      createdAt: new Date().toISOString(),
                      updatedAt: new Date().toISOString(),
                      publishedAt: undefined,
                      clonedFromId: undefined,
                      sourceIds: [],
                      instructionIds: [],
                      visibilityOverrides: undefined,
                      isVersionOnly: true,
                    };
                    
                    addAgentConfig(newVersion);
                    setCurrentAgentId(newVersion.id);
                    toast.success(`Created new version ${newVersion.versionTag}`);
                  }
                }}
              >
                <Plus className="h-3 w-3 mr-1" />
                New
              </Button>
            </div>
          </div>
        )}
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


      <Dialog open={renameVersionId !== null} onOpenChange={(open) => (!open ? setRenameVersionId(null) : null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Version</DialogTitle>
            <DialogDescription>Update the version tag for this configuration.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <Input
              value={renameVersionValue}
              onChange={(e) => setRenameVersionValue(e.target.value)}
              placeholder="Enter version tag"
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameVersionId(null)}>
              Cancel
            </Button>
            <Button onClick={handleRenameVersionSave}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </nav>
  );
}

