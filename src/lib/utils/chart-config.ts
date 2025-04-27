import { XAxisProps, YAxisProps, AreaProps, LineProps, BarProps } from 'recharts';

export const defaultXAxisConfig: XAxisProps = {
  axisLine: { stroke: 'hsl(var(--border))', strokeWidth: 0.5 },
  tickLine: false,
  tick: { 
    fill: 'hsl(var(--muted-foreground))', 
    fontSize: 11,
    fontWeight: 500,
    fontFamily: 'var(--font-sans)',
  },
  tickMargin: 8,
  height: 32,
  padding: { left: 8, right: 8 },
};

export const defaultYAxisConfig: YAxisProps = {
  axisLine: { stroke: 'hsl(var(--border))', strokeWidth: 0.5 },
  tickLine: false,
  tick: { 
    fill: 'hsl(var(--muted-foreground))', 
    fontSize: 11,
    fontWeight: 500,
    fontFamily: 'var(--font-sans)',
  },
  tickMargin: 8,
  width: 48,
  padding: { top: 8, bottom: 8 },
  tickFormatter: (value: number) => {
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}k`;
    }
    return value.toString();
  },
};

export const defaultCartesianGridConfig = {
  stroke: 'hsl(var(--border))',
  strokeDasharray: '2 2',
  strokeOpacity: 0.1,
  vertical: false,
};

export const defaultAreaStyle: Partial<AreaProps> = {
  stroke: 'hsl(var(--primary))',
  fill: 'hsl(var(--primary))',
  fillOpacity: 0.1,
  strokeWidth: 2,
  type: 'monotone',
};

export const defaultLineStyle: Partial<LineProps> = {
  stroke: 'hsl(var(--primary))',
  strokeWidth: 2,
  type: 'monotone',
  dot: {
    fill: 'hsl(var(--primary))',
    stroke: 'hsl(var(--background))',
    strokeWidth: 2,
    r: 4,
  },
  activeDot: {
    fill: 'hsl(var(--background))',
    stroke: 'hsl(var(--primary))',
    strokeWidth: 2,
    r: 6,
  },
};

export const defaultBarStyle: Partial<BarProps> = {
  fill: 'hsl(var(--primary))',
  radius: [4, 4, 0, 0],
};

export const defaultTooltipConfig = {
  contentStyle: { 
    backgroundColor: 'hsl(var(--background))',
    border: '1px solid hsl(var(--border))',
    borderRadius: 'var(--radius)',
    boxShadow: 'var(--shadow-sm)',
  },
  labelStyle: {
    color: 'hsl(var(--foreground))',
    fontSize: 12,
    fontWeight: 500,
    fontFamily: 'var(--font-sans)',
  },
}; 