'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useUserProfile } from '@/lib/user-profile-context';

export type UserRole = 'admin' | 'user';

interface RoleContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  isAdmin: boolean;
  isDevelopment: boolean;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: ReactNode }) {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const { profile, loading } = useUserProfile();

  // Use real user role from profile, default to "user"
  const realUserRole: UserRole = profile?.role || 'user';
  const [role, setRole] = useState<UserRole>(realUserRole);

  // Update role when profile loads or changes
  useEffect(() => {
    if (!loading && profile) {
      setRole(profile.role);
    }
  }, [profile, loading]);

  return (
    <RoleContext.Provider
      value={{
        role,
        setRole,
        isAdmin: role === 'admin',
        isDevelopment,
      }}
    >
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
}
