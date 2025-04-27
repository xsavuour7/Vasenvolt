import { useDecimalPrecision } from '@/contexts/decimal-precision-context';

export function useFormattedNumber() {
  const { precision } = useDecimalPrecision();

  const format = (value: number, type: 'decimal' | 'percentage' = 'decimal'): string => {
    if (type === 'percentage') {
      return `${(value * 100).toFixed(precision)}%`;
    }
    return value.toFixed(precision);
  };

  return { format };
} 