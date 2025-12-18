import { create } from 'zustand';

/**
 * Todo 인터페이스
 */
export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
}

/**
 * Todo State 인터페이스
 */
interface TodoState {
  todos: Todo[];
  filter: 'all' | 'active' | 'completed';
}

/**
 * Todo Store Actions
 */
interface TodoActions {
  addTodo: (text: string) => void;
  removeTodo: (id: string) => void;
  toggleTodo: (id: string) => void;
  updateTodo: (id: string, text: string) => void;
  clearCompleted: () => void;
  setFilter: (filter: 'all' | 'active' | 'completed') => void;
}

/**
 * Zustand Store 생성
 *
 * Zustand의 주요 특징:
 * 1. 간단한 API: create 함수 하나로 store 생성
 * 2. 보일러플레이트 최소화: 액션 크리에이터 불필요
 * 3. 직접 상태 수정: Immer 없이도 직접 수정 가능 (하지만 불변성 유지 권장)
 * 4. Provider 불필요: 전역에서 바로 사용 가능
 * 5. TypeScript 완벽 지원
 */
export const useTodoStore = create<TodoState & TodoActions>((set) => ({
  // 초기 상태
  todos: [],
  filter: 'all',

  // Todo 추가
  addTodo: (text: string) =>
    set((state) => ({
      todos: [
        ...state.todos,
        {
          id: Date.now().toString(),
          text,
          completed: false,
          createdAt: Date.now(),
        },
      ],
    })),

  // Todo 삭제
  removeTodo: (id: string) =>
    set((state) => ({
      todos: state.todos.filter((todo) => todo.id !== id),
    })),

  // Todo 완료 상태 토글
  toggleTodo: (id: string) =>
    set((state) => ({
      todos: state.todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      ),
    })),

  // Todo 텍스트 수정
  updateTodo: (id: string, text: string) =>
    set((state) => ({
      todos: state.todos.map((todo) =>
        todo.id === id ? { ...todo, text } : todo
      ),
    })),

  // 완료된 Todo 모두 삭제
  clearCompleted: () =>
    set((state) => ({
      todos: state.todos.filter((todo) => !todo.completed),
    })),

  // 필터 변경
  setFilter: (filter: 'all' | 'active' | 'completed') =>
    set(() => ({
      filter,
    })),
}));
