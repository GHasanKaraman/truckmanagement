import { useEffect, useState } from "react";
import {
  Sidebar as ProSidebar,
  Menu,
  SubMenu,
  MenuItem,
} from "react-pro-sidebar";
import { Box, IconButton, Typography, Avatar, useTheme } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";

import { tokens } from "../theme";

import SvgIcon from "@mui/material/SvgIcon";
import SellOutlinedIcon from "@mui/icons-material/SellOutlined";
import DynamicFeedIcon from "@mui/icons-material/DynamicFeed";
import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import PrecisionManufacturingOutlinedIcon from "@mui/icons-material/PrecisionManufacturingOutlined";
import EngineeringOutlinedIcon from "@mui/icons-material/EngineeringOutlined";
import ConstructionOutlinedIcon from "@mui/icons-material/ConstructionOutlined";
import RoomPreferencesOutlinedIcon from "@mui/icons-material/RoomPreferencesOutlined";
import MonitorOutlinedIcon from "@mui/icons-material/MonitorOutlined";
import SummarizeOutlinedIcon from "@mui/icons-material/SummarizeOutlined";
import HistoryEduOutlinedIcon from "@mui/icons-material/HistoryEduOutlined";
import TroubleshootOutlinedIcon from "@mui/icons-material/TroubleshootOutlined";
import HelpOutlineOutlinedIcon from "@mui/icons-material/HelpOutlineOutlined";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import DashboardIcon from "@mui/icons-material/Dashboard";
import TableViewIcon from "@mui/icons-material/TableView";
import PostAddIcon from "@mui/icons-material/PostAdd";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import InventoryIcon from "@mui/icons-material/Inventory";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import PermContactCalendarIcon from "@mui/icons-material/PermContactCalendar";
import AddBusinessIcon from "@mui/icons-material/AddBusiness";
import MapIcon from "@mui/icons-material/Map";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import AddLocationAltIcon from "@mui/icons-material/AddLocationAlt";
import BuildIcon from "@mui/icons-material/Build";
import OutputIcon from "@mui/icons-material/Output";
import AssignmentReturnIcon from "@mui/icons-material/AssignmentReturn";
import PhoneIphoneIcon from "@mui/icons-material/PhoneIphone";
import ReceiptIcon from "@mui/icons-material/Receipt";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import PointOfSaleIcon from "@mui/icons-material/PointOfSale";
import ShopIcon from "@mui/icons-material/Shop";

import logo from "../images/slowLogo.gif";
import baseRequest from "../core/baseRequest";

import { userInformations } from "../atoms/userAtoms";
import { useRecoilState } from "recoil";

import defaultUserImage from "../images/defaultUser.jpg";
import { IP } from "../env";
import { errorHandler } from "../core/errorHandler";
import useControl from "../hooks/useControl";
import useSignOut from "../hooks/useSignOut";
import { useSnackbar } from "notistack";
import { verifyPermissions } from "../utils/helpers";
import { ConstructionOutlined, WifiFind } from "@mui/icons-material";

const Item = ({ title, to, icon, selected, setSelected, sub, parentTitle }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();

  const [user, setUser] = useRecoilState(userInformations);

  if (
    ([
      "Logs",
      "Purchases",
      "PO",
      "Reports",
      "Tags",
      "Users",
      "Locations",
      "Vendors",
      "Machine Types",
      "Fixing Methods",
      "Problems",
    ].includes(parentTitle) ||
      [
        "Dashboard",
        "Vreeland",
        "Madison",
        "Create Issue",
        "New Part",
        "Add Target",
      ].includes(title)) &&
    !verifyPermissions(user.permissions, "awi")
  ) {
    return undefined;
  }

  return (
    <MenuItem
      active={selected === title}
      style={{
        color: colors.grey[100],
      }}
      onClick={() => {
        if (sub) {
          setSelected(parentTitle);
        } else {
          setSelected(title);
        }
        navigate(to);
      }}
      icon={icon}
    >
      <Typography>{title}</Typography>
    </MenuItem>
  );
};

