"use client";

import { EnergyOverview } from '@/components/dashboard/energy-overview';
import { HistoricalConsumption } from '@/components/dashboard/historical-consumption';
import { MetricHighlights } from '@/components/dashboard/metric-highlights';
import { withAuth } from '@/lib/firebase/auth/withAuth';
import { useAuth } from '@/lib/firebase/auth/context';
import { useSignOut } from '@/lib/firebase/auth/hooks';
import { Button } from '@/components/ui/button';

function DashboardContent() {
  const { user } = useAuth();
  const { signOut, loading } = useSignOut();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            {user?.isAnonymous 
              ? "Guest access - Sign up to save your data"
              : "Monitor your energy consumption and performance metrics"}
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => signOut()}
          disabled={loading}
        >
          {loading ? 'Signing out...' : 'Sign out'}
        </Button>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <EnergyOverview />
        <HistoricalConsumption />
      </div>
      <MetricHighlights />
    </div>
  );
}

export default withAuth(DashboardContent); 