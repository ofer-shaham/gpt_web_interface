import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Sentence } from '../types/sentence';

interface ResponseState {
  sentences: Sentence[];
}

const initialState: ResponseState = {
  sentences: []
};

const responseSlice = createSlice({
  name: 'response',
  initialState,
  reducers: {
    updateResponseSentences(state, action: PayloadAction<Sentence[]>) {
      state.sentences = action.payload;
    }
  }
});

export const { updateResponseSentences } = responseSlice.actions;
export default responseSlice.reducer;
