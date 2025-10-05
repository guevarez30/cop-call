'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { MfaVerificationDialog } from './components/mfa-verification-dialog';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  // MFA state
  const [showMfaDialog, setShowMfaDialog] = useState(false);
  const [mfaFactorId, setMfaFactorId] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (signInError) throw signInError;
      if (!data.user || !data.session) throw new Error('Failed to sign in');

      // Store access token for later use
      setAccessToken(data.session.access_token);

      // Check if user has MFA enabled
      const { data: factorsData } = await supabase.auth.mfa.listFactors();
      const verifiedTotpFactor = factorsData?.totp?.find((f) => f.status === 'verified');

      if (verifiedTotpFactor) {
        // User has MFA enabled - check if they need to verify
        const { data: aalData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

        if (aalData?.currentLevel === 'aal1' && aalData?.nextLevel === 'aal2') {
          // User needs to verify MFA
          setMfaFactorId(verifiedTotpFactor.id);
          setShowMfaDialog(true);
          setLoading(false);
          return; // Don't redirect yet, wait for MFA verification
        }
      }

      // No MFA or already verified - proceed with profile check and redirect
      await checkProfileAndRedirect(data.session.access_token);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const checkProfileAndRedirect = async (token: string) => {
    try {
      // Check if user has a profile using authenticated API endpoint
      const response = await fetch('/api/auth/check-profile', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to verify profile');
      }

      const { hasProfile } = await response.json();

      // If no profile exists, redirect to onboarding
      if (!hasProfile) {
        router.push('/onboarding');
      } else {
        router.push('/app');
      }
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMfaSuccess = async () => {
    setShowMfaDialog(false);

    if (accessToken) {
      await checkProfileAndRedirect(accessToken);
    }
  };

  const handleMfaCancel = async () => {
    setShowMfaDialog(false);
    setMfaFactorId(null);
    setAccessToken(null);

    // Sign out the user since they cancelled MFA
    const supabase = createClient();
    await supabase.auth.signOut();

    setError('MFA verification cancelled');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
          <CardDescription className="text-base">Sign in to your account</CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            {error && (
              <div
                className="bg-destructive/10 border border-destructive/50 text-destructive px-4 py-3 rounded-lg text-sm"
                role="alert"
              >
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={loading}
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <Label htmlFor="password">Password</Label>
                <Link
                  href="/forgot-password"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm min-h-[44px] flex items-center"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                disabled={loading}
                className="h-11"
              />
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full h-11" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>

            <p className="text-sm text-center text-muted-foreground">
              Don't have an account?{' '}
              <Link
                href="/signup"
                className="text-foreground hover:underline font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
              >
                Create account
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>

      {/* MFA Verification Dialog */}
      {showMfaDialog && mfaFactorId && (
        <MfaVerificationDialog
          open={showMfaDialog}
          factorId={mfaFactorId}
          onSuccess={handleMfaSuccess}
          onCancel={handleMfaCancel}
        />
      )}
    </div>
  );
}
