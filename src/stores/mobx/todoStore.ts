import { makeAutoObservable } from 'mobx';

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
 * MobX Todo Store
 *
 * MobX의 주요 특징:
 * 1. Observable 상태: 자동으로 반응형 상태 관리
 * 2. Action: 상태 변경 함수
 * 3. Computed: 파생 상태 자동 계산
 * 4. makeAutoObservable: 자동으로 observable, action, computed 변환
 * 5. 클래스 기반: 객체 지향적 접근
 */
class TodoStore {
  todos: Todo[] = [];
  filter: Filter = 'all';

  constructor() {
    // makeAutoObservable: 모든 속성을 observable로, 메서드를 action으로 자동 변환
    makeAutoObservable(this);
  }

  // Action: Todo 추가
  // 새 배열을 할당하여 FlatList가 변경을 감지할 수 있도록 함
  addTodo(text: string) {
    const newTodo: Todo = {
      id: Date.now().toString(),
      text,
      completed: false,
      createdAt: Date.now(),
    };
    // push 대신 새 배열 할당 (FlatList가 변경을 감지할 수 있도록)
    this.todos = [...this.todos, newTodo];
  }

  // Action: Todo 삭제
  removeTodo(id: string) {
    this.todos = this.todos.filter((todo) => todo.id !== id);
  }

  // Action: Todo 완료 상태 토글
  // 새 배열을 할당하여 FlatList가 변경을 감지할 수 있도록 함
  toggleTodo(id: string) {
    this.todos = this.todos.map((todo) =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
  }

  // Action: Todo 텍스트 수정
  // 새 배열을 할당하여 FlatList가 변경을 감지할 수 있도록 함
  updateTodo(id: string, text: string) {
    this.todos = this.todos.map((todo) =>
      todo.id === id ? { ...todo, text } : todo
    );
  }

  // Action: 완료된 Todo 모두 삭제
  clearCompleted() {
    this.todos = this.todos.filter((todo) => !todo.completed);
  }

  // Action: 필터 변경
  setFilter(filter: Filter) {
    this.filter = filter;
  }

  // Computed: 필터링된 Todo 목록
  // 항상 새로운 배열을 반환하여 FlatList가 변경을 감지할 수 있도록 함
  get filteredTodos(): Todo[] {
    if (this.filter === 'active') {
      return this.todos.filter((todo) => !todo.completed);
    }
    if (this.filter === 'completed') {
      return this.todos.filter((todo) => todo.completed);
    }
    // 새로운 배열 참조 반환 (FlatList가 변경을 감지할 수 있도록)
    return [...this.todos];
  }

  // Computed: 진행중인 Todo 개수
  get activeCount(): number {
    return this.todos.filter((todo) => !todo.completed).length;
  }

  // Computed: 완료된 Todo 개수
  get completedCount(): number {
    return this.todos.filter((todo) => todo.completed).length;
  }
}

// Store 인스턴스 생성 및 내보내기
export const todoStore = new TodoStore();
