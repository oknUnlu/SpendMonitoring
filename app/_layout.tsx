import React, { useState, useEffect, createContext, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Dimensions,
  Animated,
  Alert,
  Pressable
} from 'react-native';
import { MaterialIcons, Ionicons, FontAwesome5, Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Link } from 'expo-router'; 
import AsyncStorage from '@react-native-async-storage/async-storage';

import { categoryColors, categoryIcons, addCategoryIcons, categoryLimits, Category } from '../components/categories';

const { width } = Dimensions.get('window');

// Theme type definitions
type ThemeColors = {
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

type ThemeType = {
  light: ThemeColors;
  dark: ThemeColors;
  blue: ThemeColors;
  purple: ThemeColors;
  green: ThemeColors;
};

type ThemeName = keyof ThemeType;

interface Transaction {
  id: number;
  type: 'income' | 'expense';
  amount: number;
  category: Category;
  date: string;
  description: string;
}

// Theme definitions
const themes: ThemeType = {
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
  blue: {
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
  },
  purple: {
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
  },
  green: {
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
};

type ReportPeriod = 'daily' | 'monthly' | 'yearly';

interface CategoryReport {
  name: Category;
  amount: number;
  percentage: number;
}

interface PeriodData {
  total: number;
  change: number;
  categories: CategoryReport[];
  chart: number[];
}

type ReportData = Record<ReportPeriod, PeriodData>;

const reportData: ReportData = {
  daily: {
    total: 0,
    change: 0,
    categories: [],
    chart: [],
  },
  monthly: {
    total: 0,
    change: 0,
    categories: [],
    chart: [],
  },
  yearly: {
    total: 0,
    change: 0,
    categories: [],
    chart: [],
  },
};

const FinanceDashboard = () => {
  const [currentTheme, setCurrentTheme] = useState<ThemeName>('light');
  const theme = themes[currentTheme];
  const [balance, setBalance] = useState(0);
  const [selectedPeriod, setSelectedPeriod] = useState<ReportPeriod>('daily');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [newAmount, setNewAmount] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [selectedType, setSelectedType] = useState<Transaction['type']>('expense');
  const [selectedCategory, setSelectedCategory] = useState<Category>('Other');
  const [animation] = useState(new Animated.Value(0));
  const [showReports, setShowReports] = useState(false);
  const [showAllCategories, setShowAllCategories] = useState(false);

  // Load transactions from AsyncStorage when component mounts
  useEffect(() => {
    const loadTransactions = async () => {
      try {
        const savedTransactions = await AsyncStorage.getItem('transactions');
        if (savedTransactions) {
          setTransactions(JSON.parse(savedTransactions));
        }
      } catch (error) {
        console.error('Error loading transactions:', error);
      }
    };
    loadTransactions();
  }, []);

  // Save transactions to AsyncStorage whenever they change
  useEffect(() => {
    const saveTransactions = async () => {
      try {
        await AsyncStorage.setItem('transactions', JSON.stringify(transactions));
      } catch (error) {
        console.error('Error saving transactions:', error);
      }
    };
    saveTransactions();
  }, [transactions]);

  // Update balance whenever transactions change
  useEffect(() => {
    const newBalance = transactions.reduce((acc, transaction) => {
      return acc + (transaction.type === 'income' ? transaction.amount : -transaction.amount);
    }, 0);
    setBalance(newBalance);
  }, [transactions]);

  // Update report data whenever transactions change
  useEffect(() => {
    const updateReportData = () => {
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const startOfYear = new Date(today.getFullYear(), 0, 1);

      // Filter transactions for different periods
      const dailyTransactions = transactions.filter(t => new Date(t.date) >= startOfDay);
      const monthlyTransactions = transactions.filter(t => new Date(t.date) >= startOfMonth);
      const yearlyTransactions = transactions.filter(t => new Date(t.date) >= startOfYear);

      // Calculate totals for each period
      const calculatePeriodData = (periodTransactions: Transaction[]): PeriodData => {
        const total = periodTransactions.reduce((acc, t) => 
          acc + (t.type === 'income' ? t.amount : -t.amount), 0);

        // Calculate category totals
        const categoryTotals = periodTransactions.reduce((acc, t) => {
          const key = t.category;
          if (!acc[key]) acc[key] = 0;
          acc[key] += t.type === 'income' ? t.amount : -t.amount;
          return acc;
        }, {} as Record<Category, number>);

        // Convert to category reports
        const categories = Object.entries(categoryTotals).map(([category, amount]) => ({
          name: category as Category,
          amount: Math.abs(amount),
          percentage: Math.abs(amount) / Math.abs(total) * 100
        }));

        // Sort categories by amount
        categories.sort((a, b) => b.amount - a.amount);

        return {
          total,
          change: total - (periodTransactions.length > 0 ? 0 : total),
          categories,
          chart: [total] // Simplified chart data
        };
      };

      // Update report data
      reportData.daily = calculatePeriodData(dailyTransactions);
      reportData.monthly = calculatePeriodData(monthlyTransactions);
      reportData.yearly = calculatePeriodData(yearlyTransactions);
    };

    updateReportData();
  }, [transactions]);

  interface CategoryPillProps {
    category: Category;
    amount: number;
    icon?: string;
  }

  const CategoryPill = ({ category, amount, icon }: CategoryPillProps) => (
    <LinearGradient
      colors={[categoryColors[category] || categoryColors.Other, `${categoryColors[category]}99` || `${categoryColors.Other}99`]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.categoryPill}>
      <View style={styles.categoryIcon}>
        <FontAwesome5 name={icon || 'shopping-bag'} size={20} color="white" />
      </View>
      <Text style={styles.categoryText}>{category}</Text>
      <Text style={styles.categoryAmount}>${amount}</Text>
    </LinearGradient>
  );

  interface ReportChartProps {
    data: PeriodData;
    period: ReportPeriod;
  }

  const ReportChart = ({ data, period }: ReportChartProps) => {
    const maxValue = Math.max(...data.chart);
    
    return (
      <View style={styles.chartContainer}>
        <View style={styles.chart}>
          {data.chart.map((value, index) => (
            <View key={index} style={styles.barContainer}>
              <View 
                style={[
                  styles.bar, 
                  { 
                    height: `${(value / maxValue) * 100}%`,
                    backgroundColor: '#614385',
                  }
                ]} 
              />
              <Text style={styles.barLabel}>
                {period === 'daily' ? `D${index + 1}` : 
                 period === 'monthly' ? `W${index + 1}` : `Q${index + 1}`}
              </Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  useEffect(() => {
    Animated.spring(animation, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  }, []);

  // Add transaction function
  const addTransaction = () => {
    if (!newAmount || isNaN(Number(newAmount))) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    const amount = Number(newAmount);
    if (amount <= 0) {
      Alert.alert('Error', 'Amount must be greater than 0');
      return;
    }

    if (!newDescription) {
      Alert.alert('Error', 'Please enter a description');
      return;
    }

    const newTransaction: Transaction = {
      id: Date.now(),
      type: selectedType,
      amount: amount,
      category: selectedCategory,
      date: new Date().toISOString(),
      description: newDescription
    };

    setTransactions(prevTransactions => [...prevTransactions, newTransaction]);
    setNewAmount('');
    setNewDescription('');
    setSelectedCategory('Other');
    setSelectedType('expense');

    // Show success message
    // Alert.alert('Success', 'Transaction added successfully');
  };

  const renderCategorySelector = () => (
    <View style={styles.categorySelector}>
      {/* <Text style={[styles.sectionTitle, { color: theme.text }]}>Select Category</Text> */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryList}>
        {Object.keys(categoryColors).map((category) => (
          <TouchableOpacity
            key={category}
            onPress={() => setSelectedCategory(category as Category)}
            style={[
              styles.categoryOption,
              {
                backgroundColor: selectedCategory === category ? categoryColors[category as Category] : theme.cardBackground,
              },
            ]}
          >
            <MaterialIcons
              name={addCategoryIcons[category as keyof typeof addCategoryIcons] as any}
              size={24}
              color={selectedCategory === category ? 'white' : theme.text}
            />
            <Text
              style={[
                styles.categoryOptionText,
                { color: selectedCategory === category ? 'white' : theme.text },
              ]}
            >
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderAddTransactionForm = () => (
    <View style={[styles.addTransactionForm, { backgroundColor: theme.cardBackground }]}>
      <View style={styles.typeSelector}>
        <TouchableOpacity
          style={[
            styles.typeButton,
            { backgroundColor: selectedType === 'expense' ? theme.error : theme.cardBackground },
          ]}
          onPress={() => setSelectedType('expense')}
        >
          <Text style={{ color: selectedType === 'expense' ? 'white' : theme.text }}>Expense</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.typeButton,
            { backgroundColor: selectedType === 'income' ? theme.success : theme.cardBackground },
          ]}
          onPress={() => setSelectedType('income')}
        >
          <Text style={{ color: selectedType === 'income' ? 'white' : theme.text }}>Income</Text>
        </TouchableOpacity>
      </View>

      <TextInput
        style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.text }]}
        placeholder="Amount"
        placeholderTextColor={theme.textSecondary}
        keyboardType="numeric"
        value={newAmount}
        onChangeText={setNewAmount}
      />

      <TextInput
        style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.text }]}
        placeholder="Description"
        placeholderTextColor={theme.textSecondary}
        value={newDescription}
        onChangeText={setNewDescription}
      />

      {renderCategorySelector()}

      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: theme.primary }]}
        onPress={addTransaction}
      >
        <Text style={styles.addButtonText}>Add Transaction</Text>
      </TouchableOpacity>
    </View>
  );

  const ReportSection = () => (
    <View style={styles.reportsContainer}>
      <View style={styles.periodSelector}>
        <Link
          href="/reports"
          style={styles.viewReportsButton}
          asChild
        >
          <Pressable>
            <Text style={[styles.periodButtonText, { color: theme.primary }]}>View Reports</Text>
          </Pressable>
        </Link>
      </View>

      <View style={styles.reportCard}>
        <View style={styles.reportHeader}>
          <Text style={styles.reportTitle}>Total Spending</Text>
          <View style={styles.reportMetrics}>
            <Text style={styles.reportAmount}>${reportData[selectedPeriod].total}</Text>
            <View style={[
              styles.changeIndicator, 
              { backgroundColor: reportData[selectedPeriod].change > 0 ? '#4CAF5022' : '#FF525222' }
            ]}>
              <Text style={[
                styles.changeText,
                { color: reportData[selectedPeriod].change > 0 ? '#4CAF50' : '#FF5252' }
              ]}>
                {reportData[selectedPeriod].change > 0 ? '+' : ''}
                {reportData[selectedPeriod].change}%
              </Text>
            </View>
          </View>
        </View>

        <ReportChart data={reportData[selectedPeriod]} period={selectedPeriod} />

        <View style={styles.categoryBreakdown}>
          <Text style={styles.breakdownTitle}>Category Breakdown</Text>
          {reportData[selectedPeriod].categories.map((category, index) => (
            <View key={index} style={styles.breakdownItem}>
              <View style={styles.breakdownHeader}>
                <Text style={styles.breakdownCategory}>{category.name}</Text>
                <Text style={styles.breakdownAmount}>${category.amount}</Text>
              </View>
              <View style={styles.progressBarContainer}>
                <View 
                  style={[
                    styles.progressBar,
                    { 
                      width: `${category.percentage}%`,
                      backgroundColor: categoryColors[category.name] || categoryColors.Other
                    }
                  ]} 
                />
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Animated.View style={[styles.header, { opacity: animation }]}>
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeText}>Welcome back</Text>
          <Text style={styles.dateText}>February 2025</Text>
        </View>
        <View style={styles.headerButtons}>
          <TouchableOpacity 
            style={styles.reportsButton}
            onPress={() => setShowReports(!showReports)}
          >
            <Feather name="bar-chart-2" size={24} color="#2C3E50" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.profileButton}>
            <Ionicons name="person-circle-outline" size={32} color="#2C3E50" />
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Balance Card */}
      <Animated.View style={[styles.balanceCardContainer, {
        transform: [{
          scale: animation.interpolate({
            inputRange: [0, 1],
            outputRange: [0.9, 1]
          })
        }]
      }]}>
        <LinearGradient
          colors={['#614385', '#516395']}
          style={styles.balanceCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.balanceLabel}>Total Balance</Text>
          <Text style={styles.balanceAmount}>${balance.toFixed(2)}</Text>
          <View style={styles.balanceMetrics}>
            <View style={styles.metric}>
              <MaterialIcons name="arrow-upward" size={24} color="#4CAF50" />
              <Text style={styles.metricText}>Income</Text>
              <Text style={styles.metricAmount}>
                ${transactions
                  .filter(t => t.type === 'income')
                  .reduce((sum, t) => sum + t.amount, 0)
                  .toFixed(2)}
              </Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metric}>
              <MaterialIcons name="arrow-downward" size={24} color="#FF5252" />
              <Text style={styles.metricText}>Expenses</Text>
              <Text style={styles.metricAmount}>
                ${transactions
                  .filter(t => t.type === 'expense')
                  .reduce((sum, t) => sum + t.amount, 0)
                  .toFixed(2)}
              </Text>
            </View>
          </View>
        </LinearGradient>
      </Animated.View>

      {showReports ? (
        <ReportSection />
      ) : (
        <>
          {/* Quick Add Transaction */}
          <View style={styles.quickAdd}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Quick Add</Text>
              <TouchableOpacity>
                <Ionicons name="options-outline" size={24} color="#2C3E50" />
              </TouchableOpacity>
            </View>
            {renderAddTransactionForm()}
          </View>

          {/* Categories */}
          <View style={styles.categories}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Categories</Text>
              <TouchableOpacity onPress={() => setShowAllCategories(!showAllCategories)}>
                <Text style={styles.seeAllText}>{showAllCategories ? 'Show Less' : 'See All'}</Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {showAllCategories ? (
                Object.entries(categoryColors).map(([category], index) => {
                  // Calculate total amount for this category
                  const categoryTotal = transactions
                    .filter(t => t.category === category)
                    .reduce((sum, t) => sum + (t.type === 'income' ? t.amount : -t.amount), 0);

                  return (
                    <CategoryPill 
                      key={index} 
                      category={category as Category} 
                      amount={Math.abs(categoryTotal)}
                      icon={categoryIcons[category as keyof typeof categoryIcons]} 
                    />
                  );
                })
              ) : (
                <>
                  {['Restaurants', 'Entertainment', 'Shopping', 'Transport', 'Groceries', 'Other'].map((category) => {
                    // Calculate total amount for this category
                    const categoryTotal = transactions
                      .filter(t => t.category === category)
                      .reduce((sum, t) => sum + (t.type === 'income' ? t.amount : -t.amount), 0);

                    return (
                      <CategoryPill 
                        key={category}
                        category={category as Category}
                        amount={Math.abs(categoryTotal)}
                        icon={categoryIcons[category as keyof typeof categoryIcons]}
                      />
                    );
                  })}
                </>
              )}
            </ScrollView>
          </View>

          {/* Recent Transactions */}
          <View style={styles.transactions}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Transactions</Text>
              <Link href="/transactions" asChild>
                <TouchableOpacity>
                  <Text style={styles.seeAllText}>See All</Text>
                </TouchableOpacity>
              </Link>
            </View>
            {transactions.map(transaction => (
              <TouchableOpacity key={transaction.id} style={styles.transaction}>
                <View style={[styles.transactionIcon, { backgroundColor: transaction.type === 'income' ? '#4CAF5022' : '#FF525222' }]}>
                  <MaterialIcons
                    name={transaction.type === 'income' ? 'arrow-upward' : 'arrow-downward'}
                    size={24}
                    color={transaction.type === 'income' ? '#4CAF50' : '#FF5252'}
                  />
                </View>
                <View style={styles.transactionDetails}>
                  <Text style={styles.transactionDescription}>{transaction.description}</Text>
                  <Text style={styles.transactionCategory}>{transaction.category}</Text>
                </View>
                <View style={styles.transactionAmount}>
                  <Text
                    style={[
                      styles.amount,
                      { color: transaction.type === 'income' ? '#4CAF50' : '#FF5252' }
                    ]}
                  >
                    {transaction.type === 'income' ? '+' : '-'}${transaction.amount}
                  </Text>
                  <Text style={styles.date}>{transaction.date}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  welcomeSection: {},
  welcomeText: {
    fontSize: 16,
    color: '#666',
  },
  dateText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginTop: 4,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  reportsButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F2F5',
    borderRadius: 20,
  },
  profileButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  balanceCardContainer: {
    margin: 20,
    borderRadius: 24,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  balanceCard: {
    padding: 24,
    borderRadius: 24,
  },
  balanceLabel: {
    color: 'white',
    fontSize: 16,
    opacity: 0.9,
  },
  balanceAmount: {
    color: 'white',
    fontSize: 40,
    fontWeight: 'bold',
    marginVertical: 12,
  },
  balanceMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: 16,
  },
  metric: {
    flex: 1,
    alignItems: 'center',
  },
  metricDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginHorizontal: 16,
  },
  metricText: {
    color: 'white',
    fontSize: 14,
    opacity: 0.9,
    marginTop: 4,
  },
  metricAmount: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 4,
  },
  reportsContainer: {
    margin: 20,
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: '#F0F2F5',
    borderRadius: 16,
    padding: 4,
    marginBottom: 16,
  },
  viewReportsButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  reportCard: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  reportHeader: {
    marginBottom: 20,
  },
  reportTitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  reportMetrics: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  reportAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  changeIndicator: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  changeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  chartContainer: {
    height: 200,
    marginBottom: 20,
  },
  chart: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingTop: 20,
  },
  barContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: '100%',
  },
  bar: {
    width: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  barLabel: {
    fontSize: 12,
    color: '#666',
  },
  categoryBreakdown: {
    marginTop: 20,
  },
  breakdownTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 16,
  },
  breakdownItem: {
    marginBottom: 16,
  },
  breakdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  breakdownCategory: {
    fontSize: 14,
    color: '#2C3E50',
  },
  breakdownAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#F0F2F5',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  quickAdd: {
    margin: 20,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  seeAllText: {
    color: '#614385',
    fontSize: 14,
    fontWeight: '600',
  },
  typeSelector: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: '#F8F9FA',
    padding: 4,
    borderRadius: 12,
  },
  typeButton: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
    borderRadius: 8,
    marginHorizontal: 4,
    backgroundColor: '#fff',
  },
  selectedType: {
    backgroundColor: '#614385',
  },
  typeText: {
    color: '#666',
  },
  selectedTypeText: {
    color: '#fff',
  },
  inputContainer: {
    marginTop: 16,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 12,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    fontSize: 16,
  },
  addButton: {
    backgroundColor: '#614385',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  categories: {
    margin: 20,
  },
  categoryPill: {
    padding: 16,
    borderRadius: 16,
    marginRight: 12,
    minWidth: 140,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  categoryText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    opacity: 0.9,
  },
  categoryAmount: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 4,
  },
  transactions: {
    margin: 20,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  transaction: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F8F9FA',
  },
  transactionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  transactionDetails: {
    flex: 1,
    marginLeft: 16,
  },
  transactionDescription: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
  },
  transactionCategory: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  date: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  categorySelector: {
    marginVertical: 16,
  },
  categoryList: {
    marginTop: 8,
  },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginRight: 8,
    minWidth: 120,
  },
  categoryOptionText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  addTransactionForm: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
});

import { Stack } from 'expo-router';
import { ThemeProvider } from '../context/ThemeContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen
            name="reports"
            options={{
              presentation: 'modal',
              animation: 'slide_from_right',
            }}
          />
        </Stack>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}