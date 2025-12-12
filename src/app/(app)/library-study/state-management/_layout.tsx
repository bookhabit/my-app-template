import { Stack } from 'expo-router';

export default function StateManagementLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="redux-toolkit" />
      <Stack.Screen name="zustand" />
      <Stack.Screen name="recoil" />
      <Stack.Screen name="jotai" />
      <Stack.Screen name="mobx" />
    </Stack>
  );
}
