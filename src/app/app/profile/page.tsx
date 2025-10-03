"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Mail, Calendar, Building2, Shield, Loader2 } from "lucide-react";
import { useUserProfile } from "@/lib/user-profile-context";

export default function ProfilePage() {
  const { profile, loading, error, refreshProfile } = useUserProfile();

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
              <CardTitle className="text-2xl">
                {profile.full_name || 'No name set'}
              </CardTitle>
              <CardDescription className="text-base mt-1 flex items-center gap-2">
                <Shield className="h-4 w-4" />
                {profile.role === 'admin' ? 'Administrator' : 'User'}
              </CardDescription>
            </div>
            <Button variant="outline">Edit Profile</Button>
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
    </div>
  );
}
