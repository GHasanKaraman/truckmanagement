import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DataGrid } from "@mui/x-data-grid";

import { Box, Tooltip, Chip, useTheme, Avatar } from "@mui/material";

import { useSnackbar } from "notistack";

import Image from "../Image";
import Header from "../Header";

import { tokens } from "../../theme";

import baseRequest from "../../core/baseRequest";

import useSignOut from "../../hooks/useSignOut.js";

import { TIME } from "../../utils/const";
import {
  QuickSearchToolbar,
  requestSearch,
} from "../../scenes/DataGrid/CustomGridToolBar";

import { toStringDate } from "../../utils/helpers";
import { errorHandler } from "../../core/errorHandler.js";
import { IP } from "../../env";

const ReturnLogsPage = (props) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [controller] = useSignOut();

  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [logs, setLogs] = useState([]);
  const [data, setData] = useState([]);

  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    document.title = props.title || "";
  }, [props.title]);

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

  const loadReturnLogsPage = async () => {
    try {
      const res = await baseRequest.get("/logs/returnlogs", {});
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

  useEffect(() => {
    loadReturnLogsPage();
  }, []);

  useEffect(() => {
    //This is for reloading home page
    const interval = setInterval(() => {
      loadReturnLogsPage();
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
      valueGetter: ({ value }) => value && value.name,
    },
    {
      field: "technician",
      headerName: "Technician",
      flex: 0.9,
      cellClassName: "technician-column--cell",
      valueGetter: ({ row }) => {
        return row.technician;
      },
      renderCell: ({ row }) => {
        const img = row.technician?.image;
        const name = (
          row.technician?.name +
          " " +
          row.technician?.surname
        ).toUpperCase();
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
            label={name}
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
      field: "parts",
      headerName: "Part Name",
      flex: 1.3,
      cellClassName: "parts-column--cell",
      valueGetter: ({ row }) => {
        return row.item.partName;
      },
    },
    {
      field: "vendor",
      headerName: "Vendor",
      flex: 0.6,
      cellClassName: "vendor-column--cell",
      valueGetter: ({ row }) => {
        return row.vendor.vendor;
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
        return <Image width={40} fileName={value} />;
      },
    },
    {
      field: "returnQuantity",
      headerName: "Return Quantity",
      flex: 0.5,
      cellClassName: "name-column--cell",
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
                  {row.issue.problemID ? row.problem.problem : undefined}
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
      field: "location",
      headerName: "Source",
      flex: 0.4,
      cellClassName: "source-column--cell",
      valueGetter: ({ value }) => {
        return value.location;
      },
    },
  ];

  return (
    <Box m="0 20px ">
      <Header title="RETURN LOGS" subtitle="View & Analyze Return Logs" />
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

export default ReturnLogsPage;
