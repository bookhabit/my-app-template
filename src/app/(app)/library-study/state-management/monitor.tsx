import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useSelector } from 'react-redux';

import { useTheme } from '@/context/ThemeProvider';
import { useAtomValue } from 'jotai';
import { observer } from 'mobx-react-lite';

import TextBox from '@/components/common/TextBox';

import { todosAtom } from '@/stores/jotai/todoAtoms';
import { todoStore } from '@/stores/mobx/todoStore';
import type { RootState } from '@/stores/redux-toolkit/store';
import { useTodoStore } from '@/stores/zustand/todoStore';

/**
 * 전역 상태 라이브러리 모니터 화면
 *
 * 각 라이브러리에서 todos를 가져오는 방법을 비교하기 위한 화면
 * - Redux Toolkit: useSelector
 * - Zustand: useTodoStore
 * - Jotai: useAtomValue
 * - MobX: observer + 직접 접근
 */
function MonitorScreen() {
  const { theme } = useTheme();

  // 1. Redux Toolkit: useSelector로 상태 가져오기
  const reduxTodos = useSelector((state: RootState) => state.todo.todos);

  // 2. Zustand: useTodoStore로 상태 가져오기
  const zustandTodos = useTodoStore((state) => state.todos);

  // 3. Jotai: useAtomValue로 atom 값 가져오기
  const jotaiTodos = useAtomValue(todosAtom);

  // 4. MobX: observer 내부에서 직접 접근
  const mobxTodos = todoStore.todos;

  // 각 라이브러리별 섹션 렌더링
  const renderSection = (
    title: string,
    todos: typeof reduxTodos,
    color: string
  ) => (
    <View
      style={[
        styles.section,
        {
          backgroundColor: theme.surface,
          borderColor: color,
        },
      ]}
    >
      <TextBox variant="title3" color={color} style={styles.sectionTitle}>
        {title}
      </TextBox>
      <TextBox variant="body3" color={theme.textSecondary} style={styles.count}>
        총 {todos.length}개
      </TextBox>
      {todos.length === 0 ? (
        <TextBox
          variant="body3"
          color={theme.textSecondary}
          style={styles.empty}
        >
          할 일이 없습니다
        </TextBox>
      ) : (
        <View style={styles.todoList}>
          {todos.map((todo) => (
            <View
              key={todo.id}
              style={[
                styles.todoItem,
                {
                  backgroundColor: theme.background,
                  borderColor: theme.border,
                },
              ]}
            >
              <View style={styles.todoContent}>
                <TextBox
                  variant="body2"
                  color={todo.completed ? theme.textSecondary : theme.text}
                  style={[
                    styles.todoText,
                    todo.completed && { textDecorationLine: 'line-through' },
                  ]}
                >
                  {todo.text}
                </TextBox>
                <TextBox
                  variant="body3"
                  color={theme.textSecondary}
                  style={styles.todoStatus}
                >
                  {todo.completed ? '✓ 완료' : '○ 진행중'}
                </TextBox>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.content}
    >
      <View style={styles.header}>
        <TextBox variant="title2" color={theme.text} style={styles.title}>
          전역 상태 라이브러리 비교
        </TextBox>
        <TextBox
          variant="body3"
          color={theme.textSecondary}
          style={styles.subtitle}
        >
          각 라이브러리의 스토어에서 todos를 가져오는 방법 비교
        </TextBox>
      </View>

      {renderSection('1. Redux Toolkit', reduxTodos, '#764ABC')}
      {renderSection('2. Zustand', zustandTodos, '#443C68')}
      {renderSection('3. Jotai', jotaiTodos, '#4A5568')}
      {renderSection('4. MobX', mobxTodos, '#EA4C89')}
    </ScrollView>
  );
}

// MobX를 위해 observer로 감싸기
export default observer(MonitorScreen);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    marginBottom: 8,
  },
  subtitle: {
    lineHeight: 20,
  },
  section: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    marginBottom: 20,
  },
  sectionTitle: {
    marginBottom: 8,
  },
  count: {
    marginBottom: 12,
  },
  empty: {
    paddingVertical: 12,
    textAlign: 'center',
  },
  todoList: {
    gap: 8,
  },
  todoItem: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  todoContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  todoText: {
    flex: 1,
  },
  todoStatus: {
    marginLeft: 12,
  },
});
