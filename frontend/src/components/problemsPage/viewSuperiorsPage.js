import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { GridRowModes, DataGrid, GridActionsCellItem } from "@mui/x-data-grid";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/DeleteOutlined";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Close";

import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Tooltip,
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

import { AutocompleteEditInputCell } from "../../scenes/DataGrid/AutocompleteEditInputCell";
import useControl from "../../hooks/useControl";
import useSignOut from "../../hooks/useSignOut";
import { errorHandler } from "../../core/errorHandler";
import { verifyPermissions } from "../../utils/helpers";
import { useRecoilValue } from "recoil";
import { userInfoParams } from "../../atoms/userAtoms";

const ViewSuperiorsPage = (props) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [auth] = useControl();
  const [controller] = useSignOut();

  const user = useRecoilValue(userInfoParams);

  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));
  const [rowModesModel, setRowModesModel] = useState({});

  const [data, setData] = useState([]);

  const [openDialog, setOpenDialog] = useState(false);

  const [id, setID] = useState();

  const [searchText, setSearchText] = useState("");
  const [rows, setRows] = useState([]);

  const [targets, setTargets] = useState([]);

  const columns = [
    {
      field: "superior",
      headerName: "Superior",
      flex: 0.5,
      cellClassName: "name-column--cell",
      editable: true,
    },
    {
      field: "targetDetails",
      headerName: "Target",
      flex: 1,
      cellClassName: "name-column--cell",
      editable: true,
      filterable: false,
      sortable: false,
      valueOptions: targets,
      renderEditCell: (params) => (
        <AutocompleteEditInputCell
          type="multipleTag"
          {...params}
          options={targets}
        />
      ),
      renderCell: ({ row }) => {
        const { targetDetails } = row;
        return (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
            }}
          >
            {targetDetails.map((target, index) => {
              if (targetDetails.length > 20) {
                if (index <= 20) {
                  return (
                    <div
                      style={{
                        padding: theme.spacing(0.2),
                      }}
                    >
                      <Chip
                        style={{
                          borderRadius: "4px",
                        }}
                        size="small"
                        label={target.target}
                      />
                    </div>
                  );
                } else if (index == 21) {
                  return (
                    <Tooltip
                      componentsProps={{
                        tooltip: {
                          sx: {
                            backgroundColor: colors.ciboInnerGreen[700],
                          },
                        },
                      }}
                      title={
                        <div style={{ display: "flex", flexWrap: "wrap" }}>
                          {targetDetails.slice(index).map((target) => {
                            return (
                              <div
                                style={{
                                  padding: theme.spacing(0.2),
                                }}
                              >
                                <Chip
                                  style={{
                                    borderRadius: "4px",
                                    backgroundColor: colors.ciboInnerGreen[500],
                                  }}
                                  size="small"
                                  label={target.target}
                                />
                              </div>
                            );
                          })}
                        </div>
                      }
                    >
                      <div
                        style={{
                          padding: theme.spacing(0.2),
                        }}
                      >
                        <Chip
                          style={{
                            borderRadius: "4px",
                            backgroundColor: colors.ciboInnerGreen[500],
                          }}
                          size="small"
                          label={"+" + (targetDetails.length - index) + " more"}
                        />
                      </div>
                    </Tooltip>
                  );
                }
              } else {
                return (
                  <div
                    style={{
                      padding: theme.spacing(0.2),
                    }}
                  >
                    <Chip
                      style={{ borderRadius: "4px" }}
                      size="small"
                      label={target.target}
                    />
                  </div>
                );
              }
            })}
          </div>
        );
      },
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
        return buttons;
      },
    },
  ];

  const loadSuperiorsPage = async () => {
    try {
      const res = await baseRequest.get("/superior", {});
      if (res.data) {
        const targets = Object.values(res.data.records.targets);
        const superiors = Object.values(res.data.records.superiors);
        setData(superiors);
        setRows(superiors);
        setTargets(targets);
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
    loadSuperiorsPage();
  }, []);

  useEffect(() => {
    //This is for reloading home page
    const interval = setInterval(() => {
      loadSuperiorsPage();
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
      const res = await baseRequest.put("/superior", row);
      if (auth(res)) {
        enqueueSnackbar("Superior has been successfully updated!", {
          variant: "success",
        });
        await loadSuperiorsPage();
        let { superior, targets } = row;
        return { ...row, superior: superior.toUpperCase(), targets };
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
          enqueueSnackbar("Something went wrong updating the superior!", {
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
      const res = await baseRequest.delete("/superior", { id });
      if (auth(res)) {
        enqueueSnackbar("Superior has been successfully deleted!", {
          variant: "success",
        });
        await loadSuperiorsPage();
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
          enqueueSnackbar("Something went wrong deleting the superior!", {
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
            Do you really want to delete this superior problem?
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
      <Header
        title="VIEW SUPERIORS"
        subtitle="Managing the Superior Problems"
      />
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
          autoHeight={true}
          getRowHeight={() => "auto"}
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

export default ViewSuperiorsPage;