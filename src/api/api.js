import { hideLoader, showLoader } from "../redux/loaderSlice";
import axios from "axios";


export const BASE_URL = "http://newserver:46597/quiX/ControllerV1";

const API_BASE = "http://localhost:8000"; // Update for production


export const createOrUpdateLeafCount = (payload) => {
  return axios.post(`${API_BASE}/leaf-count`, payload);
};

export const getAllLeafCounts = async () => {

  try {
    const response = await axios.get(`${API_BASE}/leaf-count`);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch leaf counts", error);
    throw error;
  }

};

// 📆 Get all records for specific year/month
export const getLeafCountsByMonthYear = async (year, month) => {

  try {
    const response = await axios.get(`${API_BASE}/leaf-count/${year}/${month}`);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch leaf counts", error);
    throw error;
  }
};

// 🔍 Get one record by lineCode, year, month
export const getLeafCountByLineMonthYear = (lineCode, year, month) => {
  return axios.get(`${API_BASE}/leaf-count/${lineCode}/${year}/${month}`);
};

// 🗑️ Delete a record by lineCode, year, month
export const deleteLeafCount = (lineCode, year, month) => {
  try {
    return axios.delete(`${API_BASE}/leaf-count/${lineCode}/${year}/${month}`);

  } catch (error) {
    // rethrow for caller to handle
    throw error;
  }
};


export const login = async (username, password) => {
  try {
    const response = await axios.post(`${API_BASE}/auth/login`, {
      username,
      password,
    });

    return response.data; // contains: { access_token, user }
  } catch (error) {
    // rethrow for caller to handle
    throw error;
  }
};



export const register = async (username, password, role = 'user') => {
  return axios.post(
    `${API_BASE}/auth/register`,
    { username, password, role },
    {
      withCredentials: true, // ✅ allow sending cookies if needed
    }
  );
};

// api.js or targetService.js (frontend)
export const deleteTarget = (lineCode, year, month) => {
  return axios.delete(`${API_BASE}/targets/${lineCode}/${year}/${month}`);
};

export const updateTarget = (lineCode, year, month, target) =>
  axios.put(`${API_BASE}/targets/${lineCode}/${year}/${month}`, {
    target
  });

export const fetchMonthlyTargets = async (year, month) => {


  try {
    const response = await axios.get(`${API_BASE}/targets/${year}/${month}`);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch targets:", error);
    throw error;
  }
};


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

export const getPreviousMonthDateRange = (year, month) => {
  const yearNum = Number(year);
  const monthNum = Number(month);

  // Calculate the previous month and adjust year if needed
  const prevMonth = monthNum - 1;
  const prevMonthYear = prevMonth === 0 ? yearNum - 1 : yearNum;
  const prevMonthNum = prevMonth === 0 ? 12 : prevMonth;

  const firstDate = new Date(prevMonthYear, prevMonthNum - 1, 1);
  const lastDate = new Date(prevMonthYear, prevMonthNum, 0); // last day of prev month

  const formatDate = (date) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  return `${formatDate(firstDate)}~${formatDate(lastDate)}`;
};


