"use client";

import { withAuth } from '@/lib/firebase/auth/withAuth';
import { useAuth } from '@/lib/firebase/auth/context';
import { ConsumptionAnalytics } from '@/components/reports/consumption-analytics';
import { UsagePatterns } from '@/components/reports/usage-patterns';

function ReportsContent() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Reports</h1>
        <p className="text-muted-foreground">
          {user?.isAnonymous 
            ? "Guest access - Sign up to save your reports"
            : "Detailed analysis and visualization of your energy consumption data"}
        </p>
      </div>
      <UsagePatterns />
      <ConsumptionAnalytics />
    </div>
  );
}

export default withAuth(ReportsContent); 