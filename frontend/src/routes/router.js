import React from "react";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";

import QRGivePage from "../components/partsPage/QRGivePage.js";
import QRIssueManagementPage from "../components/QRIssuesPage/QRIssueManagementPage";
import QRAddPartPage from "../components/partsPage/QRAddPartPage";
import QROperatorIssueRequestPage from "../components/targetsPage/QROperatorIssueRequestPage";

import LoginPage from "../components/loginPage/loginPage";

import DashboardPage from "../components/dashboardPage/dasboardPage";

import Topbar from "../scenes/Topbar.jsx";
import Sidebar from "../scenes/Sidebar.jsx";

import IssueMonitoringPage from "../components/issueMonitoringPage/issueMonitoringPage";

import InventoryBaseReportPage from "../components/reportsPage/inventoryBaseReportPage.js";
import TechnicianBaseReportPage from "../components/reportsPage/technicianBaseReportPage.js";
import CostBaseReportPage from "../components/reportsPage/costBaseReportPage.js";
import MaintenanceBaseReportPage from "../components/reportsPage/maintenanceBaseReportPage.js";
import MaintenanceReportPage from "../components/reportsPage/maintenanceReportPage";
import CostReportPage from "../components/reportsPage/costReportPage";
import TechniciansReportPage from "../components/reportsPage/technicianReportPage";
import CustomReportPage from "../components/reportsPage/customReportPage";
import InventoryReportPage from "../components/reportsPage/inventoryReportPage";

import AddPartPage from "../components/partsPage/addPartPage";
import StockTable from "../components/partsPage/StockTable";

import AddUserPage from "../components/usersPage/addUserPage";
import ViewUsersPage from "../components/usersPage/viewUsersPage";

import ViewLabelsPage from "../components/labelsPage/viewLabelsPage";
import AddLabelPage from "../components/labelsPage/addLabelPage";

import ViewLocationsPage from "../components/locationsPage/viewLocationsPage.js";
import AddLocationPage from "../components/locationsPage/addLocationPage";

import AddVendorPage from "../components/vendorsPage/addVendorPage";
import ViewVendorsPage from "../components/vendorsPage/viewVendorsPage";

import AddFixingMethodPage from "../components/fixingMethodsPage/addFixingMethodPage";
import ViewFixingMethodsPage from "../components/fixingMethodsPage/viewFixingMethodsPage";

import ViewTargetsPage from "../components/targetsPage/viewTargetsPage.js";
import AddTargetPage from "../components/targetsPage/addTargetPage";

import ViewMachineTypesPage from "../components/machineTypesPage/viewMachineTypesPage";
import AddMachineTypePage from "../components/machineTypesPage/addMachineTypePage";

import ViewProblemsPage from "../components/problemsPage/viewProblemsPage.js";
import AddProblemPage from "../components/problemsPage/addProblemPage";

import AddSuperiorPage from "../components/problemsPage/addSuperiorPage";
import ViewSuperiorsPage from "../components/problemsPage/viewSuperiorsPage";

import CreateIssuePage from "../components/issuesPage/createIssuePage";
import ViewIssuesPage from "../components/issuesPage/viewIssuesPage";

import PurchasesPage from "../components/purchasesPage/purchasesPage.js";
import ViewPurchasesPage from "../components/purchasesPage/viewPurchasesPage.js";

import POPage from "../components/poPage/poPage";
import ViewPOPage from "../components/poPage/viewPoPage.js";

import OutputLogsPage from "../components/logsPage/outputLogsPage";
import ReturnLogsPage from "../components/logsPage/returnLogsPage";
import ConsumeLogsPage from "../components/logsPage/consumeLogsPage";

import MyProfilePage from "../components/myProfilePage/myProfilePage";
import SettingsPage from "../components/settingsPage/settingsPage";

import CameraDiscovery from "../components/camerasPage/cameraDiscoveryPage.js";

import { ColorModeContext, useMode } from "../theme";

import NoAccessPage from "../components/noAccessPage/NoAccessPage";

const BarLayout = () => {
  const [theme, colorMode] = useMode();
  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <div className="app">
          <Sidebar />
          <main className="content">
            <Topbar />
            <Outlet />
          </main>
        </div>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
};

const RegularLayout = () => {
  const [theme, colorMode] = useMode();
  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <div className="app">
          <main className="content">
            <Outlet />
          </main>
        </div>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
};

