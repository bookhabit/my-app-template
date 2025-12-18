import { atom, selector } from 'recoil';

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
 * Atom: Todo 목록
 * - 기본 상태 단위
 * - useRecoilState, useRecoilValue, useSetRecoilState로 접근
 */
export const todosAtom = atom<Todo[]>({
  key: 'todosAtom',
  default: [],
});

/**
 * Atom: 필터 상태
 */
export const filterAtom = atom<Filter>({
  key: 'filterAtom',
  default: 'all',
});

/**
 * Selector: 필터링된 Todo 목록
 * - 파생 상태 (derived state)
 * - todosAtom과 filterAtom을 구독하여 자동으로 재계산
 */
export const filteredTodosSelector = selector<Todo[]>({
  key: 'filteredTodosSelector',
  get: ({ get }) => {
    const todos = get(todosAtom);
    const filter = get(filterAtom);

    if (filter === 'active') {
      return todos.filter((todo) => !todo.completed);
    }
    if (filter === 'completed') {
      return todos.filter((todo) => todo.completed);
    }
    return todos;
  },
});

/**
 * Selector: 진행중인 Todo 개수
 */
export const activeCountSelector = selector<number>({
  key: 'activeCountSelector',
  get: ({ get }) => {
    const todos = get(todosAtom);
    return todos.filter((todo) => !todo.completed).length;
  },
});

/**
 * Selector: 완료된 Todo 개수
 */
export const completedCountSelector = selector<number>({
  key: 'completedCountSelector',
  get: ({ get }) => {
    const todos = get(todosAtom);
    return todos.filter((todo) => todo.completed).length;
  },
});
