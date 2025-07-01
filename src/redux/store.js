import { configureStore } from "@reduxjs/toolkit";
import officerLineReducer from "./officerLineSlice";

import loaderReducer from "./loaderSlice";

import achievementReducer from "./achievementSlice";
import commonDataReducer from "./commonDataSlice";
import dailyLeafCountReducer from "./dailyLeafCountSlice";
import supplierReducer from "./supplierSlice"; // Import the supplier slice
import { supplierSlice } from "./supplierSlice"; // Import the supplier slice
const store = configureStore({
  reducer: {
    officerLine: officerLineReducer,
    loader: loaderReducer,
    supplier: supplierReducer, // Add the supplier reducer
    achievement: achievementReducer,
    commonData: commonDataReducer,
    dailyLeafCount: dailyLeafCountReducer,
  }
});

export default store;
