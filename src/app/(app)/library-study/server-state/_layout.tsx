import { Stack } from 'expo-router';

export default function ServerStateLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="tanstack-query" />
      <Stack.Screen name="swr" />
      <Stack.Screen name="rtk-query" />
      <Stack.Screen name="apollo-client" />
    </Stack>
  );
}

