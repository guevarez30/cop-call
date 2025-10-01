import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireAdmin } from "@/lib/auth";
import { Shield } from "lucide-react";

/**
 * Admin-only page example
 * This page uses server-side role verification via requireAdmin()
 * Non-admin users will be automatically redirected to /app
 * Unauthenticated users will be redirected to /login
 */
export default async function AdminPage() {
  // SERVER-SIDE: Verify user is authenticated AND has admin role
  // Automatically redirects if not admin or not authenticated
  const { profile } = await requireAdmin();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Shield className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Admin-only protected page</p>
        </div>
      </div>

      {/* Admin Info */}
      <Card>
        <CardHeader>
          <CardTitle>Admin Access Verified</CardTitle>
          <CardDescription>
            This page is protected with server-side role verification
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Logged in as:</p>
            <p className="font-medium">{profile.full_name}</p>
            <p className="text-sm text-muted-foreground">{profile.email}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Role:</p>
            <p className="font-medium capitalize">{profile.role}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Organization ID:</p>
            <p className="font-mono text-sm">{profile.organization_id}</p>
          </div>
        </CardContent>
      </Card>

      {/* Admin Features Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Admin Features</CardTitle>
          <CardDescription>Manage your organization</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>Add your admin-specific features here</p>
            <p className="text-sm mt-2">User management, settings, analytics, etc.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
