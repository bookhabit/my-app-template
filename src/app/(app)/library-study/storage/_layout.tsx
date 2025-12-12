import { Stack } from 'expo-router';

export default function StorageLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="async-storage" />
      <Stack.Screen name="mmkv" />
      <Stack.Screen name="sqlite" />
    </Stack>
  );
}

