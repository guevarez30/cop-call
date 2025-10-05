'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
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

export default function AcceptInvitePage() {
  const router = useRouter();
  const params = useParams();
  const token = params.token as string;

  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [invitationData, setInvitationData] = useState<any>(null);
  const [sessionReady, setSessionReady] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    password: '',
    confirmPassword: '',
  });

  // Establish auth session and verify invitation on mount
  useEffect(() => {
    const setupSessionAndVerify = async () => {
      try {
        const supabase = createClient();

        // First, check if there's a hash fragment with auth tokens
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');

        // If we have tokens in the hash, set up the session
        if (accessToken && refreshToken) {
          console.log('Setting session from hash tokens');
          const { data, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (sessionError) {
            console.error('Session setup error:', sessionError);
            setError(
              'Failed to establish session. Please use the link from your invitation email.'
            );
            setVerifying(false);
            return;
          }

          console.log('Session established:', data.session?.user?.email);
          setSessionReady(true);
        } else {
          // Check if we already have a session
          const {
            data: { session },
            error: sessionError,
          } = await supabase.auth.getSession();

          if (sessionError || !session) {
            setError('No valid session found. Please use the link from your invitation email.');
            setVerifying(false);
            return;
          }

          console.log('Existing session found:', session.user.email);
          setSessionReady(true);
        }

        // Now verify the invitation
        const response = await fetch(`/api/invitations/accept/${token}`);
        const data = await response.json();

        if (!response.ok) {
          setError(data.error || 'Invalid invitation');
          setVerifying(false);
          return;
        }

        setInvitationData(data.invitation);
        setVerifying(false);
      } catch (err: any) {
        console.error('Setup error:', err);
        setError('Failed to verify invitation');
        setVerifying(false);
      }
    };

    if (token) {
      setupSessionAndVerify();
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validate full name
    if (!formData.fullName.trim()) {
      setError('Full name is required');
      setLoading(false);
      return;
    }

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    // Validate password length
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      const supabase = createClient();

      // Verify we still have a session before updating
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        setError('Session expired. Please use the invitation link again.');
        setLoading(false);
        return;
      }

      // First, set the password
      const { error: passwordError } = await supabase.auth.updateUser({
        password: formData.password,
      });

      if (passwordError) {
        console.error('Password update error:', passwordError);
        throw passwordError;
      }

      // Then, create the user profile
      const response = await fetch(`/api/invitations/accept/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName: formData.fullName.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to accept invitation');
      }

      // Redirect to app
      router.push('/app');
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  if (verifying) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-background">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Verifying invitation...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error && !invitationData) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-background">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Invalid Invitation</CardTitle>
            <CardDescription className="text-base">
              This invitation is no longer valid
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className="bg-destructive/10 border border-destructive/50 text-destructive px-4 py-3 rounded-lg text-sm"
              role="alert"
            >
              {error}
            </div>
          </CardContent>
          <CardFooter>
            <Link href="/login" className="w-full">
              <Button className="w-full h-11">Go to login</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Complete Your Invitation</CardTitle>
          <CardDescription className="text-base">
            Join {invitationData?.organization?.name || 'the organization'}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
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
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Enter your full name"
                required
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                disabled={loading}
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
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

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                required
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                disabled={loading}
                className="h-11"
              />
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full h-11" disabled={loading}>
              {loading ? 'Completing...' : 'Complete Invitation'}
            </Button>

            <p className="text-sm text-center text-muted-foreground">
              Already have an account?{' '}
              <Link
                href="/login"
                className="text-foreground hover:underline font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
              >
                Login
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
