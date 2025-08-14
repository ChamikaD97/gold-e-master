// src/redux/slices/officerLineSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  officers: [{}],
  allLines: [
    {

    }
  ]
};

const officerLineSlice = createSlice({
  name: "officerLine",
  initialState,
  reducers: {
    setOfficers: (state, action) => {
      state.officers = action.payload;
    },
    setAllLines: (state, action) => {
      state.allLines = action.payload;
    },
    clearOfficerLineMap: (state) => {
      state.officers = {};
    },
    clearAllLines: (state) => {
      state.allLines = [];
    }
  }
});

export const { setOfficers, setAllLines, clearAllLines, clearOfficerLineMap } = officerLineSlice.actions;
export default officerLineSlice.reducer;
