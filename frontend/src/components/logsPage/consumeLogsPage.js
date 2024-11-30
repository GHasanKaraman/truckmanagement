import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DataGrid } from "@mui/x-data-grid";

import { Box, Chip, useTheme, Avatar, Stack } from "@mui/material";

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

const ConsumeLogsPage = (props) => {
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

  const loadConsumeLogsPage = async () => {
    try {
      const res = await baseRequest.get("/logs/consume", {});
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
    loadConsumeLogsPage();
  }, []);

  useEffect(() => {
    //This is for reloading home page
    const interval = setInterval(() => {
      loadConsumeLogsPage();
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
        return (
          row.technician?.name +
          " " +
          row.technician?.surname
        ).toUpperCase();
      },
      renderCell: ({ row, value }) => {
        const img = row.technician?.image;
        const name = value;
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
      field: "parts",
      headerName: "Part Name",
      flex: 1.0,
      cellClassName: "parts-column--cell",
      valueGetter: ({ row }) => {
        return row.item.partName;
      },
    },
    {
      field: "vendor",
      headerName: "Vendor",
      flex: 0.7,
      cellClassName: "vendor-column--cell",
      valueGetter: ({ value }) => {
        return value.map((i) => i.vendor);
      },
      renderCell: ({ row }) => {
        const value = row.vendor;
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
      field: "location",
      headerName: "Location",
      flex: 0.5,
      cellClassName: "source-column--cell",
      valueGetter: ({ value }) => {
        return value.location;
      },
    },
  ];

  return (
    <Box m="0 20px ">
      <Header title="CONSUME LOGS" subtitle="View & Analyze Consume Logs" />
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

export default ConsumeLogsPage;
