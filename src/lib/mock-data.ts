import { Event } from './types';

// Helper function to get events by status
export function getEventsByStatus(events: Event[], status: 'draft' | 'submitted'): Event[] {
  return events.filter((event) => event.status === status);
}

// Helper function to get today's events (by created_at date)
export function getTodaysEvents(events: Event[]): Event[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return events.filter((event) => {
    const eventDate = new Date(event.created_at);
    eventDate.setHours(0, 0, 0, 0);
    return eventDate.getTime() === today.getTime();
  });
}

// Helper function to get events by officer
export function getEventsByOfficer(events: Event[], officerId: string): Event[] {
  return events.filter((event) => event.officer_id === officerId);
}

// Helper function to calculate event duration in minutes
export function getEventDuration(event: Event): number | null {
  if (!event.end_time) return null;

  const start = new Date(event.start_time);
  const end = new Date(event.end_time);
  return Math.round((end.getTime() - start.getTime()) / (1000 * 60));
}

// Helper function to format duration as "Xh Ym" or "Ym"
export function formatDuration(minutes: number | null): string {
  if (minutes === null) return 'In progress';

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours > 0) {
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  }
  return `${mins}m`;
}
