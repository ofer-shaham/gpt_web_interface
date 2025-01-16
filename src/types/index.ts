export interface UserRequest {
  role: string;
  scene: string;
  currentMessage: string;
  expected_response_format_to_feed_json_parse: string;
  maxSentences: number;
  maxWordsInSentence: number;
  maxTotalResponseChars: number;
  inputLanguage: string;
  outputLanguages: string[];
  url: string;
  special_notes: string;
}

export interface AppState {
  user_request: UserRequest;
  isLoading: boolean;
  error: string | null;
}