import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome5 } from '@expo/vector-icons';
import { Category, categoryColors } from './categories';
import { useCurrency } from '../context/CurrencyContext';
import { useTheme } from '../context/ThemeContext';

interface CategoryPillProps {
  category: Category;
  amount: number;
  icon?: string;
}

const CategoryPill = ({ category, amount, icon }: CategoryPillProps) => {
  const { currency } = useCurrency();
  const { theme } = useTheme();

  return (
    <LinearGradient
      colors={[categoryColors[category] || categoryColors.Other, `${categoryColors[category]}99` || `${categoryColors.Other}99`]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.categoryPill, { borderColor: theme.colors.border }]}>
      <View style={styles.categoryIcon}>
        <FontAwesome5 name={icon || 'shopping-bag'} size={20} color="white" />
      </View>
      <View style={styles.categoryContent}>
        <Text style={styles.categoryText}>{category}</Text>
        <Text style={styles.categoryAmount}>{currency.symbol}{amount.toFixed(2)}</Text>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  categoryPill: {
    padding: 16,
    borderRadius: 24,
    marginRight: 12,
    minWidth: 160,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  categoryContent: {
    gap: 4,
  },
  categoryText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    opacity: 0.9,
  },
  categoryAmount: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default CategoryPill;
