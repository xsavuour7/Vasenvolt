import { useState, useEffect } from 'react';
import { UserSettings, PLAN_DECIMAL_LIMITS, DecimalPrecision } from '@/lib/types/settings';
import { userSettingsService } from '@/lib/firebase/services';

export function useSettings() {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        // For demo purposes, we'll use a mock settings object
        // In the real app, this would come from userSettingsService
        const mockSettings: UserSettings = {
          display: {
            decimalPrecision: {
              maxAllowed: PLAN_DECIMAL_LIMITS.pro, // Default to pro plan for demo
              selected: 1 as DecimalPrecision, // Default to 1 decimal place
            },
            // ... other display settings
          },
          subscription: {
            plan: 'pro',
            // ... other subscription details
          },
          // ... other settings
        };
        setSettings(mockSettings);
      } catch (error) {
        console.error('Error fetching settings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const updateDecimalPrecision = async (precision: DecimalPrecision) => {
    if (!settings) return;
    
    try {
      const newSettings = {
        ...settings,
        display: {
          ...settings.display,
          decimalPrecision: {
            ...settings.display.decimalPrecision,
            selected: precision,
          },
        },
      };
      
      // In the real app, this would update the settings in Firestore
      // await userSettingsService.updateSettings(userId, newSettings);
      setSettings(newSettings);
    } catch (error) {
      console.error('Error updating decimal precision:', error);
    }
  };

  return {
    settings,
    loading,
    updateDecimalPrecision,
  };
} 