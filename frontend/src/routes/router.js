import React from "react";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";

import LoginPage from "../components/loginPage/loginPage";

import Topbar from "../scenes/Topbar.jsx";
import Sidebar from "../scenes/Sidebar.jsx";

import AddUserPage from "../components/usersPage/addUserPage";
import ViewUsersPage from "../components/usersPage/viewUsersPage";

import ViewTrucksPage from "../components/trucksPage/viewTrucksPage.js";
import AddTruckPage from "../components/trucksPage/addTruckPage.js";

import DashboardPage from "../components/dashboardPage/dashboardPage.js";

import MyProfilePage from "../components/myProfilePage/myProfilePage";
import SettingsPage from "../components/settingsPage/settingsPage";

import { ColorModeContext, useMode } from "../theme";

import NoAccessPage from "../components/noAccessPage/NoAccessPage";
import TruckPreOperationalChecklist from "../components/preOperationalPage/truckPreOperationalPage.js";
import ViewFormPage from "../components/preOperationalPage/viewForm.js";

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
        <Route exact path="/" element={<LoginPage title="CiboTrucks | Login" />} />
        <Route
          exact
          path="/noaccess"
          element={<NoAccessPage title="No Access" />}
        />
        <Route
          exact
          path="/login"
          element={<LoginPage title="CiboTrucks | Login" />}
        />
        <Route
          exact
          path="/truck/:id"
          element={
            <TruckPreOperationalChecklist title="CiboTrucks | Pre-Operational Checklist" />
          }
        />
      </Route>
      <Route element={<BarLayout />}>
        <Route
          exact
          path="/settings"
          element={<SettingsPage title="CiboTrucks | Settings" />}
        />

        <Route
          exact
          path="/users/view"
          element={<ViewUsersPage title="CiboTrucks | View Users" />}
        />
        <Route
          exact
          path="/users/add"
          element={<AddUserPage title="CiboTrucks | Add User" />}
        />
        <Route
          exact
          path="/profile"
          element={<MyProfilePage title="CiboTrucks | My Profile" />}
        />
        <Route
          exact
          path="/trucks/view"
          element={<ViewTrucksPage title="CiboTrucks | View Trucks" />}
        />
        <Route
          exact
          path="/trucks/add"
          element={<AddTruckPage title="CiboTrucks | Add Truck" />}
        />
        <Route
          exact
          path="/dashboard"
          element={<DashboardPage title="CiboTrucks | Dashboard" />}
        />
        <Route
          exact
          path="/form/:id"
          element={<ViewFormPage title="CiboTrucks | Form Details" />}
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Route>
    </Routes>
  );
};

export default Router;
