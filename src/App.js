import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginForm from "./pages/LoginForm";
import Dashboard from "./pages/Dashboard";
import HeaderComponent from "./components/Header";
import MainLayout from "./components/MainLayout";
import EmployeeManagementPage from "./pages/Employees";
import FactoryTargetAchievemenets from "./pages/FactoryTargetAchievemenets";
import LeafCountChart from "./pages/LeafCountChart";
import RegisterPage from "./pages/RegistrationForm";
import MealManagement from "./pages/MealManagement";
import Suppliers from "./pages/Suppliers"; // Assuming this is the correct import for the Suppliers page
import Vehicles from "./pages/Vehicles";
import SupplierInfo from "./pages/SupplierInfo";
import LeafSupply from "./pages/LeafCountChart";
import { App as AntdApp } from 'antd';
import MissingCards from "./pages/Missing Cards";
import LeafSupplyByDateRange from "./pages/LeafSupplyByDateRange";
import Prediction from "./pages/Prediction";
import OfficersPage from "./pages/Officers";
import { ToastContainer } from "react-toastify";
import OfficerTargets from "./pages/OfficerTargets";
import TodaySuppliers from "./pages/TodaySuppliers";
import TodaySuppliersFull from "./pages/TodaySuppliersFull";
import Summary from "./pages/Summery";

const LayoutWithHeader = () => (
  <>
    <HeaderComponent />
    <MainLayout />
  </>
);

const App = () => {
  return (
    <AntdApp> {/* ✅ Wrap with Ant Design context provider */}

      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={true}
        newestOnTop={true}
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark" // or "light" | "dark"
        limit={3} // limit to 3 toasts at a time
      />

      <Router>
        <Routes>

          {/* ✅ Public Routes without header */}
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* ✅ Protected Routes with header */}
          <Route element={<LayoutWithHeader />}>
            <Route index element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/factory-targets" element={<FactoryTargetAchievemenets />} />

            <Route path="/officers" element={<OfficersPage />} />

            <Route path="/employees" element={<EmployeeManagementPage />} />

            <Route path="/src/pages/Employees.js" element={<EmployeeManagementPage />} />

            <Route path="/leaf/supply" element={<LeafSupply />} />

            <Route path="/leaf/dailyLeafSupply" element={<LeafSupplyByDateRange
            />} />
            <Route path="/leaf/missingCards" element={<MissingCards />} />
            <Route path="/leaf/todaySupply/route" element={<TodaySuppliers />} />
            <Route path="/leaf/todaySupply/full" element={<TodaySuppliersFull />} />

            <Route path="/meal" element={<MealManagement />} />

            <Route path="/suppliers/routes" element={<Suppliers />} />
            <Route path="/factory-targets/prediction" element={<Prediction />} />
            <Route path="/factory-targets/officer" element={<OfficerTargets />} />

            <Route path="/summery" element={<Summary />} />
            <Route path="/vehicles" element={<Vehicles />} />
            <Route path="/supplier/info" element={<SupplierInfo />} />
            {/* 404 Route */}

            <Route path="/404" element={<div>404 - Page Not Found</div>} />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Route>

        </Routes>
      </Router>
    </AntdApp>

  );
};

export default App;
