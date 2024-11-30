import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DataGrid, GridActionsCellItem } from "@mui/x-data-grid";

import KeyboardReturnIcon from "@mui/icons-material/KeyboardReturn";

import {
  Avatar,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  LinearProgress,
  Stack,
  TextField,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";

import { useSnackbar } from "notistack";
import useMediaQuery from "@mui/material/useMediaQuery";

import { useFormik } from "formik";
import * as yup from "yup";

import Image from "../Image";
import Header from "../Header";

import { tokens } from "../../theme";

import baseRequest from "../../core/baseRequest";

import { TIME } from "../../utils/const";
import {
  QuickSearchToolbar,
  requestSearch,
} from "../../scenes/DataGrid/CustomGridToolBar";

import { toStringDate } from "../../utils/helpers";
import useControl from "../../hooks/useControl";
import useSignOut from "../../hooks/useSignOut";
import { errorHandler } from "../../core/errorHandler";
import { IP } from "../../env";

const OutputLogsPage = (props) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));

  const [logs, setLogs] = useState([]);
  const [data, setData] = useState([]);

  const [auth] = useControl();
  const [controller] = useSignOut();

  const [openDialog, setOpenDialog] = useState(false);
  const [clickedLog, setClickedLog] = useState();

  const [clicked, setClicked] = useState(false);

  const [searchText, setSearchText] = useState("");

  const loadOutputLogsPage = async () => {
    try {
      const res = await baseRequest.get("/logs/output", {});
      if (res.data) {
        const data = Object.values(res.data.records);
        setData(data);
        setLogs(data);
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

  const getIssueColor = (item) => {
    if (item.issueType === 2) {
      return colors.contrast[100];
    } else if (item.issueType === 1) {
      return colors.omegaDeluxPurple[500];
    }

    if (item.status === 0) {
      return colors.yoggieRed[500];
    } else if (item.status === 1) {
      return colors.orangeAccent[500];
    } else if (item.status === 2) {
      return colors.ciboInnerGreen[400];
    }
  };

  useEffect(() => {
    document.title = props.title || "";
  }, [props.title]);

  useEffect(() => {
    loadOutputLogsPage();
  }, []);

  useEffect(() => {
    //This is for reloading home page
    const interval = setInterval(() => {
      loadOutputLogsPage();
    }, TIME);

    return () => clearInterval(interval);
  }, []);

  const columns = [
    {
      field: "createdAt",
      headerName: "Date",
      type: "date",
      flex: 0.8,
      cellClassName: "date-column--cell",
      valueGetter: ({ value }) => value && new Date(value),
      renderCell: ({ row }) => {
        return toStringDate(row.createdAt, {
          month: "short",
          year: "numeric",
          day: "numeric",
          hour: "numeric",
          minute: "numeric",
        });
      },
    },
    {
      field: "user",
      headerName: "User",
      flex: 0.5,
      cellClassName: "user-column--cell",
      valueGetter: ({ value }) => {
        if (value) {
          return (value.name + " " + value.surname).toUpperCase();
        }
        return "QR";
      },
      renderCell: ({ value }) => {
        if (value !== "QR") {
          return value;
        }
        return (
          <Chip
            variant="filled"
            size="small"
            label={"QR"}
            style={{
              textAlign: "center",
              fontSize: "12px",
              fontWeight: "600",
              color: colors.primary[400],
              backgroundColor: colors.ciboInnerGreen[400],
              borderRadius: "4px",
              borderWidth: "0px",
            }}
          />
        );
      },
    },
    {
      field: "technician",
      headerName: "Technician",
      flex: 0.9,
      cellClassName: "technician-column--cell",
      valueGetter: ({ value }) =>
        (value.name + " " + value.surname).toUpperCase(),
      renderCell: ({ row, value }) => {
        const img = row.technician?.image;
        return (
          <Chip
            avatar={
              <Avatar
                src={
                  "http://" +
                  IP +
                  "/uploads/thumbnail-" +
                  img?.substring(img?.indexOf("/") + 1)
                }
              />
            }
            variant="filled"
            size="small"
            label={value}
            key={row._id}
            style={{
              fontSize: "12px",
              fontWeight: "600",
              background: "transparent",
              borderRadius: "4px",
              borderWidth: "0px",
              margin: "5px 0px",
            }}
          />
        );
      },
    },
    {
      field: "item",
      headerName: "Image",
      flex: 0.4,
      cellClassName: "image-column--cell",
      filterable: false,
      sortable: false,
      valueGetter: ({ row }) => {
        return row.item.image;
      },
      renderCell: ({ value }) => {
        return <Image width={50} fileName={value} />;
      },
    },
    {
      field: "parts",
      headerName: "Part Name",
      flex: 1.3,
      cellClassName: "parts-column--cell",
      valueGetter: ({ row }) => {
        return row.item.partName;
      },
    },
    {
      field: "vendors",
      headerName: "Vendor",
      flex: 0.6,
      cellClassName: "vendor-column--cell",
      renderCell: ({ value }) => {
        return (
          <Stack width="100%" direction="column">
            {value?.map(({ vendor }) => {
              return (
                <Chip
                  variant="filled"
                  size="small"
                  label={vendor.toUpperCase()}
                  key={vendor}
                  style={{
                    fontSize: "12px",
                    fontWeight: "600",
                    color: colors.primary[400],
                    backgroundColor: colors.ciboInnerGreen[300],
                    borderRadius: "4px",
                    borderWidth: "0px",
                    margin: "5px 0px",
                  }}
                />
              );
            })}
          </Stack>
        );
      },
    },
    {
      field: "outputQuantity",
      headerName: "Output",
      flex: 1,
      cellClassName: "output-column--cell",
      filterable: false,
      sortable: false,
      renderCell: ({ value, row }) => {
        const percent =
          100 - (((value - row.returnQuantity) / row.count) * 100).toFixed(0);
        return (
          <Stack direction="column" spacing={0} sx={{ width: "100%" }}>
            <Stack direction="row" spacing={3}>
              <Tooltip
                arrow
                placement="top"
                componentsProps={{
                  arrow: {
                    sx: {
                      color: colors.ciboOuterGreen[500],
                    },
                  },
                  tooltip: {
                    sx: {
                      backgroundColor: colors.ciboOuterGreen[500],
                      minWidth: "32px",
                      minHeight: "32px",
                      padding: "6px 8px",
                      color: "#fff",
                      textAlign: "start",
                      borderRadius: "6px",
                      textDecoration: "none",
                      wordWrap: "break-word",
                      fontSize: "16px",
                    },
                  },
                }}
                title={
                  row.returnQuantity === row.outputQuantity
                    ? "Returned all."
                    : "Returned " + row.returnQuantity + " pcs."
                }
              >
                <div
                  style={{
                    width: "25%",
                    fontWeight: "bold",
                    fontSize: "14px",
                    textDecoration: row.isReturned ? "line-through" : null,
                  }}
                >
                  {value + " pcs."}
                </div>
              </Tooltip>
              {row.isReturned ? (
                <div
                  style={{
                    fontWeight: "bold",
                    marginBottom: "-5px",
                    fontSize: "14px",
                  }}
                >
                  {row.outputQuantity - row.returnQuantity + " pcs."}
                </div>
              ) : null}
            </Stack>
            <Box sx={{ width: "100%" }}>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Box sx={{ width: "100%", mr: 1 }}>
                  <LinearProgress
                    variant="determinate"
                    value={percent}
                    sx={{
                      borderRadius: "5px",
                      height: "10px",
                      "& .MuiLinearProgress-bar": {
                        backgroundColor: colors.ciboInnerGreen[500], //"rgb(0, 198, 120)",
                      },
                      "&.MuiLinearProgress-root": {
                        backgroundColor: colors.yoggieRed[500], //"#ff5771",
                      },
                    }}
                  />
                </Box>
                <Box sx={{ minWidth: 35 }}>
                  <Typography variant="body2" color="text.secondary">
                    {100 - percent + "%"}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Stack>
        );
      },
    },
    {
      field: "count",
      headerName: "Available",
      flex: 0.5,
      cellClassName: "name-column--cell",
      filterable: false,
      sortable: false,
      renderCell: ({ value, row }) => {
        return (
          <Stack direction="column" spacing={0} sx={{ width: "100%" }}>
            <div
              style={{
                fontWeight: "bold",
                color:
                  value - row.outputQuantity < row.item.min_quantity
                    ? "#ff5771"
                    : "#00ca80",
              }}
            >
              {value - row.outputQuantity + row.returnQuantity + " pcs."}
            </div>
            <div
              style={{ fontSize: "12px", fontWeight: "600", color: "#9fa5bf" }}
            >
              {"from " + value + " pcs."}
            </div>
          </Stack>
        );
      },
    },
    {
      field: "price",
      headerName: "Price",
      type: "number",
      flex: 0.4,
      cellClassName: "vendor-column--cell",
      valueGetter: ({ row }) => {
        return row.item.price * (row.outputQuantity - row.returnQuantity);
      },
      renderCell: ({ value }) => {
        return "$" + value.toFixed(2);
      },
    },
    {
      field: "location",
      headerName: "Source",
      flex: 0.4,
      cellClassName: "source-column--cell",
      valueGetter: ({ value }) => value.location,
    },
    {
      field: "target",
      headerName: "Target",
      flex: 0.6,
      cellClassName: "target-column--cell",
      valueGetter: ({ value }) => value.target,
      renderCell: ({ value, row }) => {
        return (
          <Tooltip
            placement="top"
            arrow
            title={
              <div>
                <div>
                  {row.issue?.problemID ? row.problem?.problem : undefined}
                </div>
                <div>
                  {toStringDate(row.issue.createdAt, {
                    month: "short",
                    year: "numeric",
                    day: "numeric",
                    hour: "numeric",
                    minute: "numeric",
                  })}
                </div>
              </div>
            }
            componentsProps={{
              arrow: {
                sx: {
                  color: getIssueColor(row.issue),
                },
              },
              tooltip: {
                sx: {
                  minWidth: "32px",
                  minHeight: "32px",
                  padding: "6px 8px",
                  color: colors.primary[400],
                  textAlign: "start",
                  borderRadius: "6px",
                  textDecoration: "none",
                  wordWrap: "break-word",
                  fontSize: "16px",
                  backgroundColor: getIssueColor(row.issue),
                },
              },
            }}
          >
            <Chip
              variant="filled"
              size="small"
              label={value}
              style={{
                textAlign: "center",
                fontSize: "12px",
                fontWeight: "600",
                color: colors.primary[400],
                backgroundColor: getIssueColor(row.issue),
                borderRadius: "4px",
                borderWidth: "0px",
              }}
            />
          </Tooltip>
        );
      },
    },
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      flex: 0.5,
      getActions: ({ row }) => {
        return [
          <GridActionsCellItem
            icon={
              <KeyboardReturnIcon
                sx={{
                  padding: "3px",
                  background: colors.yoggieRed[500],
                  borderRadius: 1,
                  color: colors.primary[400],
                  fontSize: "25px",
                }}
              />
            }
            label="Return"
            className="textPrimary"
            onClick={handleReturnClick(row)}
            color="inherit"
          />,
        ];
      },
    },
  ];

  const handleSubmit = async (values) => {
    try {
      if (!clicked) {
        setClicked(true);
        const res = await baseRequest.post("/logs/return", {
          id: clickedLog._id,
          returnQuantity: values.returnQuantity * 1,
        });
        if (auth(res)) {
          setOpenDialog(false);
          formik.resetForm();
          loadOutputLogsPage().then(() => {
            setClicked(false);
          });
          enqueueSnackbar("Item has been returned successfully!", {
            variant: "success",
          });
        }
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
          enqueueSnackbar("Something went wrong while return the item!", {
            variant: "error",
          });
          break;
        case 500:
          enqueueSnackbar(
            "Something went wrong while writing it to the database!",
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

  const formik = useFormik({
    initialValues: {
      returnQuantity: "",
    },
    onSubmit: handleSubmit,
    validationSchema: yup.object().shape({
      returnQuantity: yup
        .string()
        .required("Please enter the return quantity!")
        .test(
          "QUANTITY_CHECK",
          "You cannot return more than actual quantity!",
          (value) => {
            return (
              !value ||
              (value &&
                value <= clickedLog.outputQuantity - clickedLog.returnQuantity)
            );
          },
        ),
    }),
  });

  const handleReturnClick = (log) => () => {
    setOpenDialog(true);
    setClickedLog(log);
  };

  return (
    <Box m="0 20px ">
      <Dialog
        sx={{
          "& .MuiInputBase-root::after": {
            borderBottomColor: colors.ciboInnerGreen[500],
          },
          "& .MuiInputBase-root::before": {
            borderBottomColor: colors.ciboInnerGreen[600],
          },
          "& .MuiFormLabel-root.Mui-focused": {
            color: colors.ciboInnerGreen[300],
          },
        }}
        fullScreen={fullScreen}
        open={openDialog}
        onClose={async () => {
          setOpenDialog(false);
          formik.resetForm();
          await loadOutputLogsPage();
        }}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Return Item</DialogTitle>
        <form onSubmit={formik.handleSubmit}>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              You can see the details of this action in return logs table after
              you return this item.
            </DialogContentText>
            <TextField
              fullWidth
              variant="filled"
              type="text"
              aria-valuemin={2}
              label="Return Quantity"
              onBlur={formik.handleBlur}
              onChange={(e) => {
                const regex = /^[0-9\b]+$/;
                if (
                  e.target.value === "" ||
                  (regex.test(e.target.value) && e.target.value >= 1)
                ) {
                  formik.setFieldValue("returnQuantity", e.target.value);
                }
              }}
              value={formik.values.returnQuantity}
              name="returnQuantity"
              error={
                !!formik.touched.returnQuantity &&
                !!formik.errors.returnQuantity
              }
              helperText={
                formik.touched.returnQuantity && formik.errors.returnQuantity
              }
              sx={{ gridColumn: "span 4" }}
              InputProps={{
                inputProps: {
                  min: 1,
                },
              }}
            />
          </DialogContent>
          <DialogActions>
            <Button
              variant="contained"
              color="error"
              onClick={async () => {
                setOpenDialog(false);
                formik.resetForm();
                await loadOutputLogsPage();
              }}
            >
              Cancel
            </Button>
            <Button type="submit" variant="contained" color="secondary">
              Return
            </Button>
          </DialogActions>
        </form>
      </Dialog>
      <Header title="OUTPUT LOGS" subtitle="View & Analyze Output Logs" />
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
          getRowHeight={() => "auto"}
          disableRowSelectionOnClick={true}
          rows={logs}
          columns={columns}
          slots={{ toolbar: QuickSearchToolbar }}
          slotProps={{
            toolbar: {
              value: searchText,
              onChange: (event) => {
                setSearchText(event.target.value);
                requestSearch(data, setLogs, event.target.value);
              },
              clearSearch: () => {
                setSearchText("");
                requestSearch(data, setLogs, "");
              },
            },
          }}
          getRowId={(log) => log._id}
        />
      </Box>
    </Box>
  );
};

export default OutputLogsPage;
