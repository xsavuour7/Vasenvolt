import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { defaultXAxisConfig, defaultYAxisConfig, defaultCartesianGridConfig } from '@/lib/utils/chart-config';

const monthlyData = [
  { month: 'Jan', savings: 150 },
  { month: 'Feb', savings: 200 },
  { month: 'Mar', savings: 180 },
  { month: 'Apr', savings: 220 },
  { month: 'May', savings: 250 },
  { month: 'Jun', savings: 300 },
  { month: 'Jul', savings: 280 },
  { month: 'Aug', savings: 320 },
  { month: 'Sep', savings: 290 },
  { month: 'Oct', savings: 260 },
  { month: 'Nov', savings: 230 },
  { month: 'Dec', savings: 200 },
];

const yearlyData = [
  { year: '2020', savings: 2500 },
  { year: '2021', savings: 2800 },
  { year: '2022', savings: 3000 },
  { year: '2023', savings: 3200 },
  { year: '2024', savings: 3500 },
];

export function EnergySavings() {
  return (
    <div className="space-y-8">
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={monthlyData}
            margin={{ top: 16, right: 16, left: 8, bottom: 8 }}
          >
            <CartesianGrid {...defaultCartesianGridConfig} />
            <XAxis 
              dataKey="month" 
              {...defaultXAxisConfig}
            />
            <YAxis 
              {...defaultYAxisConfig}
              label={{ 
                value: 'kWh', 
                angle: -90, 
                position: 'insideLeft',
                style: { 
                  fill: 'hsl(var(--muted-foreground))',
                  fontSize: 11,
                  fontWeight: 500,
                  fontFamily: 'var(--font-sans)',
                }
              }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: 'var(--radius)',
                boxShadow: 'var(--shadow-sm)',
              }}
              formatter={(value: number) => [`${value} kWh`, 'Savings']}
              labelStyle={{
                color: 'hsl(var(--foreground))',
                fontSize: 12,
                fontWeight: 500,
                fontFamily: 'var(--font-sans)',
              }}
            />
            <Bar 
              dataKey="savings" 
              fill="hsl(var(--primary))" 
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={yearlyData}
            margin={{ top: 16, right: 16, left: 8, bottom: 8 }}
          >
            <CartesianGrid {...defaultCartesianGridConfig} />
            <XAxis 
              dataKey="year" 
              {...defaultXAxisConfig}
            />
            <YAxis 
              {...defaultYAxisConfig}
              label={{ 
                value: 'kWh', 
                angle: -90, 
                position: 'insideLeft',
                style: { 
                  fill: 'hsl(var(--muted-foreground))',
                  fontSize: 11,
                  fontWeight: 500,
                  fontFamily: 'var(--font-sans)',
                }
              }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: 'var(--radius)',
                boxShadow: 'var(--shadow-sm)',
              }}
              formatter={(value: number) => [`${value} kWh`, 'Savings']}
              labelStyle={{
                color: 'hsl(var(--foreground))',
                fontSize: 12,
                fontWeight: 500,
                fontFamily: 'var(--font-sans)',
              }}
            />
            <Bar 
              dataKey="savings" 
              fill="hsl(var(--primary))" 
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
} 