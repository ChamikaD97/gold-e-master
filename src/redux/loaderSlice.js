// src/redux/slices/loaderSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isLoading: false,


};

const loaderSlice = createSlice({
  name: "loader",
  initialState,
  reducers: {
    showLoader: (state, action) => {
      state.isLoading = true;

    },
    hideLoader: (state) => {
      state.isLoading = false;

    }
  }
});

export const { showLoader, hideLoader } = loaderSlice.actions;
export default loaderSlice.reducer;
