'use client';

import { useState, useEffect, useCallback } from 'react';
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
import { Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { createClient } from '@/lib/supabase/client';
import { TagBadge } from '@/components/tag-badge';
import { HistoryFilters, FilterValues } from './components/history-filters';
import { EventDetailDialog } from '../components/event-detail-dialog';
import { DeleteEventDialog } from '../components/delete-event-dialog';
import { toast } from 'sonner';

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function HistoryPage() {
  const { isAdmin } = useRole();
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvents, setSelectedEvents] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationMeta>({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
  });

  // Filter state
  const [filters, setFilters] = useState<FilterValues>({
    officerIds: [],
    startDate: '',
    endDate: '',
    tagIds: [],
  });

  // Dialog states
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<Event | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Fetch events from API
  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) return;

      // Build query params
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        status: 'submitted', // Only show submitted events in history
      });

      // Add filters
      if (filters.officerIds.length > 0) {
        params.append('officer_ids', filters.officerIds.join(','));
      }
      if (filters.startDate) {
        params.append('start_date', filters.startDate);
      }
      if (filters.endDate) {
        params.append('end_date', filters.endDate);
      }
      if (filters.tagIds.length > 0) {
        params.append('tag_ids', filters.tagIds.join(','));
      }

      const response = await fetch(`/api/events?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setEvents(data.events || []);
        setPagination(data.pagination);
      } else {
        toast.error('Failed to fetch events');
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('An error occurred while fetching events');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, filters]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleFilterChange = (newFilters: FilterValues) => {
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to page 1 on filter change
  };

  const handleClearFilters = () => {
    setFilters({
      officerIds: [],
      startDate: '',
      endDate: '',
      tagIds: [],
    });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, page: newPage }));
      setSelectedEvents(new Set()); // Clear selection on page change
    }
  };

  const handleRowClick = (event: Event) => {
    setSelectedEvent(event);
    setShowDetailDialog(true);
  };

  const handleDeleteClick = (event: Event, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent row click
    setEventToDelete(event);
    setShowDeleteDialog(true);
  };

  const handleBulkDeleteClick = () => {
    if (selectedEvents.size === 0) return;
    // For bulk delete, we'll use a slightly different flow
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!isAdmin) return;

    try {
      setDeleting(true);
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) return;

      // Determine if single or bulk delete
      if (eventToDelete) {
        // Single delete
        const response = await fetch(`/api/events/${eventToDelete.id}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        if (response.ok) {
          toast.success('Event deleted successfully');
          setShowDeleteDialog(false);
          setEventToDelete(null);
          fetchEvents();
        } else {
          const data = await response.json();
          toast.error(data.error || 'Failed to delete event');
        }
      } else if (selectedEvents.size > 0) {
        // Bulk delete
        const response = await fetch('/api/events/bulk-delete', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            event_ids: Array.from(selectedEvents),
          }),
        });

        if (response.ok) {
          const data = await response.json();
          toast.success(data.message || 'Events deleted successfully');
          setShowDeleteDialog(false);
          setSelectedEvents(new Set());
          fetchEvents();
        } else {
          const data = await response.json();
          toast.error(data.error || 'Failed to delete events');
        }
      }
    } catch (error) {
      console.error('Error deleting event(s):', error);
      toast.error('An error occurred while deleting');
    } finally {
      setDeleting(false);
    }
  };

  const allSelected = events.length > 0 && selectedEvents.size === events.length;
  const someSelected = selectedEvents.size > 0 && selectedEvents.size < events.length;

  const handleSelectAll = () => {
    if (allSelected) {
      setSelectedEvents(new Set());
    } else {
      setSelectedEvents(new Set(events.map(e => e.id)));
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
          {isAdmin ? 'All department events and activity logs' : 'Your submitted events'}
        </p>
      </div>

      {/* Filters */}
      <HistoryFilters
        isAdmin={isAdmin}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
      />

      {/* Bulk Actions Bar */}
      {isAdmin && selectedEvents.size > 0 && (
        <Card className="bg-muted/50">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">
                {selectedEvents.size} event{selectedEvents.size !== 1 ? 's' : ''} selected
              </p>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBulkDeleteClick}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Selected
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Events Table */}
      {loading ? (
        <Card>
          <CardContent className="py-12 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <Spinner size="lg" />
              <p className="text-sm text-muted-foreground">Loading events...</p>
            </div>
          </CardContent>
        </Card>
      ) : events.length > 0 ? (
        <>
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {isAdmin && (
                        <TableHead className="w-[50px]">
                          <Checkbox
                            checked={allSelected ? true : someSelected ? "indeterminate" : false}
                            onCheckedChange={handleSelectAll}
                            aria-label="Select all events"
                          />
                        </TableHead>
                      )}
                      {isAdmin && <TableHead>Officer</TableHead>}
                      <TableHead>Date</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Tags</TableHead>
                      <TableHead className="max-w-[300px]">Notes</TableHead>
                      {isAdmin && <TableHead className="w-[100px]">Actions</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {events.map((event) => {
                      const { date, time } = formatDateTime(event.start_time);
                      const duration = getEventDuration(event);
                      const durationText = formatDuration(duration);
                      const notesPreview = event.notes.length > 80
                        ? `${event.notes.substring(0, 80)}...`
                        : event.notes;

                      return (
                        <TableRow
                          key={event.id}
                          className={`cursor-pointer ${selectedEvents.has(event.id) ? 'bg-muted/50' : 'hover:bg-accent/50'} transition-colors duration-150`}
                          onClick={() => handleRowClick(event)}
                        >
                          {isAdmin && (
                            <TableCell onClick={(e) => e.stopPropagation()}>
                              <Checkbox
                                checked={selectedEvents.has(event.id)}
                                onCheckedChange={() => handleSelectEvent(event.id)}
                                aria-label={`Select event ${event.id}`}
                              />
                            </TableCell>
                          )}
                          {isAdmin && (
                            <TableCell className="font-medium">
                              {event.officer_name}
                            </TableCell>
                          )}
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
                          <TableCell className="text-sm text-muted-foreground max-w-[300px]">
                            {notesPreview || '—'}
                          </TableCell>
                          {isAdmin && (
                            <TableCell onClick={(e) => e.stopPropagation()}>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => handleDeleteClick(event, e)}
                                className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          )}
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <p className="text-sm text-muted-foreground">
                Showing {events.length} of {pagination.total} event{pagination.total !== 1 ? 's' : ''}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="h-9"
                >
                  <ChevronLeft className="h-4 w-4 sm:mr-1" />
                  <span className="hidden sm:inline">Previous</span>
                </Button>
                <div className="flex items-center gap-1 min-w-[120px] justify-center">
                  <span className="text-sm font-medium">
                    Page {pagination.page} of {pagination.totalPages}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                  className="h-9"
                >
                  <span className="hidden sm:inline">Next</span>
                  <ChevronRight className="h-4 w-4 sm:ml-1" />
                </Button>
              </div>
            </div>
          )}
        </>
      ) : (
        <Card>
          <CardContent className="py-12">
            <div className="text-center space-y-3">
              <p className="text-base text-muted-foreground">
                No events found.
              </p>
              {(filters.officerIds.length > 0 || filters.startDate || filters.endDate || filters.tagIds.length > 0) ? (
                <p className="text-sm text-muted-foreground">
                  No events match your current filters. Try adjusting your search.
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {isAdmin
                    ? 'Events will appear here as officers log and submit their activities.'
                    : 'Your submitted events will appear here.'}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Event Detail Dialog */}
      <EventDetailDialog
        event={selectedEvent}
        open={showDetailDialog}
        onClose={() => {
          setShowDetailDialog(false);
          setSelectedEvent(null);
        }}
        showOfficer={isAdmin}
        isAdmin={isAdmin}
        canDelete={isAdmin}
        onDelete={(event) => {
          setShowDetailDialog(false);
          setEventToDelete(event);
          setShowDeleteDialog(true);
        }}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteEventDialog
        open={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false);
          setEventToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        eventStatus="submitted"
        isAdmin={isAdmin}
        deleting={deleting}
      />
    </div>
  );
}
