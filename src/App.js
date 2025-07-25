import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import LoginForm from "./pages/LoginForm";
import Dashboard from "./pages/Dashboard";
import HeaderComponent from "./components/Header";
import MainLayout from "./components/MainLayout";
import Suppliers from "./pages/Suppliers";
import SupplierInfo from "./pages/SupplierInfo";
import LeafSupply from "./pages/LeafCountChart";
import { App as AntdApp } from "antd";
import LastSupply from "./pages/LastSupply";
import LeafSupplyByDateRange from "./pages/LeafSupplyByDateRange";
import Prediction from "./pages/Prediction";
import { ToastContainer } from "react-toastify";
import OfficerTargets from "./pages/OfficerTargets";
import TodaySuppliersFull from "./pages/TodaySuppliersOfficer.js";
import Summary from "./pages/Summery";
import MissRejo from "./pages/Miss&Rejo.js";
import RegisterPage from "./pages/RegisterPage.js";

// ✅ Session check
export const isSessionValid = () => {

  const token = localStorage.getItem("token");


  console.log(token);


  try {


    if (!token) {
      localStorage.removeItem("loggedInUser");
      localStorage.removeItem("token");
      return false
    } else {
      return true;

    }





  } catch (e) {
    console.error("Invalid session format", e);
    localStorage.removeItem("loggedInUser");
    localStorage.removeItem("token");
    return false;
  }
};

// ✅ Layout wrapper
const LayoutWithHeader = () => (
  <>
    <HeaderComponent />
    <MainLayout />
  </>
);

// ✅ Route guard
const PrivateRoute = ({ element }) => {
  return isSessionValid() ? element : <Navigate to="/login" replace />;
};

const App = () => {
  return (
    <AntdApp>
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={true}
        newestOnTop={true}
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
        limit={3}
      />

      <Router>
        <Routes>
          {/* ✅ Public Routes */}
          <Route
            path="/login"
            element={
              isSessionValid() ? <Navigate to="/dashboard" replace /> : <LoginForm />
            }
          />
          <Route
            path="/register"
            element={
              isSessionValid() ? <Navigate to="/dashboard" replace /> : <RegisterPage />
            }
          />

          {/* ✅ Protected Routes */}
          <Route element={<LayoutWithHeader />}>
            <Route index element={<PrivateRoute element={<Dashboard />} />} />
            <Route path="/dashboard" element={<PrivateRoute element={<Dashboard />} />} />
            <Route path="/leaf/supply" element={<PrivateRoute element={<LeafSupply />} />} />
            <Route path="/leaf/dailyLeafSupply" element={<PrivateRoute element={<LeafSupplyByDateRange />} />} />
            <Route path="/leaf/lastSupply" element={<PrivateRoute element={<LastSupply />} />} />
            <Route path="/leaf/todaySupply/officer" element={<PrivateRoute element={<TodaySuppliersFull />} />} />
            <Route path="/suppliers/routes" element={<PrivateRoute element={<Suppliers />} />} />
            <Route path="/factory-targets/prediction" element={<PrivateRoute element={<Prediction />} />} />
            <Route path="/factory-targets/officer" element={<PrivateRoute element={<OfficerTargets />} />} />
            <Route path="/summery" element={<PrivateRoute element={<Summary />} />} />
            <Route path="/missing" element={<PrivateRoute element={<MissRejo />} />} />
            <Route path="/supplier/info" element={<PrivateRoute element={<SupplierInfo />} />} />

            {/* 404 */}
            <Route path="/404" element={<div>404 - Page Not Found</div>} />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Route>
        </Routes>
      </Router>
    </AntdApp>
  );
};

export default App;
