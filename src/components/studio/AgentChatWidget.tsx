'use client';

import { useState } from 'react';
import { X, Send, Minimize2, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { AgentConfig } from '../../../lib/types';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AgentChatWidgetProps {
  agent: AgentConfig;
  onClose: () => void;
}

export function AgentChatWidget({ agent, onClose }: AgentChatWidgetProps) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: `Hello! I'm ${agent.name}. How can I help you today?`,
      timestamp: new Date(),
    },
  ]);

  const handleSend = (content?: string) => {
    const messageContent = content || inputValue;
    if (!messageContent.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageContent,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `This is a mock response from ${agent.name}. In production, this would connect to your AI agent API.`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    }, 1000);
  };

  const handlePromptClick = (prompt: string) => {
    handleSend(prompt);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div
      className={cn(
        'fixed bottom-4 right-4 bg-background border rounded-lg shadow-2xl flex flex-col transition-all duration-300 ease-in-out',
        isMinimized ? 'w-80 h-16' : 'w-96 h-[600px]',
        'animate-in slide-in-from-bottom-8 fade-in duration-300'
      )}
      style={{ zIndex: 9999 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-primary text-primary-foreground">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm">{agent.name}</h3>
            {agent.subheader && (
              <p className="text-xs opacity-90 truncate">{agent.subheader}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-primary-foreground hover:text-primary-foreground hover:bg-primary/20"
            onClick={() => setIsMinimized(!isMinimized)}
          >
            {isMinimized ? (
              <Maximize2 className="h-4 w-4" />
            ) : (
              <Minimize2 className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-primary-foreground hover:text-primary-foreground hover:bg-primary/20"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      {!isMinimized && (
        <>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  'flex',
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                <div
                  className={cn(
                    'max-w-[80%] rounded-lg p-3 text-sm',
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  )}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  <p
                    className={cn(
                      'text-xs mt-1',
                      message.role === 'user'
                        ? 'text-primary-foreground/70'
                        : 'text-muted-foreground'
                    )}
                    suppressHydrationWarning
                  >
                    {message.timestamp.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            ))}

            {/* Suggested Prompts - Show only when no conversation yet */}
            {messages.length === 1 && agent.suggestedPrompts && agent.suggestedPrompts.length > 0 && (
              <div className="px-4 pb-2">
                <p className="text-xs font-medium text-muted-foreground mb-2">
                  What can I help with?
                </p>
                <div className="space-y-2">
                  {agent.suggestedPrompts.map((prompt, index) => (
                    <button
                      key={index}
                      onClick={() => handlePromptClick(prompt)}
                      className="w-full text-left px-3 py-2 text-sm border rounded-lg hover:bg-muted transition-colors"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                placeholder="Type your message..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1"
              />
              <Button onClick={() => handleSend()} size="icon">
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              This is a test interface. Real responses would come from your AI agent.
            </p>
          </div>
        </>
      )}
    </div>
  );
}

