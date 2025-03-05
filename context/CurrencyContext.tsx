import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type CurrencyType = {
  code: string;
  symbol: string;
};

interface CurrencyContextType {
  currency: CurrencyType;
  setCurrency: (currency: CurrencyType) => void;
}

const defaultCurrency: CurrencyType = {
  code: 'USD',
  symbol: '$'
};

const CurrencyContext = createContext<CurrencyContextType>({
  currency: defaultCurrency,
  setCurrency: () => {}
});

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currency, setCurrency] = useState<CurrencyType>(defaultCurrency);

  useEffect(() => {
    // Load saved currency from AsyncStorage
    const loadCurrency = async () => {
      try {
        const savedCurrency = await AsyncStorage.getItem('currency');
        if (savedCurrency) {
          setCurrency(JSON.parse(savedCurrency));
        }
      } catch (error) {
        console.error('Error loading currency:', error);
      }
    };
    loadCurrency();
  }, []);

  const handleSetCurrency = async (newCurrency: CurrencyType) => {
    try {
      await AsyncStorage.setItem('currency', JSON.stringify(newCurrency));
      setCurrency(newCurrency);
    } catch (error) {
      console.error('Error saving currency:', error);
    }
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency: handleSetCurrency }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => useContext(CurrencyContext);
