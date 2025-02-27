import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeType = 'light' | 'dark';

interface ThemeContextType {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
  colors: typeof themes.light;
}

export type ThemeColors = {
  primary: string;
  secondary: string;
  background: string;
  cardBackground: string;
  text: string;
  textSecondary: string;
  success: string;
  error: string;
  border: string;
  inputBackground: string;
};

const themes = {
  light: {
    primary: '#614385',
    secondary: '#516395',
    background: '#F8F9FA',
    cardBackground: '#FFFFFF',
    text: '#2C3E50',
    textSecondary: '#666666',
    success: '#4CAF50',
    error: '#FF5252',
    border: '#F0F2F5',
    inputBackground: '#F8F9FA',
  },
  dark: {
    primary: '#614385',
    secondary: '#516395',
    background: '#1A1A1A',
    cardBackground: '#2D2D2D',
    text: '#FFFFFF',
    textSecondary: '#BBBBBB',
    success: '#4CAF50',
    error: '#FF5252',
    border: '#3D3D3D',
    inputBackground: '#363636',
  },
};

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  setTheme: () => {},
  colors: themes.light,
});

export function useTheme() {
  return useContext(ThemeContext);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<ThemeType>('light');

  useEffect(() => {
    // Load saved theme
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('theme');
        if (savedTheme) {
          setTheme(savedTheme as ThemeType);
        }
      } catch (error) {
        console.error('Error loading theme:', error);
      }
    };
    loadTheme();
  }, []);

  const value = {
    theme,
    setTheme,
    colors: themes[theme],
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}