const ItemGroup = ({ label, icon, items, selected }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [user, setUser] = useRecoilState(userInformations);

  if (
    [
      "Logs",
      "Purchases",
      "PO",
      "Reports",
      "Tags",
      "Users",
      "Locations",
      "Vendors",
      "Machine Types",
      "Fixing Methods",
      "Problems",
    ].includes(label) &&
    !verifyPermissions(user.permissions, "awi")
  ) {
    return undefined;
  }

  return (
    <SubMenu
      active={selected === label}
      label={label}
      icon={icon}
      style={{
        color: colors.grey[100],
      }}
    >
      {items.map((item, index) => {
        return <div key={index}>{item}</div>;
      })}
    </SubMenu>
  );
};

const Sidebar = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [auth] = useControl();
  const [controller] = useSignOut();

  const location = useLocation();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [isCollapsed, setIsCollapsed] = useState(
    (function () {
      const collapsed = localStorage.getItem("collapsed");
      if (collapsed === "true") {
        return true;
      }
      return false;
    })(),
  );
  const [selected, setSelected] = useState("Dashboard");

  const [user, setUser] = useRecoilState(userInformations);

  const loadUser = async () => {
    try {
      const res = await baseRequest.get("/user/profile", null);
      if (auth(res, true)) {
        setUser(res.data.records);
      }
    } catch (error) {
      const { data, status } = errorHandler(error);
      switch (status) {
        case 401:
          controller.forceLogin();
          break;
        case 403:
          navigate("/noaccess");
          break;
        case 404:
          enqueueSnackbar("Something went wrong retrieving configurations!", {
            variant: "error",
          });
          break;
        case 500:
          enqueueSnackbar(
            "Something went wrong while authenticating the user!",
            {
              variant: "error",
            },
          );
          break;
        default:
          enqueueSnackbar(data, {
            variant: "error",
          });
          break;
      }
    }
  };

  const checkPermissions = () => {
    const path = location.pathname;
    const perms = user?.permissions;
    const forbiddenPages = [
      "/parts/add",
      "/tags/add",
      "/users/add",
      "/locations/add",
      "/vendors/add",
      "purchases/add",
      "/po/add",
      "/issues/create",
      "/machinetypes/add",
      "/targets/add",
      "/fixingmethods/add",
      "/problems/add",
      "/problems/superiors/add",
    ];

    if (forbiddenPages.includes(path) && !verifyPermissions(perms, "awi")) {
      navigate("/noaccess");
    }
  };

  useEffect(() => {
    if (user?.username === "") {
      loadUser();
    }
  });

  useEffect(() => {
    if (user?.username !== "") {
      checkPermissions();
    }
  }, [{ user }]);

  return (
    <Box
      sx={{
        "& .ps-sidebar-container": {
          background: `${colors.primary[400]} !important`,
        },
        "& .ps-submenu-content": {
          background: `${colors.primary[400]} !important`,
          borderRadius: 2,
          marginLeft: 2,
        },
        "& .ps-menu-icon": {
          backgroundColor: "transparent !important",
        },
        "& .ps-menu-button": {
          padding: "5px 35px 5px 20px !important",
        },
        "& .ps-menu-button:hover": {
          color: colors.ciboInnerGreen[500] + " !important",
          backgroundColor: "transparent !important",
        },
        "& .ps-menu-button.ps-active": {
          color: colors.ciboInnerGreen[400] + " !important",
        },
        "& .ps-menu-button svg:hover": {
          stroke: colors.ciboInnerGreen[500] + " !important",
        },
        "& .ps-menu-button.ps-active svg": {
          stroke: colors.ciboInnerGreen[400] + " !important",
        },
      }}
    >
      <ProSidebar collapsed={isCollapsed}>
        <Menu iconShape="square">
          <div style={{ width: "100%", textAlign: "center", marginTop: "5px" }}>
            <img
              alt="logo"
              src={logo}
              width="75%"
              style={{ pointerEvents: "none" }}
            />
            {!isCollapsed ? (
              <Typography variant="h6" color={colors.grey[100]}>
                v2.3.0.1
              </Typography>
            ) : null}
          </div>
          <MenuItem
            onClick={() => {
              localStorage.setItem("collapsed", !isCollapsed);
              setIsCollapsed(!isCollapsed);
            }}
            icon={isCollapsed ? <MenuOutlinedIcon /> : undefined}
            style={{
              margin: "10px 0 20px 0",
              color: colors.grey[100],
            }}
          >
            {!isCollapsed && (
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                ml="15px"
              >
                <Typography variant="h3" color={colors.grey[100]}>
                  USERS
                </Typography>
                <IconButton onClick={() => setIsCollapsed(!isCollapsed)}>
                  <MenuOutlinedIcon />
                </IconButton>
              </Box>
            )}
          </MenuItem>

          {!isCollapsed && (
            <Box mb="25px">
              <Box display="flex" justifyContent="center" alignItems="center">
                {user?.image === "" ? (
                  <img
                    src={defaultUserImage}
                    alt="pp"
                    width={100}
                    height={100}
                    style={{ borderRadius: "50px" }}
                  />
                ) : (
                  <Avatar
                    sx={{ width: 100, height: 100, pointerEvents: "none" }}
                    alt={user.name[0]}
                    src={"http://" + IP + "/" + user?.image}
                  >
                    {user.name[0] + user.surname[0]}
                  </Avatar>
                )}
              </Box>
              <Box textAlign="center">
                <Typography
                  variant="h2"
                  color={colors.grey[100]}
                  fontWeight="bold"
                  sx={{ m: "10px 0 0 0" }}
                >
                  {user?.name}
                </Typography>
                <Typography
                  variant="h5"
                  fontWeight="600"
                  color={colors.ciboInnerGreen[500]}
                >
                  {user?.position}
                </Typography>
              </Box>
            </Box>
          )}

          <Box paddingLeft={isCollapsed ? undefined : "10%"}>
            <Item
              title="Dashboard"
              to="/dashboard"
              icon={<DashboardIcon />}
              selected={selected}
              setSelected={setSelected}
            />
            {verifyPermissions(user.permissions, "iaw") ? (
              <Typography
                variant="h6"
                color={colors.grey[300]}
                sx={{ m: "15px 0 5px 20px" }}
              >
                Stock
              </Typography>
            ) : undefined}
            <Item
              title="Vreeland"
              to="/stock/vreeland"
              icon={
                <SvgIcon viewBox="0 0 384 512" fontSize="1em">
                  <path d="M19.7 34.5c16.3-6.8 35 .9 41.8 17.2L192 364.8 322.5 51.7c6.8-16.3 25.5-24 41.8-17.2s24 25.5 17.2 41.8l-160 384c-5 11.9-16.6 19.7-29.5 19.7s-24.6-7.8-29.5-19.7L2.5 76.3c-6.8-16.3 .9-35 17.2-41.8z" />
                </SvgIcon>
              }
              selected={selected}
              setSelected={setSelected}
            />
            <Item
              title="Madison"
              to="/stock/madison"
              icon={
                <SvgIcon viewBox="0 0 448 512" fontSize="1em">
                  <path d="M22.7 33.4c13.5-4.1 28.1 1.1 35.9 12.9L224 294.3 389.4 46.2c7.8-11.7 22.4-17 35.9-12.9S448 49.9 448 64V448c0 17.7-14.3 32-32 32s-32-14.3-32-32V169.7L250.6 369.8c-5.9 8.9-15.9 14.2-26.6 14.2s-20.7-5.3-26.6-14.2L64 169.7V448c0 17.7-14.3 32-32 32s-32-14.3-32-32V64C0 49.9 9.2 37.5 22.7 33.4z" />
                </SvgIcon>
              }
              selected={selected}
              setSelected={setSelected}
            />
            <Typography
              variant="h6"
              color={colors.grey[300]}
              sx={{ m: "15px 0 5px 20px" }}
            >
              Data
            </Typography>
            <ItemGroup
              label="Logs"
              icon={<HistoryEduOutlinedIcon />}
              selected={selected}
              items={[
                <Item
                  sub
                  title="Output Logs"
                  parentTitle="Logs"
                  to="/logs/output"
                  icon={<OutputIcon />}
                  selected={selected}
                  setSelected={setSelected}
                />,
                <Item
                  sub
                  title="Consume Logs"
                  parentTitle="Logs"
                  to="/logs/consumables"
                  icon={<ConstructionOutlined />}
                  selected={selected}
                  setSelected={setSelected}
                />,
                <Item
                  sub
                  title="Return Logs"
                  parentTitle="Logs"
                  to="/logs/return"
                  icon={<AssignmentReturnIcon />}
                  selected={selected}
                  setSelected={setSelected}
                />,
              ]}
            />
            <ItemGroup
              label="Purchases"
              icon={<ReceiptIcon />}
              selected={selected}
              items={[
                <Item
                  sub
                  title="View Purchases"
                  parentTitle="Purchases"
                  to="/purchases/view"
                  icon={<PointOfSaleIcon />}
                  selected={selected}
                  setSelected={setSelected}
                />,
                <Item
                  sub
                  title="Add Purchase"
                  parentTitle="Purchases"
                  to="/purchases/add"
                  icon={<CreditCardIcon />}
                  selected={selected}
                  setSelected={setSelected}
                />,
              ]}
            />
            <ItemGroup
              label="PO"
              icon={<ShopIcon />}
              selected={selected}
              items={[
                <Item
                  sub
                  title="View POs"
                  parentTitle="PO"
                  to="/po/view"
                  icon={<PointOfSaleIcon />}
                  selected={selected}
                  setSelected={setSelected}
                />,
                <Item
                  sub
                  title="Add PO"
                  parentTitle="PO"
                  to="/po/add"
                  icon={<CreditCardIcon />}
                  selected={selected}
                  setSelected={setSelected}
                />,
              ]}
            />
            <ItemGroup
              label="Reports"
              icon={<SummarizeOutlinedIcon />}
              selected={selected}
              items={[
                <Item
                  sub
                  title="Maintenance"
                  parentTitle="Reports"
                  to="/maintenancereports"
                  icon={<BuildIcon />}
                  selected={selected}
                  setSelected={setSelected}
                />,
                <Item
                  sub
                  title="Costs"
                  parentTitle="Reports"
                  to="/costreports"
                  icon={<AttachMoneyIcon />}
                  selected={selected}
                  setSelected={setSelected}
                />,
                <Item
                  sub
                  title="Technicians"
                  parentTitle="Reports"
                  to="/techniciansreports"
                  icon={<EngineeringOutlinedIcon />}
                  selected={selected}
                  setSelected={setSelected}
                />,
                <Item
                  sub
                  title="Inventory"
                  parentTitle="Reports"
                  to="/inventoryreports"
                  icon={<InventoryIcon />}
                  selected={selected}
                  setSelected={setSelected}
                />,
              ]}
            />
            <ItemGroup
              label="Issues"
              icon={<TroubleshootOutlinedIcon />}
              selected={selected}
              items={[
                <Item
                  sub
                  title="View Issues"
                  parentTitle="Issues"
                  to="/issues/view"
                  icon={<DynamicFeedIcon />}
                  selected={selected}
                  setSelected={setSelected}
                />,
                <Item
                  sub
                  title="Create Issue"
                  parentTitle="Issues"
                  to="/issues/create"
                  icon={<PostAddIcon />}
                  selected={selected}
                  setSelected={setSelected}
                />,
              ]}
            />
            <Item
              title="Issue Monitoring"
              to="/issuemonitoring"
              icon={<MonitorOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            />
            <Typography
              variant="h6"
              color={colors.grey[300]}
              sx={{ m: "15px 0 5px 0px", ml: isCollapsed ? "10px" : "20px" }}
            >
              Settings
            </Typography>
            <Item
              title="New Part"
              to="/parts/add"
              icon={<AddCircleOutlineOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            />
            <Item
              title="Discover Cameras"
              to="/cameras/discover"
              icon={
                <SvgIcon
                  viewBox="0 0 60 60"
                  fontSize="1em"
                  style={{
                    width: 25,
                    height: 25,
                    strokeWidth: "1.2px",
                    stroke: "#000",
                  }}
                >
                  <path d="M56.963,32.026H55.14c-1.703,0-3.088,1.385-3.088,3.088v3.912h-10v-6.219c3.646-1.177,5.957-6.052,5.957-12.781 c0-7.235-2.669-12.333-6.8-12.988c-0.052-0.008-0.104-0.012-0.157-0.012h-40c-0.481,0-0.893,0.343-0.982,0.816l-0.001,0 c-0.02,0.107-0.472,2.648,1.243,4.714c1.138,1.371,2.92,2.169,5.292,2.395c-0.357,1.59-0.552,3.31-0.552,5.075 c0,7.29,3.075,13,7,13h21v12.967c0,1.672,1.36,3.033,3.033,3.033h1.935c1.308,0,2.415-0.837,2.84-2h10.193v2.912 c0,1.703,1.385,3.088,3.088,3.088h1.823c1.703,0,3.088-1.385,3.088-3.088V35.114C60.051,33.411,58.666,32.026,56.963,32.026z M40.967,9.026c2.397,0.436,4.788,3.683,5.018,10h-20.52l-3.707-3.707c-0.188-0.188-0.442-0.293-0.707-0.293h-2h-0.349h-3.985 h-1.07c-0.009-0.014-0.02-0.028-0.029-0.042c-0.102-0.164-0.216-0.329-0.34-0.495c-0.067-0.09-0.142-0.18-0.215-0.27 c-0.033-0.041-0.064-0.082-0.098-0.123c-0.04-0.047-0.081-0.094-0.123-0.141c-0.044-0.05-0.08-0.099-0.125-0.149 c-0.017-0.019-0.039-0.032-0.058-0.05c-0.112-0.121-0.229-0.242-0.352-0.364c-0.079-0.078-0.159-0.155-0.241-0.232 c-0.199-0.186-0.409-0.373-0.633-0.56c-0.18-0.151-0.368-0.298-0.558-0.445c-0.087-0.067-0.173-0.134-0.263-0.201 C9.099,10.823,7.347,9.82,5.766,9.026H40.967z M14.051,18.692c0,2.09-0.6,3.471-1,4.073c-0.4-0.603-1-1.983-1-4.073 c0-0.806,0.087-1.489,0.21-2.053c0.004,0.006,0.012,0.008,0.017,0.013c0.084,0.103,0.186,0.184,0.302,0.246 c0.025,0.013,0.049,0.023,0.076,0.034c0.124,0.054,0.255,0.092,0.396,0.092h0.862C14.005,17.558,14.051,18.116,14.051,18.692z M2.864,11.296c-0.482-0.574-0.696-1.218-0.791-1.773c1.508,0.648,3.509,1.606,5.354,2.716c-0.098,0.246-0.188,0.501-0.276,0.759 C5.147,12.87,3.708,12.299,2.864,11.296z M8.051,20.026c0-2.422,0.382-4.745,1.086-6.671c0.02,0.014,0.04,0.028,0.06,0.042 c0.617,0.445,1.133,0.879,1.576,1.303c-0.351,0.861-0.723,2.197-0.723,3.992c0,3.374,1.402,6.333,3,6.333s3-2.959,3-6.333 c0-0.571-0.048-1.125-0.124-1.667h1.92c0.135,0.988,0.204,1.994,0.204,3c0,6.195-2.688,11-5,11 C10.687,31.026,8.051,26.508,8.051,20.026z M16.724,31.026c0.028-0.033,0.053-0.075,0.081-0.109 c0.191-0.231,0.376-0.479,0.554-0.742c0.03-0.044,0.061-0.082,0.091-0.127c0.205-0.313,0.399-0.65,0.585-1.003 c0.05-0.094,0.095-0.195,0.143-0.292c0.134-0.271,0.262-0.55,0.384-0.84c0.052-0.124,0.103-0.249,0.153-0.376 c0.119-0.304,0.229-0.618,0.334-0.94c0.034-0.106,0.072-0.208,0.104-0.315c0.131-0.43,0.249-0.872,0.354-1.328 c0.021-0.091,0.036-0.185,0.056-0.276c0.079-0.371,0.15-0.749,0.211-1.135c0.024-0.155,0.045-0.311,0.067-0.467 c0.047-0.349,0.086-0.703,0.117-1.061c0.013-0.152,0.029-0.303,0.039-0.457c0.034-0.504,0.056-1.014,0.056-1.532v-3h0.586 l3.707,3.707c0.188,0.188,0.442,0.293,0.707,0.293h20.934c-0.23,6.317-2.621,9.564-5.018,10h-6.916H16.724z M39.019,47.026h-1.935 c-0.569,0-1.033-0.463-1.033-1.033V33.026h4v6v6.967C40.051,46.562,39.588,47.026,39.019,47.026z M42.051,45.026v-4h10v4H42.051z M58.051,49.937c0,0.6-0.488,1.088-1.088,1.088H55.14c-0.6,0-1.088-0.488-1.088-1.088v-2.912v-8v-3.912 c0-0.6,0.488-1.088,1.088-1.088h1.823c0.6,0,1.088,0.488,1.088,1.088V49.937z"></path>
                  <circle cx="32.051" cy="27.026" r="1"></circle>
                  <circle cx="28.051" cy="27.026" r="1"></circle>
                  <circle cx="24.051" cy="27.026" r="1"></circle>
                </SvgIcon>
              }
              selected={selected}
              setSelected={setSelected}
            />
            <ItemGroup
              label="Tags"
              icon={<SellOutlinedIcon />}
              selected={selected}
              items={[
                <Item
                  sub
                  title="View Tags"
                  parentTitle="Tags"
                  to="/tags/view"
                  icon={<TableViewIcon />}
                  selected={selected}
                  setSelected={setSelected}
                />,
                <Item
                  sub
                  title="Add Tag"
                  parentTitle="Tags"
                  to="/tags/add"
                  icon={<PostAddIcon />}
                  selected={selected}
                  setSelected={setSelected}
                />,
              ]}
            />
            <ItemGroup
              label="Users"
              icon={<ManageAccountsIcon />}
              selected={selected}
              items={[
                <Item
                  sub
                  title="View Users"
                  parentTitle="Users"
                  to="/users/view"
                  icon={<PermContactCalendarIcon />}
                  selected={selected}
                  setSelected={setSelected}
                />,
                <Item
                  sub
                  title="Add User"
                  parentTitle="Users"
                  to="/users/add"
                  icon={<PersonAddIcon />}
                  selected={selected}
                  setSelected={setSelected}
                />,
                <Item
                  sub
                  title="Notification Keys"
                  parentTitle="Users"
                  to="/users/pushnotifications"
                  icon={<PhoneIphoneIcon />}
                  selected={selected}
                  setSelected={setSelected}
                />,
              ]}
            />
            <ItemGroup
              label="Locations"
              icon={<LocationOnIcon />}
              selected={selected}
              items={[
                <Item
                  sub
                  title="View Locations"
                  parentTitle="Locations"
                  to="/locations/view"
                  icon={<MapIcon />}
                  selected={selected}
                  setSelected={setSelected}
                />,
                <Item
                  sub
                  title="Add Location"
                  parentTitle="Locations"
                  to="/locations/add"
                  icon={<AddLocationAltIcon />}
                  selected={selected}
                  setSelected={setSelected}
                />,
              ]}
            />
            <ItemGroup
              label="Vendors"
              icon={<StorefrontOutlinedIcon />}
              selected={selected}
              items={[
                <Item
                  sub
                  title="View Vendors"
                  parentTitle="Vendors"
                  to="/vendors/view"
                  icon={<TableViewIcon />}
                  selected={selected}
                  setSelected={setSelected}
                />,
                <Item
                  sub
                  title="Add Vendor"
                  parentTitle="Vendors"
                  to="/vendors/add"
                  icon={<AddBusinessIcon />}
                  selected={selected}
                  setSelected={setSelected}
                />,
              ]}
            />
            <ItemGroup
              label="Machine Types"
              icon={<RoomPreferencesOutlinedIcon />}
              selected={selected}
              items={[
                <Item
                  sub
                  title="View Mach. Types"
                  parentTitle="Machine Types"
                  to="/machinetypes/view"
                  icon={<TableViewIcon />}
                  selected={selected}
                  setSelected={setSelected}
                />,
                <Item
                  sub
                  title="Add Mach. Type"
                  parentTitle="Machine Types"
                  to="/machinetypes/add"
                  icon={<PostAddIcon />}
                  selected={selected}
                  setSelected={setSelected}
                />,
              ]}
            />
            <ItemGroup
              label="Targets"
              icon={<PrecisionManufacturingOutlinedIcon />}
              selected={selected}
              items={[
                <Item
                  sub
                  title="View Targets"
                  parentTitle="Targets"
                  to="/targets/view"
                  icon={<TableViewIcon />}
                  selected={selected}
                  setSelected={setSelected}
                />,
                <Item
                  sub
                  title="Add Target"
                  parentTitle="Targets"
                  to="/targets/add"
                  icon={<PostAddIcon />}
                  selected={selected}
                  setSelected={setSelected}
                />,
              ]}
            />
            <ItemGroup
              label="Fixing Methods"
              icon={<ConstructionOutlinedIcon />}
              selected={selected}
              items={[
                <Item
                  sub
                  title="View Fixings"
                  parentTitle="Fixing Methods"
                  to="/fixingmethods/view"
                  icon={<TableViewIcon />}
                  selected={selected}
                  setSelected={setSelected}
                />,
                <Item
                  sub
                  title="Add Fixing"
                  parentTitle="Fixing Methods"
                  to="/fixingmethods/add"
                  icon={<PostAddIcon />}
                  selected={selected}
                  setSelected={setSelected}
                />,
              ]}
            />
            <ItemGroup
              label="Problems"
              icon={<HelpOutlineOutlinedIcon />}
              selected={selected}
              items={[
                <Item
                  sub
                  title="View Problems"
                  parentTitle="Problems"
                  to="/problems/view"
                  icon={<TableViewIcon />}
                  selected={selected}
                  setSelected={setSelected}
                />,
                <Item
                  sub
                  title="View Superiors"
                  parentTitle="Problems"
                  to="/problems/superiors/view"
                  icon={<TableViewIcon />}
                  selected={selected}
                  setSelected={setSelected}
                />,
                <Item
                  sub
                  title="Add Problem"
                  parentTitle="Problems"
                  to="/problems/add"
                  icon={<PostAddIcon />}
                  selected={selected}
                  setSelected={setSelected}
                />,
                <Item
                  sub
                  title="Add Superior"
                  parentTitle="Problems"
                  to="/problems/superiors/add"
                  icon={<PostAddIcon />}
                  selected={selected}
                  setSelected={setSelected}
                />,
              ]}
            />
          </Box>
        </Menu>
      </ProSidebar>
    </Box>
  );
};

export default Sidebar;
