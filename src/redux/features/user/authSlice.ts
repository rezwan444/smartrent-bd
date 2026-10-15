import { IAdminProfile } from "@/types/global";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import Cookies from "js-cookie";

// Auth state interface
export interface AuthState {
  user: IAdminProfile | null;
  accessToken: string | null;
  refreshToken: string | null;
  resetPassToken: string | null;
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  resetPassToken: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<IAdminProfile | null>) => {
      state.user = action.payload;
    },

    setTokens: (
      state,
      action: PayloadAction<{ accessToken: string; refreshToken?: string }>,
    ) => {
      const { accessToken, refreshToken } = action.payload;
      state.accessToken = accessToken;
      state.refreshToken = refreshToken ?? null;

      Cookies.set("accessToken", accessToken);
      if (refreshToken) {
        Cookies.set("refreshToken", refreshToken);
      } else {
        Cookies.remove("refreshToken");
      }
    },

    setResetPassToken: (state, action: PayloadAction<string>) => {
      state.resetPassToken = action.payload;
    },
    clearResetPassToken: (state) => {
      state.resetPassToken = null;
    },

    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;

      Cookies.remove("authUser");
      Cookies.remove("accessToken");
      Cookies.remove("refreshToken");
    },

    clearAuthError: () => {},
  },
});

export const {
  setUser,
  setTokens,
  logout,
  clearAuthError,
  setResetPassToken,
  clearResetPassToken,
} = authSlice.actions;

// Selectors
export const selectAuth = (state: { auth: AuthState }) => state.auth;
export const selectUser = (state: { auth: AuthState }) => state.auth.user;

export default authSlice.reducer;
