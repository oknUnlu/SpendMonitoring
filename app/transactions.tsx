import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { MaterialIcons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { categoryColors } from '../components/categories';

const { width } = Dimensions.get('window');

type CategoryName = keyof typeof categoryColors;

interface Transaction {
  id: number;
  type: 'income' | 'expense';
  amount: number;
  category: CategoryName;
  date: string;
  description: string;
}

const AllTransactions = () => {
  const [viewMode, setViewMode] = useState<'list' | 'chart'>('list');
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const chartData = {
    labels: [],
    datasets: [{
      data: [],
    }],
  };

  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    color: (opacity = 1) => `rgba(97, 67, 133, ${opacity})`,
    strokeWidth: 2,
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Link href="/" asChild>
          <TouchableOpacity style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={24} color="#2C3E50" />
          </TouchableOpacity>
        </Link>
        <Text style={styles.title}>All Transactions</Text>
      </View>

      <View style={styles.viewSelector}>
        <TouchableOpacity 
          style={[styles.viewButton, viewMode === 'list' && styles.activeViewButton]}
          onPress={() => setViewMode('list')}
        >
          <Text style={[styles.viewButtonText, viewMode === 'list' && styles.activeViewButtonText]}>List View</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.viewButton, viewMode === 'chart' && styles.activeViewButton]}
          onPress={() => setViewMode('chart')}
        >
          <Text style={[styles.viewButtonText, viewMode === 'chart' && styles.activeViewButtonText]}>Chart View</Text>
        </TouchableOpacity>
      </View>

      {viewMode === 'chart' && (
        <View style={styles.chartContainer}>
          <View style={styles.chartTypeSelector}>
            <TouchableOpacity 
              style={[styles.chartTypeButton, chartType === 'line' && styles.activeChartTypeButton]}
              onPress={() => setChartType('line')}
            >
              <Text style={[styles.chartTypeText, chartType === 'line' && styles.activeChartTypeText]}>Line</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.chartTypeButton, chartType === 'bar' && styles.activeChartTypeButton]}
              onPress={() => setChartType('bar')}
            >
              <Text style={[styles.chartTypeText, chartType === 'bar' && styles.activeChartTypeText]}>Bar</Text>
            </TouchableOpacity>
          </View>

          {chartType === 'line' ? (
            <LineChart
              data={chartData}
              width={width - 40}
              height={220}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
            />
          ) : (
            <BarChart
              data={chartData}
              width={width - 40}
              height={220}
              yAxisLabel="$"
              yAxisSuffix=""
              chartConfig={chartConfig}
              style={styles.chart}
            />
          )}
        </View>
      )}

      <View style={styles.transactionsList}>
        {transactions.map(transaction => (
          <View key={transaction.id} style={styles.transaction}>
            <View style={[styles.transactionIcon, { 
              backgroundColor: transaction.type === 'income' ? '#4CAF5022' : '#FF525222' 
            }]}>
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
              <Text style={[styles.amount, { 
                color: transaction.type === 'income' ? '#4CAF50' : '#FF5252' 
              }]}>
                {transaction.type === 'income' ? '+' : '-'}${transaction.amount}
              </Text>
              <Text style={styles.date}>{transaction.date}</Text>
            </View>
          </View>
        ))}
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
    backgroundColor: 'white',
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  viewSelector: {
    flexDirection: 'row',
    margin: 20,
    backgroundColor: '#F0F2F5',
    borderRadius: 12,
    padding: 4,
  },
  viewButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeViewButton: {
    backgroundColor: '#614385',
  },
  viewButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  activeViewButtonText: {
    color: 'white',
  },
  chartContainer: {
    padding: 20,
    backgroundColor: 'white',
    marginHorizontal: 20,
    borderRadius: 16,
    marginBottom: 20,
  },
  chartTypeSelector: {
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: '#F0F2F5',
    borderRadius: 8,
    padding: 4,
  },
  chartTypeButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeChartTypeButton: {
    backgroundColor: '#614385',
  },
  chartTypeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  activeChartTypeText: {
    color: 'white',
  },
  chart: {
    borderRadius: 16,
  },
  transactionsList: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 16,
    padding: 16,
  },
  transaction: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F2F5',
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
});

export default AllTransactions;
