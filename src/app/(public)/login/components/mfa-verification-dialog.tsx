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
import { Loader2, AlertCircle, Shield } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface MfaVerificationDialogProps {
  open: boolean;
  factorId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function MfaVerificationDialog({
  open,
  factorId,
  onSuccess,
  onCancel,
}: MfaVerificationDialogProps) {
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleVerify = async () => {
    if (verificationCode.length !== 6) {
      setError('Please enter a 6-digit code');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const supabase = createClient();

      // Create a challenge
      const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId,
      });

      if (challengeError) throw challengeError;
      if (!challengeData) throw new Error('No challenge data returned');

      // Verify the code
      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challengeData.id,
        code: verificationCode,
      });

      if (verifyError) {
        if (verifyError.message.includes('Invalid') || verifyError.message.includes('incorrect')) {
          throw new Error('Invalid verification code. Please try again.');
        }
        throw verifyError;
      }

      // Success! Call the onSuccess callback
      onSuccess();
    } catch (err: unknown) {
      console.error('MFA verification error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to verify code';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && verificationCode.length === 6 && !isLoading) {
      handleVerify();
    }
  };

  return (
    <Dialog open={open} onOpenChange={(newOpen) => !newOpen && onCancel()}>
      <DialogContent className="sm:max-w-[450px]" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Two-Factor Authentication
          </DialogTitle>
          <DialogDescription>
            Enter the 6-digit code from your authenticator app to continue
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="mfa-code">Authentication Code</Label>
            <Input
              id="mfa-code"
              placeholder="000000"
              value={verificationCode}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                setVerificationCode(value);
              }}
              onKeyDown={handleKeyDown}
              maxLength={6}
              className="text-center text-2xl tracking-widest font-mono"
              disabled={isLoading}
              autoFocus
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleVerify} disabled={isLoading || verificationCode.length !== 6}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Verify
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
