import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface PaywallContextType {
  isVisible: boolean;
  trigger: 'ai' | 'session' | 'feature' | 'general';
  openPaywall: (trigger?: 'ai' | 'session' | 'feature' | 'general') => void;
  closePaywall: () => void;
}

const PaywallContext = createContext<PaywallContextType | undefined>(undefined);

export function PaywallProvider({ children }: { children: ReactNode }) {
  const [isVisible, setIsVisible] = useState(false);
  const [trigger, setTrigger] = useState<'ai' | 'session' | 'feature' | 'general'>('general');

  const openPaywall = useCallback((newTrigger: 'ai' | 'session' | 'feature' | 'general' = 'general') => {
    setTrigger(newTrigger);
    setIsVisible(true);
  }, []);

  const closePaywall = useCallback(() => {
    setIsVisible(false);
  }, []);

  return (
    <PaywallContext.Provider value={{ isVisible, trigger, openPaywall, closePaywall }}>
      {children}
    </PaywallContext.Provider>
  );
}

export function usePaywall() {
  const context = useContext(PaywallContext);
  if (context === undefined) {
    throw new Error('usePaywall must be used within a PaywallProvider');
  }
  return context;
}
