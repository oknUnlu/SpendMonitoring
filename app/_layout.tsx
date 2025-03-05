import { Stack } from 'expo-router';
import { ThemeProvider } from '../context/ThemeContext';
import { CurrencyProvider } from '../context/CurrencyContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <CurrencyProvider>
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
        </CurrencyProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}