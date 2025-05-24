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
        setRecurrenceDefaults({
          ...defaultRecurrenceDefaults,
          ...parsedSettings
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
    setRecurrenceDefaults(prev => ({
      ...prev,
      ...newDefaults
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