import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { MaterialIcons } from '@expo/vector-icons';
import { useCurrency } from '../../context/CurrencyContext';
import { useTheme } from '../../context/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { categoryColors, Category } from '../categories';

const { width } = Dimensions.get('window');

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const MonthlyTab = () => {
  const { currency } = useCurrency();
  const { theme } = useTheme();
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [transactions, setTransactions] = useState<any[]>([]);
  const [monthlyData, setMonthlyData] = useState<{
    total: number;
    byCategory: Record<Category, number>;
    dailyTotals: number[];
  }>({
    total: 0,
    byCategory: {} as Record<Category, number>,
    dailyTotals: [],
  });

  useEffect(() => {
    loadTransactions();
  }, [selectedMonth, selectedYear]);

  const loadTransactions = async () => {
    try {
      const saved = await AsyncStorage.getItem('transactions');
      if (saved) {
        const allTransactions = JSON.parse(saved);
        const filtered = allTransactions.filter((t: any) => {
          const date = new Date(t.date);
          return date.getMonth() === selectedMonth && date.getFullYear() === selectedYear;
        });
        setTransactions(filtered);
        calculateMonthlyData(filtered);
      } else {
        console.warn('No transactions found in storage');
        setTransactions([]);
        setMonthlyData({
          total: 0,
          byCategory: {
            Restaurants: 0,
            Entertainment: 0,
            Salary: 0,
            Shopping: 0,
            Transport: 0,
            Healthcare: 0,
            Education: 0,
            Housing: 0,
            Utilities: 0,
            Insurance: 0,
            Savings: 0,
            Investment: 0,
            Travel: 0,
            Groceries: 0,
            Other: 0
          },
          dailyTotals: []
        });
      }
    } catch (error) {
      console.error('Error loading transactions:', error);
    }
  };

  const calculateMonthlyData = (monthTransactions: any[]) => {
    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    const dailyTotals = Array(daysInMonth).fill(1); // Initialize with 1 instead of 0
    let total = 0;
    const byCategory: Record<Category, number> = {} as Record<Category, number>;

    monthTransactions.forEach(t => {
      const date = new Date(t.date);
      const day = date.getDate() - 1;
      const amount = t.type === 'expense' ? -t.amount : t.amount;
      
      dailyTotals[day] = Math.max(1, Math.abs(amount)); // Ensure minimum value is 1
      total += amount;
      
      if (t.type === 'expense' && t.category) {
        byCategory[t.category as Category] = (byCategory[t.category as Category] || 0) + t.amount;
      }
    });

    setMonthlyData({ total, byCategory, dailyTotals });
  };

  const formatAmount = (amount: number) => `${currency.symbol}${Math.abs(amount).toFixed(2)}`;

  const navigateMonth = (direction: 'prev' | 'next') => {
    let newMonth = selectedMonth;
    let newYear = selectedYear;

    if (direction === 'next') {
      if (selectedMonth === 11) {
        newMonth = 0;
        newYear++;
      } else {
        newMonth++;
      }
    } else {
      if (selectedMonth === 0) {
        newMonth = 11;
        newYear--;
      } else {
        newMonth--;
      }
    }

    setSelectedMonth(newMonth);
    setSelectedYear(newYear);
  };

  const chartConfig = {
    backgroundColor: theme.colors.cardBackground,
    backgroundGradientFrom: theme.colors.cardBackground,
    backgroundGradientTo: theme.colors.cardBackground,
    color: (opacity = 1) => `rgba(${theme.isDark ? '255, 255, 255,' : '0, 0, 0,'} ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
    decimalPlaces: 0,
    formatYLabel: (yLabel: string) => Math.round(parseFloat(yLabel)).toString(),
    propsForDots: {
      r: "4",
      strokeWidth: "2",
      stroke: theme.colors.primary
    }
  };

  const chartData = {
    labels: monthlyData.dailyTotals.map((_, i) => `${i + 1}`).filter((_, i) => i % 3 === 0), // Show every third day
    datasets: [{
      data: monthlyData.dailyTotals.length > 0 ? monthlyData.dailyTotals : [1], // Provide fallback data
      color: (opacity = 1) => theme.colors.primary,
      strokeWidth: 2,
    }],
  };

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Month Selector with Shadow */}
      <View style={[styles.monthSelector, { 
        backgroundColor: theme.colors.cardBackground,
        shadowColor: theme.colors.text,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
      }]}>
        <TouchableOpacity 
          style={styles.monthArrowButton} 
          onPress={() => navigateMonth('prev')}
        >
          <MaterialIcons name="chevron-left" size={30} color={theme.colors.primary} />
        </TouchableOpacity>
        <Text style={[styles.monthText, { color: theme.colors.text }]}>
          {months[selectedMonth]} {selectedYear}
        </Text>
        <TouchableOpacity 
          style={styles.monthArrowButton} 
          onPress={() => navigateMonth('next')}
        >
          <MaterialIcons name="chevron-right" size={30} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Monthly Summary */}
      <View style={[styles.summaryCard, { backgroundColor: theme.colors.cardBackground }]}>
        <Text style={[styles.summaryTitle, { color: theme.colors.textSecondary }]}>Monthly Total</Text>
        <Text style={[styles.summaryAmount, { color: theme.colors.text }]}>
          {formatAmount(monthlyData.total)}
        </Text>
      </View>

      {/* Spending Chart */}
      <View style={[styles.chartCard, { backgroundColor: theme.colors.cardBackground }]}>
        <Text style={[styles.chartTitle, { color: theme.colors.text }]}>Daily Spending</Text>
        <LineChart
          data={chartData}
          width={width - 40}
          height={220}
          chartConfig={chartConfig}
          bezier
          style={styles.chart}
          withInnerLines={true}
          withOuterLines={true}
          withVerticalLines={false}
          withHorizontalLines={true}
          withVerticalLabels={true}
          withHorizontalLabels={true}
          fromZero={true}
          segments={4}
        />
      </View>

      {/* Category Breakdown */}
      <View style={[styles.categoriesCard, { backgroundColor: theme.colors.cardBackground }]}>
        <Text style={[styles.categoriesTitle, { color: theme.colors.text }]}>Category Breakdown</Text>
        {Object.entries(monthlyData.byCategory)
          .sort(([, a], [, b]) => b - a)
          .map(([category, amount]) => (
            <View key={category} style={styles.categoryRow}>
              <View style={styles.categoryInfo}>
                <View style={[styles.categoryDot, { backgroundColor: categoryColors[category as Category] || 'gray' }]} />
                <Text style={[styles.categoryName, { color: theme.colors.text }]}>{category}</Text>
              </View>
              <Text style={[styles.categoryAmount, { color: theme.colors.text }]}>
                {formatAmount(amount)}
              </Text>
            </View>
          ))}
      </View>

      {/* Transactions List */}
      <View style={[styles.transactionsCard, { backgroundColor: theme.colors.cardBackground }]}>
        <Text style={[styles.transactionsTitle, { color: theme.colors.text }]}>Transactions</Text>
        {transactions.map((t, index) => (
          <View key={index} style={styles.transaction}>
            <View style={styles.transactionLeft}>
              <Text style={[styles.transactionDate, { color: theme.colors.textSecondary }]}>
                {new Date(t.date).toLocaleDateString()}
              </Text>
              <Text style={[styles.transactionDescription, { color: theme.colors.text }]}>
                {t.description}
              </Text>
            </View>
            <Text style={[
              styles.transactionAmount,
              { color: t.type === 'expense' ? theme.colors.error : theme.colors.success }
            ]}>
              {t.type === 'expense' ? '-' : '+'}{formatAmount(t.amount)}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  monthSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginVertical: 16,
    marginHorizontal: 20,
  },
  monthArrowButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(97, 67, 133, 0.1)',
  },
  monthText: {
    fontSize: 20,
    fontWeight: '700',
  },
  summaryCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  summaryTitle: {
    fontSize: 14,
    marginBottom: 8,
  },
  summaryAmount: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  chartCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  chart: {
    borderRadius: 16,
    marginVertical: 8,
  },
  categoriesCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
  },
  categoriesTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  categoryName: {
    fontSize: 16,
  },
  categoryAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
  transactionsCard: {
    padding: 20,
    borderRadius: 16,
  },
  transactionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  transaction: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F2F5',
  },
  transactionLeft: {
    flex: 1,
  },
  transactionDate: {
    fontSize: 12,
    marginBottom: 4,
  },
  transactionDescription: {
    fontSize: 16,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 16,
  },
});

export default MonthlyTab;
