import { Stack } from 'expo-router';
import { Provider } from 'react-redux';

import { store } from '@/stores/redux-toolkit/store';

export default function StateManagementLayout() {
  return (
    <Provider store={store}>
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
    </Provider>
  );
}
