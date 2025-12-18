import { useState, useCallback, useMemo } from 'react';
import { View, StyleSheet, Pressable, FlatList } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import { MaterialIcons } from '@expo/vector-icons';

import { useTheme } from '@/context/ThemeProvider';

import TextBox from '@/components/common/TextBox';

import type { RootState } from '@/stores/redux-toolkit/store';
import {
  addTodo,
  removeTodo,
  toggleTodo,
  clearCompleted,
  setFilter,
} from '@/stores/redux-toolkit/todoSlice';

import { TodoInputSection, TodoFilterSection } from './components';

/**
 * Redux Toolkit TodoList 화면
 *
 * Redux Toolkit의 주요 특징:
 * 1. createSlice: 액션과 리듀서를 한 번에 정의
 * 2. Immer 내장: 불변성 관리 자동화 (직접 수정 가능)
 * 3. TypeScript 지원: 타입 안전성 보장
 * 4. Redux DevTools 자동 연결
 */
export default function ReduxToolkitScreen() {
  const { theme } = useTheme();
  const dispatch = useDispatch();
  const { todos, filter } = useSelector((state: RootState) => state.todo);

  const [inputText, setInputText] = useState('');

  // 필터링된 Todo 목록
  const filteredTodos = todos.filter((todo) => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  });

  // Todo 추가
  const handleAddTodo = useCallback(() => {
    if (inputText.trim()) {
      dispatch(addTodo(inputText.trim()));
      setInputText('');
    }
  }, [inputText, dispatch]);

  // Todo 삭제
  const handleRemoveTodo = useCallback(
    (id: string) => {
      dispatch(removeTodo(id));
    },
    [dispatch]
  );

  // Todo 완료 토글
  const handleToggleTodo = useCallback(
    (id: string) => {
      dispatch(toggleTodo(id));
    },
    [dispatch]
  );

  // 완료된 Todo 모두 삭제
  const handleClearCompleted = useCallback(() => {
    dispatch(clearCompleted());
  }, [dispatch]);

  // 필터 변경
  const handleSetFilter = useCallback(
    (newFilter: 'all' | 'active' | 'completed') => {
      dispatch(setFilter(newFilter));
    },
    [dispatch]
  );

  // Todo 아이템 렌더링
  const renderTodoItem = ({ item }: { item: (typeof todos)[0] }) => (
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
  );

  const activeCount = todos.filter((todo) => !todo.completed).length;
  const completedCount = todos.filter((todo) => todo.completed).length;

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
