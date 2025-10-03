"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Users, UserPlus, Shield, Mail, MoreVertical, AlertCircle } from "lucide-react";
import { useState } from "react";

interface SettingsClientProps {
  isAdmin: boolean;
}

export default function SettingsClient({ isAdmin }: SettingsClientProps) {
  // If not admin, show unauthorized message
  if (!isAdmin) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium">Admin Access Required</p>
              <p className="text-sm text-muted-foreground mt-2">
                You need administrator privileges to access organization settings.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Organization Settings</h1>
      </div>

      {/* Team Members */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              <CardTitle>Team Members</CardTitle>
            </div>
            <Button size="sm">
              <UserPlus className="h-4 w-4 mr-2" />
              Invite User
            </Button>
          </div>
          <CardDescription>
            Manage users and their permissions in your organization
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Placeholder for user list - will be fetched from API */}
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="font-medium">No team members to display</p>
            <p className="text-sm mt-1">Invite users to get started</p>
          </div>
        </CardContent>
      </Card>

      {/* Pending Invitations */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            <CardTitle>Pending Invitations</CardTitle>
          </div>
          <CardDescription>
            Users who have been invited but haven't joined yet
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center py-8 text-muted-foreground">
            <Mail className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="font-medium">No pending invitations</p>
            <p className="text-sm mt-1">Invite users to collaborate with your team</p>
          </div>
        </CardContent>
      </Card>

      {/* Organization Details */}
      <Card>
        <CardHeader>
          <CardTitle>Organization Details</CardTitle>
          <CardDescription>
            Manage your organization's information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Organization Name</p>
              <p className="text-sm text-muted-foreground">Your organization's display name</p>
            </div>
            <Button variant="outline" size="sm">Edit</Button>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Plan</p>
              <p className="text-sm text-muted-foreground">Free Plan</p>
            </div>
            <Button variant="outline" size="sm">Upgrade</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
