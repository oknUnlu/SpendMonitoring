import { Stack } from 'expo-router';

export default function TabLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen 
        name="reports" 
        options={{
          presentation: 'modal',
          animation: 'slide_from_right'
        }}
      />
    </Stack>
  );
}
