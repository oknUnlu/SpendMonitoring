import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { LineChart } from 'react-native-chart-kit';
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

export default function MonthlyTab() {
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

  // Son 30 günün verilerini hazırla
  const monthlyData = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dayTransactions = transactions
      .filter(t => new Date(t.date).toDateString() === date.toDateString())
      .reduce((sum, t) => sum + (t.type === 'expense' ? t.amount : 0), 0);
    return dayTransactions;
  }).reverse();

  const chartData = {
    labels: Array.from({ length: 30 }, (_, i) => `${i + 1}`),
    datasets: [{
      data: monthlyData,
    }],
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>Monthly Expenses</Text>
      
      <View style={styles.chartContainer}>
        <LineChart
          data={chartData}
          width={width - 40}
          height={220}
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
          bezier
          style={styles.chart}
        />
      </View>

      <View style={styles.statsContainer}>
        <Text style={[styles.statsTitle, { color: theme.text }]}>Summary</Text>
        <Text style={[styles.statsText, { color: theme.textSecondary }]}>
          Total Expenses: $
          {monthlyData.reduce((sum, amount) => sum + amount, 0).toFixed(2)}
        </Text>
        <Text style={[styles.statsText, { color: theme.textSecondary }]}>
          Average Daily: $
          {(monthlyData.reduce((sum, amount) => sum + amount, 0) / 30).toFixed(2)}
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
