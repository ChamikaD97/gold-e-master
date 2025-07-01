// src/redux/slices/achievementSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  achievements: [], // List of all achievements (can be per line, officer, etc.)
};

const achievementSlice = createSlice({
  name: "achievement",
  initialState,
  reducers: {
    setAchievements: (state, action) => {
      state.achievements = action.payload; // Replace the entire list
    },
    addAchievement: (state, action) => {
      state.achievements.push(action.payload); // Add a new one
    },
    updateAchievement: (state, action) => {
      const index = state.achievements.findIndex(
        (a) => a.id === action.payload.id
      );
      if (index !== -1) {
        state.achievements[index] = action.payload;
      }
    },
    clearAchievements: (state) => {
      state.achievements = [];
    },
  },
});

export const {
  setAchievements,
  addAchievement,
  updateAchievement,
  clearAchievements,
} = achievementSlice.actions;

export default achievementSlice.reducer;
