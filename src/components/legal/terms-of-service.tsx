'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, AlertTriangle, Shield, Scale, Clock, Zap } from 'lucide-react';

const sections = [
  {
    title: 'Acceptance of Terms',
    icon: FileText,
    content: [
      'By accessing or using VasenVolt services, you agree to:',
      '- Comply with these Terms of Service',
      '- Provide accurate account information',
      '- Maintain the security of your account',
      '- Accept responsibility for all activities under your account',
    ],
  },
  {
    title: 'Service Usage',
    icon: Zap,
    content: [
      'You may use our services to:',
      '- Monitor and analyze energy consumption',
      '- Generate reports and recommendations',
      '- Manage connected devices',
      '- Access support and documentation',
      'Prohibited activities include unauthorized access, data scraping, and service disruption.',
    ],
  },
  {
    title: 'Account Management',
    icon: Shield,
    content: [
      'Account responsibilities:',
      '- Maintain accurate contact information',
      '- Keep login credentials secure',
      '- Notify us of unauthorized access',
      '- Pay subscription fees on time',
      '- Comply with usage limits',
    ],
  },
  {
    title: 'Intellectual Property',
    icon: Scale,
    content: [
      'All rights reserved:',
      '- Software and platform design',
      '- Documentation and content',
      '- Analytics and algorithms',
      '- Branding and trademarks',
      'Unauthorized use or reproduction is prohibited.',
    ],
  },
  {
    title: 'Service Availability',
    icon: Clock,
    content: [
      'We strive to maintain:',
      '- 99.9% service uptime',
      '- Regular updates and improvements',
      '- Technical support availability',
      '- Data backup and recovery',
      'Scheduled maintenance will be announced in advance.',
    ],
  },
  {
    title: 'Limitations',
    icon: AlertTriangle,
    content: [
      'Service limitations:',
      '- Maximum number of connected devices',
      '- Data retention periods',
      '- API rate limits',
      '- Support response times',
      'Specific limits are detailed in your subscription plan.',
    ],
  },
];

export function TermsOfService() {
  return (
    <div className="space-y-12">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold tracking-tight">Terms of Service</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Last updated: {new Date().toLocaleDateString()}
        </p>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          These Terms of Service govern your use of the VasenVolt energy monitoring platform and services.
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
          For questions about these Terms of Service, please contact us at legal@vasenvolt.com
        </p>
      </div>
    </div>
  );
} 