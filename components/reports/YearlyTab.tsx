import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { BarChart } from 'react-native-chart-kit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

interface Transaction {
  id: number;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  date: string;
  description: string;
}

export default function YearlyTab() {
  const theme = useTheme();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  
  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      const saved = await AsyncStorage.getItem('transactions');
      if (saved) {
        setTransactions(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading transactions:', error);
    }
  };

  // Son 12 ayın verilerini hazırla
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const yearlyData = Array.from({ length: 12 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const monthTransactions = transactions
      .filter(t => {
        const tDate = new Date(t.date);
        return tDate.getMonth() === date.getMonth() && 
               tDate.getFullYear() === date.getFullYear();
      })
      .reduce((sum, t) => sum + (t.type === 'expense' ? t.amount : 0), 0);
    return monthTransactions;
  }).reverse();

  const chartData = {
    labels: monthNames,
    datasets: [{
      data: yearlyData,
    }],
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>Yearly Overview</Text>
      
      <View style={styles.chartContainer}>
        <BarChart
          data={chartData}
          width={width - 40}
          height={220}
          yAxisLabel="$"
          yAxisSuffix=""
          chartConfig={{
            backgroundColor: theme.background,
            backgroundGradientFrom: theme.background,
            backgroundGradientTo: theme.background,
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(97, 67, 133, ${opacity})`,
            style: {
              borderRadius: 16,
            },
          }}
          style={styles.chart}
        />
      </View>

      <View style={styles.statsContainer}>
        <Text style={[styles.statsTitle, { color: theme.text }]}>Annual Summary</Text>
        <Text style={[styles.statsText, { color: theme.textSecondary }]}>
          Total Yearly Expenses: $
          {yearlyData.reduce((sum, amount) => sum + amount, 0).toFixed(2)}
        </Text>
        <Text style={[styles.statsText, { color: theme.textSecondary }]}>
          Average Monthly: $
          {(yearlyData.reduce((sum, amount) => sum + amount, 0) / 12).toFixed(2)}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  chartContainer: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
  },
  chart: {
    borderRadius: 16,
  },
  statsContainer: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 16,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  statsText: {
    fontSize: 16,
    marginBottom: 8,
  },
});