const Router = () => {
  return (
    <Routes>
      <Route element={<RegularLayout />}>
        <Route exact path="/" element={<LoginPage title="CiboENG | Login" />} />
        <Route
          exact
          path="/noaccess"
          element={<NoAccessPage title="No Access" />}
        />
        <Route
          exact
          path="/login"
          element={<LoginPage title="CiboENG | Login" />}
        />
        <Route
          exact
          path="/reports/custom"
          element={<CustomReportPage title="CiboENG | Custom Report" />}
        />
        <Route
          exact
          path="/reports/maintenance"
          element={
            <MaintenanceReportPage title="CiboENG | Maintenance Report" />
          }
        />
        <Route
          exact
          path="/reports/cost"
          element={<CostReportPage title="CiboENG | Cost Report" />}
        />
        <Route
          exact
          path="/reports/technicians"
          element={
            <TechniciansReportPage title="CiboENG | Technicians Report" />
          }
        />
        <Route
          exact
          path="/reports/inventory"
          element={<InventoryReportPage title="CiboENG | Inventory Report" />}
        />
        <Route
          exact
          path="/issuemonitoring"
          element={<IssueMonitoringPage title="CiboENG | Issue Monitoring" />}
        />

        <Route
          exact
          path="/qr/:id"
          element={<QRGivePage title="CiboENG | Give" />}
        />
        <Route
          exact
          path="/location/:id"
          element={<QRAddPartPage title="CiboENG | Add Item" />}
        />
        <Route
          exact
          path="/target/:id"
          element={<QRIssueManagementPage title="CiboENG | Issue Control" />}
        />
        <Route
          exact
          path="/operator/:id"
          element={
            <QROperatorIssueRequestPage title="CiboENG | Issue Request" />
          }
        />
      </Route>
      <Route element={<BarLayout />}>
        <Route
          exact
          path="/settings"
          element={<SettingsPage title="CiboENG | Settings" />}
        />

        <Route
          exact
          path="/dashboard"
          element={<DashboardPage title="CiboENG | Dashboard" />}
        />

        <Route
          exact
          path="/stock/vreeland"
          element={
            <StockTable key="V" facility="V" title="CiboENG | Vreeland" />
          }
        />
        <Route
          exact
          path="/stock/madison"
          element={
            <StockTable key="M" facility="M" title="CiboENG | Madison" />
          }
        />

        <Route
          exact
          path="/purchases/add"
          element={<PurchasesPage title="CiboENG | Add Purchase" />}
        />
        <Route
          exact
          path="/purchases/view"
          element={<ViewPurchasesPage title="CiboENG | View Purchases" />}
        />

        <Route
          exact
          path="/po/view"
          element={<ViewPOPage title="CiboENG | View POs" />}
        />
        <Route
          exact
          path="/po/add"
          element={<POPage title="CiboENG | Add PO" />}
        />

        <Route
          exact
          path="/maintenancereports"
          element={
            <MaintenanceBaseReportPage title="CiboENG | Maintenance Report" />
          }
        />
        <Route
          exact
          path="/costreports"
          element={<CostBaseReportPage title="CiboENG | Cost Report" />}
        />
        <Route
          exact
          path="/techniciansreports"
          element={
            <TechnicianBaseReportPage title="CiboENG | Technicians Report" />
          }
        />
        <Route
          exact
          path="/inventoryreports"
          element={
            <InventoryBaseReportPage title="CiboENG | Inventory Report" />
          }
        />
        <Route
          exact
          path="/parts/add"
          element={<AddPartPage title="CiboENG | Add Part" />}
        />

        <Route
          exact
          path="/tags/view"
          element={<ViewLabelsPage title="CiboENG | View Tags" />}
        />
        <Route
          exact
          path="/tags/add"
          element={<AddLabelPage title="CiboENG | Add Tag" />}
        />

        <Route
          exact
          path="/logs/output"
          element={<OutputLogsPage title="CiboENG | Output Logs" />}
        />
        <Route
          exact
          path="/logs/consumables"
          element={<ConsumeLogsPage title="CiboENG | Consume Logs" />}
        />

        <Route
          exact
          path="/logs/return"
          element={<ReturnLogsPage title="CiboENG | Return Logs" />}
        />

        <Route
          exact
          path="/users/view"
          element={<ViewUsersPage title="CiboENG | View Users" />}
        />
        <Route
          exact
          path="/users/add"
          element={<AddUserPage title="CiboENG | Add User" />}
        />
        <Route
          exact
          path="/profile"
          element={<MyProfilePage title="CiboENG | My Profile" />}
        />

        <Route
          exact
          path="/locations/view"
          element={<ViewLocationsPage title="CiboENG | View Locations" />}
        />
        <Route
          exact
          path="/locations/add"
          element={<AddLocationPage title="CiboENG | Add Location" />}
        />

        <Route
          exact
          path="/vendors/view"
          element={<ViewVendorsPage title="CiboENG | View Vendors" />}
        />
        <Route
          exact
          path="/vendors/add"
          element={<AddVendorPage title="CiboENG | Add Vendor" />}
        />

        <Route
          exact
          path="/machinetypes/view"
          element={
            <ViewMachineTypesPage title="CiboENG | View Machine Types" />
          }
        />
        <Route
          exact
          path="/machinetypes/add"
          element={<AddMachineTypePage title="CiboENG | Add Machine Type" />}
        />

        <Route
          exact
          path="/targets/view"
          element={<ViewTargetsPage title="CiboENG | View Targets" />}
        />
        <Route
          exact
          path="/targets/add"
          element={<AddTargetPage title="CiboENG | Add Target" />}
        />
        <Route
          exact
          path="/cameras/discover"
          element={<CameraDiscovery title="CiboENG | Discover Cameras" />}
        />

        <Route
          exact
          path="/issues/view"
          element={<ViewIssuesPage title="CiboENG | View Issues" />}
        />
        <Route
          exact
          path="/issues/create"
          element={<CreateIssuePage title="CiboENG | Create Issue" />}
        />

        <Route
          exact
          path="/fixingmethods/view"
          element={
            <ViewFixingMethodsPage title="CiboENG | View Fixing Methods" />
          }
        />
        <Route
          exact
          path="/fixingmethods/add"
          element={<AddFixingMethodPage title="CiboENG | Add Fixing Method" />}
        />

        <Route
          exact
          path="/problems/view"
          element={<ViewProblemsPage title="CiboENG | View Problems" />}
        />
        <Route
          exact
          path="/problems/add"
          element={<AddProblemPage title="CiboENG | Add Problem" />}
        />

        <Route
          exact
          path="/problems/superiors/view"
          element={<ViewSuperiorsPage title="CiboENG | View Superiors" />}
        />
        <Route
          exact
          path="/problems/superiors/add"
          element={<AddSuperiorPage title="CiboENG | Add Superior" />}
        />

        <Route path="*" element={<Navigate to="/" />} />
      </Route>
    </Routes>
  );
};

export default Router;
