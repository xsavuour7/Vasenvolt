'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Lock, Database, User, Bell, Globe } from 'lucide-react';

const sections = [
  {
    title: 'Data Collection',
    icon: Database,
    content: [
      'We collect information necessary to provide our energy monitoring services, including:',
      '- Device usage data and energy consumption metrics',
      '- Account information and user preferences',
      '- Technical data from connected devices',
      '- Communication history with our support team',
    ],
  },
  {
    title: 'Data Usage',
    icon: Bell,
    content: [
      'Your data is used to:',
      '- Provide real-time energy monitoring and analytics',
      '- Generate reports and recommendations',
      '- Improve our services and develop new features',
      '- Send important notifications and updates',
      '- Respond to support requests',
    ],
  },
  {
    title: 'Data Protection',
    icon: Lock,
    content: [
      'We implement robust security measures:',
      '- End-to-end encryption for all data transmissions',
      '- Regular security audits and updates',
      '- Access controls and authentication protocols',
      '- Secure data storage with industry-standard practices',
    ],
  },
  {
    title: 'User Rights',
    icon: User,
    content: [
      'You have the right to:',
      '- Access your personal data',
      '- Request data correction or deletion',
      '- Opt-out of marketing communications',
      '- Export your data in standard formats',
      '- Withdraw consent for data processing',
    ],
  },
  {
    title: 'Third-Party Services',
    icon: Globe,
    content: [
      'We work with trusted partners:',
      '- Cloud service providers for data storage',
      '- Analytics services to improve our platform',
      '- Payment processors for subscription management',
      '- All partners are GDPR and CCPA compliant',
    ],
  },
  {
    title: 'Compliance',
    icon: Shield,
    content: [
      'We comply with:',
      '- General Data Protection Regulation (GDPR)',
      '- California Consumer Privacy Act (CCPA)',
      '- Industry-specific regulations',
      '- International data protection standards',
    ],
  },
];

export function PrivacyPolicy() {
  return (
    <div className="space-y-12">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold tracking-tight">Privacy Policy</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Last updated: {new Date().toLocaleDateString()}
        </p>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          This Privacy Policy describes how VasenVolt collects, uses, and protects your personal information when you use our energy monitoring platform.
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
          If you have any questions about our Privacy Policy or how we handle your data, please contact our Data Protection Officer at privacy@vasenvolt.com
        </p>
      </div>
    </div>
  );
} 