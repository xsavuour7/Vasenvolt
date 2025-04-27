'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, 
  Download, 
  Plus, 
  Clock, 
  CheckCircle2,
  AlertCircle,
  Calendar,
  BarChart2
} from 'lucide-react';

type ReportStatus = 'ready' | 'generating' | 'error';

const reports = [
  {
    id: 'rep-1',
    title: 'Monthly Energy Report - March 2024',
    type: 'monthly',
    date: '2024-03-31',
    size: '2.4 MB',
    status: 'ready' as ReportStatus,
    metrics: {
      consumption: '1,850 kWh',
      cost: '$185.00',
      peak: '2.5 kW',
      efficiency: '92%',
    },
  },
  {
    id: 'rep-2',
    title: 'Quarterly Performance Analysis - Q1 2024',
    type: 'quarterly',
    date: '2024-03-31',
    size: '4.2 MB',
    status: 'generating' as ReportStatus,
    metrics: {
      consumption: '5,200 kWh',
      cost: '$520.00',
      peak: '2.8 kW',
      efficiency: '89%',
    },
  },
  {
    id: 'rep-3',
    title: 'Annual Energy Summary - 2023',
    type: 'annual',
    date: '2023-12-31',
    size: '8.7 MB',
    status: 'ready' as ReportStatus,
    metrics: {
      consumption: '21,500 kWh',
      cost: '$2,150.00',
      peak: '3.2 kW',
      efficiency: '91%',
    },
  },
];

const templates = [
  {
    id: 'temp-1',
    title: 'Standard Energy Report',
    description: 'Comprehensive overview of energy consumption and costs',
    icon: FileText,
  },
  {
    id: 'temp-2',
    title: 'Performance Analysis',
    description: 'Detailed analysis of system performance and efficiency',
    icon: BarChart2,
  },
  {
    id: 'temp-3',
    title: 'Custom Date Range',
    description: 'Generate a report for any specific time period',
    icon: Calendar,
  },
];

const statusColors: Record<ReportStatus, string> = {
  ready: 'bg-green-500',
  generating: 'bg-yellow-500',
  error: 'bg-red-500',
};

export function ReportsPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
          <p className="text-muted-foreground">
            View and manage your energy reports
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export All
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Report
          </Button>
        </div>
      </div>

      <Tabs defaultValue="available" className="space-y-4">
        <TabsList>
          <TabsTrigger value="available">Available Reports</TabsTrigger>
          <TabsTrigger value="templates">Report Templates</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="available" className="space-y-4">
          <div className="grid gap-6">
            {reports.map((report) => (
              <Card key={report.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <CardTitle>{report.title}</CardTitle>
                        <Badge variant="outline">{report.type}</Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {report.date}
                        </div>
                        <div className="flex items-center gap-1">
                          <FileText className="h-4 w-4" />
                          {report.size}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="secondary"
                        className={statusColors[report.status]}
                      >
                        {report.status}
                      </Badge>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-4">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">
                        Total Consumption
                      </p>
                      <p className="font-medium">{report.metrics.consumption}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">
                        Total Cost
                      </p>
                      <p className="font-medium">{report.metrics.cost}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">
                        Peak Demand
                      </p>
                      <p className="font-medium">{report.metrics.peak}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">
                        System Efficiency
                      </p>
                      <p className="font-medium">{report.metrics.efficiency}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-3">
            {templates.map((template) => {
              const Icon = template.icon;
              return (
                <Card key={template.id}>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Icon className="h-5 w-5 text-primary" />
                      <CardTitle>{template.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      {template.description}
                    </p>
                    <Button className="w-full">Use Template</Button>
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
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Clock className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium">No Scheduled Reports</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Schedule a new report to see it here
                </p>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Schedule Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 