/**
 * useSyncExternalStore를 사용한 커스텀 스토어 예제
 *
 * useSyncExternalStore는 React 18에서 도입된 훅으로,
 * 외부 스토어와 React를 동기화하는 데 사용됩니다.
 *
 * 많은 상태 관리 라이브러리(Zustand, Jotai 등)가 내부적으로 이 훅을 사용합니다.
 */
import { useSyncExternalStore } from 'react';

export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
}

export type Filter = 'all' | 'active' | 'completed';

/**
 * 간단한 외부 스토어 클래스
 *
 * useSyncExternalStore를 사용하려면:
 * 1. subscribe: 스토어 변경을 구독하는 함수
 * 2. getSnapshot: 현재 스토어 상태를 반환하는 함수
 * 3. getServerSnapshot: SSR을 위한 스냅샷 (선택적)
 */
class TodoStore {
  private todos: Todo[] = [];
  private filter: Filter = 'all';
  private listeners = new Set<() => void>();
  private snapshot: {
    todos: Todo[];
    filter: Filter;
    filteredTodos: Todo[];
    activeCount: number;
    completedCount: number;
  } = {
    todos: [],
    filter: 'all',
    filteredTodos: [],
    activeCount: 0,
    completedCount: 0,
  };

  // 현재 상태 반환
  // 동일한 상태에 대해 동일한 참조를 반환해야 함 (무한 루프 방지)
  getSnapshot = () => {
    // 상태가 변경되지 않았다면 기존 스냅샷 반환
    if (
      this.snapshot.todos === this.todos &&
      this.snapshot.filter === this.filter
    ) {
      return this.snapshot;
    }

    // 계산된 값들도 함께 계산
    const filteredTodos = this.getFilteredTodos();
    const activeCount = this.getActiveCount();
    const completedCount = this.getCompletedCount();

    // 상태가 변경되었다면 새 스냅샷 생성
    this.snapshot = {
      todos: this.todos,
      filter: this.filter,
      filteredTodos,
      activeCount,
      completedCount,
    };
    return this.snapshot;
  };

  // 변경 구독
  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  // 변경 알림
  private notify = () => {
    this.listeners.forEach((listener) => listener());
  };

  // Todo 추가
  addTodo = (text: string) => {
    const newTodo: Todo = {
      id: Date.now().toString(),
      text,
      completed: false,
      createdAt: Date.now(),
    };
    this.todos = [...this.todos, newTodo];
    this.notify();
  };

  // Todo 삭제
  removeTodo = (id: string) => {
    this.todos = this.todos.filter((todo) => todo.id !== id);
    this.notify();
  };

  // Todo 완료 토글
  toggleTodo = (id: string) => {
    this.todos = this.todos.map((todo) =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
    this.notify();
  };

  // 완료된 Todo 모두 삭제
  clearCompleted = () => {
    this.todos = this.todos.filter((todo) => !todo.completed);
    this.notify();
  };

  // 필터 변경
  setFilter = (filter: Filter) => {
    this.filter = filter;
    this.notify();
  };

  // 필터링된 Todo 목록 (계산된 값)
  getFilteredTodos = (): Todo[] => {
    if (this.filter === 'active') {
      return this.todos.filter((todo) => !todo.completed);
    }
    if (this.filter === 'completed') {
      return this.todos.filter((todo) => todo.completed);
    }
    return this.todos;
  };

  // 진행중인 Todo 개수
  getActiveCount = (): number => {
    return this.todos.filter((todo) => !todo.completed).length;
  };

  // 완료된 Todo 개수
  getCompletedCount = (): number => {
    return this.todos.filter((todo) => todo.completed).length;
  };
}

// 스토어 인스턴스 생성
export const todoStore = new TodoStore();

/**
 * useSyncExternalStore를 사용한 커스텀 훅
 *
 * 이 훅은 외부 스토어의 상태를 React 컴포넌트와 동기화합니다.
 * 스토어가 변경되면 자동으로 컴포넌트가 재렌더링됩니다.
 */
export function useExternalSyncTodoStore() {
  const state = useSyncExternalStore(
    todoStore.subscribe, // 구독 함수
    todoStore.getSnapshot // 스냅샷 함수
  );

  // state는 이미 메모이제이션된 스냅샷이므로 안전하게 사용 가능
  // 함수들은 안정적인 참조를 유지 (클래스 메서드이므로 자동으로 안정적)
  return {
    todos: state.todos,
    filter: state.filter,
    filteredTodos: state.filteredTodos,
    activeCount: state.activeCount,
    completedCount: state.completedCount,
    addTodo: todoStore.addTodo,
    removeTodo: todoStore.removeTodo,
    toggleTodo: todoStore.toggleTodo,
    clearCompleted: todoStore.clearCompleted,
    setFilter: todoStore.setFilter,
  };
}
