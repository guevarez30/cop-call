'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MOCK_EVENTS, getTodaysEvents, getEventsByStatus } from '@/lib/mock-data';
import { EventCard } from './components/event-card';
import { Plus } from 'lucide-react';
import { useRole } from '@/lib/role-context';
import { useUserProfile } from '@/lib/user-profile-context';

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
          <CardDescription className="text-base">
            What&apos;s happening in your organization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-base">
              No activity yet. Get started by building your application features!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function UserDashboard({ userId }: { userId: string }) {
  // Get events for this officer only (in real app, filter by userId)
  // For now using mock data - showing officer-1's events as example
  const userEvents = MOCK_EVENTS.filter(event => event.officer_id === 'officer-1');
  const todaysEvents = getTodaysEvents(userEvents);
  const drafts = getEventsByStatus(todaysEvents, 'draft');
  const submitted = getEventsByStatus(todaysEvents, 'submitted');

  return (
    <div className="space-y-6">
      {/* Header with Log Event Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">My Events</h1>
          <p className="text-base text-muted-foreground">Today&apos;s activity log</p>
        </div>
        <Button
          size="lg"
          className="w-full sm:w-auto h-14 text-base font-semibold shadow-md hover:shadow-lg"
        >
          <Plus className="h-5 w-5 mr-2" />
          Log New Event
        </Button>
      </div>

      {/* Drafts Section */}
      {drafts.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Drafts</h2>
            <span className="text-sm text-muted-foreground">{drafts.length} pending</span>
          </div>
          <div className="space-y-3">
            {drafts.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </div>
      )}

      {/* Today's Submitted Events */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Today&apos;s Events</h2>
          <span className="text-sm text-muted-foreground">{submitted.length} submitted</span>
        </div>

        {submitted.length > 0 ? (
          <div className="space-y-3">
            {submitted.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12">
              <div className="text-center space-y-3">
                <p className="text-base text-muted-foreground">
                  No events logged today.
                </p>
                <p className="text-sm text-muted-foreground">
                  Tap &quot;Log New Event&quot; to get started.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default function AppPage() {
  const { isAdmin } = useRole();
  const { profile } = useUserProfile();

  // Show loading state while profile loads
  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return isAdmin ? <AdminDashboard /> : <UserDashboard userId={profile.id} />;
}
