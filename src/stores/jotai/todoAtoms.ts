import { atom } from 'jotai';

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
 * 필터 타입
 */
export type Filter = 'all' | 'active' | 'completed';

/**
 * Jotai Atoms 정의
 *
 * Jotai의 주요 특징:
 * 1. 원자(atom) 기반: 각 상태를 atom으로 정의
 * 2. 파생 atom: 다른 atom으로부터 계산된 값
 * 3. Provider 선택적 사용: 전역에서 바로 사용 가능
 * 4. 매우 작은 번들 사이즈
 * 5. TypeScript 완벽 지원
 */

// 기본 atoms: 원시 상태
export const todosAtom = atom<Todo[]>([]);
export const filterAtom = atom<Filter>('all');

// 파생 atoms: 다른 atom으로부터 계산된 값
export const filteredTodosAtom = atom((get) => {
  const todos = get(todosAtom);
  const filter = get(filterAtom);

  if (filter === 'active') {
    return todos.filter((todo) => !todo.completed);
  }
  if (filter === 'completed') {
    return todos.filter((todo) => todo.completed);
  }
  return todos;
});

export const activeCountAtom = atom((get) => {
  const todos = get(todosAtom);
  return todos.filter((todo) => !todo.completed).length;
});

export const completedCountAtom = atom((get) => {
  const todos = get(todosAtom);
  return todos.filter((todo) => todo.completed).length;
});

// Write-only atoms: 액션 함수들
export const addTodoAtom = atom(null, (get, set, text: string) => {
  const newTodo: Todo = {
    id: Date.now().toString(),
    text,
    completed: false,
    createdAt: Date.now(),
  };
  set(todosAtom, [...get(todosAtom), newTodo]);
});

export const removeTodoAtom = atom(null, (get, set, id: string) => {
  set(
    todosAtom,
    get(todosAtom).filter((todo) => todo.id !== id)
  );
});

export const toggleTodoAtom = atom(null, (get, set, id: string) => {
  set(
    todosAtom,
    get(todosAtom).map((todo) =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    )
  );
});

export const updateTodoAtom = atom(
  null,
  (get, set, { id, text }: { id: string; text: string }) => {
    set(
      todosAtom,
      get(todosAtom).map((todo) => (todo.id === id ? { ...todo, text } : todo))
    );
  }
);

export const clearCompletedAtom = atom(null, (get, set) => {
  set(
    todosAtom,
    get(todosAtom).filter((todo) => !todo.completed)
  );
});

export const setFilterAtom = atom(null, (get, set, filter: Filter) => {
  set(filterAtom, filter);
});
