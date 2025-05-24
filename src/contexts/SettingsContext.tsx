import React, { createContext, useContext, useEffect, useState } from 'react';

interface RecurrenceDefaults {
  daily: number;   // days
  weekly: number;  // weeks
  monthly: number; // months
  yearly: number;  // years
}

interface SettingsContextType {
  recurrenceDefaults: RecurrenceDefaults;
  updateRecurrenceDefaults: (newDefaults: Partial<RecurrenceDefaults>) => void;
}

const defaultRecurrenceDefaults: RecurrenceDefaults = {
  daily: 30,   // days
  weekly: 8,   // weeks
  monthly: 12, // months
  yearly: 5    // years
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [recurrenceDefaults, setRecurrenceDefaults] = useState<RecurrenceDefaults>(defaultRecurrenceDefaults);

  // Load settings from localStorage on initial load
  useEffect(() => {
    const savedSettings = localStorage.getItem('recurrenceDefaults');
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        
        // Ensure all values are valid numbers and at least 1
        const validatedSettings: Partial<RecurrenceDefaults> = {};
        
        if (typeof parsedSettings.daily === 'number' && !isNaN(parsedSettings.daily) && parsedSettings.daily >= 1) {
          validatedSettings.daily = parsedSettings.daily;
        }
        
        if (typeof parsedSettings.weekly === 'number' && !isNaN(parsedSettings.weekly) && parsedSettings.weekly >= 1) {
          validatedSettings.weekly = parsedSettings.weekly;
        }
        
        if (typeof parsedSettings.monthly === 'number' && !isNaN(parsedSettings.monthly) && parsedSettings.monthly >= 1) {
          validatedSettings.monthly = parsedSettings.monthly;
        }
        
        if (typeof parsedSettings.yearly === 'number' && !isNaN(parsedSettings.yearly) && parsedSettings.yearly >= 1) {
          validatedSettings.yearly = parsedSettings.yearly;
        }
        
        setRecurrenceDefaults({
          ...defaultRecurrenceDefaults,
          ...validatedSettings
        });
      } catch (e) {
        console.error('Failed to parse saved recurrence defaults', e);
      }
    }
  }, []);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('recurrenceDefaults', JSON.stringify(recurrenceDefaults));
  }, [recurrenceDefaults]);

  const updateRecurrenceDefaults = (newDefaults: Partial<RecurrenceDefaults>) => {
    // Validate that all values are at least 1
    const validatedDefaults: Partial<RecurrenceDefaults> = {};
    
    if (newDefaults.daily !== undefined) {
      validatedDefaults.daily = Math.max(1, newDefaults.daily);
    }
    
    if (newDefaults.weekly !== undefined) {
      validatedDefaults.weekly = Math.max(1, newDefaults.weekly);
    }
    
    if (newDefaults.monthly !== undefined) {
      validatedDefaults.monthly = Math.max(1, newDefaults.monthly);
    }
    
    if (newDefaults.yearly !== undefined) {
      validatedDefaults.yearly = Math.max(1, newDefaults.yearly);
    }
    
    setRecurrenceDefaults(prev => ({
      ...prev,
      ...validatedDefaults
    }));
  };

  return (
    <SettingsContext.Provider value={{ recurrenceDefaults, updateRecurrenceDefaults }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}; 