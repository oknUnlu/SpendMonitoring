import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome5 } from '@expo/vector-icons';
import { CategoryPillProps, categoryColors } from './categories';

export const CategoryPill: React.FC<CategoryPillProps> = ({ category, amount, icon }) => (
  <LinearGradient
    colors={[categoryColors[category], `${categoryColors[category]}99`]}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 1 }}
    style={styles.categoryPill}
  >
    <View style={styles.categoryIcon}>
      <FontAwesome5 name={icon} size={20} color="white" />
    </View>
    <Text style={styles.categoryText}>{category}</Text>
    <Text style={styles.categoryAmount}>${amount}</Text>
  </LinearGradient>
);

const styles = StyleSheet.create({
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
});

export default CategoryPill;
