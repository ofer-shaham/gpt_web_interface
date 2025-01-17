import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { sentence } from './types/sentence';

interface ResponseState {
  sentences: sentence[];
}

const initialState: ResponseState = {
  sentences: []
};

const responseSlice = createSlice({
  name: 'response',
  initialState,
  reducers: {
    updateResponseSentences(state, action: PayloadAction<sentence[]>) {
      state.sentences = action.payload;
    }
  }
});

export const { updateResponseSentences } = responseSlice.actions;
export default responseSlice.reducer;
