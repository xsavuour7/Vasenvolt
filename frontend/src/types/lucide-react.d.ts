declare module 'lucide-react' {
  import { FC, SVGProps } from 'react';
  
  export interface LucideProps extends SVGProps<SVGSVGElement> {
    size?: number | string;
    absoluteStrokeWidth?: boolean;
  }
  
  export type LucideIcon = FC<LucideProps>;
  
  export const Zap: LucideIcon;
  export const BarChart: LucideIcon;
  export const Brain: LucideIcon;
  export const Globe: LucideIcon;
  export const Leaf: LucideIcon;
  export const Lightbulb: LucideIcon;
  export const Shield: LucideIcon;
  export const Sparkles: LucideIcon;
} 