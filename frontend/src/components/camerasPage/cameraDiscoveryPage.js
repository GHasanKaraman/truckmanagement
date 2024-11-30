import React, { useEffect, useState } from "react";
import {
  Autocomplete,
  Box,
  Button,
  Chip,
  CircularProgress,
  colors,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  tableCellClasses,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  useTheme,
} from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";
import SearchIcon from "@mui/icons-material/Search";

import Highlighter from "react-highlight-words";

import baseRequest from "../../core/baseRequest";
import Header from "../Header";
import { errorHandler } from "../../core/errorHandler";
import { useSnackbar } from "notistack";
import styled from "@emotion/styled";
import { tokens } from "../../theme";
import { PrecisionManufacturing } from "@mui/icons-material";
import useControl from "../../hooks/useControl";
import useSignOut from "../../hooks/useSignOut";
import { useNavigate } from "react-router-dom";

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: tokens(theme.palette.mode).ciboInnerGreen[400],
    color: tokens(theme.palette.mode).primary[400],
    fontWeight: 600,
    fontSize: 15,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(odd)": {
    backgroundColor: theme.palette.action.hover,
  },
  // hide last border
  "&:last-child td, &:last-child th": {
    border: 0,
  },
}));

const CameraDiscovery = (props) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const { enqueueSnackbar } = useSnackbar();

  const [devices, setDevices] = useState([]);
  const [data, setData] = useState([]);

  const [auth] = useControl();
  const [controller] = useSignOut();

  const navigate = useNavigate();

  const [searchText, setSearchText] = useState("");

  const [open, setOpen] = useState(false);
  const [IP, setIP] = useState("");

  const [targets, setTargets] = useState([]);
  const [ipList, setIPList] = useState([]);
  const [value, setValue] = useState(null);

  const loadTargets = async () => {
    try {
      const res = await baseRequest.get("/target", {});
      if (res.data) {
        setTargets(res.data.records.targets);
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

  const loadCamerasPage = async () => {
    try {
      setSearchText("");
      const res = await baseRequest.get("/discover");
      setIPList(res.data.records.ipList);
      const devices = res.data.records.cameras.map((device, index) => {
        return {
          index: index,
          brand:
            device["x-user-agent"] === "redsonic"
              ? "AMCREST"
              : device.xml.root?.device[0].manufacturer[0],
          IP: device.IP,
          URL: device.xml.root?.device[0]?.presentationURL[0],
          mac: device.xml.root.device[0].serialNumber[0],
          sn:
            device["x-user-agent"] === "redsonic"
              ? device.xml.root?.device[0]?.friendlyName[0]
              : device.xml.root.device[0].modelNumber[0],
        };
      });
      setData(devices);
      search(devices, searchText);
    } catch (error) {
      const { data, status } = errorHandler(error);
      switch (status) {
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
    loadCamerasPage();
  }, []);
  useEffect(() => {
    //This is for reloading home page
    const interval = setInterval(() => {
      loadCamerasPage();
    }, 1000 * 60);

    return () => clearInterval(interval);
  }, []);

  const search = (data, text) => {
    if (text === "") {
      setDevices(data);
    } else {
      const newData = data.filter((device) => {
        return (
          device.brand.toUpperCase().includes(text.toUpperCase()) ||
          device.IP.toUpperCase().includes(text.toUpperCase()) ||
          device.mac.toUpperCase().includes(text.toUpperCase()) ||
          device.sn.toUpperCase().includes(text.toUpperCase())
        );
      });
      setDevices(newData);
    }
  };

  const handleAssign = async () => {
    try {
      if (value) {
        const res = await baseRequest.put("/target/assign", {
          id: value._id,
          IP,
        });
        if (auth(res)) {
          setOpen(false);
          setValue(null);
          enqueueSnackbar(
            "IP address has been assigned to  " + value.target + ".",
            {
              variant: "success",
            },
          );
          await loadCamerasPage();
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
          enqueueSnackbar("Something went wrong while assigning the IP!", {
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

  return (
    <Box m="0 20px">
      <Dialog
        fullWidth={true}
        open={open}
        onClose={() => {
          setOpen(false);
          setValue(null);
        }}
      >
        <DialogTitle>{"ASSIGN " + IP}</DialogTitle>
        <DialogContent>
          <Autocomplete
            onChange={(_, value) => {
              setValue(value);
            }}
            value={value}
            sx={{ gridColumn: "span 2" }}
            options={
              targets.sort(
                (a, b) =>
                  -b.machineType.machineType.localeCompare(
                    a.machineType.machineType,
                  ),
              ) || []
            }
            getOptionLabel={(option) => option.target}
            groupBy={(option) => option.machineType.machineType}
            isOptionEqualToValue={(option, value) => option._id === value._id}
            renderInput={(params) => (
              <TextField
                {...params}
                variant="filled"
                label="Target"
                name="target"
              />
            )}
          />
          <Button
            onClick={handleAssign}
            variant="contained"
            color="secondary"
            sx={{
              width: "100%",
              mt: 2,
              fontWeight: 700,
              fontSize: 15,
              color: "#fff",
            }}
          >
            ASSIGN
          </Button>
        </DialogContent>
      </Dialog>
      <Header title="CAMERAS" subtitle="Discover Your Network" />
      <TextField
        disabled={data.length === 0}
        autoFocus
        style={{ width: "100%", marginBottom: "15px" }}
        variant="standard"
        value={searchText}
        onChange={(event) => {
          const text = event.target.value;
          setSearchText(text);
          search(data, text);
        }}
        placeholder="Search…"
        InputProps={{
          startAdornment: (
            <SearchIcon
              fontSize="small"
              htmlColor={colors.ciboInnerGreen[300]}
            />
          ),
          endAdornment: (
            <IconButton
              title="Clear"
              aria-label="Clear"
              size="small"
              style={{ visibility: searchText !== "" ? "visible" : "hidden" }}
              onClick={() => {
                setSearchText("");
                search(data, "");
              }}
            >
              <ClearIcon fontSize="small" />
            </IconButton>
          ),
        }}
      />

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 700 }} aria-label="customized table">
          <TableHead>
            <TableRow>
              <StyledTableCell align="left">ID</StyledTableCell>
              <StyledTableCell>Brand</StyledTableCell>
              <StyledTableCell>Status</StyledTableCell>
              <StyledTableCell align="right">IPv4 Address</StyledTableCell>
              <StyledTableCell align="right">MAC Address</StyledTableCell>
              <StyledTableCell align="right">Serial Number</StyledTableCell>
              <StyledTableCell align="right">Actions</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody sx={{ textAlign: "center" }}>
            {data.length === 0 ? (
              <StyledTableRow>
                <StyledTableCell colSpan={5} sx={{ textAlign: "center" }}>
                  <CircularProgress size={20} />
                </StyledTableCell>
              </StyledTableRow>
            ) : (
              devices.map((device, index) => {
                const status = ipList.map(({ IP }) => IP).includes(device.IP);

                return (
                  <StyledTableRow key={device.index}>
                    <StyledTableCell align="left">{index + 1}</StyledTableCell>
                    <StyledTableCell component="th" scope="row">
                      <Highlighter
                        searchWords={[searchText]}
                        autoEscape
                        textToHighlight={device.brand}
                        highlightStyle={{
                          backgroundColor: "#ffc069",
                          padding: 0,
                        }}
                      />
                    </StyledTableCell>
                    <StyledTableCell>
                      <Chip
                        variant="outlined"
                        label={
                          status
                            ? ipList.filter(({ IP }) => IP === device.IP)[0]
                                ?.target
                            : "Not Assigned"
                        }
                        sx={{
                          minWidth: 100,
                          color: colors.primary[400],
                          fontWeight: status ? 700 : 500,
                          background: status
                            ? colors.ciboInnerGreen[400]
                            : colors.yoggieRed[400],
                        }}
                      />
                    </StyledTableCell>

                    <StyledTableCell align="right">
                      <Chip
                        clickable
                        variant="outlined"
                        href={device.URL}
                        target="_blank"
                        label={device.IP}
                        sx={{ minWidth: 100 }}
                        component="a"
                      />
                    </StyledTableCell>
                    <StyledTableCell align="right">
                      <Highlighter
                        searchWords={[searchText]}
                        autoEscape
                        textToHighlight={device.mac}
                        highlightStyle={{
                          backgroundColor: "#ffc069",
                          padding: 0,
                        }}
                      />
                    </StyledTableCell>
                    <StyledTableCell align="right">
                      <Highlighter
                        searchWords={[searchText]}
                        autoEscape
                        textToHighlight={device.sn}
                        highlightStyle={{
                          backgroundColor: "#ffc069",
                          padding: 0,
                        }}
                      />
                    </StyledTableCell>
                    <StyledTableCell align="right">
                      <IconButton
                        onClick={async () => {
                          setIP(device.IP);
                          setOpen(true);
                          await loadTargets();
                        }}
                      >
                        <PrecisionManufacturing />
                      </IconButton>
                    </StyledTableCell>
                  </StyledTableRow>
                );
              })
            )}
            {/*rows.map((row) => (
              <StyledTableRow key={row.name}>
                <StyledTableCell component="th" scope="row">
                  {row.name}
                </StyledTableCell>
                <StyledTableCell align="right">{row.calories}</StyledTableCell>
                <StyledTableCell align="right">{row.fat}</StyledTableCell>
                <StyledTableCell align="right">{row.carbs}</StyledTableCell>
                <StyledTableCell align="right">{row.protein}</StyledTableCell>
              </StyledTableRow>
            ))*/}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default CameraDiscovery;
