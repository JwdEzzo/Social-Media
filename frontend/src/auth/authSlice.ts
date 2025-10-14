import type { LoginResponse } from "@/types/responseTypes";
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { AuthState } from "./authApi";

// Loading auth credentials from storage if the user had already logged in before
const loadAuthFromStorage = (): AuthState => {
  // Try getting the token and username from local storage
  try {
    const token = localStorage.getItem("token");
    const username = localStorage.getItem("username");

    // if token and username exist, then return them and authenticate the user
    if (token && username) {
      return {
        token,
        username,
        isAuthenticated: true,
      };
    }
    // Catch error
  } catch (error) {
    console.error("Error loading auth from storage:", error);
  }

  // return no token, no username , and dont authenticate the user by default
  return {
    token: null,
    username: null,
    isAuthenticated: false,
  };
};

// Define the initial state as the loadAuthFromStorage
const initialState: AuthState = loadAuthFromStorage();

// Redux Slice for auth credentials
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Define reducer function: setCredentials
    setCredentials: (state, action: PayloadAction<LoginResponse>) => {
      // We got the token and username from the LoginResponse
      const { token, username } = action.payload;
      // Set the credentials as the values from the LoginResponse
      state.token = token;
      state.username = username;
      state.isAuthenticated = true;

      // Persist to localStorage, i.e. , store the username and token in localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("username", username);
    },
    // Define reducer function for logging out
    logout: (state) => {
      // Set the credentials to null
      state.token = null;
      state.username = null;
      state.isAuthenticated = false;

      // Clear localStorage
      localStorage.removeItem("token");
      localStorage.removeItem("username");
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
