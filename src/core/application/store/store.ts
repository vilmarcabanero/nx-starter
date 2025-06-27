import { configureStore } from '@reduxjs/toolkit';
import todosReducer from '../todos/slice';

export const store = configureStore({
  reducer: {
    todos: todosReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['todos/createTodo/fulfilled', 'todos/updateTodo/fulfilled'],
        ignoredPaths: ['payload.createdAt'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
