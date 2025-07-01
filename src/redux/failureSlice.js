import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  failuresData: null,
  engineFailuresData: null,
  completedEngineFailureData: null,
  inProgressEngineFailureData: null,
  pendingEngineFailureData: null,
};

const failuresSlice = createSlice({
  name: "engFail",
  initialState,
  reducers: {
    failures(state, action) {
      state.failuresData = action.payload;
    },
    engineFailures(state, action) {
      state.engineFailuresData = action.payload;
    },
    pendingEngineFailures(state, action) {
      state.pendingEngineFailureData = action.payload;
    },
    inProgressEngineFailures(state, action) {
      state.inProgressEngineFailureData = action.payload;
    },
    completedEngineFailures(state, action) {
      state.completedEngineFailureData = action.payload;
    },
  },
});

export const {
  failures,
  engineFailures,
  pendingEngineFailures,
  completedEngineFailures,
  inProgressEngineFailures,
} = failuresSlice.actions;


export default failuresSlice.reducer;
