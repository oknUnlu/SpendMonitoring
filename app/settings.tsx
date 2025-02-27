import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTheme, ThemeType } from '../context/ThemeContext';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import AsyncStorage from '@react-native-async-storage/async-storage';

const currencies = [
  { code: 'USD', symbol: '$' },
  { code: 'EUR', symbol: '€' },
  { code: 'GBP', symbol: '£' },
  { code: 'TRY', symbol: '₺' },
  { code: 'JPY', symbol: '¥' },
];

const Settings = () => {
  const { theme, setTheme } = useTheme();
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [isDarkMode, setIsDarkMode] = useState(theme === 'dark');

  const handleThemeChange = () => {
    const newTheme = isDarkMode ? 'light' : 'dark';
    setIsDarkMode(!isDarkMode);
    setTheme(newTheme);
    AsyncStorage.setItem('theme', newTheme);
  };

  const handleCurrencySelect = (currency: string) => {
    setSelectedCurrency(currency);
    AsyncStorage.setItem('currency', currency);
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
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <MaterialIcons name="arrow-back" size={24} color={isDarkMode ? '#FFF' : '#2C3E50'} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: isDarkMode ? '#FFF' : '#2C3E50' }]}>Settings</Text>
      </View>

      {/* Theme Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: isDarkMode ? '#FFF' : '#2C3E50' }]}>Appearance</Text>
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <MaterialIcons name="dark-mode" size={24} color={isDarkMode ? '#FFF' : '#2C3E50'} />
            <Text style={[styles.settingText, { color: isDarkMode ? '#FFF' : '#2C3E50' }]}>Dark Mode</Text>
          </View>
          <Switch
            value={isDarkMode}
            onValueChange={handleThemeChange}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={isDarkMode ? '#f5dd4b' : '#f4f3f4'}
          />
        </View>
      </View>

      {/* Currency Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: isDarkMode ? '#FFF' : '#2C3E50' }]}>Currency</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.currencyList}>
          {currencies.map(currency => (
            <TouchableOpacity
              key={currency.code}
              style={[
                styles.currencyOption,
                selectedCurrency === currency.code && styles.selectedCurrency,
                { backgroundColor: isDarkMode ? '#333' : '#FFF' }
              ]}
              onPress={() => handleCurrencySelect(currency.code)}
            >
              <Text style={[
                styles.currencyText,
                selectedCurrency === currency.code && styles.selectedCurrencyText,
                { color: isDarkMode ? '#FFF' : '#2C3E50' }
              ]}>
                {currency.symbol} {currency.code}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Export Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: isDarkMode ? '#FFF' : '#2C3E50' }]}>Export Data</Text>
        <View style={styles.exportButtons}>
          <TouchableOpacity
            style={[styles.exportButton, { backgroundColor: isDarkMode ? '#333' : '#FFF' }]}
            onPress={() => exportData('CSV')}
          >
            <MaterialIcons name="file-download" size={24} color="#614385" />
            <Text style={[styles.exportButtonText, { color: isDarkMode ? '#FFF' : '#2C3E50' }]}>Export as CSV</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.exportButton, { backgroundColor: isDarkMode ? '#333' : '#FFF' }]}
            onPress={() => exportData('PDF')}
          >
            <MaterialIcons name="picture-as-pdf" size={24} color="#614385" />
            <Text style={[styles.exportButtonText, { color: isDarkMode ? '#FFF' : '#2C3E50' }]}>Export as PDF</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F2F5',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F2F5',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingText: {
    fontSize: 16,
  },
  currencyList: {
    flexDirection: 'row',
  },
  currencyOption: {
    padding: 12,
    borderRadius: 8,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  selectedCurrency: {
    backgroundColor: '#614385',
  },
  currencyText: {
    fontSize: 16,
  },
  selectedCurrencyText: {
    color: 'white',
  },
  exportButtons: {
    gap: 12,
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    gap: 12,
  },
  exportButtonText: {
    fontSize: 16,
  },
});

export default Settings;
