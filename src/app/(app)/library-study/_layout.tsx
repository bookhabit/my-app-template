import { Stack } from 'expo-router';

export default function LibraryStudyLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="state-management" />
      <Stack.Screen name="form" />
      <Stack.Screen name="server-state" />
      <Stack.Screen name="storage" />
      <Stack.Screen name="animation" />
      <Stack.Screen name="list" />
      <Stack.Screen name="media" />
    </Stack>
  );
}