export const getLeafRecordsBySupplierId = async ({ filters, supplierId, dispatch } = {}) => {
  dispatch?.(showLoader());
  const query = {
    k: API_KEY,
    d: '2025-05-06',
    h: '1,2,3,4,5,6,7,8,9,10',   // e.g. "2024-06-01~2024-06-30"
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


export const ajithLines = '81,60,154,65,146,74,33,8,98,145,97';
export const udaraLines = '23, 72, 96, 149, 21, 9,162';
export const udayangaLines = '6, 7, 25, 62, 61, 150, 155, 36, 102, 161, 64, 48, 129';
export const gaminiLines = '109, 70, 12, 31, 157, 34, 127';
export const chamodLines = '91, 67, 68, 69, 138, 124';




export const getUsers = async () => {
  try {
    const res = await axios.get(`${API_BASE}/users`);
    return res.data;
  } catch (err) {
    console.error(" Failed to fetch users:", err);
    throw err;
  }
};

export const getUserById = async (id) => {
  try {
    const res = await axios.get(`${API_BASE}/users/${id}`);
    return res.data;
  } catch (err) {
    console.error(` Failed to fetch user ID ${id}:`, err);
    throw err;
  }
};

export const createUser = async (userData) => {
  try {
    const res = await axios.post(`${API_BASE}/users`, userData);
    return res.data;
  } catch (err) {
    console.error(" Failed to create user:", err);
    throw err;
  }
};

export const updateUser = async (id, userData) => {
  try {
    const res = await axios.put(`${API_BASE}/users/${id}`, userData);
    return res.data;
  } catch (err) {
    console.error(` Failed to update user ID ${id}:`, err);
    throw err;
  }
};

export const deleteUser = async (id) => {
  try {
    const res = await axios.delete(`${API_BASE}/users/${id}`);
    return res.data;
  } catch (err) {
    console.error(` Failed to delete user ID ${id}:`, err);
    throw err;
  }
};

export const toggleUserStatus = async (id, status) => {
  try {
    const res = await axios.patch(`${API_BASE}/users/${id}/status`, { status });
    return res.data;
  } catch (err) {
    console.error(` Failed to toggle status for user ID ${id}:`, err);
    throw err;
  }
};

export const updateUserRole = async (id, role) => {
  try {
    const res = await axios.patch(`${API_BASE}/users/${id}/role`, { role });
    return res.data;
  } catch (err) {
    console.error(` Failed to update role for user ID ${id}:`, err);
    throw err;
  }
};


export async function fetchOfficers() {
  try {
    const response = await axios.get(`${API_BASE}/officers`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch officers', error);
    throw error;
  }
}

// Get one officer by id
export async function fetchOfficerById(id) {
  try {
    const response = await axios.get(`${API_BASE}/officers/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch officer id=${id}`, error);
    throw error;
  }
}

// Create new officer
export async function createOfficer(officerData) {
  try {
    const data = {
      name: officerData.officer,
      nic: officerData.nic, 
      joinedDate: officerData.joinedDate
    };    
    const response = await axios.post(`${API_BASE}/officers`, data);
    return response.data;
  } catch (error) {
    console.error('Failed to create officer', error);
    throw error;
  }
}

// Delete officer by id
export async function deleteOfficer(officer) {
  try {
    await axios.delete(`${API_BASE}/officers/${officer.id}`);
  } catch (error) {
    console.error(`Failed to delete officer id=${officer.id}`, error);
    throw error;
  }
}

// Get all lines
export async function fetchLines() {
  try {
    const response = await axios.get(`${API_BASE}/lines`);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch lines", error);
    throw error;
  }
}

// Create a new line
export async function createLine(lineData) {
  try {
    const response = await axios.post(`${API_BASE}/lines`, lineData);
    return response.data;
  } catch (error) {
    console.error("Failed to create line", error);
    throw error;
  }
}

// Update a line by composite keys: lineCode and lineId
export async function updateLine(lineCode, lineId, updateData) {
  try {
   
    
    const response = await axios.put(`${API_BASE}/lines/${lineCode}/${lineId}`, updateData);
    return response.data;
  } catch (error) {
    console.error("Failed to update line", error);
    throw error;
  }
}

export async function updateOfficer(id,updateData) {
  try {    
        const data = {
      name: updateData.officer,
      nic: updateData.nic, 
      joinedDate: updateData.joinedDate
    };   
    const response = await axios.put(`${API_BASE}/officers/${id}`, data);
    return response.data;
  } catch (error) {
    console.error("Failed to update officer", error);
    throw error;
  }
}


// Delete a line by lineCode and lineId
export async function deleteLine(lineCode, lineId) {
  try {
    const response = await axios.delete(`${API_BASE}/lines/${lineCode}/${lineId}`);
    return response.data;
  } catch (error) {
    console.error("Failed to delete line", error);
    throw error;
  }
}
