import { useState, useCallback } from 'react';
import { View, StyleSheet, Pressable, FlatList } from 'react-native';

import { MaterialIcons } from '@expo/vector-icons';

import { useTheme } from '@/context/ThemeProvider';

import TextBox from '@/components/common/TextBox';

import {
  useExternalSyncTodoStore,
  type Filter,
  type Todo,
} from '@/stores/useSyncExternalStore/customStore';

import { TodoInputSection, TodoFilterSection } from './components';

/**
 * useSyncExternalStore TodoList 화면
 *
 * useSyncExternalStore의 주요 특징:
 * 1. React 18에서 도입된 공식 훅
 * 2. 외부 스토어와 React를 동기화
 * 3. subscribe: 스토어 변경 구독 함수
 * 4. getSnapshot: 현재 스토어 상태 반환 함수
 * 5. 자동 최적화: 스토어 변경 시에만 재렌더링
 * 6. 많은 상태 관리 라이브러리가 내부적으로 사용
 *    - Zustand, Jotai 등이 useSyncExternalStore 기반
 *
 * 왜 사용하는가?
 * - 외부 스토어(Redux, Zustand 등)와 React를 안전하게 동기화
 * - Concurrent Features와 호환성 보장
 * - 스토어 변경 시 자동으로 컴포넌트 업데이트
 */
export default function UseSyncExternalStoreScreen() {
  const { theme } = useTheme();
  const [inputText, setInputText] = useState('');

  // useSyncExternalStore를 사용한 커스텀 훅
  const {
    todos,
    filter,
    filteredTodos,
    activeCount,
    completedCount,
    addTodo,
    removeTodo,
    toggleTodo,
    clearCompleted,
    setFilter,
  } = useExternalSyncTodoStore();

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
        <TextBox
          variant="body3"
          color={theme.textSecondary}
          style={styles.description}
        >
          useSyncExternalStore를 사용한 커스텀 스토어
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
    marginTop: 8,
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
