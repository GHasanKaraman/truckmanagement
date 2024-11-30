import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  GridRowModes,
  DataGrid,
  GridActionsCellItem,
  getGridSingleSelectOperators,
} from "@mui/x-data-grid";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/DeleteOutlined";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Close";
import PrintIcon from "@mui/icons-material/Print";

import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  useTheme,
} from "@mui/material";
import { useSnackbar } from "notistack";
import useMediaQuery from "@mui/material/useMediaQuery";

import Header from "../Header";

import { tokens } from "../../theme";
import baseRequest from "../../core/baseRequest";

import { TIME } from "../../utils/const";
import {
  QuickSearchToolbar,
  requestSearch,
} from "../../scenes/DataGrid/CustomGridToolBar";
import PrintComponent from "../../utils/print";

import { AutocompleteEditInputCell } from "../../scenes/DataGrid/AutocompleteEditInputCell";
import useControl from "../../hooks/useControl";
import useSignOut from "../../hooks/useSignOut";
import { errorHandler } from "../../core/errorHandler";
import { verifyPermissions } from "../../utils/helpers";
import { useRecoilValue } from "recoil";
import { userInfoParams } from "../../atoms/userAtoms";

const ViewTargetsPage = (props) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const user = useRecoilValue(userInfoParams);

  const [auth] = useControl();
  const [controller] = useSignOut();

  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));
  const [rowModesModel, setRowModesModel] = useState({});

  const [data, setData] = useState([]);

  const [openDialog, setOpenDialog] = useState(false);
  const [openCamera, setOpenCamera] = useState(false);

  const [id, setID] = useState();

  const [searchText, setSearchText] = useState("");
  const [rows, setRows] = useState([]);

  const [machineTypes, setMachineTypes] = useState([]);

  const [cameraIP, setIP] = useState("");
  const columns = [
    {
      field: "target",
      headerName: "Target",
      flex: 1,
      cellClassName: "name-column--cell",
      editable: true,
      renderCell: ({ row }) => {
        return (
          <Chip
            onClick={
              row.IP && row.IP !== ""
                ? () => {
                    setIP(row.IP);
                    setOpenCamera(true);
                  }
                : undefined
            }
            label={row.target}
            sx={{
              minWidth: 100,
              fontWeight: row.IP && row.IP !== "" ? 700 : 500,
              fontSize: row.IP && row.IP !== "" ? 16 : 14,
              color:
                row.IP && row.IP !== ""
                  ? colors.ciboInnerGreen[400]
                  : colors.yoggieRed[400],
            }}
            component={row.IP && row.IP !== "" ? "a" : "div"}
          />
        );
      },
    },
    {
      field: "facility",
      headerName: "Facility",
      flex: 1,
      cellClassName: "name-column--cell",
      editable: true,
      type: "singleSelect",
      valueOptions: [
        { label: "VREELAND", value: "V" },
        { label: "MADISON", value: "M" },
      ],
    },
    {
      field: "machineType",
      headerName: "Machine Type",
      flex: 1,
      cellClassName: "name-column--cell",
      editable: true,
      filterable: true,
      type: "singleSelect",
      valueOptions: machineTypes,
      renderCell: ({ value }) => value.machineType,
      filterOperators: getGridSingleSelectOperators()
        .filter((op) => op.value === "is")
        .map((operator) => {
          const newOperator = { ...operator };
          newOperator.getApplyFilterFn = (filterItem, column) => {
            return (params) => {
              if (!filterItem.value) return true;
              return filterItem?.value === params?.value?._id;
            };
          };

          return newOperator;
        }),
      getOptionLabel: ({ machineType }) => machineType,
      getOptionValue: (value) => {
        return value?._id;
      },
      renderEditCell: (params) => (
        <AutocompleteEditInputCell
          type="custom"
          {...params}
          options={machineTypes}
          getOptionLabel={({ machineType }) => machineType}
          isOptionEqualToValue={(option, value) => option._id === value._id}
        />
      ),
    },
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      flex: 0.4,
      getActions: (params) => {
        const { row, id } = params;
        const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;
        if (isInEditMode) {
          return [
            <GridActionsCellItem
              icon={<SaveIcon />}
              label="Save"
              onClick={handleSaveClick(id)}
            />,
            <GridActionsCellItem
              icon={<CancelIcon />}
              label="Cancel"
              className="textPrimary"
              onClick={handleCancelClick(id)}
              color="inherit"
            />,
          ];
        }

        const buttons = [];

        if (verifyPermissions(user.permissions, "awu")) {
          buttons.push(
            <GridActionsCellItem
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
          );
        }

        if (verifyPermissions(user.permissions, "awd")) {
          buttons.push(
            <GridActionsCellItem
              icon={
                <DeleteIcon
                  sx={{
                    padding: "2px",
                    background: colors.yoggieRed[500],
                    borderRadius: 1,
                    color: colors.primary[400],
                    fontSize: "25px",
                  }}
                />
              }
              label="Delete"
              onClick={handleDeleteClick(id)}
              color="inherit"
            />,
          );
        }

        buttons.push(
          <GridActionsCellItem
            component={function () {
              return (
                <PrintComponent
                  label="Target QR"
                  url={(
                    "http://" +
                    window.location.hostname +
                    `:${window.location.port}/target/${id}`
                  ).trim()}
                  part={row.target}
                  location={""}
                />
              );
            }}
            label="Target QR"
            showInMenu
          />,
        );

        buttons.push(
          <GridActionsCellItem
            component={function () {
              return (
                <PrintComponent
                  label="Operator QR"
                  url={(
                    "http://" +
                    window.location.hostname +
                    `:${window.location.port}/operator/${id}`
                  ).trim()}
                  part={row.target + " - " + "Operator"}
                  location={""}
                />
              );
            }}
            label="Operator QR"
            showInMenu
          />,
        );

        return buttons;
      },
    },
  ];

  const loadTargetsPage = async () => {
    try {
      const res = await baseRequest.get("/target", {});
      if (res.data) {
        const data = Object.values(res.data.records.targets);
        setData(data);
        setRows(data);
        setMachineTypes(Object.values(res.data.records.machineTypes));
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
    loadTargetsPage();
  }, []);

  useEffect(() => {
    //This is for reloading home page
    const interval = setInterval(() => {
      loadTargetsPage();
    }, TIME);

    return () => clearInterval(interval);
  }, []);

  const handleEditClick = (id) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
  };

  const handleSaveClick = (id) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
  };

  const handleDeleteClick = (id) => async () => {
    setOpenDialog(true);
    setID(id);
  };

  const handleCancelClick = (id) => () => {
    setRowModesModel({
      ...rowModesModel,
      [id]: { mode: GridRowModes.View, ignoreModifications: true },
    });
  };

  const processRowUpdate = useCallback(async (row, old) => {
    try {
      const res = await baseRequest.put("/target", row);
      if (auth(res)) {
        enqueueSnackbar("Machine has been successfully updated!", {
          variant: "success",
        });
        await loadTargetsPage();
        let { target, machineType, facility } = row;
        return { ...row, target: target.toUpperCase(), machineType, facility };
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
          enqueueSnackbar("Something went wrong updating the machine!", {
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

  const dialogDeleteApproved = async () => {
    try {
      const res = await baseRequest.delete("/target", { id });
      if (auth(res)) {
        enqueueSnackbar("Machine has been successfully deleted!", {
          variant: "success",
        });
        await loadTargetsPage();
      }

      setOpenDialog(false);
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
          enqueueSnackbar("Something went wrong deleting the machine!", {
            variant: "error",
          });
          break;
        case 500:
          enqueueSnackbar(
            "Something went wrong while deleting from database!",
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

  return (
    <Box m="0 20px ">
      <Dialog
        fullScreen={fullScreen}
        open={openCamera}
        onClose={() => {
          setOpenCamera(false);
        }}
        aria-labelledby="camera-dialog-title"
        aria-describedby="camera-dialog-description"
      >
        <DialogTitle id="camera-dialog-title">Live Stream</DialogTitle>
        <DialogContent
          sx={{
            textAlign: "center",
            justifyContent: "center",
          }}
        >
          <img
            style={{ width: "-webkit-fill-available" }}
            alt="stream"
            src={
              "http://10.12.0.60:3000/?auth=admin:Cibovita&url=http%3A%2F%2F" +
              cameraIP +
              "%3A80%2Fcgi-bin%2Fmjpg%2Fvideo.cgi%3Fchannel%3D1%26subtype%3D1"
            }
          />
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              setOpenCamera(false);
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        fullScreen={fullScreen}
        open={openDialog}
        onClose={() => {
          setOpenDialog(false);
        }}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Confirm the action"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Do you really want to delete this target?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            color="info"
            onClick={() => {
              setOpenDialog(false);
            }}
          >
            Disagree
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={dialogDeleteApproved}
            autoFocus
          >
            Agree
          </Button>
        </DialogActions>
      </Dialog>
      <Header title="VIEW TARGETS" subtitle="Managing the Targets" />
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
          isCellEditable={(params) => {
            if (verifyPermissions(user.permissions, "awu")) {
              return true;
            }
            return false;
          }}
          rows={rows}
          columns={columns}
          slots={{
            toolbar: QuickSearchToolbar,
            moreActionsIcon: () => {
              return (
                <PrintIcon
                  sx={{
                    padding: "2px",
                    borderRadius: 1,
                    color: colors.grey[200],
                    fontSize: "25px",
                  }}
                />
              );
            },
          }}
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

export default ViewTargetsPage;
