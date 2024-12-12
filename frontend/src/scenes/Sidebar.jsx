import { useEffect, useState } from "react";
import {
  Sidebar as ProSidebar,
  Menu,
  SubMenu,
  MenuItem,
} from "react-pro-sidebar";
import {
  Box,
  IconButton,
  Typography,
  Avatar,
  useTheme,
  Stack,
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";

import { tokens } from "../theme";

import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import DashboardIcon from "@mui/icons-material/Dashboard";
import TableViewIcon from "@mui/icons-material/TableView";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import PermContactCalendarIcon from "@mui/icons-material/PermContactCalendar";

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
import { Add } from "@mui/icons-material";
import truck from "../images/truck.gif";

const Item = ({ title, to, icon, selected, setSelected, sub, parentTitle }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();

  const [user, setUser] = useRecoilState(userInformations);

  if (
    (["Users"].includes(parentTitle) ||
      ["Dashboard", "Create Issue", "Add Truck"].includes(title)) &&
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
    const forbiddenPages = ["/users/add", "/issues/create", "/trucks/add"];

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
          color: colors.crusta[400] + " !important",
          backgroundColor: "transparent !important",
        },
        "& .ps-menu-button.ps-active": {
          color: colors.crusta[500] + " !important",
        },
        "& .ps-menu-button svg:hover": {
          stroke: colors.crusta[400] + " !important",
        },
        "& .ps-menu-button.ps-active svg": {
          stroke: colors.crusta[500] + " !important",
        },
      }}
    >
      <ProSidebar collapsed={isCollapsed}>
        <Menu iconShape="square">
          <div style={{ width: "100%", textAlign: "center", marginTop: "5px" }}>
            {!isCollapsed ? (
              <p
                style={{
                  alignSelf: "center",
                  fontWeight: 700,
                  fontSize: 44,
                  color: "#f55b1a",
                  margin: 0,
                }}
              >
                CiboTrucks
              </p>
            ) : (
              <img
                alt="truck"
                width={80}
                style={{ marginLeft: -20, padding: 1, marginTop: 5 }}
                src={truck}
              />
            )}

            {!isCollapsed ? (
              <Typography variant="h6" color={colors.grey[100]}>
                v0.1b
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
                  color={colors.crusta[600]}
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
            <Typography
              variant="h6"
              color={colors.grey[300]}
              sx={{ m: "15px 0 5px 0px", ml: isCollapsed ? "10px" : "20px" }}
            >
              Settings
            </Typography>
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
              ]}
            />
            <ItemGroup
              label="Trucks"
              icon={<LocalShippingIcon />}
              selected={selected}
              items={[
                <Item
                  sub
                  title="View Trucks"
                  parentTitle="Trucks"
                  to="/trucks/view"
                  icon={<TableViewIcon />}
                  selected={selected}
                  setSelected={setSelected}
                />,
                <Item
                  sub
                  title="Add Truck"
                  parentTitle="Trucks"
                  to="/trucks/add"
                  icon={
                    <Stack>
                      <LocalShippingIcon />
                      <Add
                        sx={{
                          position: "absolute",
                          color: colors.primary[400],
                          p: 0.5,
                          ml: -0.3,
                          mt: -0.1,
                        }}
                      />
                    </Stack>
                  }
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
