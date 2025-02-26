import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface User {
  id: string;
  email: string;
  username: string;
  like: [];
}

interface AuthState {
  token: string | null;
  user: User | null;
}

const initialState: AuthState = {
  token: null,
  user: null,
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{
        token: string;
        user: User;
        email: string;
        username: string;
        id: string;
      }>
    ) => {
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.user.email = action.payload.user.email;
      state.user.username = action.payload.user.username;
      state.user.id = action.payload.user.id;
    },
    logout: (state) => {
      state.token = null;
      state.user = null;
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;

export const getUser = (state: { auth: AuthState }) => state.auth.user;

export default authSlice.reducer;
