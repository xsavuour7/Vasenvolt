export type DecimalPrecision = 0 | 1 | 2 | 3 | 4;

export type SubscriptionPlan = 'free' | 'basic' | 'pro' | 'enterprise';

export interface UserSettings {
  // ... existing settings ...
  display: {
    // ... existing display settings ...
    decimalPrecision: {
      maxAllowed: DecimalPrecision;  // Based on subscription plan
      selected: DecimalPrecision;    // User's choice within their plan's limit
    };
  };
  subscription: {
    plan: SubscriptionPlan;
    // ... other subscription details ...
  };
}

// Plan-specific decimal precision limits
export const PLAN_DECIMAL_LIMITS: Record<SubscriptionPlan, DecimalPrecision> = {
  'free': 1,
  'basic': 2,
  'pro': 3,
  'enterprise': 4
}; 