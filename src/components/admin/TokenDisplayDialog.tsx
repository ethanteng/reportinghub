'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Copy, Check, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface TokenDisplayDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  token: string;
  keyName: string;
}

export function TokenDisplayDialog({
  open,
  onOpenChange,
  token,
  keyName,
}: TokenDisplayDialogProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(token);
    setCopied(true);
    toast.success('Token copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>API Key Created Successfully</DialogTitle>
          <DialogDescription>
            Your API key &quot;{keyName}&quot; has been created. Copy it now - you won&apos;t be able to see it again.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Alert className="border-orange-200 bg-orange-50">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              This token will only be shown once. Make sure to copy it to a secure location.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="token-input" className="text-sm font-medium">
              API Key Token
            </Label>
            <div className="flex gap-2">
              <Input
                id="token-input"
                value={token}
                readOnly
                className="font-mono text-sm"
                onClick={(e) => (e.target as HTMLInputElement).select()}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleCopy}
                className="shrink-0"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <div className="rounded-md bg-muted p-4">
            <p className="text-sm text-muted-foreground">
              <strong>Usage:</strong> Include this token in the Authorization header of your API requests:
            </p>
            <code className="mt-2 block text-xs bg-background p-2 rounded border">
              Authorization: Bearer {token.substring(0, 20)}...
            </code>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Done</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
