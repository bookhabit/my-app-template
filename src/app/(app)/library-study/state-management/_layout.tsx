import { Provider } from 'react-redux';

import { useSegments } from 'expo-router';
import { Stack } from 'expo-router';

import CustomHeader from '@/components/layout/CustomHeader';

import { store } from '@/stores/redux-toolkit/store';

// 라우트 이름 매핑
const routeTitleMap: Record<string, string> = {
  index: '전역 상태 관리',
  'redux-toolkit': 'Redux Toolkit',
  zustand: 'Zustand',
  recoil: 'Recoil',
  jotai: 'Jotai',
  mobx: 'MobX',
  useSyncExternalStore: 'useSyncExternalStore',
  monitor: 'Monitor',
};

// 헤더 컴포넌트
function DynamicHeader() {
  const segments = useSegments();
  const currentRoute = segments[segments.length - 1] || 'index';
  const title = routeTitleMap[currentRoute] || '전역 상태 관리';

  return <CustomHeader title={title} showBackButton />;
}

export default function StateManagementLayout() {
  return (
    <Provider store={store}>
      <Stack
        screenOptions={{
          header: () => <DynamicHeader />,
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="redux-toolkit" />
        <Stack.Screen name="zustand" />
        <Stack.Screen name="recoil" />
        <Stack.Screen name="jotai" />
        <Stack.Screen name="mobx" />
        <Stack.Screen name="useSyncExternalStore" />
        <Stack.Screen name="monitor" />
      </Stack>
    </Provider>
  );
}
