"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { Settings } from "lucide-react";

interface DecimalPrecisionControlProps {
  value: number;
  maxValue: number;
  onChange: (value: number) => void;
}

export function DecimalPrecisionControl({ 
  value, 
  maxValue, 
  onChange 
}: DecimalPrecisionControlProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon"
          className="fixed bottom-4 right-4 rounded-full shadow-lg"
          title="Decimal Precision"
        >
          <Settings className="h-5 w-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-80 p-4"
        align="end"
        side="top"
      >
        <div className="space-y-4">
          <h4 className="font-medium">Decimal Precision</h4>
          <p className="text-sm text-muted-foreground">
            Adjust the number of decimal places shown in metrics
          </p>
          <div className="space-y-2">
            <Slider
              value={[value]}
              max={maxValue}
              step={1}
              onValueChange={([newValue]) => onChange(newValue)}
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>0 decimals</span>
              <span>{maxValue} decimals</span>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
} 