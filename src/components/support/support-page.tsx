'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BookOpen, 
  HelpCircle, 
  AlertTriangle, 
  FileText, 
  MessageSquare, 
  ArrowRight,
  ChevronRight
} from 'lucide-react';

const faqs = [
  {
    question: 'How do I set up my first energy monitoring device?',
    answer: 'Setting up your first device is simple. Connect the device to your power source, download our mobile app, and follow the step-by-step setup wizard. The app will guide you through the entire process.',
  },
  {
    question: 'What types of devices are supported?',
    answer: 'Our platform supports a wide range of devices including solar panels, batteries, smart meters, and IoT energy sensors. Check our compatibility list for specific models.',
  },
  {
    question: 'How accurate are the energy readings?',
    answer: 'Our devices provide 99.9% accurate readings with real-time monitoring capabilities. All devices are calibrated and certified for commercial use.',
  },
  {
    question: 'Can I export my energy data?',
    answer: 'Yes, you can export your data in various formats including CSV, Excel, and PDF. Data can be exported for any time period you choose.',
  },
];

const troubleshootingGuides = [
  {
    title: 'Device Not Connecting',
    steps: [
      'Check power supply and connections',
      'Verify network connectivity',
      'Restart the device',
      'Update device firmware',
    ],
  },
  {
    title: 'Inaccurate Readings',
    steps: [
      'Verify device calibration',
      'Check for interference',
      'Update sensor firmware',
      'Contact support if issue persists',
    ],
  },
  {
    title: 'App Connection Issues',
    steps: [
      'Check internet connection',
      'Verify app permissions',
      'Clear app cache',
      'Reinstall app if needed',
    ],
  },
];

const documentationLinks = [
  {
    title: 'Getting Started Guide',
    description: 'Learn the basics of our platform and how to set up your first device',
    icon: BookOpen,
  },
  {
    title: 'API Documentation',
    description: 'Integrate our platform with your existing systems using our REST API',
    icon: FileText,
  },
  {
    title: 'Best Practices',
    description: 'Optimize your energy monitoring setup with our recommended practices',
    icon: AlertTriangle,
  },
  {
    title: 'Troubleshooting Guide',
    description: 'Common issues and how to resolve them',
    icon: HelpCircle,
  },
];

export function SupportPage() {
  return (
    <div className="space-y-12">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold tracking-tight">Support Center</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Find answers to common questions, access documentation, and get help with troubleshooting.
        </p>
      </div>

      <Tabs defaultValue="faq" className="space-y-8">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="faq">FAQs</TabsTrigger>
          <TabsTrigger value="troubleshooting">Troubleshooting</TabsTrigger>
          <TabsTrigger value="documentation">Documentation</TabsTrigger>
        </TabsList>

        <TabsContent value="faq" className="space-y-6">
          {faqs.map((faq, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="text-lg">{faq.question}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{faq.answer}</p>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="troubleshooting" className="space-y-6">
          {troubleshootingGuides.map((guide, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="text-lg">{guide.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="list-decimal list-inside space-y-2">
                  {guide.steps.map((step, stepIndex) => (
                    <li key={stepIndex} className="text-muted-foreground">
                      {step}
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="documentation">
          <div className="grid gap-6 md:grid-cols-2">
            {documentationLinks.map((doc, index) => {
              const Icon = doc.icon;
              return (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Icon className="h-5 w-5 text-primary" />
                      <CardTitle className="text-lg">{doc.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground">{doc.description}</p>
                    <Button variant="outline" className="w-full">
                      View Documentation
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      <div className="text-center space-y-4">
        <h3 className="text-2xl font-bold">Still Need Help?</h3>
        <p className="text-muted-foreground">
          Our support team is available 24/7 to assist you with any questions or issues.
        </p>
        <div className="flex justify-center gap-4">
          <Button>
            <MessageSquare className="mr-2 h-4 w-4" />
            Live Chat
          </Button>
          <Button variant="outline">
            Contact Support
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
} 