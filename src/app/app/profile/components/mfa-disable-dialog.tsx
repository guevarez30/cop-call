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
import { Loader2, AlertCircle, ShieldAlert } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

interface MfaDisableDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  factorId: string | null;
}

export function MfaDisableDialog({ open, onOpenChange, onSuccess, factorId }: MfaDisableDialogProps) {
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset state when dialog opens/closes
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setVerificationCode('');
      setError(null);
    }
    onOpenChange(newOpen);
  };

  // Verify code and disable MFA
  const handleDisableMfa = async () => {
    if (!factorId) {
      setError('No MFA factor found');
      return;
    }

    if (verificationCode.length !== 6) {
      setError('Please enter a 6-digit code');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const supabase = createClient();

      // First verify the code to ensure user has access to their authenticator
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

      // Now unenroll the factor
      const { error: unenrollError } = await supabase.auth.mfa.unenroll({
        factorId,
      });

      if (unenrollError) throw unenrollError;

      // Success!
      toast.success('Two-factor authentication disabled');
      onSuccess();
      handleOpenChange(false);
    } catch (err: unknown) {
      console.error('Disable MFA error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to disable MFA';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-destructive" />
            Disable Two-Factor Authentication
          </DialogTitle>
          <DialogDescription>
            This will reduce your account security. Enter your current 6-digit code to confirm.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Your account will be less secure without two-factor authentication enabled.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="disable-verification-code">
              Enter 6-digit code from your authenticator app
            </Label>
            <Input
              id="disable-verification-code"
              placeholder="000000"
              value={verificationCode}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                setVerificationCode(value);
              }}
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
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDisableMfa}
            disabled={isLoading || verificationCode.length !== 6}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Disable MFA
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
