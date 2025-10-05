'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Users,
  UserPlus,
  Shield,
  Mail,
  MoreVertical,
  AlertCircle,
  Trash2,
  Loader2,
  RefreshCw,
  Pencil,
  Check,
  X,
  ShieldCheck,
  UserCog,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import InviteUserDialog from './components/invite-user-dialog';
import { toast } from 'sonner';
import { useUserProfile } from '@/lib/user-profile-context';

interface SettingsClientProps {
  isAdmin: boolean;
}

interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'user';
  created_at: string;
}

interface Invitation {
  id: string;
  email: string;
  role: 'admin' | 'user';
  created_at: string;
  expires_at: string;
  invited_by: {
    full_name: string;
  };
}

export default function SettingsClient({ isAdmin }: SettingsClientProps) {
  const { profile, refreshProfile } = useUserProfile();
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingInvitations, setLoadingInvitations] = useState(true);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [resendingId, setResendingId] = useState<string | null>(null);
  const [isEditingOrgName, setIsEditingOrgName] = useState(false);
  const [editedOrgName, setEditedOrgName] = useState('');
  const [isSavingOrgName, setIsSavingOrgName] = useState(false);
  const [changingRoleId, setChangingRoleId] = useState<string | null>(null);

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

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) return;

      const response = await fetch('/api/users/list', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchInvitations = async () => {
    setLoadingInvitations(true);
    try {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) return;

      const response = await fetch('/api/invitations/list', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setInvitations(data.invitations || []);
      }
    } catch (error) {
      console.error('Error fetching invitations:', error);
    } finally {
      setLoadingInvitations(false);
    }
  };

  const handleRevokeInvitation = async (invitationId: string) => {
    setRevokingId(invitationId);
    try {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) return;

      const response = await fetch(`/api/invitations/${invitationId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (response.ok) {
        toast.success('Invitation revoked successfully');
        fetchInvitations();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to revoke invitation');
      }
    } catch (error) {
      console.error('Error revoking invitation:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setRevokingId(null);
    }
  };

  const handleResendInvitation = async (invitationId: string) => {
    setResendingId(invitationId);
    try {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) return;

      const response = await fetch(`/api/invitations/resend/${invitationId}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (response.ok) {
        toast.success('Invitation email resent successfully');
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to resend invitation');
      }
    } catch (error) {
      console.error('Error resending invitation:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setResendingId(null);
    }
  };

  const handleInviteSent = () => {
    // Refresh both lists when a new invitation is sent
    fetchInvitations();
  };

  // Handle organization name edit
  const handleEditOrgName = () => {
    setEditedOrgName(profile?.organizations?.name || '');
    setIsEditingOrgName(true);
  };

  const handleSaveOrgName = async () => {
    if (!editedOrgName.trim()) return;

    try {
      setIsSavingOrgName(true);
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        toast.error('Not authenticated');
        return;
      }

      const response = await fetch('/api/organizations', {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: editedOrgName.trim() }),
      });

      if (response.ok) {
        toast.success('Organization name updated successfully');
        setIsEditingOrgName(false);
        // Refresh profile to get updated organization name
        await refreshProfile();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to update organization name');
      }
    } catch (error) {
      console.error('Failed to save organization name:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsSavingOrgName(false);
    }
  };

  const handleCancelOrgEdit = () => {
    setIsEditingOrgName(false);
    setEditedOrgName('');
  };

  const handleChangeRole = async (userId: string, newRole: 'admin' | 'user') => {
    setChangingRoleId(userId);
    try {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        toast.error('Not authenticated');
        return;
      }

      const response = await fetch(`/api/users/${userId}/role`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (response.ok) {
        const actionText = newRole === 'admin' ? 'promoted to Admin' : 'demoted to User';
        toast.success(`User ${actionText} successfully`);
        fetchUsers();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to update user role');
      }
    } catch (error) {
      console.error('Error changing user role:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setChangingRoleId(null);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchUsers();
    fetchInvitations();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getDaysUntilExpiry = (expiresAt: string) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Organization Settings</h1>
      </div>

      {/* Team Members */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              <CardTitle className="text-xl">Team Members</CardTitle>
            </div>
            <Button
              size="default"
              className="h-11 w-full sm:w-auto"
              onClick={() => setInviteDialogOpen(true)}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Invite User
            </Button>
          </div>
          <CardDescription className="text-base">
            Manage users and their permissions in your organization
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loadingUsers ? (
            <div className="text-center py-12">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium text-base">No team members to display</p>
              <p className="text-sm mt-1">Invite users to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {users.map((user) => {
                const isCurrentUser = user.id === profile?.id;
                const adminCount = users.filter((u) => u.role === 'admin').length;
                const isLastAdmin = user.role === 'admin' && adminCount === 1;
                const canChangeRole = !isCurrentUser && !isLastAdmin;

                return (
                  <div
                    key={user.id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium break-words">{user.full_name}</p>
                        {user.role === 'admin' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary/10 text-primary text-xs font-medium shrink-0">
                            <Shield className="h-3 w-3" />
                            Admin
                          </span>
                        )}
                        {isCurrentUser && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-muted text-muted-foreground text-xs font-medium shrink-0">
                            You
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground break-words">{user.email}</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-sm text-muted-foreground hidden sm:block">
                        Joined {formatDate(user.created_at)}
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-11 w-11"
                            disabled={changingRoleId === user.id}
                          >
                            {changingRoleId === user.id ? (
                              <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                              <MoreVertical className="h-5 w-5" />
                            )}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {user.role === 'user' ? (
                            <DropdownMenuItem
                              onClick={() => handleChangeRole(user.id, 'admin')}
                              disabled={!canChangeRole || changingRoleId === user.id}
                            >
                              <ShieldCheck className="h-4 w-4 mr-2" />
                              Promote to Admin
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              onClick={() => handleChangeRole(user.id, 'user')}
                              disabled={!canChangeRole || changingRoleId === user.id}
                            >
                              <UserCog className="h-4 w-4 mr-2" />
                              {isLastAdmin ? 'Demote to User (Last Admin)' : 'Demote to User'}
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pending Invitations */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            <CardTitle className="text-xl">Pending Invitations</CardTitle>
          </div>
          <CardDescription className="text-base">
            Users who have been invited but haven't joined yet
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loadingInvitations ? (
            <div className="text-center py-12">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
            </div>
          ) : invitations.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Mail className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium text-base">No pending invitations</p>
              <p className="text-sm mt-1">Invite users to collaborate with your team</p>
            </div>
          ) : (
            <div className="space-y-3">
              {invitations.map((invitation) => {
                const daysLeft = getDaysUntilExpiry(invitation.expires_at);
                return (
                  <div
                    key={invitation.id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium break-words">{invitation.email}</p>
                        {invitation.role === 'admin' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary/10 text-primary text-xs font-medium shrink-0">
                            <Shield className="h-3 w-3" />
                            Admin
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Invited by {invitation.invited_by.full_name} · Expires in {daysLeft}{' '}
                        {daysLeft === 1 ? 'day' : 'days'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleResendInvitation(invitation.id)}
                        disabled={resendingId === invitation.id || revokingId === invitation.id}
                        title="Resend invitation email"
                        className="h-11 w-11"
                        aria-label="Resend invitation"
                      >
                        {resendingId === invitation.id ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          <RefreshCw className="h-5 w-5" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRevokeInvitation(invitation.id)}
                        disabled={revokingId === invitation.id || resendingId === invitation.id}
                        title="Revoke invitation"
                        className="h-11 w-11"
                        aria-label="Revoke invitation"
                      >
                        {revokingId === invitation.id ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          <Trash2 className="h-5 w-5" />
                        )}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Organization Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Organization Details</CardTitle>
          <CardDescription className="text-base">
            Manage your organization's information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <p className="font-medium">Organization Name</p>
            {isEditingOrgName ? (
              <div className="flex items-center gap-2">
                <Input
                  value={editedOrgName}
                  onChange={(e) => setEditedOrgName(e.target.value)}
                  placeholder="Enter organization name"
                  className="text-base h-11"
                  disabled={isSavingOrgName}
                  autoFocus
                />
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={handleSaveOrgName}
                  disabled={isSavingOrgName || !editedOrgName.trim()}
                  className="h-11 w-11 shrink-0 transition-colors"
                  aria-label="Save organization name"
                >
                  <Check className="h-5 w-5" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={handleCancelOrgEdit}
                  disabled={isSavingOrgName}
                  className="h-11 w-11 shrink-0 transition-colors"
                  aria-label="Cancel editing"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <p className="text-base text-muted-foreground flex-1">
                  {profile?.organizations?.name || 'No organization name set'}
                </p>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={handleEditOrgName}
                  className="h-11 w-11 shrink-0 opacity-60 hover:opacity-100 transition-opacity"
                  aria-label="Edit organization name"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
          <Separator />
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="font-medium">Plan</p>
              <p className="text-sm text-muted-foreground">Free Plan</p>
            </div>
            <Button variant="outline" size="default" className="h-11 w-full sm:w-auto shrink-0">
              Upgrade
            </Button>
          </div>
        </CardContent>
      </Card>

      <InviteUserDialog
        open={inviteDialogOpen}
        onOpenChange={setInviteDialogOpen}
        onInviteSent={handleInviteSent}
      />
    </div>
  );
}
