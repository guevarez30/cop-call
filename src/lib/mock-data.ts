import { Event, EventTag } from './types';

// Predefined event tags (from project-definition.md)
export const MOCK_EVENT_TAGS: string[] = [
  'Traffic Stop',
  'Citation',
  'Warning',
  'Arrest',
  'Felony',
  'Misdemeanor',
  'Warrant',
  'Community Interaction',
  'Citizen Contact',
  'Business Check',
  'School Visit',
  'Dispatch Call',
  'Disturbance',
  'Welfare Check',
  'Assistance',
  'Use of Force',
  'Verbal Commands',
  'Physical Control',
  'Less Lethal',
  'Property Check',
  'Residential',
  'Commercial',
  'Vehicle',
  'Report Taken',
  'Incident Report',
  'Accident Report',
  'Other',
];

// Sample events for development and testing
export const MOCK_EVENTS: Event[] = [
  {
    id: '1',
    officer_id: 'officer-1',
    officer_name: 'Officer Smith',
    start_time: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    end_time: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(), // 1.5 hours ago
    tags: ['Traffic Stop', 'Citation'],
    notes: 'Stopped vehicle for speeding on Highway 101. Driver was cooperative. Issued citation for 15 mph over the limit.',
    involved_parties: 'John Doe (Driver, CA DL# D1234567)',
    photos: [],
    status: 'submitted',
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(),
    organization_id: 'org-1',
  },
  {
    id: '2',
    officer_id: 'officer-1',
    officer_name: 'Officer Smith',
    start_time: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
    end_time: new Date(Date.now() - 3.5 * 60 * 60 * 1000).toISOString(), // 3.5 hours ago
    tags: ['Community Interaction', 'School Visit'],
    notes: 'Community outreach event at Lincoln Elementary. Spoke with students about safety and career opportunities.',
    involved_parties: null,
    photos: [],
    status: 'submitted',
    created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 3.5 * 60 * 60 * 1000).toISOString(),
    organization_id: 'org-1',
  },
  {
    id: '3',
    officer_id: 'officer-1',
    officer_name: 'Officer Smith',
    start_time: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
    end_time: null,
    tags: ['Dispatch Call', 'Welfare Check'],
    notes: 'Responding to welfare check request at 123 Main Street. Caller reported they haven\'t heard from elderly neighbor in several days.',
    involved_parties: 'Caller: Jane Smith (neighbor)',
    photos: [],
    status: 'draft',
    created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    organization_id: 'org-1',
  },
  {
    id: '4',
    officer_id: 'officer-2',
    officer_name: 'Officer Johnson',
    start_time: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
    end_time: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
    tags: ['Arrest', 'Warrant', 'Felony'],
    notes: 'Arrested subject on outstanding felony warrant. Subject was located at residence and taken into custody without incident.',
    involved_parties: 'Michael Brown (DOB 01/15/1985, Warrant #WR-2024-1234)',
    photos: [],
    status: 'submitted',
    created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    organization_id: 'org-1',
  },
  {
    id: '5',
    officer_id: 'officer-2',
    officer_name: 'Officer Johnson',
    start_time: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
    end_time: new Date(Date.now() - 5.5 * 60 * 60 * 1000).toISOString(), // 5.5 hours ago
    tags: ['Property Check', 'Commercial'],
    notes: 'Routine business check at 456 Oak Street. All doors and windows secure. No signs of suspicious activity.',
    involved_parties: null,
    photos: [],
    status: 'submitted',
    created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 5.5 * 60 * 60 * 1000).toISOString(),
    organization_id: 'org-1',
  },
  {
    id: '6',
    officer_id: 'officer-3',
    officer_name: 'Officer Davis',
    start_time: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
    end_time: new Date(Date.now() - 0.5 * 60 * 60 * 1000).toISOString(), // 30 minutes ago
    tags: ['Dispatch Call', 'Disturbance', 'Report Taken', 'Incident Report'],
    notes: 'Responded to noise complaint at apartment complex. Contacted resident and advised to keep volume down. No further action required.',
    involved_parties: 'Resident: Sarah Williams (Apt 201), Complainant: Tom Chen (Apt 202)',
    photos: [],
    status: 'submitted',
    created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 0.5 * 60 * 60 * 1000).toISOString(),
    organization_id: 'org-1',
  },
];

// Helper function to get events by status
export function getEventsByStatus(events: Event[], status: 'draft' | 'submitted'): Event[] {
  return events.filter((event) => event.status === status);
}

// Helper function to get today's events
export function getTodaysEvents(events: Event[]): Event[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return events.filter((event) => {
    const eventDate = new Date(event.start_time);
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
