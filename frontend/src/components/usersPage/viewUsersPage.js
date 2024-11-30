import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { DataGrid, GridActionsCellItem, GridRowModes } from "@mui/x-data-grid";

import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Close";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import LockOpenOutlinedIcon from "@mui/icons-material/LockOpenOutlined";
import DoNotDisturbOnOutlinedIcon from "@mui/icons-material/DoNotDisturbOnOutlined";

import { Box, Typography, useTheme, Avatar } from "@mui/material";
import { useSnackbar } from "notistack";

import Header from "../Header";

import { tokens } from "../../theme";
import baseRequest from "../../core/baseRequest";

import { TIME } from "../../utils/const";
import {
  QuickSearchToolbar,
  requestSearch,
} from "../../scenes/DataGrid/CustomGridToolBar";
import { AutocompleteEditInputCell } from "../../scenes/DataGrid/AutocompleteEditInputCell";

import useSignOut from "../../hooks/useSignOut";
import useControl from "../../hooks/useControl";
import { errorHandler } from "../../core/errorHandler";
import { useRecoilValue } from "recoil";
import { userInfoParams } from "../../atoms/userAtoms";
import { verifyPermissions } from "../../utils/helpers";
import { IP } from "../../env";
import { HowToReg, PersonOff } from "@mui/icons-material";

