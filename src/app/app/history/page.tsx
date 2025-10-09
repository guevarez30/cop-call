'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRole } from '@/lib/role-context';
import { Event } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDuration, getEventDuration } from '@/lib/mock-data';
import { X } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { createClient } from '@/lib/supabase/client';
import { TagBadge } from '@/components/tag-badge';

export default function HistoryPage() {
  const { isAdmin } = useRole();
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvents, setSelectedEvents] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

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

  // Sort events by start_time (most recent first)
  const sortedEvents = useMemo(() => {
    return [...events].sort((a, b) => {
      return new Date(b.start_time).getTime() - new Date(a.start_time).getTime();
    });
  }, [events]);

  // Admin-only protection
  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card>
          <CardContent className="py-12 px-8">
            <p className="text-muted-foreground text-center">
              Access denied. This page is only available to administrators.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const allSelected = sortedEvents.length > 0 && selectedEvents.size === sortedEvents.length;
  const someSelected = selectedEvents.size > 0 && selectedEvents.size < sortedEvents.length;

  const handleSelectAll = () => {
    if (allSelected) {
      setSelectedEvents(new Set());
    } else {
      setSelectedEvents(new Set(sortedEvents.map(e => e.id)));
    }
  };

  const handleSelectEvent = (eventId: string) => {
    const newSelected = new Set(selectedEvents);
    if (newSelected.has(eventId)) {
      newSelected.delete(eventId);
    } else {
      newSelected.add(eventId);
    }
    setSelectedEvents(newSelected);
  };

  const handleClearSelection = () => {
    setSelectedEvents(new Set());
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      time: date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Event History</h1>
        <p className="text-base text-muted-foreground">
          All department events and activity logs
        </p>
      </div>

      {/* Selection Controls */}
      {selectedEvents.size > 0 && (
        <Card className="bg-muted/50">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">
                {selectedEvents.size} event{selectedEvents.size !== 1 ? 's' : ''} selected
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearSelection}
              >
                <X className="h-4 w-4 mr-2" />
                Clear Selection
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Events Table */}
      {sortedEvents.length > 0 ? (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">
                      <Checkbox
                        checked={allSelected ? true : someSelected ? "indeterminate" : false}
                        onCheckedChange={handleSelectAll}
                        aria-label="Select all events"
                      />
                    </TableHead>
                    <TableHead>Officer</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Tags</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="max-w-[300px]">Notes</TableHead>
                    <TableHead>Involved Parties</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedEvents.map((event) => {
                    const { date, time } = formatDateTime(event.start_time);
                    const duration = getEventDuration(event);
                    const durationText = formatDuration(duration);
                    const notesPreview = event.notes.length > 80
                      ? `${event.notes.substring(0, 80)}...`
                      : event.notes;

                    return (
                      <TableRow
                        key={event.id}
                        className={selectedEvents.has(event.id) ? 'bg-muted/50' : 'hover:bg-accent/50 transition-colors duration-150'}
                      >
                        <TableCell>
                          <Checkbox
                            checked={selectedEvents.has(event.id)}
                            onCheckedChange={() => handleSelectEvent(event.id)}
                            aria-label={`Select event ${event.id}`}
                          />
                        </TableCell>
                        <TableCell className="font-medium">
                          {event.officer_name}
                        </TableCell>
                        <TableCell className="text-sm">{date}</TableCell>
                        <TableCell className="text-sm">{time}</TableCell>
                        <TableCell className="text-sm">{durationText}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1 max-w-[200px]">
                            {event.tags.slice(0, 2).map((tag) => (
                              <TagBadge key={tag.id} tag={tag} size="sm" />
                            ))}
                            {event.tags.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{event.tags.length - 2}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={event.status === 'draft' ? 'secondary' : 'default'}
                            className="text-xs"
                          >
                            {event.status === 'draft' ? 'Draft' : 'Submitted'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground max-w-[300px]">
                          {notesPreview || '—'}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {event.involved_parties || '—'}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-12">
            <div className="text-center space-y-3">
              <p className="text-base text-muted-foreground">
                No events logged yet.
              </p>
              <p className="text-sm text-muted-foreground">
                Events will appear here as officers log their daily activities.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
