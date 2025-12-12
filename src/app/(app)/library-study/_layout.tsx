import { Stack } from 'expo-router';

export default function LibraryStudyLayout() {
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
      <Stack.Screen name="react-hook-form-zod" />
      <Stack.Screen name="formik-yup" />
      <Stack.Screen name="react-final-form" />
      <Stack.Screen name="tanstack-query" />
      <Stack.Screen name="swr" />
      <Stack.Screen name="rtk-query" />
      <Stack.Screen name="apollo-client" />
      <Stack.Screen name="async-storage" />
      <Stack.Screen name="mmkv" />
      <Stack.Screen name="sqlite" />
      <Stack.Screen name="react-native-reanimated" />
      <Stack.Screen name="react-native-gesture-handler" />
      <Stack.Screen name="react-native-skia" />
      <Stack.Screen name="lottie" />
      <Stack.Screen name="flatlist-sectionlist" />
      <Stack.Screen name="flashlist" />
      <Stack.Screen name="recyclerlistview" />
      <Stack.Screen name="react-native-fast-image" />
    </Stack>
  );
}
