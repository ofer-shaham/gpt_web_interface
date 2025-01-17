// src/store/index.ts
import { configureStore } from '@reduxjs/toolkit';
import sentencesReducer from './sentencesSlice';
import promptReducer from './promptSlice'; // Import the prompt reducer
import responseReducer from './responseSlice'; // Import the response reducer
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';

// Create a Redux store
const store = configureStore({
  reducer: {
    sentences: sentencesReducer,
    prompt: promptReducer, // Add the prompt reducer here
    response: responseReducer, // Add the response reducer here
  },
});

// Define RootState and AppDispatch types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export default store;
