import { useDispatch } from "react-redux";
import { hideLoader, showLoader } from "../redux/loaderSlice";

// api.js
export const BASE_URL = "http://newserver:46597/quiX/ControllerV1";
export const API_KEY = "quix717244";
const buildQueryParams = (params) =>
  Object.entries(params)
    .filter(([_, v]) => v !== undefined && v !== "" && v !== null)
    .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
    .join("&");

export const fetchSupplierDataFromAPI = async ({ filter, dispatch }) => {
  const baseUrl = "/quiX/ControllerV1/supdata";
  const params = new URLSearchParams({
    k: API_KEY,
    r: filter.line
  });
  const url = `${baseUrl}?${params.toString()}`;


  dispatch?.(showLoader());

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch supplier data");
    let data = await response.json();

    // ✅ Ensure it's an array
    if (Array.isArray(data)) {
      return data

    } else if (data && typeof data === "object") {
      return [data];
    } else {
      return [];
    }
  } catch (err) {
    return []
  } finally {
    dispatch?.(hideLoader());

  }

};

export const getAllSuppliers = async ({ dispatch } = {}) => {
  dispatch?.(showLoader());

  const query = {
    k: API_KEY,
    s: '00000~99999',
    h: '1,2,3,4,5,6,7,8,9,10'
  };
  const url = `${BASE_URL}/supdata?${buildQueryParams(query)}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to fetch supplier data");
  dispatch?.(hideLoader());

  return response.json();
};

export const getSuppliersByRoute = async ({ filters, dispatch } = {}) => {
  console.log(filters);

  dispatch?.(showLoader());

  const query = {
    k: API_KEY,
    r: filters.line,       // e.g. "23,24"

  };
  const url = `${BASE_URL}/supdata?${buildQueryParams(query)}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to fetch supplier data");
  dispatch?.(hideLoader());

  return response.json();
};

export const getSuppliersById = async ({ supplierId, dispatch } = {}) => {

  dispatch?.(showLoader());
  const query = {
    k: API_KEY,
    s: supplierId,    // e.g. "00001,00002" or "00001~00005"
    //r: routeNos,       // e.g. "23,24"
    h: '1,2,3,4,5,6,7,8,9,10'        // e.g. "1,2,3,5"
  };
  const url = `${BASE_URL}/supdata?${buildQueryParams(query)}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to fetch supplier data");
  dispatch?.(hideLoader());

  return response.json();
};

export const getSuppliersByLine = async ({ lineCode, dispatch } = {}) => {
  dispatch?.(showLoader());

  const query = {
    k: API_KEY,
    r: "23", // e.g. "TP", "S", etc.
  };
  const url = `${BASE_URL}/supdata?${buildQueryParams(query)}`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch supplier data");
    const data = await response.json();
    return data;
  } catch (err) {
    console.error("getSuppliersByLine error:", err);
    throw err;
  } finally {
    dispatch?.(hideLoader());
  }
};


export const getLeafRecordsByRoutes = async ({ dateRange, routeNos, headings, dispatch } = {}) => {

  dispatch?.(showLoader());
  const query = {
    k: API_KEY,
    d: dateRange,      // e.g. "2024-06-01~2024-06-30"
    r: routeNos,       // optional
    h: '1,2,3,4,5,6,7,8,9,10'        // e.g. "1,2,4,8"
  };
  const url = `${BASE_URL}/glfdata?${buildQueryParams(query)}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to fetch leaf records");
  dispatch?.(hideLoader());

  return response.json();
};



export const getMonthDateRangeFromParts = (year, month) => {
  const yearNum = Number(year);
  const monthNum = Number(month);

  const firstDate = new Date(yearNum, monthNum - 1, 1);
  const lastDate = new Date(yearNum, monthNum, 0); // still valid, just format carefully

  const formatDate = (date) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  return `${formatDate(firstDate)}~${formatDate(lastDate)}`;
};


export const getLeafRecordsBySupplierId = async ({ filters, supplierId, dispatch } = {}) => {
  console.log('getLeafRecordsBySupplierId............');

  dispatch?.(showLoader());
  const query = {
    k: API_KEY,
    d: '2025-05-06',
    h: '1,2,3,4,5,6,7,8,9,10'    ,   // e.g. "2024-06-01~2024-06-30"
    s: supplierId,      // optional
  };


  const url = `${BASE_URL}/glfdata?${buildQueryParams(query)}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to fetch leaf records");
  dispatch?.(hideLoader());

  return response.json();
};

export const getIssueRecords = async ({ dateRange, supplierNos, issueTypes, headings, dispatch } = {}) => {

  dispatch?.(showLoader());

  const query = {
    k: API_KEY,
    d: dateRange,      // e.g. "2024-06-01~2024-06-30"
    s: supplierNos,    // optional
    t: issueTypes,     // optional
    h: headings        // e.g. "1,2,3,4"
  };
  const url = `${BASE_URL}/isudata?${buildQueryParams(query)}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to fetch issue records");
  dispatch?.(hideLoader());

  return response.json();
};
