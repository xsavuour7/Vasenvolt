'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Check } from 'lucide-react';

const features = [
  'Real-time energy monitoring',
  'AI-powered analytics',
  'Custom alerts and notifications',
  'Historical data analysis',
  'Energy efficiency recommendations',
  'Multi-device support',
  'API access',
  'Priority support',
];

const plans = [
  {
    name: 'Starter',
    price: '$49',
    period: '/month',
    description: 'Perfect for small businesses and homeowners',
    features: features.slice(0, 4),
    cta: 'Start Free Trial',
  },
  {
    name: 'Professional',
    price: '$99',
    period: '/month',
    description: 'Ideal for growing businesses',
    features: features.slice(0, 6),
    cta: 'Start Free Trial',
    popular: true,
  },
  {
    name: 'Enterprise',
    price: '$199',
    period: '/month',
    description: 'For large organizations with complex needs',
    features,
    cta: 'Contact Sales',
  },
];

export function PricingPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-4 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Pricing Plans</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Choose the perfect plan for your energy monitoring needs. All plans include a 14-day free trial.
        </p>
      </div>

      <Tabs defaultValue="monthly" className="w-full">
        <div className="flex justify-center">
          <TabsList>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
            <TabsTrigger value="yearly">Yearly (Save 20%)</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="monthly" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-3">
            {plans.map((plan) => (
              <Card
                key={plan.name}
                className={plan.popular ? 'border-primary' : ''}
              >
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{plan.name}</span>
                    {plan.popular && (
                      <span className="text-xs font-normal bg-primary/10 text-primary px-2 py-1 rounded-full">
                        Most Popular
                      </span>
                    )}
                  </CardTitle>
                  <div className="mt-2">
                    <span className="text-3xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {plan.description}
                  </p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-primary" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="w-full mt-6"
                    variant={plan.popular ? 'default' : 'outline'}
                  >
                    {plan.cta}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="yearly" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-3">
            {plans.map((plan) => (
              <Card
                key={plan.name}
                className={plan.popular ? 'border-primary' : ''}
              >
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{plan.name}</span>
                    {plan.popular && (
                      <span className="text-xs font-normal bg-primary/10 text-primary px-2 py-1 rounded-full">
                        Most Popular
                      </span>
                    )}
                  </CardTitle>
                  <div className="mt-2">
                    <span className="text-3xl font-bold">
                      ${Math.round(parseInt(plan.price.slice(1)) * 0.8)}
                    </span>
                    <span className="text-muted-foreground">/month</span>
                    <span className="block text-sm text-muted-foreground">
                      Billed annually
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {plan.description}
                  </p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-primary" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="w-full mt-6"
                    variant={plan.popular ? 'default' : 'outline'}
                  >
                    {plan.cta}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <div className="rounded-lg border bg-card p-6 text-center">
        <h3 className="text-xl font-semibold mb-2">Need a custom solution?</h3>
        <p className="text-muted-foreground mb-4">
          Contact our sales team to discuss your specific requirements and get a
          tailored quote.
        </p>
        <Button>Contact Sales</Button>
      </div>
    </div>
  );
} 