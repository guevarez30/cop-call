"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Menu, Home, Settings, User, LogOut } from "lucide-react";
import { RoleProvider, useRole } from "@/lib/role-context";
import { createClient } from "@/lib/supabase/client";

function NavigationItems() {
  const { isAdmin } = useRole();

  const baseItems = [
    { name: "Dashboard", href: "/app", icon: Home },
    { name: "Settings", href: "/app/settings", icon: Settings },
  ];

  const adminItems = [
    { name: "Dashboard", href: "/app", icon: Home },
    { name: "Settings", href: "/app/settings", icon: Settings },
  ];

  return isAdmin ? adminItems : baseItems;
}

function RoleToggle() {
  const { role, setRole, isDevelopment } = useRole();

  if (!isDevelopment) return null;

  return (
    <div className="flex items-center gap-2 bg-accent px-3 py-1 rounded-md border border-border">
      <span className="text-xs font-medium text-muted-foreground">Dev:</span>
      <select
        value={role}
        onChange={(e) => setRole(e.target.value as "admin" | "user")}
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
  const navigationItems = NavigationItems();
  const router = useRouter();

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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Left Side: Menu and Logo */}
            <div className="flex items-center gap-3">
              {/* Hamburger Menu - Always visible */}
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon" className="h-10 w-10">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[300px]">
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

              <Link href="/app" className="text-xl font-bold hover:text-primary transition-colors">
                MicroSaaS
              </Link>
            </div>

            {/* Right Side: Dev Toggle + User Menu */}
            <div className="flex items-center gap-3">
              {/* Dev Mode Role Toggle */}
              <RoleToggle />

              {/* User Avatar Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src="/avatar-placeholder.png" alt="User" />
                      <AvatarFallback>TG</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">Taylor Guevarez</p>
                      <p className="text-xs text-muted-foreground">taylor@example.com</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/app/profile" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/app/settings" className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="cursor-pointer text-destructive"
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    {isLoggingOut ? "Logging out..." : "Log out"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
    </div>
  );
}

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleProvider>
      <AppLayoutContent>{children}</AppLayoutContent>
    </RoleProvider>
  );
}
