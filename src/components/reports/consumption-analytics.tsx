'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Download, Filter } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';

type ConsumptionData = {
  id: string;
  department: string;
  energyType: string;
  consumption: number;
  cost: number;
  date: string;
  change: number;
};

const consumptionData: ConsumptionData[] = [
  {
    id: '1',
    department: 'Manufacturing',
    energyType: 'Electricity',
    consumption: 45000,
    cost: 6750,
    date: '2024-03-01',
    change: -5.2,
  },
  {
    id: '2',
    department: 'Office',
    energyType: 'Electricity',
    consumption: 12000,
    cost: 1800,
    date: '2024-03-01',
    change: -3.8,
  },
  {
    id: '3',
    department: 'Manufacturing',
    energyType: 'Natural Gas',
    consumption: 25000,
    cost: 3750,
    date: '2024-03-01',
    change: -2.1,
  },
  {
    id: '4',
    department: 'Office',
    energyType: 'Natural Gas',
    consumption: 8000,
    cost: 1200,
    date: '2024-03-01',
    change: -1.5,
  },
  {
    id: '5',
    department: 'Manufacturing',
    energyType: 'Electricity',
    consumption: 42000,
    cost: 6300,
    date: '2024-03-02',
    change: -6.5,
  },
];

export function ConsumptionAnalytics() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Consumption Analytics</CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select defaultValue="all">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                <SelectItem value="manufacturing">Manufacturing</SelectItem>
                <SelectItem value="office">Office</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Select defaultValue="all">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Energy Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Energy Types</SelectItem>
                <SelectItem value="electricity">Electricity</SelectItem>
                <SelectItem value="natural-gas">Natural Gas</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Input
              type="date"
              className="w-[180px]"
              defaultValue="2024-03-01"
            />
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Department</TableHead>
              <TableHead>Energy Type</TableHead>
              <TableHead>Consumption (kWh)</TableHead>
              <TableHead>Cost ($)</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Change (%)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {consumptionData.map((data) => (
              <TableRow key={data.id}>
                <TableCell className="font-medium">{data.department}</TableCell>
                <TableCell>{data.energyType}</TableCell>
                <TableCell>{data.consumption.toLocaleString()}</TableCell>
                <TableCell>${data.cost.toLocaleString()}</TableCell>
                <TableCell>{data.date}</TableCell>
                <TableCell
                  className={
                    data.change >= 0 ? 'text-green-500' : 'text-red-500'
                  }
                >
                  {data.change > 0 ? '+' : ''}
                  {data.change}%
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
} 