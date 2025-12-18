import { configureStore } from '@reduxjs/toolkit';

import todoReducer from './todoSlice';

/**
 * Redux Store 생성
 * 
 * configureStore는:
 * - 기본 미들웨어 자동 설정 (Redux Thunk 등)
 * - Redux DevTools 자동 연결
 * - 불변성 체크 및 직렬화 체크 활성화
 */
export const store = configureStore({
  reducer: {
    todo: todoReducer,
  },
});

// TypeScript를 위한 타입 정의
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

