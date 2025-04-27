'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Cookie, Shield, Settings, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

const sections = [
  {
    title: 'Essential Cookies',
    icon: Cookie,
    content: [
      'These cookies are necessary for:',
      '- User authentication and session management',
      '- Basic website functionality',
      '- Security features and fraud prevention',
      '- Load balancing and performance optimization',
      'These cookies cannot be disabled as they are required for core functionality.',
    ],
  },
  {
    title: 'Analytics Cookies',
    icon: Settings,
    content: [
      'We use analytics cookies to:',
      '- Track website usage and performance',
      '- Understand user behavior and preferences',
      '- Improve our services and user experience',
      '- Identify and fix technical issues',
      'These cookies help us make data-driven improvements.',
    ],
  },
  {
    title: 'Marketing Cookies',
    icon: AlertTriangle,
    content: [
      'Marketing cookies help us:',
      '- Deliver relevant advertisements',
      '- Measure campaign effectiveness',
      '- Understand user interests',
      '- Personalize marketing content',
      'These cookies are optional and can be disabled.',
    ],
  },
  {
    title: 'Cookie Management',
    icon: Shield,
    content: [
      'You can control cookies through:',
      '- Browser settings and preferences',
      '- Our cookie consent banner',
      '- Third-party opt-out tools',
      '- Privacy settings in your account',
      'Changes to cookie preferences may affect website functionality.',
    ],
  },
  {
    title: 'Cookie Duration',
    icon: CheckCircle,
    content: [
      'Cookies are stored for:',
      '- Session duration (temporary)',
      '- 30 days (short-term)',
      '- 1 year (long-term)',
      '- Until manually deleted',
      'Duration depends on cookie type and purpose.',
    ],
  },
  {
    title: 'Third-Party Cookies',
    icon: XCircle,
    content: [
      'We use cookies from:',
      '- Analytics providers (Google Analytics)',
      '- Advertising networks',
      '- Social media platforms',
      '- Payment processors',
      'These cookies are subject to their respective privacy policies.',
    ],
  },
];

export function CookiePolicy() {
  return (
    <div className="space-y-12">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold tracking-tight">Cookie Policy</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Last updated: {new Date().toLocaleDateString()}
        </p>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          This Cookie Policy explains how VasenVolt uses cookies and similar technologies to recognize you when you visit our website and use our services.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {sections.map((section, index) => {
          const Icon = section.icon;
          return (
            <Card key={index}>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Icon className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">{section.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-2">
                  {section.content.map((item, itemIndex) => (
                    <li key={itemIndex} className="text-muted-foreground">
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="text-center space-y-4">
        <h3 className="text-2xl font-bold">Contact Us</h3>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          For questions about our Cookie Policy or to manage your cookie preferences, please contact us at privacy@vasenvolt.com
        </p>
      </div>
    </div>
  );
} 