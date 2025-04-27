"use client";

import { UsagePatterns } from '@/components/analytics/usage-patterns';
import { ConsumptionMetrics } from '@/components/analytics/consumption-metrics';
import { InsightsSummary } from '@/components/analytics/insights-summary';
import { ConsumptionComparison } from '@/components/analytics/consumption-comparison';
import { withAuth } from '@/lib/firebase/auth/withAuth';
import { useAuth } from '@/lib/firebase/auth/context';

function AnalyticsContent() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">
          {user?.isAnonymous 
            ? "Guest access - Sign up to save your analytics data"
            : "Detailed analysis of your energy consumption patterns and metrics"}
        </p>
      </div>
      <InsightsSummary />
      <div className="grid gap-6 md:grid-cols-2">
        <UsagePatterns />
        <ConsumptionComparison />
      </div>
      <ConsumptionMetrics />
    </div>
  );
}

export default withAuth(AnalyticsContent); 