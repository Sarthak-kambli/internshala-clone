import { createSlice } from "@reduxjs/toolkit";

export const userslice = createSlice({
  name: "user",
  initialState: {
    user: null, // ✅ FIXED
  },
  reducers: {
    login: (state, action) => {
      state.user = action.payload;
    },
    logout: (state) => {
      state.user = null;
    },
  },
});

export const { login, logout } = userslice.actions;
export const selectuser = (state) => state.user.user; // ✅ correct path
export default userslice.reducer;