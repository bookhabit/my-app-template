import { Tabs } from 'expo-router';

import { MaterialIcons } from '@expo/vector-icons';

import { useTheme } from '@/context/ThemeProvider';

export default function TabsLayout() {
  const { theme } = useTheme();

  return (
    <Tabs
      initialRouteName="index"
      screenOptions={{
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.surface,
          borderTopColor: theme.border,
        },
        headerStyle: {
          backgroundColor: theme.surface,
        },
        headerTintColor: theme.text,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: '홈',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="design"
        options={{
          title: '디자인',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="palette" size={size} color={color} />
          ),
          // tabBarBadge: 2,
          // tabBarBadgeStyle: {
          //   backgroundColor: 'tomato',
          //   color: 'white',
          // },
        }}
      />
      <Tabs.Screen
        name="image"
        options={{
          title: '이미지',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="image" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="icon"
        options={{
          title: '아이콘',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="widgets" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="modal"
        options={{
          title: '모달',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="workspaces" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
