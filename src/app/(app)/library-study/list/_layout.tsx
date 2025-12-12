import { Stack } from 'expo-router';

export default function ListLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="flatlist-sectionlist" />
      <Stack.Screen name="flashlist" />
      <Stack.Screen name="recyclerlistview" />
    </Stack>
  );
}

