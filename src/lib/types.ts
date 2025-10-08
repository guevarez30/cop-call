export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  role: 'admin' | 'user';
  theme: 'light' | 'dark';
  created_at: string;
  organization_id: string;
  organizations: {
    id: string;
    name: string;
  };
}

// Event-related types
export type EventStatus = 'draft' | 'submitted';

export interface EventTag {
  id: string;
  name: string;
  created_at: string;
  organization_id: string;
}

export interface EventPhoto {
  id: string;
  url: string;
  uploaded_at: string;
}

export interface Event {
  id: string;
  officer_id: string;
  officer_name: string;
  start_time: string;
  end_time: string | null;
  tags: string[]; // Array of tag names
  notes: string;
  involved_parties: string | null;
  photos: EventPhoto[];
  status: EventStatus;
  created_at: string;
  updated_at: string;
  organization_id: string;
}
