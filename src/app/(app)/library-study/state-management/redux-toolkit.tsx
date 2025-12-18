import { useState, useCallback, useMemo } from 'react';
import { View, StyleSheet, Pressable, FlatList } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import { MaterialIcons } from '@expo/vector-icons';

import { useTheme } from '@/context/ThemeProvider';

import { Input } from '@/components/common/Input';
import TextBox from '@/components/common/TextBox';
import { CustomButton } from '@/components/common/button';
import CustomHeader from '@/components/layout/CustomHeader';

import type { RootState } from '@/stores/redux-toolkit/store';
import {
  addTodo,
  removeTodo,
  toggleTodo,
  clearCompleted,
  setFilter,
} from '@/stores/redux-toolkit/todoSlice';

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
      <CustomHeader title="Redux Toolkit TodoList" showBackButton />

      {/* Todo 입력 섹션 - FlatList 밖으로 분리 */}
      <View style={styles.section}>
        <View style={styles.inputContainer}>
          <Input
            placeholder="할 일을 입력하세요..."
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={handleAddTodo}
            returnKeyType="done"
            style={styles.input}
          />
          <CustomButton
            title="추가"
            onPress={handleAddTodo}
            variant="primary"
            size="medium"
          />
        </View>
      </View>

      {/* 필터 섹션 - FlatList 밖으로 분리 */}
      <View style={styles.section}>
        <View style={styles.filterContainer}>
          <Pressable
            onPress={() => handleSetFilter('all')}
            style={[
              styles.filterButton,
              {
                backgroundColor:
                  filter === 'all' ? theme.primary : theme.surface,
                borderColor: theme.border,
              },
            ]}
          >
            <TextBox
              variant="button4"
              color={filter === 'all' ? '#FFFFFF' : theme.text}
            >
              전체 ({todos.length})
            </TextBox>
          </Pressable>
          <Pressable
            onPress={() => handleSetFilter('active')}
            style={[
              styles.filterButton,
              {
                backgroundColor:
                  filter === 'active' ? theme.primary : theme.surface,
                borderColor: theme.border,
              },
            ]}
          >
            <TextBox
              variant="button4"
              color={filter === 'active' ? '#FFFFFF' : theme.text}
            >
              진행중 ({activeCount})
            </TextBox>
          </Pressable>
          <Pressable
            onPress={() => handleSetFilter('completed')}
            style={[
              styles.filterButton,
              {
                backgroundColor:
                  filter === 'completed' ? theme.primary : theme.surface,
                borderColor: theme.border,
              },
            ]}
          >
            <TextBox
              variant="button4"
              color={filter === 'completed' ? '#FFFFFF' : theme.text}
            >
              완료 ({completedCount})
            </TextBox>
          </Pressable>
        </View>

        {completedCount > 0 && (
          <CustomButton
            title="완료된 항목 모두 삭제"
            onPress={handleClearCompleted}
            variant="outline"
            size="small"
            style={styles.clearButton}
          />
        )}
      </View>

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
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  input: {
    flex: 1,
    minWidth: 0,
  },
  filterContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  clearButton: {
    alignSelf: 'flex-start',
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
