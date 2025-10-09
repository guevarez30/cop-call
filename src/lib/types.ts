export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  badge_no: string | null;
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

export interface Tag {
  id: string;
  name: string;
  color: string; // Hex color code (e.g., #FF0000)
  description?: string; // Optional description of what the tag represents
  created_at: string;
  updated_at: string;
  organization_id: string;
}

// Backward compatibility alias (deprecated, use Tag instead)
export type EventTag = Tag;

// Event from database (without populated tags)
export interface EventDB {
  id: string;
  officer_id: string;
  officer_name: string;
  start_time: string;
  end_time: string | null;
  notes: string;
  involved_parties: string | null;
  status: EventStatus;
  created_at: string;
  updated_at: string;
  organization_id: string;
}

// Event with populated tags (for display)
export interface Event extends EventDB {
  tags: Tag[]; // Tags fetched via JOIN with event_tags table
}

// For backward compatibility with mock data (will be removed)
export interface EventLegacy extends EventDB {
  tags: string[]; // Array of tag names (deprecated)
}
