import { Stack } from 'expo-router';

export default function AnimationLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="react-native-reanimated" />
      <Stack.Screen name="react-native-gesture-handler" />
      <Stack.Screen name="react-native-skia" />
      <Stack.Screen name="lottie" />
    </Stack>
  );
}