const ViewUsersPage = (props) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [auth] = useControl();
  const [controller] = useSignOut();

  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [rowModesModel, setRowModesModel] = useState({});

  const [data, setData] = useState([]);

  const [searchText, setSearchText] = useState("");
  const [rows, setRows] = useState([]);

  const user = useRecoilValue(userInfoParams);

  const columns = [
    {
      field: "_",
      headerName: "Image",
      flex: 0.4,
      renderCell: ({ row: { image } }) => {
        return (
          <Avatar
            src={image !== "" ? "http://" + IP + "/" + image : ""}
            width="50px"
          />
        );
      },
      editable: false,
    },
    {
      field: "name",
      headerName: "Name",
      flex: 0.6,
      cellClassName: "name-column--cell",
      editable: true,
    },
    {
      field: "surname",
      headerName: "Surname",
      flex: 0.5,
      cellClassName: "surname-column--cell",
      editable: true,
    },
    {
      field: "username",
      headerName: "Username",
      flex: 0.8,
      cellClassName: "username-column--cell",
      filterable: false,
      sortable: false,
      editable: true,
    },
    {
      field: "phone",
      headerName: "Phone Number",
      flex: 0.6,
      editable: true,
    },
    {
      field: "facility",
      headerName: "Facility",
      flex: 0.5,
      renderCell: ({ row: { facility } }) => {
        return facility.toUpperCase();
      },
      filterable: false,
      sortable: false,
      editable: true,
      renderEditCell: (params) => (
        <AutocompleteEditInputCell
          type="single"
          {...params}
          options={["vreeland", "madison"]}
        />
      ),
    },
    {
      field: "zone",
      headerName: "Zone",
      flex: 0.4,
      renderCell: ({ row: { zone } }) => {
        return zone.toUpperCase();
      },
      editable: true,
      filterable: false,
      sortable: false,
      renderEditCell: (params) => (
        <AutocompleteEditInputCell
          type="single"
          {...params}
          options={["office", "zone 1", "zone 2", "zone 3", "zone 4", "zone 5"]}
        />
      ),
    },
    {
      field: "position",
      headerName: "Position",
      flex: 0.6,
      filterable: false,
      sortable: false,
      editable: true,
      renderEditCell: (params) => (
        <AutocompleteEditInputCell
          type="single"
          {...params}
          options={["Lead", "Supervisor", "Technician"]}
        />
      ),
    },
    {
      field: "showQR",
      headerName: "QR Perm",
      flex: 0.5,
      type: "boolean",
      filterable: false,
      sortable: false,
      editable: true,
      renderCell: ({ value }) => {
        if (value) {
          return <HowToReg sx={{ color: colors.ciboInnerGreen[500] }} />;
        }
        return <PersonOff sx={{ color: colors.yoggieRed[500] }} />;
      },
    },

    {
      field: "accessLevel",
      headerName: "Access Level",
      flex: 0.75,
      filterable: false,
      sortable: false,
      editable: false,
      renderCell: ({ row: { permissions } }) => {
        return (
          <Box
            width="100px"
            p="5px"
            display="flex"
            justifyContent="center"
            backgroundColor={
              permissions === "a"
                ? colors.orangeAccent[500]
                : permissions === "rw" || permissions === "wr"
                  ? colors.omegaDeluxPurple[500]
                  : permissions === ""
                    ? colors.redAccent[500]
                    : colors.ciboInnerGreen[600]
            }
            borderRadius="4px"
          >
            {permissions === "admin" ? (
              <AdminPanelSettingsOutlinedIcon />
            ) : permissions === "" ? (
              <DoNotDisturbOnOutlinedIcon />
            ) : (
              <LockOpenOutlinedIcon />
            )}
            <Typography color={colors.contrast[100]} sx={{ ml: "5px" }}>
              {permissions === "admin"
                ? "ADMIN"
                : permissions === ""
                  ? "NO ACCESS"
                  : permissions.split("").sort().join("").toUpperCase()}
            </Typography>
          </Box>
        );
      },
    },
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      flex: 0.5,
      getActions: (params) => {
        const { row, id } = params;
        const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;
        if (isInEditMode) {
          return [
            <GridActionsCellItem
              key={1}
              icon={<SaveIcon />}
              label="Save"
              onClick={handleSaveClick(id)}
            />,
            <GridActionsCellItem
              key={2}
              icon={<CancelIcon />}
              label="Cancel"
              className="textPrimary"
              onClick={handleCancelClick(id)}
              color="inherit"
            />,
          ];
        }

        return [
          <GridActionsCellItem
            key={3}
            icon={
              <EditIcon
                sx={{
                  padding: "3px",
                  background: colors.ciboInnerGreen[400],
                  borderRadius: 1,
                  color: colors.primary[400],
                  fontSize: "25px",
                }}
              />
            }
            label="Edit"
            className="textPrimary"
            onClick={handleEditClick(id)}
            color="inherit"
          />,
        ];
      },
    },
  ];

  const loadUsersPage = async () => {
    try {
      const res = await baseRequest.get("/user", {});
      if (res.data) {
        const data = Object.values(res.data.records);
        setData(data);
        setRows(data);
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
          enqueueSnackbar("Something went wrong retrieving the table!", {
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

  useEffect(() => {
    document.title = props.title || "";
  }, [props.title]);

  useEffect(() => {
    loadUsersPage();
  }, []);

  useEffect(() => {
    //This is for reloading home page
    const interval = setInterval(() => {
      loadUsersPage();
    }, TIME);

    return () => clearInterval(interval);
  }, []);

  const handleEditClick = (id) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
  };

  const handleSaveClick = (id) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
  };

  const handleCancelClick = (id) => () => {
    setRowModesModel({
      ...rowModesModel,
      [id]: { mode: GridRowModes.View, ignoreModifications: true },
    });
  };

  const processRowUpdate = useCallback(async (row, old) => {
    try {
      const res = await baseRequest.put("/user", row);
      if (auth(res)) {
        enqueueSnackbar("User has been successfully updated!", {
          variant: "success",
        });
        await loadUsersPage();
        return { ...row };
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
        case 400:
          enqueueSnackbar("Something went wrong updating the user!", {
            variant: "error",
          });
          break;
        case 500:
          enqueueSnackbar(
            "Something went wrong while updating from database!",
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
    return { ...old };
  }, []);

  const onProcessRowUpdateError = useCallback((err) => {
    console.log(err);
  }, []);

  const handleRowModesModelChange = (newRowModesModel) => {
    setRowModesModel(newRowModesModel);
  };

  return (
    <Box m="0 20px ">
      <Header title="VIEW USERS" subtitle="Managing the Users" />
      <Box
        m="40px 0 0 0"
        height="75vh"
        sx={{
          "& .MuiDataGrid-root": {
            border: "none",
          },
          "& .MuiDataGrid-cell": {
            borderBottom: "none",
          },
          "& .name-column--cell": {
            color: colors.ciboInnerGreen[300],
          },
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: colors.ciboInnerGreen[500],
            borderBottom: "none",
          },
          "& .MuiDataGrid-virtualScroller": {
            backgroundColor: colors.primary[400],
          },
          "& .MuiDataGrid-footerContainer": {
            borderTop: "none",
            backgroundColor: colors.ciboInnerGreen[500],
          },
          "& .MuiCheckbox-root": {
            color: `${colors.ciboInnerGreen[200]} !important`,
          },
          "& .MuiDataGrid-toolbarContainer .MuiButton-text": {
            color: `${colors.grey[100]} !important`,
          },
          "& .MuiDataGrid-cell:focus": {
            outlineColor: colors.primary[400],
          },
          "& .MuiDataGrid-cell:focus-within": {
            outlineColor: colors.primary[400],
          } /*,
          "& .MuiDataGrid-row--editing .MuiDataGrid-cell--editing": {
            backgroundColor: "red",
          }*/,
          "& .MuiInputBase-root::after": {
            borderBottomColor: colors.ciboInnerGreen[500],
          },
          "& .MuiInputBase-root::before": {
            borderBottomColor: colors.ciboInnerGreen[600],
          },
        }}
      >
        <DataGrid
          disableRowSelectionOnClick={true}
          isCellEditable={({ row }) => {
            var list = [];
            switch (user.position) {
              case "Lead":
                list = ["Technician", "Supervisor"];
                break;
              case "Supervisor":
                list = ["Technician"];
                break;
              case "Asst. Manager":
                list = ["Lead", "Supervisor", "Technician"];
                break;
              case "Manager":
                list = ["Asst. Manager", "Lead", "Supervisor", "Technician"];
                break;
              default:
                break;
            }
            if (verifyPermissions(user.permissions, "awu")) {
              if (
                list.includes(row.position) ||
                user.position === "Super Admin"
              ) {
                return true;
              }
            }
            return false;
          }}
          rows={rows}
          columns={columns}
          slots={{ toolbar: QuickSearchToolbar }}
          slotProps={{
            toolbar: {
              value: searchText,
              onChange: (event) => {
                setSearchText(event.target.value);
                requestSearch(data, setRows, event.target.value);
              },
              clearSearch: () => {
                setSearchText("");
                requestSearch(data, setRows, "");
              },
            },
          }}
          getRowId={(row) => row._id}
          editMode="row"
          rowModesModel={rowModesModel}
          onRowModesModelChange={handleRowModesModelChange}
          processRowUpdate={processRowUpdate}
          onProcessRowUpdateError={onProcessRowUpdateError}
        />
      </Box>
    </Box>
  );
};

export default ViewUsersPage;
