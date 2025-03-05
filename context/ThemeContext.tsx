import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

export type ThemeOption = {
  name: string;
  colors: ThemeColors;
  isDark: boolean;
};

export const themeOptions: Record<string, ThemeOption> = {
  light: {
    name: 'Light',
    isDark: false,
    colors: {
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
    }
  },
  dark: {
    name: 'Dark',
    isDark: true,
    colors: {
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
    }
  },
  purple: {
    name: 'Purple',
    isDark: false,
    colors: {
      primary: '#9C27B0',
      secondary: '#BA68C8',
      background: '#FAF5FB',
      cardBackground: '#FFFFFF',
      text: '#3C1053',
      textSecondary: '#6D478D',
      success: '#6B2E78',
      error: '#D81B60',
      border: '#F3E5F5',
      inputBackground: '#F8F9FA',
    }
  },
  blue: {
    name: 'Blue',
    isDark: false,
    colors: {
      primary: '#1A73E8',
      secondary: '#4285F4',
      background: '#F5F8FF',
      cardBackground: '#FFFFFF',
      text: '#202124',
      textSecondary: '#5F6368',
      success: '#34A853',
      error: '#EA4335',
      border: '#E8F0FE',
      inputBackground: '#F8F9FA',
    }
  },
  green: {
    name: 'Green',
    isDark: false,
    colors: {
      primary: '#2E7D32',
      secondary: '#4CAF50',
      background: '#F1F8E9',
      cardBackground: '#FFFFFF',
      text: '#1B5E20',
      textSecondary: '#558B2F',
      success: '#43A047',
      error: '#E53935',
      border: '#DCEDC8',
      inputBackground: '#F8F9FA',
    }
  },
  ocean: {
    name: 'Ocean',
    isDark: false,
    colors: {
      primary: '#006D77',
      secondary: '#83C5BE',
      background: '#F8FAFA',
      cardBackground: '#FFFFFF',
      text: '#1A3C40',
      textSecondary: '#4B777D',
      success: '#2A9D8F',
      error: '#E76F51',
      border: '#E0ECEB',
      inputBackground: '#F5F9F9',
    }
  },
  sunset: {
    name: 'Sunset',
    isDark: false,
    colors: {
      primary: '#FF7B54',
      secondary: '#FFB26B',
      background: '#FFF6F0',
      cardBackground: '#FFFFFF',
      text: '#2C1810',
      textSecondary: '#7D4F3F',
      success: '#68B984',
      error: '#D64545',
      border: '#FFE6D6',
      inputBackground: '#FFF9F5',
    }
  },
  midnight: {
    name: 'Midnight',
    isDark: true,
    colors: {
      primary: '#845EC2',
      secondary: '#4B4453',
      background: '#1E1E2E',
      cardBackground: '#2D2D44',
      text: '#FFFFFF',
      textSecondary: '#B2B2D0',
      success: '#00C9A7',
      error: '#FF8066',
      border: '#3D3D5C',
      inputBackground: '#363652',
    }
  },
  mint: {
    name: 'Mint',
    isDark: false,
    colors: {
      primary: '#4ECCA3',
      secondary: '#68B984',
      background: '#F7FEFC',
      cardBackground: '#FFFFFF',
      text: '#1B4D3E',
      textSecondary: '#508068',
      success: '#2D8B74',
      error: '#FF6B6B',
      border: '#E0F5EE',
      inputBackground: '#F2FBF8',
    }
  },
  rose: {
    name: 'Rose',
    isDark: false,
    colors: {
      primary: '#FF4C7C',
      secondary: '#FF8FA3',
      background: '#FFF5F7',
      cardBackground: '#FFFFFF',
      text: '#4A1525',
      textSecondary: '#8E445B',
      success: '#00B894',
      error: '#EB4D4B',
      border: '#FFE9EE',
      inputBackground: '#FFF8FA',
    }
  },
  galaxy: {
    name: 'Galaxy',
    isDark: true,
    colors: {
      primary: '#7F5AF0',
      secondary: '#2CB67D',
      background: '#16161A',
      cardBackground: '#242629',
      text: '#FFFFFE',
      textSecondary: '#94A1B2',
      success: '#2CB67D',
      error: '#EF4565',
      border: '#343639',
      inputBackground: '#2F3134',
    }
  },
  coffee: {
    name: 'Coffee',
    isDark: false,
    colors: {
      primary: '#C8973F',
      secondary: '#A17C45',
      background: '#FDF8F2',
      cardBackground: '#FFFFFF',
      text: '#3E2A1B',
      textSecondary: '#76614C',
      success: '#739E82',
      error: '#CB4F4F',
      border: '#F3E6D8',
      inputBackground: '#FBF6F0',
    }
  }
};

interface ThemeContextType {
  theme: ThemeOption;
  setTheme: (themeName: string) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: themeOptions.light,
  setTheme: () => {}
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<ThemeOption>(themeOptions.light);

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('themeName');
        if (savedTheme && themeOptions[savedTheme]) {
          setTheme(themeOptions[savedTheme]);
        }
      } catch (error) {
        console.error('Error loading theme:', error);
      }
    };
    loadTheme();
  }, []);

  const handleSetTheme = async (themeName: string) => {
    if (themeOptions[themeName]) {
      try {
        await AsyncStorage.setItem('themeName', themeName);
        setTheme(themeOptions[themeName]);
      } catch (error) {
        console.error('Error saving theme:', error);
      }
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme: handleSetTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
