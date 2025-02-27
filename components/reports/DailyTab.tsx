import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

export default function DailyTab() {
  const theme = useTheme();
  
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Daily Report</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  text: {
    fontSize: 16,
  }
});
