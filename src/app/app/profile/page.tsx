"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Mail, Calendar, Building2, Shield, Loader2, Bell, Lock, Globe, Moon, Sun, Pencil, Check, X } from "lucide-react";
import { useUserProfile } from "@/lib/user-profile-context";
import { useTheme } from "@/lib/theme-context";
import { PasswordChangeDialog } from "./components/password-change-dialog";

export default function ProfilePage() {
  const { profile, loading, error, refreshProfile, updateProfile } = useUserProfile();
  const { theme, setTheme } = useTheme();
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [isSavingName, setIsSavingName] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);

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
    setEditedName(profile?.full_name || "");
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
    setEditedName("");
  };

  // Get user initials for avatar
  const getInitials = (name: string | null) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(n => n[0])
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
              <p className="text-lg text-muted-foreground">
                {error || 'Profile not found'}
              </p>
              <Button onClick={refreshProfile} className="mt-4">
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
        <h1 className="text-3xl font-bold">Profile</h1>
      </div>

      {/* Profile Header Card */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src="/avatar-placeholder.png" alt={profile.full_name || 'User'} />
              <AvatarFallback className="text-2xl">
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
                    className="text-2xl font-bold h-auto py-1"
                    disabled={isSavingName}
                    autoFocus
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={handleSaveName}
                    disabled={isSavingName || !editedName.trim()}
                    className="h-8 w-8 shrink-0"
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={handleCancelEdit}
                    disabled={isSavingName}
                    className="h-8 w-8 shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <CardTitle className="text-2xl">
                    {profile.full_name || 'No name set'}
                  </CardTitle>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={handleEditName}
                    className="h-6 w-6 shrink-0 opacity-60 hover:opacity-100"
                  >
                    <Pencil className="h-3 w-3" />
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
          <CardTitle>Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Mail className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Email</p>
              <p className="text-base">{profile.email}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Details */}
      <Card>
        <CardHeader>
          <CardTitle>Account Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Building2 className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Organization</p>
              <p className="text-base">{profile.organizations.name}</p>
            </div>
          </div>
          <Separator />
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Member Since</p>
              <p className="text-base">{formatDate(profile.created_at)}</p>
            </div>
          </div>
          <Separator />
          <div className="flex items-center gap-3">
            <div className="h-5 w-5 flex items-center justify-center">
              <div className="h-3 w-3 rounded-full bg-primary" />
            </div>
            <div>
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
            <CardTitle>Security</CardTitle>
          </div>
          <CardDescription>
            Manage your account security settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Password</p>
              <p className="text-sm text-muted-foreground">Change your account password</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => setShowPasswordDialog(true)}>
              Change
            </Button>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Two-Factor Authentication</p>
              <p className="text-sm text-muted-foreground">Not enabled</p>
            </div>
            <Button variant="outline" size="sm">Enable</Button>
          </div>
        </CardContent>
      </Card>

      {/* Preferences */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            <CardTitle>Preferences</CardTitle>
          </div>
          <CardDescription>
            Customize your experience
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {theme === "dark" ? (
                <Moon className="h-5 w-5 text-muted-foreground" />
              ) : (
                <Sun className="h-5 w-5 text-muted-foreground" />
              )}
              <div>
                <p className="font-medium">Theme</p>
                <p className="text-sm text-muted-foreground">
                  {theme === "dark" ? "Dark mode" : "Light mode"}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={theme === "light" ? "default" : "outline"}
                size="sm"
                onClick={() => handleThemeChange("light")}
                className="w-24"
              >
                <Sun className="h-4 w-4 mr-1" />
                Light
              </Button>
              <Button
                variant={theme === "dark" ? "default" : "outline"}
                size="sm"
                onClick={() => handleThemeChange("dark")}
                className="w-24"
              >
                <Moon className="h-4 w-4 mr-1" />
                Dark
              </Button>
            </div>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Email Notifications</p>
                <p className="text-sm text-muted-foreground">Receive updates via email</p>
              </div>
            </div>
            <Button variant="outline" size="sm">Configure</Button>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>
            Irreversible actions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Delete Account</p>
              <p className="text-sm text-muted-foreground">Permanently delete your account and all data</p>
            </div>
            <Button variant="destructive" size="sm">Delete</Button>
          </div>
        </CardContent>
      </Card>

      {/* Password Change Dialog */}
      <PasswordChangeDialog
        open={showPasswordDialog}
        onOpenChange={setShowPasswordDialog}
      />
    </div>
  );
}
