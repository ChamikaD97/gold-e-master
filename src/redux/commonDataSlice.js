import { createSlice } from "@reduxjs/toolkit";
import { notification } from "antd";

const initialState = {
  notificationDate: 1,
  leafRound: 7,
  automaticalyInactive: 10, selectedSupplierId: '',
  selectedRoute: '',
  notification: true, // Default to true
  monthMap: {
    "01": "January", "02": "February", "03": "March", "04": "April",
    "05": "May", "06": "June", "07": "July", "08": "August",
    "09": "September", "10": "October", "11": "November", "12": "December"
  },

};

const commonDataSlice = createSlice({
  name: "commonData",
  initialState,
  reducers: {
    setNotificationDate: (state, action) => {
      state.notificationDate = action.payload;
    },
    setNotificationsVisible: (state, action) => {
      state.notification = action.payload;
      
    },
    setLeafRound: (state, action) => {
      state.leafRound = action.payload;
    },
    setAutomaticalyInactive: (state, action) => {
      state.automaticalyInactive = action.payload;
    },
    clearMarkers: (state) => {
      state.notificationDate = 1; // Reset to default value
      state.leafRound = 7; // Reset to default value
      state.automaticalyInactive = 10; // Reset to default value
      state.selectedSupplierId = ''; // Reset selected supplier
      state.selectedRoute = ''; // Reset selected route
      state.notification = true; // Reset notification visibility
      state.monthMap = {
        "01": "January", "02": "February", "03": "March", "04": "April",
        "05": "May", "06": "June", "07": "July", "08": "August",
        "09": "September", "10": "October", "11": "November", "12": "December"
      };
    },
    setSelectedSupplier: (state, action) => {
      state.selectedSupplierId = action.payload; // Set selected supplier
    },
    setSelectedRoute: (state, action) => {
      state.selectedRoute = action.payload; // Set selected route
    },
  }
});

export const { setNotificationDate, setRange6DaysMarkers,setNotificationsVisible, setAutomaticalyInactive, setLeafRound, clearMarkers, setSelectedSupplier, setSelectedRoute } = commonDataSlice.actions;
export default commonDataSlice.reducer;
