'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, FileText, BarChart2, Calendar } from 'lucide-react';

const reports = [
  {
    id: 1,
    title: 'Monthly Energy Report',
    type: 'monthly',
    date: 'March 2024',
    size: '2.4 MB',
    status: 'ready',
    metrics: {
      totalConsumption: '1,250,000 kW',
      totalCost: '$125,000',
      peakDemand: '800 kW',
      efficiency: '85%',
    },
  },
  {
    id: 2,
    title: 'Quarterly Performance Analysis',
    type: 'quarterly',
    date: 'Q1 2024',
    size: '3.8 MB',
    status: 'ready',
    metrics: {
      totalConsumption: '3,750,000 kW',
      totalCost: '$375,000',
      peakDemand: '850 kW',
      efficiency: '82%',
    },
  },
  {
    id: 3,
    title: 'Annual Energy Summary',
    type: 'annual',
    date: '2023',
    size: '5.2 MB',
    status: 'ready',
    metrics: {
      totalConsumption: '15,000,000 kW',
      totalCost: '$1,500,000',
      peakDemand: '900 kW',
      efficiency: '80%',
    },
  },
];

const reportTemplates = [
  {
    id: 1,
    title: 'Standard Energy Report',
    description: 'Basic energy consumption and cost analysis',
    icon: FileText,
  },
  {
    id: 2,
    title: 'Performance Analysis',
    description: 'Detailed performance metrics and trends',
    icon: BarChart2,
  },
  {
    id: 3,
    title: 'Custom Date Range',
    description: 'Generate report for specific time period',
    icon: Calendar,
  },
];

export function EnergyReports() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Energy Reports</h2>
        <Button>
          <Download className="mr-2 h-4 w-4" />
          Export All Reports
        </Button>
      </div>

      <Tabs defaultValue="available" className="space-y-4">
        <TabsList>
          <TabsTrigger value="available">Available Reports</TabsTrigger>
          <TabsTrigger value="templates">Report Templates</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="available" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {reports.map((report) => (
              <Card key={report.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{report.title}</CardTitle>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Date</span>
                        <span className="font-medium">{report.date}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Size</span>
                        <span className="font-medium">{report.size}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Status</span>
                        <span className="font-medium">{report.status}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Key Metrics</h4>
                      <div className="rounded-lg border p-3 space-y-2">
                        {Object.entries(report.metrics).map(([key, value]) => (
                          <div
                            key={key}
                            className="flex items-center justify-between text-sm"
                          >
                            <span className="text-muted-foreground">
                              {key.replace(/([A-Z])/g, ' $1').trim()}
                            </span>
                            <span className="font-medium">{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            {reportTemplates.map((template) => {
              const Icon = template.icon;
              return (
                <Card key={template.id}>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Icon className="h-5 w-5 text-muted-foreground" />
                      <CardTitle className="text-lg">{template.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {template.description}
                    </p>
                    <Button className="mt-4 w-full">Generate Report</Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="scheduled" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Scheduled Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border p-4">
                <p className="text-sm text-muted-foreground">
                  No scheduled reports at this time.
                </p>
                <Button className="mt-4">Schedule New Report</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 