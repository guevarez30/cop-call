'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useUserProfile } from '@/lib/user-profile-context';

export type UserRole = 'admin' | 'user';

interface RoleContextType {
  role: UserRole;
  isAdmin: boolean;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: ReactNode }) {
  const { profile } = useUserProfile();

  // Use real user role from profile, default to "user"
  const role: UserRole = profile?.role || 'user';

  return (
    <RoleContext.Provider
      value={{
        role,
        isAdmin: role === 'admin',
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
