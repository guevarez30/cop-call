'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MOCK_EVENTS, getTodaysEvents, getEventsByStatus } from '@/lib/mock-data';
import { EventCard } from './components/event-card';
import { EventForm } from './components/event-form';
import { Plus } from 'lucide-react';
import { useRole } from '@/lib/role-context';
import { useUserProfile } from '@/lib/user-profile-context';
import { Event } from '@/lib/types';

function AdminDashboard() {
  const [formOpen, setFormOpen] = useState(false);
  const [events, setEvents] = useState<Event[]>(MOCK_EVENTS);

  // Admin sees ALL events from all officers
  const todaysEvents = getTodaysEvents(events);
  const drafts = getEventsByStatus(todaysEvents, 'draft');
  const submitted = getEventsByStatus(todaysEvents, 'submitted');

  const handleSaveEvent = (eventData: Partial<Event>, status: 'draft' | 'submitted') => {
    const newEvent: Event = {
      id: `event-${Date.now()}`,
      officer_id: 'admin-1', // Admin creating event uses admin ID
      officer_name: 'Admin User', // In real app, get from user profile
      start_time: eventData.start_time!,
      end_time: eventData.end_time || null,
      tags: eventData.tags || [],
      notes: eventData.notes || '',
      involved_parties: eventData.involved_parties || null,
      photos: [],
      status,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      organization_id: 'org-1', // In real app, get from user profile
    };

    setEvents(prev => [newEvent, ...prev]);
  };

  return (
    <div className="space-y-6">
      {/* Header with Log Event Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">All Events</h1>
          <p className="text-base text-muted-foreground">Today&apos;s activity log - all officers</p>
        </div>
        <Button
          size="lg"
          onClick={() => setFormOpen(true)}
          className="w-full sm:w-auto h-14 text-base font-semibold shadow-md hover:shadow-lg"
        >
          <Plus className="h-5 w-5 mr-2" />
          Log New Event
        </Button>
      </div>

      {/* Event Form */}
      <EventForm
        open={formOpen}
        onCancel={() => setFormOpen(false)}
        onSave={handleSaveEvent}
      />

      {/* Drafts Section */}
      {drafts.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Drafts</h2>
            <span className="text-sm text-muted-foreground">{drafts.length} pending</span>
          </div>
          <div className="space-y-3">
            {drafts.map((event) => (
              <EventCard key={event.id} event={event} showOfficer={true} />
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
              <EventCard key={event.id} event={event} showOfficer={true} />
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

function UserDashboard({ userId }: { userId: string }) {
  const [formOpen, setFormOpen] = useState(false);
  const [events, setEvents] = useState<Event[]>(MOCK_EVENTS);

  // Get events for this officer only (in real app, filter by userId)
  // For now using mock data - showing officer-1's events as example
  const userEvents = events.filter(event => event.officer_id === 'officer-1');
  const todaysEvents = getTodaysEvents(userEvents);
  const drafts = getEventsByStatus(todaysEvents, 'draft');
  const submitted = getEventsByStatus(todaysEvents, 'submitted');

  const handleSaveEvent = (eventData: Partial<Event>, status: 'draft' | 'submitted') => {
    const newEvent: Event = {
      id: `event-${Date.now()}`,
      officer_id: 'officer-1', // In real app, use actual userId
      officer_name: 'Officer Smith', // In real app, get from user profile
      start_time: eventData.start_time!,
      end_time: eventData.end_time || null,
      tags: eventData.tags || [],
      notes: eventData.notes || '',
      involved_parties: eventData.involved_parties || null,
      photos: [],
      status,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      organization_id: 'org-1', // In real app, get from user profile
    };

    setEvents(prev => [newEvent, ...prev]);
  };

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
          onClick={() => setFormOpen(true)}
          className="w-full sm:w-auto h-14 text-base font-semibold shadow-md hover:shadow-lg"
        >
          <Plus className="h-5 w-5 mr-2" />
          Log New Event
        </Button>
      </div>

      {/* Event Form */}
      <EventForm
        open={formOpen}
        onCancel={() => setFormOpen(false)}
        onSave={handleSaveEvent}
      />

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
