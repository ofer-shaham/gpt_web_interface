import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
// import { AppState, UserRequest } from '.';
import { sendAIRequest } from '../services/apiService';


// src/store/types.ts

export interface UserRequest {
  maxTotalResponseChars: number;
  minTotalResponseChars?: number; // Ensure this is defined
  maxSentences: number;
  minSentences?: number; // Ensure this is defined
  maxWordsInSentence: number;
  inputLanguage: string;
  outputLanguages: string[];
  role: string;
  url: string;
  expected_response_format_to_feed_json_parse: string;
  special_notes: string;
  currentMessage: string;
  scene: string;
}


export interface AppState {
  user_request: UserRequest; // The user request object
  isLoading: boolean; // Loading state
  error: string | null; // Error message
}



const initialState: AppState = {
  user_request: {
    role: "You're an Arabic and Hebrew teacher who prefers using words that are similar in both languages. You enjoy teaching through proverbs, idioms, and traditional cultural tales.",
    scene: "dialogue between two children who are learning each other's language and meet for the first time in the house of one of the boys. they come from a different background and want to learn each other language",
    currentMessage: "the arabic speaker asks the hebrew speaker if he wants to drink tea",
    expected_response_format_to_feed_json_parse: '[{ "lang_code": "string", "text": "string" }]',
    special_notes: 'return pure text and not markdown',
    maxSentences: 10,
    minSentences: 10,
    maxWordsInSentence: 50,
    maxTotalResponseChars: 500,
    inputLanguage: 'en',
    outputLanguages: [],
    url: 'https://api-git-main-ofershahams-projects.vercel.app/ai/logic'
  },
  isLoading: false,
  error: null,
};

export const processPrompt = createAsyncThunk(
  'prompt/process',
  async (request: UserRequest) => {
    const { role, url, ...payload } = request;
    const response = await sendAIRequest(url, role, payload);

    if (!response.success) {
      throw new Error(response.error);
    }

    return response.data;
  }
);

const promptSlice = createSlice({
  name: 'prompt',
  initialState,
  reducers: {
    updateRequest: (state, action: PayloadAction<Partial<UserRequest>>) => {
      state.user_request = { ...state.user_request, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(processPrompt.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(processPrompt.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(processPrompt.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'An error occurred';
      });
  },
});

export const { updateRequest } = promptSlice.actions;
export default promptSlice.reducer;
