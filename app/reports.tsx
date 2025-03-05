import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { NavigationContainer } from '@react-navigation/native';
import MonthlyTab from '../components/reports/MonthlyTab';
import YearlyTab from '../components/reports/YearlyTab';

const Tab = createMaterialTopTabNavigator();

export default function Reports() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <MaterialIcons name="arrow-back" size={24} color="#2C3E50" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Reports</Text>
      </View>

      <Tab.Navigator
        screenOptions={{
          tabBarStyle: { backgroundColor: '#fff' },
          tabBarLabelStyle: { fontWeight: '600' },
          tabBarIndicatorStyle: { backgroundColor: '#614385' },
          tabBarActiveTintColor: '#614385',
          tabBarInactiveTintColor: '#666',
        }}
      >
        <Tab.Screen name="Monthly" component={MonthlyTab} />
        <Tab.Screen name="Yearly" component={YearlyTab} />
      </Tab.Navigator>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F2F5',
  },
  backButton: {
    padding: 8,
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
});
