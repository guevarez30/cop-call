'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
  Mail,
  Calendar,
  Building2,
  Shield,
  Loader2,
  Bell,
  Lock,
  Globe,
  Moon,
  Sun,
  Pencil,
  Check,
  X,
  BadgeCheck,
} from 'lucide-react';
import { useUserProfile } from '@/lib/user-profile-context';
import { useTheme } from '@/lib/theme-context';
import { PasswordChangeDialog } from './components/password-change-dialog';
import { MfaSetupDialog } from './components/mfa-setup-dialog';
import { MfaDisableDialog } from './components/mfa-disable-dialog';
import { createClient } from '@/lib/supabase/client';

export default function ProfilePage() {
  const { profile, loading, error, refreshProfile, updateProfile } = useUserProfile();
  const { theme, setTheme } = useTheme();
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [isSavingName, setIsSavingName] = useState(false);
  const [isEditingBadgeNo, setIsEditingBadgeNo] = useState(false);
  const [editedBadgeNo, setEditedBadgeNo] = useState('');
  const [isSavingBadgeNo, setIsSavingBadgeNo] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);

  // MFA state
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [mfaFactorId, setMfaFactorId] = useState<string | null>(null);
  const [checkingMfa, setCheckingMfa] = useState(true);
  const [showMfaSetupDialog, setShowMfaSetupDialog] = useState(false);
  const [showMfaDisableDialog, setShowMfaDisableDialog] = useState(false);

  // Check MFA status on mount
  useEffect(() => {
    const checkMfaStatus = async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase.auth.mfa.listFactors();

        if (error) {
          console.error('Error checking MFA status:', error);
          return;
        }

        // Check if user has any verified TOTP factors
        const totpFactors = data?.totp || [];
        const verifiedFactor = totpFactors.find((f) => f.status === 'verified');

        if (verifiedFactor) {
          setMfaEnabled(true);
          setMfaFactorId(verifiedFactor.id);
        } else {
          setMfaEnabled(false);
          setMfaFactorId(null);
        }
      } catch (err) {
        console.error('Error checking MFA status:', err);
      } finally {
        setCheckingMfa(false);
      }
    };

    checkMfaStatus();
  }, []);

  // Handle theme change
  const handleThemeChange = async (newTheme: 'light' | 'dark') => {
    try {
      // Update UI immediately
      setTheme(newTheme);
      // Persist to database
      await updateProfile({ theme: newTheme });
    } catch (error) {
      console.error('Failed to save theme preference:', error);
      // Revert UI on error
      setTheme(profile?.theme || 'light');
    }
  };

  // Handle name edit
  const handleEditName = () => {
    setEditedName(profile?.full_name || '');
    setIsEditingName(true);
  };

  const handleSaveName = async () => {
    if (!editedName.trim()) return;

    try {
      setIsSavingName(true);
      await updateProfile({ full_name: editedName.trim() });
      setIsEditingName(false);
    } catch (error) {
      console.error('Failed to save name:', error);
    } finally {
      setIsSavingName(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditingName(false);
    setEditedName('');
  };

  // Handle badge number edit
  const handleEditBadgeNo = () => {
    setEditedBadgeNo(profile?.badge_no || '');
    setIsEditingBadgeNo(true);
  };

  const handleSaveBadgeNo = async () => {
    try {
      setIsSavingBadgeNo(true);
      await updateProfile({ badge_no: editedBadgeNo.trim() || null });
      setIsEditingBadgeNo(false);
    } catch (error) {
      console.error('Failed to save badge number:', error);
    } finally {
      setIsSavingBadgeNo(false);
    }
  };

  const handleCancelBadgeEdit = () => {
    setIsEditingBadgeNo(false);
    setEditedBadgeNo('');
  };

  // Refresh MFA status
  const refreshMfaStatus = async () => {
    try {
      setCheckingMfa(true);
      const supabase = createClient();
      const { data, error } = await supabase.auth.mfa.listFactors();

      if (error) {
        console.error('Error checking MFA status:', error);
        return;
      }

      const totpFactors = data?.totp || [];
      const verifiedFactor = totpFactors.find((f) => f.status === 'verified');

      if (verifiedFactor) {
        setMfaEnabled(true);
        setMfaFactorId(verifiedFactor.id);
      } else {
        setMfaEnabled(false);
        setMfaFactorId(null);
      }
    } catch (err) {
      console.error('Error refreshing MFA status:', err);
    } finally {
      setCheckingMfa(false);
    }
  };

  // Get user initials for avatar
  const getInitials = (name: string | null) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  // Loading state
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  // Error state
  if (error || !profile) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <p className="text-lg text-muted-foreground">{error || 'Profile not found'}</p>
              <Button onClick={refreshProfile} className="mt-4 cursor-pointer">
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
      </div>

      {/* Profile Header Card */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <Avatar className="h-16 w-16 sm:h-20 sm:w-20">
              <AvatarImage src="/avatar-placeholder.png" alt={profile.full_name || 'User'} />
              <AvatarFallback className="text-xl sm:text-2xl">
                {getInitials(profile.full_name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              {isEditingName ? (
                <div className="flex items-center gap-2">
                  <Input
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    placeholder="Enter your name"
                    className="text-lg sm:text-2xl font-bold h-11"
                    disabled={isSavingName}
                    autoFocus
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={handleSaveName}
                    disabled={isSavingName || !editedName.trim()}
                    className="h-11 w-11 shrink-0 transition-colors"
                    aria-label="Save name"
                  >
                    <Check className="h-5 w-5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={handleCancelEdit}
                    disabled={isSavingName}
                    className="h-11 w-11 shrink-0 transition-colors"
                    aria-label="Cancel editing"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <CardTitle className="text-xl sm:text-2xl">
                    {profile.full_name || 'No name set'}
                  </CardTitle>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={handleEditName}
                    className="h-11 w-11 shrink-0 opacity-60 hover:opacity-100 transition-opacity"
                    aria-label="Edit name"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </div>
              )}
              <CardDescription className="text-base mt-1 flex items-center gap-2">
                <Shield className="h-4 w-4" />
                {profile.role === 'admin' ? 'Administrator' : 'User'}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-4">
            <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-muted-foreground">Email</p>
              <p className="text-base break-words">{profile.email}</p>
            </div>
          </div>
          <Separator />
          <div className="flex items-start gap-4">
            <BadgeCheck className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-muted-foreground">Badge Number</p>
              {isEditingBadgeNo ? (
                <div className="flex items-center gap-2 mt-1">
                  <Input
                    value={editedBadgeNo}
                    onChange={(e) => setEditedBadgeNo(e.target.value)}
                    placeholder="Enter badge number"
                    className="text-base h-10"
                    disabled={isSavingBadgeNo}
                    autoFocus
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={handleSaveBadgeNo}
                    disabled={isSavingBadgeNo}
                    className="h-10 w-10 shrink-0 transition-colors"
                    aria-label="Save badge number"
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={handleCancelBadgeEdit}
                    disabled={isSavingBadgeNo}
                    className="h-10 w-10 shrink-0 transition-colors"
                    aria-label="Cancel editing"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-base break-words">
                    {profile.badge_no || 'Not set'}
                  </p>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={handleEditBadgeNo}
                    className="h-10 w-10 shrink-0 opacity-60 hover:opacity-100 transition-opacity"
                    aria-label="Edit badge number"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Account Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-4">
            <Building2 className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-muted-foreground">Organization</p>
              <p className="text-base break-words">{profile.organizations.name}</p>
            </div>
          </div>
          <Separator />
          <div className="flex items-start gap-4">
            <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-muted-foreground">Member Since</p>
              <p className="text-base">{formatDate(profile.created_at)}</p>
            </div>
          </div>
          <Separator />
          <div className="flex items-start gap-4">
            <div className="h-5 w-5 flex items-center justify-center mt-0.5">
              <div className="h-3 w-3 rounded-full bg-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-muted-foreground">Status</p>
              <p className="text-base">Active</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            <CardTitle className="text-xl">Security</CardTitle>
          </div>
          <CardDescription className="text-base">
            Manage your account security settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="font-medium">Password</p>
              <p className="text-sm text-muted-foreground">Change your account password</p>
            </div>
            <Button
              variant="outline"
              size="default"
              onClick={() => setShowPasswordDialog(true)}
              className="h-11 w-full sm:w-auto shrink-0"
            >
              Change
            </Button>
          </div>
          <Separator />
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="font-medium">Two-Factor Authentication</p>
              <p className="text-sm text-muted-foreground">
                {checkingMfa ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Checking...
                  </span>
                ) : mfaEnabled ? (
                  <span className="text-green-600 dark:text-green-500">Enabled</span>
                ) : (
                  'Not enabled'
                )}
              </p>
            </div>
            {mfaEnabled ? (
              <Button
                variant="outline"
                size="default"
                className="h-11 w-full sm:w-auto shrink-0"
                onClick={() => setShowMfaDisableDialog(true)}
                disabled={checkingMfa}
              >
                Disable
              </Button>
            ) : (
              <Button
                variant="outline"
                size="default"
                className="h-11 w-full sm:w-auto shrink-0"
                onClick={() => setShowMfaSetupDialog(true)}
                disabled={checkingMfa}
              >
                Enable
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Preferences */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            <CardTitle className="text-xl">Preferences</CardTitle>
          </div>
          <CardDescription className="text-base">Customize your experience</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-4">
            <div className="flex items-start gap-4">
              {theme === 'dark' ? (
                <Moon className="h-5 w-5 text-muted-foreground mt-0.5" />
              ) : (
                <Sun className="h-5 w-5 text-muted-foreground mt-0.5" />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium">Theme</p>
                <p className="text-sm text-muted-foreground">
                  {theme === 'dark' ? 'Dark mode' : 'Light mode'}
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                variant={theme === 'light' ? 'default' : 'outline'}
                size="default"
                onClick={() => handleThemeChange('light')}
                className="h-11 flex-1 transition-all"
              >
                <Sun className="h-4 w-4 mr-2" />
                Light
              </Button>
              <Button
                variant={theme === 'dark' ? 'default' : 'outline'}
                size="default"
                onClick={() => handleThemeChange('dark')}
                className="h-11 flex-1 transition-all"
              >
                <Moon className="h-4 w-4 mr-2" />
                Dark
              </Button>
            </div>
          </div>
          <Separator />
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4 flex-1 min-w-0">
              <Bell className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="font-medium">Email Notifications</p>
                <p className="text-sm text-muted-foreground">Receive updates via email</p>
              </div>
            </div>
            <Button variant="outline" size="default" className="h-11 w-full sm:w-auto shrink-0">
              Configure
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-xl text-destructive">Danger Zone</CardTitle>
          <CardDescription className="text-base">Irreversible actions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="font-medium">Delete Account</p>
              <p className="text-sm text-muted-foreground">
                Permanently delete your account and all data
              </p>
            </div>
            <Button variant="destructive" size="default" className="h-11 w-full sm:w-auto shrink-0">
              Delete
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Password Change Dialog */}
      <PasswordChangeDialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog} />

      {/* MFA Setup Dialog */}
      <MfaSetupDialog
        open={showMfaSetupDialog}
        onOpenChange={setShowMfaSetupDialog}
        onSuccess={refreshMfaStatus}
      />

      {/* MFA Disable Dialog */}
      <MfaDisableDialog
        open={showMfaDisableDialog}
        onOpenChange={setShowMfaDisableDialog}
        onSuccess={refreshMfaStatus}
        factorId={mfaFactorId}
      />
    </div>
  );
}
