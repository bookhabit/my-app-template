import { Stack } from 'expo-router';

export default function FormLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="react-hook-form-zod" />
      <Stack.Screen name="formik-yup" />
      <Stack.Screen name="vanilla-react" />
      <Stack.Screen name="yup" />
      <Stack.Screen name="zod" />
    </Stack>
  );
}
