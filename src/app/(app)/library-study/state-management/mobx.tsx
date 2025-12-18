import { useState, useCallback } from 'react';
import { View, StyleSheet, Pressable, FlatList } from 'react-native';

import { MaterialIcons } from '@expo/vector-icons';

import { useTheme } from '@/context/ThemeProvider';
import { observer } from 'mobx-react-lite';

import TextBox from '@/components/common/TextBox';

import { todoStore, type Filter, type Todo } from '@/stores/mobx/todoStore';

import { TodoInputSection, TodoFilterSection } from './components';

/**
 * MobX TodoList 화면
 *
 * MobX의 주요 특징:
 * 1. Observable 상태: 자동으로 반응형 상태 관리
 * 2. Action: 상태 변경 함수
 * 3. Computed: 파생 상태 자동 계산
 * 4. makeAutoObservable: 자동으로 observable, action, computed 변환
 * 5. observer: 컴포넌트를 감싸서 반응형으로 만듦
 * 6. 클래스 기반: 객체 지향적 접근
 */
function MobXScreen() {
  const { theme } = useTheme();
  const [inputText, setInputText] = useState('');

  // MobX store에서 상태와 액션 가져오기
  // observer 내부에서 직접 읽어야 자동으로 구독됨
  const todos = todoStore.todos;
  const filter = todoStore.filter;
  const filteredTodos = todoStore.filteredTodos;
  const activeCount = todoStore.activeCount;
  const completedCount = todoStore.completedCount;

  // Todo 추가
  const handleAddTodo = useCallback(() => {
    if (inputText.trim()) {
      todoStore.addTodo(inputText.trim());
      setInputText('');
    }
  }, [inputText]);

  // Todo 삭제
  const handleRemoveTodo = useCallback((id: string) => {
    todoStore.removeTodo(id);
  }, []);

  // Todo 완료 토글
  const handleToggleTodo = useCallback((id: string) => {
    todoStore.toggleTodo(id);
  }, []);

  // 완료된 Todo 모두 삭제
  const handleClearCompleted = useCallback(() => {
    todoStore.clearCompleted();
  }, []);

  // 필터 변경
  const handleSetFilter = useCallback((newFilter: Filter) => {
    todoStore.setFilter(newFilter);
  }, []);

  // Todo 아이템 렌더링
  // MobX observer 내부에서는 useCallback 없이도 자동으로 최적화됨
  const renderTodoItem = ({ item }: { item: Todo }) => (
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

  // ListHeaderComponent: Todo 목록 제목만
  // observer 내부에서 직접 computed 값을 읽으면 자동으로 구독됨
  const renderHeader = () => (
    <View style={styles.section}>
      <TextBox variant="title4" color={theme.text} style={styles.listTitle}>
        Todo 목록 ({todoStore.filteredTodos.length})
      </TextBox>
    </View>
  );

  // ListEmptyComponent: 빈 상태
  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <MaterialIcons
        name="check-circle-outline"
        size={48}
        color={theme.textSecondary}
      />
      <TextBox variant="body3" color={theme.textSecondary}>
        {todoStore.filter === 'active'
          ? '진행중인 할 일이 없습니다'
          : todoStore.filter === 'completed'
            ? '완료된 할 일이 없습니다'
            : '할 일을 추가해보세요'}
      </TextBox>
    </View>
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
        extraData={`${todos.length}-${filter}-${filteredTodos.length}`}
      />
    </View>
  );
}

// observer로 컴포넌트 감싸기: MobX observable 상태 변화 감지
export default observer(MobXScreen);

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
