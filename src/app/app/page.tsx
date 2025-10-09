'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getTodaysEvents, getEventsByStatus } from '@/lib/mock-data';
import { EventCard } from './components/event-card';
import { EventForm } from './components/event-form';
import { EventDetailDialog } from './components/event-detail-dialog';
import { DeleteEventDialog } from './components/delete-event-dialog';
import { Plus, Loader2 } from 'lucide-react';
import { useRole } from '@/lib/role-context';
import { useUserProfile } from '@/lib/user-profile-context';
import { Event } from '@/lib/types';
import { createClient } from '@/lib/supabase/client';

function AdminDashboard() {
  const [formOpen, setFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [viewingEvent, setViewingEvent] = useState<Event | null>(null);
  const [deletingEvent, setDeletingEvent] = useState<Event | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const { profile } = useUserProfile();

  // Fetch events from API
  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) return;

      const response = await fetch('/api/events', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setEvents(data.events || []);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  // Admin sees ALL events from all officers
  const todaysEvents = getTodaysEvents(events);
  const drafts = getEventsByStatus(todaysEvents, 'draft');
  const submitted = getEventsByStatus(todaysEvents, 'submitted');

  const handleSaveEvent = async (eventData: any) => {
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) return;

      if (editingEvent) {
        // Update existing event
        const response = await fetch(`/api/events/${editingEvent.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify(eventData),
        });

        if (response.ok) {
          const data = await response.json();
          setEvents(prev => prev.map(e => e.id === editingEvent.id ? data.event : e));
          setEditingEvent(null);
        }
      } else {
        // Create new event
        const response = await fetch('/api/events', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify(eventData),
        });

        if (response.ok) {
          const data = await response.json();
          setEvents(prev => [data.event, ...prev]);
        }
      }
    } catch (error) {
      console.error('Error saving event:', error);
    }
  };

  const handleEditDraft = (event: Event) => {
    setEditingEvent(event);
    setFormOpen(true);
  };

  const handleViewEvent = (event: Event) => {
    setViewingEvent(event);
  };

  const handleDeleteEvent = async () => {
    if (!deletingEvent) return;

    setDeleting(true);
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) return;

      const response = await fetch(`/api/events/${deletingEvent.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (response.ok) {
        setEvents(prev => prev.filter(e => e.id !== deletingEvent.id));
        setDeletingEvent(null);
        setViewingEvent(null);
      }
    } catch (error) {
      console.error('Error deleting event:', error);
    } finally {
      setDeleting(false);
    }
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setEditingEvent(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

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
        onCancel={handleCloseForm}
        onSave={handleSaveEvent}
        editEvent={editingEvent}
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
              <EventCard key={event.id} event={event} showOfficer={true} onClick={() => handleEditDraft(event)} />
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
              <EventCard key={event.id} event={event} showOfficer={true} onClick={() => handleViewEvent(event)} />
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

      {/* Event Detail Dialog */}
      <EventDetailDialog
        event={viewingEvent}
        open={!!viewingEvent}
        onClose={() => setViewingEvent(null)}
        onEdit={handleEditDraft}
        onDelete={(event) => setDeletingEvent(event)}
        showOfficer={true}
        isAdmin={true}
        canEdit={true}
        canDelete={true}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteEventDialog
        open={!!deletingEvent}
        onClose={() => setDeletingEvent(null)}
        onConfirm={handleDeleteEvent}
        eventStatus={deletingEvent?.status || 'draft'}
        isAdmin={true}
        deleting={deleting}
      />
    </div>
  );
}

function UserDashboard({ userId }: { userId: string }) {
  const [formOpen, setFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [viewingEvent, setViewingEvent] = useState<Event | null>(null);
  const [deletingEvent, setDeletingEvent] = useState<Event | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const { profile } = useUserProfile();

  // Fetch events from API
  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) return;

      const response = await fetch('/api/events', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setEvents(data.events || []);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const todaysEvents = getTodaysEvents(events);
  const drafts = getEventsByStatus(todaysEvents, 'draft');
  const submitted = getEventsByStatus(todaysEvents, 'submitted');

  const handleSaveEvent = async (eventData: any) => {
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) return;

      if (editingEvent) {
        // Update existing event
        const response = await fetch(`/api/events/${editingEvent.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify(eventData),
        });

        if (response.ok) {
          const data = await response.json();
          setEvents(prev => prev.map(e => e.id === editingEvent.id ? data.event : e));
          setEditingEvent(null);
        }
      } else {
        // Create new event
        const response = await fetch('/api/events', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify(eventData),
        });

        if (response.ok) {
          const data = await response.json();
          setEvents(prev => [data.event, ...prev]);
        }
      }
    } catch (error) {
      console.error('Error saving event:', error);
    }
  };

  const handleEditDraft = (event: Event) => {
    setEditingEvent(event);
    setFormOpen(true);
  };

  const handleViewEvent = (event: Event) => {
    setViewingEvent(event);
  };

  const handleDeleteEvent = async () => {
    if (!deletingEvent) return;

    setDeleting(true);
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) return;

      const response = await fetch(`/api/events/${deletingEvent.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (response.ok) {
        setEvents(prev => prev.filter(e => e.id !== deletingEvent.id));
        setDeletingEvent(null);
        setViewingEvent(null);
      }
    } catch (error) {
      console.error('Error deleting event:', error);
    } finally {
      setDeleting(false);
    }
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setEditingEvent(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

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
        onCancel={handleCloseForm}
        onSave={handleSaveEvent}
        editEvent={editingEvent}
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
              <EventCard key={event.id} event={event} onClick={() => handleEditDraft(event)} />
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
              <EventCard key={event.id} event={event} onClick={() => handleViewEvent(event)} />
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

      {/* Event Detail Dialog */}
      <EventDetailDialog
        event={viewingEvent}
        open={!!viewingEvent}
        onClose={() => setViewingEvent(null)}
        onEdit={handleEditDraft}
        onDelete={(event) => setDeletingEvent(event)}
        showOfficer={false}
        isAdmin={false}
        canEdit={true}
        canDelete={viewingEvent?.status === 'draft'}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteEventDialog
        open={!!deletingEvent}
        onClose={() => setDeletingEvent(null)}
        onConfirm={handleDeleteEvent}
        eventStatus={deletingEvent?.status || 'draft'}
        isAdmin={false}
        deleting={deleting}
      />
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
