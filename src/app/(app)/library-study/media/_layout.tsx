import { Stack } from 'expo-router';

export default function MediaLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="react-native-fast-image" />
    </Stack>
  );
}

