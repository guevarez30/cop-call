import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { requireAuth } from "@/lib/auth";

function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Organization Dashboard</h1>
        <p className="text-muted-foreground">Overview of organization-wide metrics</p>
      </div>

      {/* Stats Grid - Organization-wide metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="cursor-pointer hover:shadow-lg hover:border-primary/50 transition-all">
          <CardHeader className="p-4">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground mt-1">Active members</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg hover:border-primary/50 transition-all">
          <CardHeader className="p-4">
            <CardTitle className="text-sm font-medium text-muted-foreground">Metric 2</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground mt-1">Description</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg hover:border-primary/50 transition-all">
          <CardHeader className="p-4">
            <CardTitle className="text-sm font-medium text-muted-foreground">Metric 3</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground mt-1">Description</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg hover:border-primary/50 transition-all">
          <CardHeader className="p-4">
            <CardTitle className="text-sm font-medium text-muted-foreground">Metric 4</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-xs text-muted-foreground mt-1">Description</p>
          </CardContent>
        </Card>
      </div>

      {/* Organization Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>What's happening in your organization</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>No activity yet. Get started by building your application features!</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function UserDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">My Dashboard</h1>
        <p className="text-muted-foreground">Your personal overview</p>
      </div>

      {/* Stats Grid - Personal metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="cursor-pointer hover:shadow-lg hover:border-primary/50 transition-all">
          <CardHeader className="p-4">
            <CardTitle className="text-sm font-medium text-muted-foreground">Metric 1</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg hover:border-primary/50 transition-all">
          <CardHeader className="p-4">
            <CardTitle className="text-sm font-medium text-muted-foreground">Metric 2</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg hover:border-primary/50 transition-all">
          <CardHeader className="p-4">
            <CardTitle className="text-sm font-medium text-muted-foreground">Metric 3</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg hover:border-primary/50 transition-all">
          <CardHeader className="p-4">
            <CardTitle className="text-sm font-medium text-muted-foreground">Metric 4</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your recent activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>No activity yet. Start using the application to see your data here!</p>
            <Button className="mt-4">Get Started</Button>
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
