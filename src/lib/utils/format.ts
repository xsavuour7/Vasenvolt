import { DecimalPrecision, UserSettings } from '@/lib/types/settings';

export const formatNumber = (
  value: number,
  settings: UserSettings,
  type: 'percentage' | 'decimal' = 'decimal'
): string => {
  const precision = settings.display.decimalPrecision.selected;
  
  if (type === 'percentage') {
    return `${(value * 100).toFixed(precision)}%`;
  }
  
  return value.toFixed(precision);
};

export const getMaxPrecision = (settings: UserSettings): number => {
  return settings.display.decimalPrecision.maxAllowed;
};

export const isValidPrecision = (precision: number, settings: UserSettings): boolean => {
  return precision >= 0 && precision <= settings.display.decimalPrecision.maxAllowed;
}; 