// src/redux/slices/supplierSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// ✅ Replace with your actual API endpoint

// 🔁 Async thunk to fetch supplier data
export const fetchSuppliers = createAsyncThunk(
    "supplier/fetchSuppliers",
    async (supplierId = "", { rejectWithValue }) => {
        try {
            const formattedUrl = `http://newserver:46597/quiX/DataStruts/GetJSONData?req=5$#F001@000001$F002@9999999$F003@${supplierId}`;
            const response = await axios.get(formattedUrl);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);


const initialState = {
    suppliers: [],
    filteredSuppliers: [],
    joinedDate: null,
    selectedLine: null,
    selectedOfficer: null,
    loading: false,
    error: null,
};

const supplierSlice = createSlice({
    name: "supplier",
    initialState,
    reducers: {
        addSupplier: (state, action) => {
            state.suppliers.push(action.payload);
        },
        updateSupplier: (state, action) => {
            const index = state.suppliers.findIndex(
                (s) => s.id === action.payload.id
            );
            if (index !== -1) {
                state.suppliers[index] = action.payload;
            }
        },
        filterSuppliersById: (state, action) => {
            const supplierId = action.payload;
            state.filteredSuppliers = state.suppliers.filter(
                (supplier) => supplier.id === supplierId
            );
        },
        setJoinedDate: (state, action) => {
            state.joinedDate = action.payload;
        },

        setSuppliersByRoutes: (state, action) => {
            state.suppliers = action.payload;
        },
        setSelectedLine: (state, action) => {
            state.selectedLine = action.payload;
        },
        setSelectedOfficer: (state, action) => {
            state.selectedOfficer = action.payload;
        },
        clearSupplierState: (state) => {
            state.suppliers = [];
            state.filteredSuppliers = [];
            state.joinedDate = null;
            state.selectedLine = null;
            state.selectedOfficer = null;
            state.loading = false;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchSuppliers.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchSuppliers.fulfilled, (state, action) => {
                state.suppliers = action.payload;
                state.loading = false;
            })
            .addCase(fetchSuppliers.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const {
    addSupplier,
    updateSupplier,
    filterSuppliersById,
    setJoinedDate, setSuppliersByRoutes,
    setSelectedLine,
    setSelectedOfficer,
    clearSupplierState,
} = supplierSlice.actions;

export default supplierSlice.reducer;
