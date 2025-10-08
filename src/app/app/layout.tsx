'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { Menu, Home, Settings, User, LogOut, ChevronLeft, ChevronRight, History } from 'lucide-react';
import { RoleProvider, useRole } from '@/lib/role-context';
import { UserProfileProvider, useUserProfile } from '@/lib/user-profile-context';
import { createClient } from '@/lib/supabase/client';
import { ThemeSync } from '@/components/theme-sync';
import { Toaster } from '@/components/ui/sonner';
import { cn } from '@/lib/utils';

function NavigationItems(isAdmin: boolean) {
  const items = [{ name: 'Dashboard', href: '/app', icon: Home }];

  if (isAdmin) {
    items.push({ name: 'History', href: '/app/history', icon: History });
    items.push({ name: 'Department Settings', href: '/app/settings', icon: Settings });
  }

  return items;
}

function Sidebar({ isCollapsed, setIsCollapsed }: { isCollapsed: boolean; setIsCollapsed: (collapsed: boolean) => void }) {
  const pathname = usePathname();
  const { isAdmin } = useRole();
  const navigationItems = NavigationItems(isAdmin);

  return (
    <aside
      className={cn(
        'hidden md:flex flex-col bg-card border-r h-screen sticky top-0 transition-all duration-300',
        isCollapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Sidebar Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <Link
          href="/app"
          className={cn(
            'text-xl font-bold hover:text-primary transition-colors',
            isCollapsed && 'hidden'
          )}
        >
          Event Logger
        </Link>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={cn('h-8 w-8', isCollapsed && 'mx-auto')}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 p-4 space-y-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-accent text-muted-foreground hover:text-foreground',
                isCollapsed && 'justify-center'
              )}
              title={isCollapsed ? item.name : undefined}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {!isCollapsed && <span className="font-medium">{item.name}</span>}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

function RoleToggle() {
  const { role, setRole, isDevelopment } = useRole();

  if (!isDevelopment) return null;

  return (
    <div className="flex items-center gap-2 bg-accent px-3 py-1 rounded-md border border-border">
      <span className="text-xs font-medium text-muted-foreground">Dev:</span>
      <select
        value={role}
        onChange={(e) => setRole(e.target.value as 'admin' | 'user')}
        className="text-xs font-medium bg-transparent border-none focus:outline-none cursor-pointer text-foreground hover:text-primary transition-colors"
      >
        <option value="admin">Admin</option>
        <option value="user">User</option>
      </select>
    </div>
  );
}

function AppLayoutContent({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const router = useRouter();
  const { profile, loading: profileLoading } = useUserProfile();
  const { isAdmin } = useRole();
  const navigationItems = NavigationItems(isAdmin);

  // Load sidebar collapse state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('sidebar-collapsed');
    if (saved !== null) {
      setIsSidebarCollapsed(saved === 'true');
    }
  }, []);

  // Save sidebar collapse state to localStorage
  const handleSidebarCollapse = (collapsed: boolean) => {
    setIsSidebarCollapsed(collapsed);
    localStorage.setItem('sidebar-collapsed', String(collapsed));
  };

  // Get user initials for avatar
  const getInitials = (name: string | null) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('Error logging out:', error);
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar - Always visible on md and up */}
      <Sidebar isCollapsed={isSidebarCollapsed} setIsCollapsed={handleSidebarCollapse} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-card border-b sticky top-0 z-10">
          <div className="px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              {/* Left Side: Mobile Menu and Logo */}
              <div className="flex items-center gap-3">
                {/* Hamburger Menu - Mobile only */}
                <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="icon" className="h-10 w-10 md:hidden">
                      <Menu className="h-5 w-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-[300px]">
                    <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                    <nav className="flex flex-col gap-4 mt-8">
                      {navigationItems.map((item) => {
                        const Icon = item.icon;
                        return (
                          <Link
                            key={item.name}
                            href={item.href}
                            onClick={() => setMobileMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 text-base font-medium hover:bg-accent rounded-lg transition-colors"
                          >
                            <Icon className="h-5 w-5" />
                            {item.name}
                          </Link>
                        );
                      })}
                    </nav>
                  </SheetContent>
                </Sheet>

                {/* Logo - Mobile only (on desktop it's in sidebar) */}
                <Link
                  href="/app"
                  className="text-xl font-bold hover:text-primary transition-colors md:hidden"
                >
                  Event Logger
                </Link>
              </div>

              {/* Right Side: Dev Toggle + User Menu */}
              <div className="flex items-center gap-3">
                {/* Dev Mode Role Toggle */}
                <RoleToggle />

                {/* User Avatar Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-10 w-10 rounded-full cursor-pointer"
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage
                          src="/avatar-placeholder.png"
                          alt={profile?.full_name || 'User'}
                        />
                        <AvatarFallback>
                          {profileLoading ? '...' : getInitials(profile?.full_name || null)}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium">
                          {profileLoading ? 'Loading...' : profile?.full_name || 'No name'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {profileLoading ? '' : profile?.email || 'No email'}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/app/profile" className="cursor-pointer">
                        <User className="mr-2 h-4 w-4" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="cursor-pointer text-destructive"
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      {isLoggingOut ? 'Logging out...' : 'Log out'}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <UserProfileProvider>
      <RoleProvider>
        <ThemeSync />
        <AppLayoutContent>{children}</AppLayoutContent>
        <Toaster />
      </RoleProvider>
    </UserProfileProvider>
  );
}
