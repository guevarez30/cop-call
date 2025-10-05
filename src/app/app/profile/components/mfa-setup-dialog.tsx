'use client';

import { useState } from 'react';
import Image from 'next/image';
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
import { Loader2, Check, AlertCircle, Smartphone, Copy } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

interface MfaSetupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function MfaSetupDialog({ open, onOpenChange, onSuccess }: MfaSetupDialogProps) {
  const [step, setStep] = useState<'enroll' | 'verify'>('enroll');
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [factorId, setFactorId] = useState<string | null>(null);
  const [challengeId, setChallengeId] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset state when dialog opens/closes
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset state when closing
      setStep('enroll');
      setQrCode(null);
      setSecret(null);
      setFactorId(null);
      setChallengeId(null);
      setVerificationCode('');
      setError(null);
    }
    onOpenChange(newOpen);
  };

  // Start enrollment process
  const handleStartEnrollment = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const supabase = createClient();

      // Enroll in TOTP
      const { data: enrollData, error: enrollError } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        friendlyName: 'Authenticator App',
      });

      if (enrollError) throw enrollError;
      if (!enrollData) throw new Error('No enrollment data returned');

      // Store the QR code, secret, and factor ID
      setQrCode(enrollData.totp.qr_code);
      setSecret(enrollData.totp.secret);
      setFactorId(enrollData.id);

      // Move to verification step
      setStep('verify');
    } catch (err: unknown) {
      console.error('Enrollment error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to start MFA enrollment';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Verify the code and complete enrollment
  const handleVerifyCode = async () => {
    if (!factorId) {
      setError('No factor ID found. Please restart the setup process.');
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

      // Success!
      toast.success('Two-factor authentication enabled successfully');
      onSuccess();
      handleOpenChange(false);
    } catch (err: unknown) {
      console.error('Verification error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to verify code';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Copy secret to clipboard
  const handleCopySecret = async () => {
    if (!secret) return;
    try {
      await navigator.clipboard.writeText(secret);
      toast.success('Secret copied to clipboard');
    } catch (err) {
      toast.error('Failed to copy secret');
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Enable Two-Factor Authentication</DialogTitle>
          <DialogDescription>
            Add an extra layer of security to your account with an authenticator app
          </DialogDescription>
        </DialogHeader>

        {step === 'enroll' ? (
          <div className="space-y-4 py-4">
            <Alert>
              <Smartphone className="h-4 w-4" />
              <AlertDescription>
                You&apos;ll need an authenticator app like Google Authenticator, Authy, or 1Password to
                scan the QR code.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <h4 className="font-medium">How it works:</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                <li>Click &quot;Continue&quot; to generate your QR code</li>
                <li>Scan the QR code with your authenticator app</li>
                <li>Enter the 6-digit code from your app to verify</li>
              </ol>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>
        ) : (
          <div className="space-y-4 py-4">
            {qrCode && (
              <div className="flex flex-col items-center gap-4">
                <div className="bg-white p-4 rounded-lg">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={qrCode} alt="QR Code for MFA setup" className="w-48 h-48" />
                </div>

                <div className="w-full space-y-2">
                  <Label className="text-sm font-medium">Or enter this code manually:</Label>
                  <div className="flex gap-2">
                    <Input value={secret || ''} readOnly className="font-mono text-sm" />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleCopySecret}
                      className="shrink-0"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="verification-code">Enter 6-digit code from your app</Label>
              <Input
                id="verification-code"
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
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          {step === 'enroll' ? (
            <Button onClick={handleStartEnrollment} disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Continue
            </Button>
          ) : (
            <Button onClick={handleVerifyCode} disabled={isLoading || verificationCode.length !== 6}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Verify & Enable
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
