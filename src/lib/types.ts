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
