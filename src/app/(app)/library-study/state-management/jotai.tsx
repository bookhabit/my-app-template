import { useState, useCallback } from 'react';
import { View, StyleSheet, Pressable, FlatList } from 'react-native';

import { MaterialIcons } from '@expo/vector-icons';

import { useTheme } from '@/context/ThemeProvider';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';

import TextBox from '@/components/common/TextBox';

import {
  todosAtom,
  filterAtom,
  filteredTodosAtom,
  activeCountAtom,
  completedCountAtom,
  addTodoAtom,
  removeTodoAtom,
  toggleTodoAtom,
  clearCompletedAtom,
  setFilterAtom,
  type Filter,
} from '@/stores/jotai/todoAtoms';

import { TodoInputSection, TodoFilterSection } from './components';

/**
 * Jotai TodoList 화면
 *
 * Jotai의 주요 특징:
 * 1. 원자(atom) 기반: 각 상태를 atom으로 정의
 * 2. 파생 atom: 다른 atom으로부터 계산된 값 자동 계산
 * 3. Provider 선택적 사용: 전역에서 바로 사용 가능
 * 4. 매우 작은 번들 사이즈
 * 5. TypeScript 완벽 지원
 * 6. 자동 최적화: 파생 atom은 자동으로 메모이제이션
 */
export default function JotaiScreen() {
  const { theme } = useTheme();
  const [inputText, setInputText] = useState('');

  // Jotai atoms에서 상태 가져오기
  // useAtomValue: 읽기 전용 (값만 가져오기)
  const todos = useAtomValue(todosAtom);
  const filter = useAtomValue(filterAtom);
  const filteredTodos = useAtomValue(filteredTodosAtom);
  const activeCount = useAtomValue(activeCountAtom);
  const completedCount = useAtomValue(completedCountAtom);

  // useSetAtom: 쓰기 전용 (액션만 가져오기)
  const addTodo = useSetAtom(addTodoAtom);
  const removeTodo = useSetAtom(removeTodoAtom);
  const toggleTodo = useSetAtom(toggleTodoAtom);
  const clearCompleted = useSetAtom(clearCompletedAtom);
  const setFilter = useSetAtom(setFilterAtom);

  // Todo 추가
  const handleAddTodo = useCallback(() => {
    if (inputText.trim()) {
      addTodo(inputText.trim());
      setInputText('');
    }
  }, [inputText, addTodo]);

  // Todo 삭제
  const handleRemoveTodo = useCallback(
    (id: string) => {
      removeTodo(id);
    },
    [removeTodo]
  );

  // Todo 완료 토글
  const handleToggleTodo = useCallback(
    (id: string) => {
      toggleTodo(id);
    },
    [toggleTodo]
  );

  // 완료된 Todo 모두 삭제
  const handleClearCompleted = useCallback(() => {
    clearCompleted();
  }, [clearCompleted]);

  // 필터 변경
  const handleSetFilter = useCallback(
    (newFilter: Filter) => {
      setFilter(newFilter);
    },
    [setFilter]
  );

  // Todo 아이템 렌더링
  const renderTodoItem = useCallback(
    ({ item }: { item: (typeof todos)[0] }) => (
      <View
        style={[
          styles.todoItem,
          {
            backgroundColor: theme.surface,
            borderColor: theme.border,
          },
        ]}
      >
        <Pressable
          style={styles.todoContent}
          onPress={() => handleToggleTodo(item.id)}
        >
          <MaterialIcons
            name={item.completed ? 'check-circle' : 'radio-button-unchecked'}
            size={24}
            color={item.completed ? theme.primary : theme.textSecondary}
          />
          <TextBox
            variant="body2"
            color={item.completed ? theme.textSecondary : theme.text}
            style={[
              styles.todoText,
              item.completed && { textDecorationLine: 'line-through' },
            ]}
          >
            {item.text}
          </TextBox>
        </Pressable>
        <Pressable
          onPress={() => handleRemoveTodo(item.id)}
          style={styles.deleteButton}
        >
          <MaterialIcons name="delete" size={20} color={theme.error} />
        </Pressable>
      </View>
    ),
    [theme, handleToggleTodo, handleRemoveTodo]
  );

  // ListHeaderComponent: Todo 목록 제목만
  const renderHeader = useCallback(
    () => (
      <View style={styles.section}>
        <TextBox variant="title4" color={theme.text} style={styles.listTitle}>
          Todo 목록 ({filteredTodos.length})
        </TextBox>
      </View>
    ),
    [filteredTodos.length, theme]
  );

  // ListEmptyComponent: 빈 상태
  const renderEmpty = useCallback(
    () => (
      <View style={styles.emptyContainer}>
        <MaterialIcons
          name="check-circle-outline"
          size={48}
          color={theme.textSecondary}
        />
        <TextBox variant="body3" color={theme.textSecondary}>
          {filter === 'active'
            ? '진행중인 할 일이 없습니다'
            : filter === 'completed'
              ? '완료된 할 일이 없습니다'
              : '할 일을 추가해보세요'}
        </TextBox>
      </View>
    ),
    [filter, theme]
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Todo 입력 섹션 */}
      <TodoInputSection
        inputText={inputText}
        onInputChange={setInputText}
        onAddTodo={handleAddTodo}
      />

      {/* 필터 섹션 */}
      <TodoFilterSection
        filter={filter}
        totalCount={todos.length}
        activeCount={activeCount}
        completedCount={completedCount}
        onFilterChange={handleSetFilter}
        onClearCompleted={handleClearCompleted}
      />

      <FlatList
        data={filteredTodos}
        renderItem={renderTodoItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
  },
  listContent: {
    paddingBottom: 20,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  description: {
    lineHeight: 24,
  },
  listTitle: {
    marginBottom: 12,
  },
  todoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    margin: 12,
  },
  todoContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  todoText: {
    flex: 1,
  },
  deleteButton: {
    padding: 4,
  },
  separator: {
    height: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    gap: 12,
  },
});
