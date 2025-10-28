'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AgentCard } from '@/components/studio/AgentCard';
import { AgentChatWidget } from '@/components/studio/AgentChatWidget';
import { useBiGeniusStore } from '@/store/useBiGeniusStore';
import { Plus, Search } from 'lucide-react';
import { toast } from 'sonner';
import { AgentStatus } from '../../lib/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

export default function AgentsPage() {
  const router = useRouter();
  const {
    agentConfigs,
    updateAgentConfig,
    deleteAgentConfig,
    cloneAgentConfig,
    addAgentConfig,
    setCurrentAgentId,
  } = useBiGeniusStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [showRenameDialog, setShowRenameDialog] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [newSubheader, setNewSubheader] = useState('');
  const [newAgentName, setNewAgentName] = useState('');
  const [newAgentSubheader, setNewAgentSubheader] = useState('');
  const [testingAgentId, setTestingAgentId] = useState<string | null>(null);

  const selectedAgent = agentConfigs.find((a) => a.id === selectedAgentId);
  const testingAgent = agentConfigs.find((a) => a.id === testingAgentId);

  const filteredAgents = agentConfigs.filter((agent) => {
    if (searchQuery) {
      return agent.name.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  const handleConfigure = (agentId: string) => {
    setCurrentAgentId(agentId);
    router.push('/sources');
  };

  const handleRename = (agentId: string) => {
    const agent = agentConfigs.find((a) => a.id === agentId);
    if (agent) {
      setSelectedAgentId(agentId);
      setNewName(agent.name);
      setNewSubheader(agent.subheader || '');
      setShowRenameDialog(true);
    }
  };

  const handleRenameConfirm = () => {
    if (selectedAgentId && newName.trim()) {
      updateAgentConfig(selectedAgentId, { 
        name: newName.trim(),
        subheader: newSubheader.trim() || undefined,
      });
      toast.success('Agent updated successfully');
      setShowRenameDialog(false);
      setSelectedAgentId(null);
      setNewName('');
      setNewSubheader('');
    }
  };

  const handleClone = (agentId: string) => {
    const cloned = cloneAgentConfig(agentId);
    toast.success(`Created ${cloned.name}`);
  };

  const handleDelete = (agentId: string) => {
    deleteAgentConfig(agentId);
    toast.success('Agent deleted');
  };

  const handlePublish = (agentId: string) => {
    updateAgentConfig(agentId, {
      status: AgentStatus.Live,
      publishedAt: new Date().toISOString(),
    });
    toast.success('Agent published successfully!');
  };

  const handleTest = (agentId: string) => {
    setTestingAgentId(agentId);
  };

  const handleUpdatePrompts = (agentId: string, prompts: string[]) => {
    updateAgentConfig(agentId, { suggestedPrompts: prompts });
    toast.success('Suggested prompts updated');
  };

  const handleCreateNew = () => {
    setNewAgentName('');
    setNewAgentSubheader('');
    setShowCreateDialog(true);
  };

  const handleCreateConfirm = () => {
    if (!newAgentName.trim()) {
      toast.error('Please enter an agent name');
      return;
    }

    const newAgent = {
      id: `agent_${Date.now()}` as any,
      name: newAgentName.trim(),
      subheader: newAgentSubheader.trim() || undefined,
      modelId: '' as any, // Blank model ID - user needs to add data sources first
      versionTag: 'v1',
      status: AgentStatus.Draft,
      createdAt: new Date().toISOString(),
      instructionIds: [],
      sourceIds: [],
    };
    
    addAgentConfig(newAgent);
    toast.success(`Agent "${newAgentName}" created! Add data sources to begin.`);
    setShowCreateDialog(false);
    setNewAgentName('');
    setNewAgentSubheader('');
    
    // Navigate to sources page to start configuration
    router.push('/sources');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold">BI Genius Studio</h1>
              <p className="text-muted-foreground mt-1">
                Manage your AI agents
              </p>
            </div>
            <Button onClick={handleCreateNew} size="lg">
              <Plus className="h-4 w-4 mr-2" />
              Create New Agent
            </Button>
          </div>

          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search agents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
      </div>

      {/* Agent Grid */}
      <div className="container mx-auto px-6 py-8">
        {filteredAgents.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold mb-2">No agents found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery
                ? 'Try a different search term'
                : 'Create your first AI agent to get started'}
            </p>
            {!searchQuery && (
              <Button onClick={handleCreateNew}>
                <Plus className="h-4 w-4 mr-2" />
                Create New Agent
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
            {filteredAgents.map((agent) => (
              <AgentCard
                key={agent.id}
                agent={agent}
                onConfigure={handleConfigure}
                onRename={handleRename}
                onClone={handleClone}
                onDelete={handleDelete}
                onPublish={handlePublish}
                onTest={handleTest}
                onUpdatePrompts={handleUpdatePrompts}
              />
            ))}
          </div>
        )}
      </div>

      {/* Rename Dialog */}
      <Dialog open={showRenameDialog} onOpenChange={setShowRenameDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Agent</DialogTitle>
            <DialogDescription>
              Update the name and subheader for "{selectedAgent?.name}"
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    handleRenameConfirm();
                  }
                }}
                autoFocus
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="subheader">Subheader (optional)</Label>
              <Input
                id="subheader"
                placeholder="e.g., Your AI-powered assistant"
                value={newSubheader}
                onChange={(e) => setNewSubheader(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    handleRenameConfirm();
                  }
                }}
              />
              <p className="text-xs text-muted-foreground">
                This will appear below the agent name in the chat window
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRenameDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleRenameConfirm}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create New Agent Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New AI Agent</DialogTitle>
            <DialogDescription>
              Give your AI agent a name and subheader. You'll configure data sources and instructions next.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="newAgentName">Agent Name</Label>
              <Input
                id="newAgentName"
                placeholder="e.g., Sales Assistant, Support Bot"
                value={newAgentName}
                onChange={(e) => setNewAgentName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    handleCreateConfirm();
                  }
                }}
                autoFocus
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="newAgentSubheader">Subheader (optional)</Label>
              <Input
                id="newAgentSubheader"
                placeholder="e.g., Your AI-powered assistant"
                value={newAgentSubheader}
                onChange={(e) => setNewAgentSubheader(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    handleCreateConfirm();
                  }
                }}
              />
              <p className="text-xs text-muted-foreground">
                This will appear below the agent name in the chat window
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCreateDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateConfirm}>Create Agent</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Chat Widget */}
      {testingAgent && (
        <AgentChatWidget
          agent={testingAgent}
          onClose={() => setTestingAgentId(null)}
        />
      )}
    </div>
  );
}

