"use client";

import { useEffect } from "react";
import { useTheme } from "@/lib/theme-context";
import { useUserProfile } from "@/lib/user-profile-context";

export function ThemeSync() {
  const { setTheme } = useTheme();
  const { profile, loading } = useUserProfile();

  useEffect(() => {
    // Once profile is loaded, sync theme with database value
    if (!loading && profile?.theme) {
      setTheme(profile.theme);
    }
  }, [profile?.theme, loading, setTheme]);

  return null;
}
