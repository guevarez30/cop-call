"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useRole } from "@/lib/role-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function SheetsPage() {
  const { isAdmin } = useRole();
  const router = useRouter();

  useEffect(() => {
    if (!isAdmin) {
      router.push("/app");
    }
  }, [isAdmin, router]);

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Sheets</h1>
        <p className="text-gray-600">Admin-only spreadsheet management</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Data Management</CardTitle>
          <CardDescription>Manage and export team data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <p>Sheets functionality coming soon</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
