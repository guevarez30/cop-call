import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { requireAuth } from "@/lib/auth";

function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Organization Dashboard</h1>
        <p className="text-base text-muted-foreground">Overview of organization-wide metrics</p>
      </div>

      {/* Stats Grid - Organization-wide metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="transition-all hover:shadow-md hover:border-primary/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">0</div>
            <p className="text-xs text-muted-foreground mt-2">Active members</p>
          </CardContent>
        </Card>

        <Card className="transition-all hover:shadow-md hover:border-primary/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Metric 2</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">0</div>
            <p className="text-xs text-muted-foreground mt-2">Description</p>
          </CardContent>
        </Card>

        <Card className="transition-all hover:shadow-md hover:border-primary/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Metric 3</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">0</div>
            <p className="text-xs text-muted-foreground mt-2">Description</p>
          </CardContent>
        </Card>

        <Card className="transition-all hover:shadow-md hover:border-primary/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Metric 4</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">--</div>
            <p className="text-xs text-muted-foreground mt-2">Description</p>
          </CardContent>
        </Card>
      </div>

      {/* Organization Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Recent Activity</CardTitle>
          <CardDescription className="text-base">What's happening in your organization</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-base">No activity yet. Get started by building your application features!</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function UserDashboard() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">My Dashboard</h1>
        <p className="text-base text-muted-foreground">Your personal overview</p>
      </div>

      {/* Stats Grid - Personal metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="transition-all hover:shadow-md hover:border-primary/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Metric 1</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">0</div>
          </CardContent>
        </Card>

        <Card className="transition-all hover:shadow-md hover:border-primary/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Metric 2</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">0</div>
          </CardContent>
        </Card>

        <Card className="transition-all hover:shadow-md hover:border-primary/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Metric 3</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">0</div>
          </CardContent>
        </Card>

        <Card className="transition-all hover:shadow-md hover:border-primary/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Metric 4</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">0</div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Recent Activity</CardTitle>
          <CardDescription className="text-base">Your recent activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-base">No activity yet. Start using the application to see your data here!</p>
            <Button className="mt-6 h-11">Get Started</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default async function AppPage() {
  // SERVER-SIDE: Verify authentication and fetch user role from database
  const { profile } = await requireAuth();

  // Render different dashboard based on actual database role
  const isAdmin = profile.role === 'admin';

  return isAdmin ? <AdminDashboard /> : <UserDashboard />;
}
