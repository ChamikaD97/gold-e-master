import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isAuthenticated: false,
  user: null,
  loading: false,
  token:null,
  selectedKey:"1",
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login(state, action) {
      state.isAuthenticated = true;
      state.user = action.payload;
    },
    logout(state) {
      state.isAuthenticated = false;
      state.user = null;
    },
    register(state, action) {
      state.isAuthenticated = true;
      state.user = action.payload;
    },
    isLoading(state, action) {
      state.loading = action.payload;
    },
    userToken(state, action) {
      state.token = action.payload;
    },
    setSelectedKey(state, action) {
      state.selectedKey = action.payload;
    },
  },
});

export const { login, logout, register,isLoading,userToken,setSelectedKey } = authSlice.actions;
export default authSlice.reducer;
