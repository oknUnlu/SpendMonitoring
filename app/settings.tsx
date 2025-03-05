import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useTheme, themeOptions } from '../context/ThemeContext';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCurrency } from '../context/CurrencyContext';

const currencies = [
  { code: 'USD', symbol: '$' },
  { code: 'EUR', symbol: '€' },
  { code: 'GBP', symbol: '£' },
  { code: 'TRY', symbol: '₺' },
  { code: 'JPY', symbol: '¥' },
];

const Settings = () => {
  const { theme, setTheme } = useTheme();
  const { currency, setCurrency } = useCurrency();
  const [isDarkMode, setIsDarkMode] = useState(theme.name === 'dark');

  const handleThemeChange = () => {
    const newTheme = isDarkMode ? 'light' : 'dark';
    setIsDarkMode(!isDarkMode);
    setTheme(newTheme);
    AsyncStorage.setItem('theme', newTheme);
  };

  const handleCurrencySelect = (currencyCode: string) => {
    const selectedCurrency = currencies.find(c => c.code === currencyCode);
    if (selectedCurrency) {
      setCurrency({
        code: selectedCurrency.code,
        symbol: selectedCurrency.symbol
      });
    }
  };

  const exportData = async (format: 'CSV' | 'PDF') => {
    try {
      const transactions = await AsyncStorage.getItem('transactions');
      if (!transactions) {
        Alert.alert('No Data', 'There are no transactions to export.');
        return;
      }

      let content = '';
      const data = JSON.parse(transactions);

      if (format === 'CSV') {
        // CSV başlık
        content = 'Date,Type,Amount,Category,Description\n';
        // Verileri CSV formatına dönüştür
        data.forEach((t: any) => {
          content += `${t.date},${t.type},${t.amount},${t.category},"${t.description}"\n`;
        });

        const fileUri = `${FileSystem.documentDirectory}transactions.csv`;
        await FileSystem.writeAsStringAsync(fileUri, content);
        await Sharing.shareAsync(fileUri);
      } else {
        // PDF oluşturma işlemi burada yapılacak
        Alert.alert('Coming Soon', 'PDF export will be available soon.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to export data.');
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.secondary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <MaterialIcons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Settings</Text>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        {/* Theme Options Section */}
        <View style={[styles.section, { backgroundColor: theme.colors.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Choose Your Theme</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.themeList}>
            {Object.entries(themeOptions).map(([key, option]) => (
              <TouchableOpacity
                key={key}
                style={[
                  styles.themeOption,
                  { backgroundColor: option.colors.cardBackground },
                  theme.name === option.name && styles.selectedTheme
                ]}
                onPress={() => setTheme(key)}
              >
                <LinearGradient
                  colors={[option.colors.primary, option.colors.secondary]}
                  style={styles.themeColorPreview}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                />
                <Text style={[styles.themeText, { color: option.colors.text }]}>
                  {option.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Currency Section */}
        <View style={[styles.section, { backgroundColor: theme.colors.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Select Currency</Text>
          <View style={styles.currencyGrid}>
            {currencies.map(curr => (
              <TouchableOpacity
                key={curr.code}
                style={[
                  styles.currencyOption,
                  { backgroundColor: theme.colors.inputBackground },
                  currency.code === curr.code && styles.selectedCurrency
                ]}
                onPress={() => handleCurrencySelect(curr.code)}
              >
                <Text style={[styles.currencySymbol, { 
                  color: currency.code === curr.code ? '#FFF' : theme.colors.primary 
                }]}>{curr.symbol}</Text>
                <Text style={[styles.currencyCode, { 
                  color: currency.code === curr.code ? '#FFF' : theme.colors.text 
                }]}>{curr.code}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Export Section */}
        <View style={[styles.section, { backgroundColor: theme.colors.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Export Data</Text>
          <View style={styles.exportButtons}>
            {['CSV', 'PDF'].map((format) => (
              <TouchableOpacity
                key={format}
                style={[styles.exportButton, { backgroundColor: theme.colors.inputBackground }]}
                onPress={() => exportData(format as 'CSV' | 'PDF')}
              >
                <MaterialIcons 
                  name={format === 'CSV' ? 'file-download' : 'picture-as-pdf'} 
                  size={24} 
                  color={theme.colors.primary} 
                />
                <Text style={[styles.exportButtonText, { color: theme.colors.text }]}>
                  Export as {format}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerGradient: {
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
    marginLeft: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: 16,
  },
  section: {
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 20,
  },
  themeList: {
    marginBottom: 8,
  },
  themeOption: {
    padding: 16,
    borderRadius: 16,
    marginRight: 12,
    width: 120,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  selectedTheme: {
    transform: [{scale: 1.05}],
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  themeColorPreview: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginBottom: 12,
  },
  themeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  currencyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  currencyOption: {
    width: '30%',
    aspectRatio: 1,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  selectedCurrency: {
    backgroundColor: '#614385',
    transform: [{scale: 1.05}],
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  currencyCode: {
    fontSize: 14,
    fontWeight: '600',
  },
  exportButtons: {
    gap: 12,
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    gap: 12,
  },
  exportButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default Settings;
