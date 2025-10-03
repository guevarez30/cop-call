import { requireAuth } from "@/lib/auth";
import SettingsClient from "./settings-client";

/**
 * Settings Page
 * Server component that verifies authentication and fetches user role
 */
export default async function SettingsPage() {
  // SERVER-SIDE: Verify authentication and fetch user role from database
  const { profile } = await requireAuth();

  return <SettingsClient isAdmin={profile.role === 'admin'} />;
}
