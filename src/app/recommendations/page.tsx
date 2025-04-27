"use client";

import { withAuth } from '@/lib/firebase/auth/withAuth';
import { useAuth } from '@/lib/firebase/auth/context';
import { RecommendationsList } from '@/components/recommendations/recommendations-list';

function RecommendationsContent() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Recommendations</h1>
        <p className="text-muted-foreground">
          {user?.isAnonymous 
            ? "Guest access - Sign up to save your recommendations"
            : "Personalized energy-saving recommendations based on your usage patterns"}
        </p>
      </div>
      <RecommendationsList />
    </div>
  );
}

export default withAuth(RecommendationsContent); 