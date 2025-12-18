import { useState, useCallback } from 'react';
import { View, StyleSheet, Pressable, FlatList } from 'react-native';

import { MaterialIcons } from '@expo/vector-icons';

import { useTheme } from '@/context/ThemeProvider';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';

import TextBox from '@/components/common/TextBox';

import {
  todosAtom,
  filterAtom,
  filteredTodosSelector,
  activeCountSelector,
  completedCountSelector,
  type Filter,
  type Todo,
} from '@/stores/recoil/todoAtoms';

import { TodoInputSection, TodoFilterSection } from './components';

console.log('recoil', useRecoilState, useRecoilValue, useSetRecoilState);

console.log('recoil', useRecoilState);

/**
 * Recoil TodoList 화면
 *
 * Recoil의 주요 특징:
 * 1. Atom: 상태의 기본 단위 (단일 상태)
 * 2. Selector: 파생 상태 (다른 atom/selector를 구독하여 자동 계산)
 * 3. useRecoilState: atom의 값과 setter를 반환 (useState와 유사)
 * 4. useRecoilValue: atom의 값만 반환 (읽기 전용)
 * 5. useSetRecoilState: atom의 setter만 반환 (쓰기 전용)
 * 6. RecoilRoot: 앱 최상위에 필수 (Provider 역할)
 * 7. 자동 최적화: 구독한 atom/selector만 변경 시 재렌더링
 */
export default function RecoilScreen() {
  const { theme } = useTheme();
  const [inputText, setInputText] = useState('');

  // Atom: Todo 목록과 필터 상태
  const [todos, setTodos] = useRecoilState(todosAtom);
  const [filter, setFilter] = useRecoilState(filterAtom);

  // Selector: 파생 상태 (자동으로 계산됨)
  const filteredTodos = useRecoilValue(filteredTodosSelector);
  const activeCount = useRecoilValue(activeCountSelector);
  const completedCount = useRecoilValue(completedCountSelector);

  // Todo 추가
  const handleAddTodo = useCallback(() => {
    if (inputText.trim()) {
      const newTodo: Todo = {
        id: Date.now().toString(),
        text: inputText.trim(),
        completed: false,
        createdAt: Date.now(),
      };
      setTodos((prevTodos) => [...prevTodos, newTodo]);
      setInputText('');
    }
  }, [inputText, setTodos]);

  // Todo 삭제
  const handleRemoveTodo = useCallback(
    (id: string) => {
      setTodos((prevTodos) => prevTodos.filter((todo) => todo.id !== id));
    },
    [setTodos]
  );

  // Todo 완료 토글
  const handleToggleTodo = useCallback(
    (id: string) => {
      setTodos((prevTodos) =>
        prevTodos.map((todo) =>
          todo.id === id ? { ...todo, completed: !todo.completed } : todo
        )
      );
    },
    [setTodos]
  );

  // 완료된 Todo 모두 삭제
  const handleClearCompleted = useCallback(() => {
    setTodos((prevTodos) => prevTodos.filter((todo) => !todo.completed));
  }, [setTodos]);

  // 필터 변경
  const handleSetFilter = useCallback(
    (newFilter: Filter) => {
      setFilter(newFilter);
    },
    [setFilter]
  );

  // Todo 아이템 렌더링
  const renderTodoItem = useCallback(
    ({ item }: { item: Todo }) => (
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

  // ListHeaderComponent: Todo 목록 제목
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
