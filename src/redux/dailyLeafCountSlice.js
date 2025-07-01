// src/redux/slices/dailyLeafCountSlice.js
import { createSlice } from "@reduxjs/toolkit";
import { a } from "react-spring";

const initialState = {
  dailyLeafCount: [], // List of all achievements (can be per line, officer, etc.)
};

const dailyLeafCountSlice = createSlice({
  name: "dailyLeafCount",
  initialState,
  reducers: {
    setDailyLeafCount: (state, action) => {
      state.dailyLeafCount = action.payload; // Replace the entire list
    },
    addDailyLeafCount: (state, action) => {
      state.dailyLeafCount.push(action.payload); // Add a new one
    },
    updateDailyLeafCount: (state, action) => {
      const index = state.dailyLeafCount.findIndex(
        (a) => a.id === action.payload.id
      );
      if (index !== -1) {
        state.dailyLeafCount[index] = action.payload;
      }
    },
    clearDailyLeafCount: (state) => {
      state.dailyLeafCount = [];
    },

  },
});

export const {
  setDailyLeafCount,
  addDailyLeafCount,
  updateDailyLeafCount,
  clearDailyLeafCount,  
} = dailyLeafCountSlice.actions;

export default dailyLeafCountSlice.reducer;
