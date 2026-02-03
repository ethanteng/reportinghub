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
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Upload } from 'lucide-react';
import { toast } from 'sonner';

interface UploadCustomKeysDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpload: (publicKey: string, privateKey: string) => void;
}

export function UploadCustomKeysDialog({
  open,
  onOpenChange,
  onUpload,
}: UploadCustomKeysDialogProps) {
  const [publicKey, setPublicKey] = useState('');
  const [privateKey, setPrivateKey] = useState('');

  const handleUpload = () => {
    if (!publicKey.trim()) {
      toast.error('Please provide a public key');
      return;
    }
    if (!privateKey.trim()) {
      toast.error('Please provide a private key');
      return;
    }

    // Validate basic key format
    if (!publicKey.includes('BEGIN PUBLIC KEY') || !publicKey.includes('END PUBLIC KEY')) {
      toast.error('Invalid public key format. Expected PEM format.');
      return;
    }

    if (!privateKey.includes('BEGIN PRIVATE KEY') && !privateKey.includes('BEGIN RSA PRIVATE KEY')) {
      toast.error('Invalid private key format. Expected PEM format.');
      return;
    }

    onUpload(publicKey.trim(), privateKey.trim());
    toast.success('Custom keys uploaded successfully');
    
    // Reset form
    setPublicKey('');
    setPrivateKey('');
    onOpenChange(false);
  };

  const handleClose = () => {
    setPublicKey('');
    setPrivateKey('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Upload Custom RSA Keys</DialogTitle>
          <DialogDescription>
            Upload your own RSA key pair for token signing and verification. The keys must be in PEM format.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Alert className="border-orange-200 bg-orange-50">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              <strong>Warning:</strong> Uploading custom keys will replace the auto-generated keys. 
              Make sure you have securely stored the previous keys if you need to rollback.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="public-key">Public Key (PEM format)</Label>
            <Textarea
              id="public-key"
              placeholder="-----BEGIN PUBLIC KEY-----&#10;...&#10;-----END PUBLIC KEY-----"
              value={publicKey}
              onChange={(e) => setPublicKey(e.target.value)}
              className="font-mono text-xs"
              rows={6}
            />
            <p className="text-sm text-muted-foreground">
              Paste your RSA public key in PEM format
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="private-key">Private Key (PEM format)</Label>
            <Textarea
              id="private-key"
              placeholder="-----BEGIN PRIVATE KEY-----&#10;...&#10;-----END PRIVATE KEY-----"
              value={privateKey}
              onChange={(e) => setPrivateKey(e.target.value)}
              className="font-mono text-xs"
              rows={6}
            />
            <p className="text-sm text-muted-foreground">
              Paste your RSA private key in PEM format. This will be securely stored.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleUpload}>
            <Upload className="mr-2 h-4 w-4" />
            Upload Keys
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
