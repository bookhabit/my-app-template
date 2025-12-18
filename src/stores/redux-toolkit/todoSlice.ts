import { createSlice, PayloadAction } from '@reduxjs/toolkit';

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
 * 초기 상태
 */
const initialState: TodoState = {
  todos: [],
  filter: 'all',
};

/**
 * Redux Toolkit의 createSlice를 사용한 Todo Slice
 * 
 * createSlice는:
 * - 액션 타입 자동 생성
 * - 액션 크리에이터 자동 생성
 * - Immer를 내장하여 불변성 관리 자동화
 */
const todoSlice = createSlice({
  name: 'todo',
  initialState,
  reducers: {
    /**
     * Todo 추가
     */
    addTodo: (state, action: PayloadAction<string>) => {
      const newTodo: Todo = {
        id: Date.now().toString(),
        text: action.payload,
        completed: false,
        createdAt: Date.now(),
      };
      // Immer 덕분에 직접 수정 가능 (불변성 자동 관리)
      state.todos.push(newTodo);
    },

    /**
     * Todo 삭제
     */
    removeTodo: (state, action: PayloadAction<string>) => {
      state.todos = state.todos.filter((todo) => todo.id !== action.payload);
    },

    /**
     * Todo 완료 상태 토글
     */
    toggleTodo: (state, action: PayloadAction<string>) => {
      const todo = state.todos.find((todo) => todo.id === action.payload);
      if (todo) {
        todo.completed = !todo.completed;
      }
    },

    /**
     * Todo 텍스트 수정
     */
    updateTodo: (state, action: PayloadAction<{ id: string; text: string }>) => {
      const todo = state.todos.find((todo) => todo.id === action.payload.id);
      if (todo) {
        todo.text = action.payload.text;
      }
    },

    /**
     * 완료된 Todo 모두 삭제
     */
    clearCompleted: (state) => {
      state.todos = state.todos.filter((todo) => !todo.completed);
    },

    /**
     * 필터 변경
     */
    setFilter: (state, action: PayloadAction<'all' | 'active' | 'completed'>) => {
      state.filter = action.payload;
    },
  },
});

// 액션 크리에이터 내보내기
export const { addTodo, removeTodo, toggleTodo, updateTodo, clearCompleted, setFilter } =
  todoSlice.actions;

// 리듀서 내보내기
export default todoSlice.reducer;

