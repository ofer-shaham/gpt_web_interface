import { UserRequest } from "./userRequest";

export interface AppState {
  user_request: UserRequest; // The user request object
  isLoading: boolean; // Loading state
  error: string | null; // Error message
}
