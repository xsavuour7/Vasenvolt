"use client";

import { MainLayout } from "@/components/layout/main-layout";
import { DecimalPrecisionControl } from '@/components/settings/decimal-precision-control';
import { useDecimalPrecision } from '@/contexts/decimal-precision-context';

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const { precision, maxPrecision, setPrecision } = useDecimalPrecision();
  
  return (
    <>
      <MainLayout>
        {children}
      </MainLayout>
      <DecimalPrecisionControl 
        value={precision}
        maxValue={maxPrecision}
        onChange={setPrecision}
      />
    </>
  );
} 