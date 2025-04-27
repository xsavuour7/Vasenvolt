"use client";

import { createContext, useContext, useState, ReactNode } from 'react';

interface DecimalPrecisionContextType {
  precision: number;
  maxPrecision: number;
  setPrecision: (value: number) => void;
}

const DecimalPrecisionContext = createContext<DecimalPrecisionContextType | undefined>(undefined);

export function DecimalPrecisionProvider({ children }: { children: ReactNode }) {
  // In a real app, these values would come from user settings
  const [precision, setPrecision] = useState(1);
  const maxPrecision = 4; // This would be based on subscription plan

  return (
    <DecimalPrecisionContext.Provider value={{ precision, maxPrecision, setPrecision }}>
      {children}
    </DecimalPrecisionContext.Provider>
  );
}

export function useDecimalPrecision() {
  const context = useContext(DecimalPrecisionContext);
  if (context === undefined) {
    throw new Error('useDecimalPrecision must be used within a DecimalPrecisionProvider');
  }
  return context;
} 