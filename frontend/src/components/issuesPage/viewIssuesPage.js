import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Autocomplete,
  Box,
  Button,
  CardHeader,
  Chip,
  CircularProgress,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Grid,
  Pagination,
  Stack,
  TextField,
  Tooltip,
  Zoom,
  useTheme,
  Card,
  IconButton,
  CardActions,
  CardContent,
  Typography,
  useMediaQuery,
  Avatar,
  createFilterOptions,
  SvgIcon,
} from "@mui/material";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import { DateTimePicker, LocalizationProvider } from "@mui/x-date-pickers";

import {
  AccessTime,
  AccessTimeFilled,
  Delete,
  Edit,
  ErrorOutline,
  Pause,
  PlayArrow,
  PlayCircleOutline,
  Stop,
  Warning,
  WarningAmber,
} from "@mui/icons-material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import { ReactComponent as DelayIcon } from "../../images/delayIcon.svg";

import { userInfoParams } from "../../atoms/userAtoms";
import moment from "moment-timezone";

import { useSnackbar } from "notistack";

import { useFormik } from "formik";
import * as yup from "yup";

import Header from "../Header";

import { tokens } from "../../theme";

import baseRequest from "../../core/baseRequest";

import {
  getPartID,
  minuteDifference,
  toStringDate,
  verifyPermissions,
} from "../../utils/helpers";
import CountUp from "../../utils/countUp";

import loadingWhite from "../../images/loadingWhite.gif";
import loadingBlack from "../../images/loadingBlack.gif";
import FilterTools from "./filterTools";

import { useRecoilValue } from "recoil";
import {
  issueFilterParams,
  issueSearchQueryParams,
} from "../../atoms/issueAtoms";
import Image from "../Image";
import useControl from "../../hooks/useControl";
import useSignOut from "../../hooks/useSignOut";
import { errorHandler } from "../../core/errorHandler";
import { IP } from "../../env";
import UploadImage from "../UploadImage";

const ViewIssuesPage = (props) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [auth] = useControl();
  const [controller] = useSignOut();

  const user = useRecoilValue(userInfoParams);

  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));
  const [open, setOpen] = useState(false);

  const [problems, setProblems] = useState([]);
  const [superiors, setSuperiors] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [fixingMethods, setFixingMethods] = useState([]);
  const [targets, setTargets] = useState([]);

  const filter = createFilterOptions();

  const [issue, setIssue] = useState([]);

  const [disabledProblem, setDisabledProblem] = useState(true);
  const [requiredOption, setRequiredOption] = useState(false);

  const [issues, setIssues] = useState([]);

  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState({ value: 1 });
  const [count, setCount] = useState(1);

  const [expanded, setExpanded] = useState({ 0: false });
  const [openDialog, setOpenDialog] = useState(false);

  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [detailsInfo, setDetailsInfo] = useState();

  const filterParams = useRecoilValue(issueFilterParams);
  const searchQuery = useRecoilValue(issueSearchQueryParams);

  const [clickedIssueType, setClickedIssueType] = useState(false);
  const [clickedStart, setClickedStart] = useState(false);
  const [clickedStop, setClickedStop] = useState(false);
  const [clickedDelete, setClickedDelete] = useState(false);
  const [clickedPause, setClickedPause] = useState(false);
  const [clickedUpdate, setClickedUpdate] = useState(false);

  const pauseStartIssue = (id) => {
    try {
      if (!clickedPause) {
        setClickedPause(true);
        baseRequest
          .put("/issue/pause/start", {
            id,
          })
          .then((res) => {
            if (auth(res)) {
              loadIssuesPage().then((_) => {
                setClickedPause(false);
              });
            }
          });
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
          enqueueSnackbar("Something went wrong while starting the issue!", {
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

  const pauseStopIssue = (id) => {
    try {
      if (!clickedPause) {
        setClickedPause(true);
        baseRequest
          .put("/issue/pause/stop", {
            id,
          })
          .then((res) => {
            if (auth(res)) {
              loadIssuesPage().then((_) => {
                setClickedPause(false);
              });
            }
          });
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
          enqueueSnackbar("Something went wrong while starting the issue!", {
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

  const changeIssueType = (id, issueType) => {
    try {
      if (!clickedIssueType) {
        setClickedIssueType(true);
        baseRequest
          .put("/issue/changeType", {
            id,
            issueType,
          })
          .then((res) => {
            if (auth(res)) {
              loadIssuesPage().then((_) => {
                setClickedIssueType(false);
              });
            }
          });
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
          enqueueSnackbar("Something went wrong while starting the issue!", {
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

  const workOnIssue = (id) => {
    try {
      if (!clickedStart) {
        setClickedStart(true);
        baseRequest.put("/issue/start", { id }).then((res) => {
          if (auth(res)) {
            loadIssuesPage().then((_) => {
              setClickedStart(false);
            });
          }
        });
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
          enqueueSnackbar("Something went wrong while starting the issue!", {
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

  const stopWorking = (id) => {
    try {
      if (!clickedStop) {
        setClickedStop(true);
        baseRequest.put("/issue/stop", { id }).then((res) => {
          if (auth(res)) {
            loadIssuesPage().then((_) => {
              setClickedStop(false);
            });
          }
        });
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
          enqueueSnackbar("Something went wrong while stopping the issue!", {
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

  const loadSuperiors = async (targetID) => {
    try {
      const res = await baseRequest.get("/superior/find", {
        params: { targetID },
      });
      if (auth(res)) {
        setSuperiors(Object.values(res.data.records));
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
          enqueueSnackbar(
            "Something went wrong while retrieving the superiors!",
            {
              variant: "error",
            },
          );
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

  const loadProblems = async (superiorID) => {
    try {
      const res = await baseRequest.get("/problem/find", {
        params: { superiorID },
      });
      if (auth(res)) {
        setProblems(Object.values(res.data.records));
        return Object.values(res.data.records);
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
          enqueueSnackbar(
            "Something went wrong while retrieving the problems!",
            {
              variant: "error",
            },
          );
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

  const getQueryString = (page, filterParams) => {
    const { selectedCase, selectedRange, selectedTarget, searchText } =
      filterParams;
    var queryString = "?page=" + page;
    const { startDate, endDate } = selectedRange;
    if (startDate !== "" && endDate !== "") {
      if (selectedCase === "special") {
        queryString += "&show=special";
      }
      queryString += "&from=" + startDate + "&to=" + endDate;
    } else {
      queryString += "&show=" + selectedCase;
    }
    if (selectedTarget) {
      queryString += "&target=" + selectedTarget;
    }
    if (searchText !== "") {
      queryString += "&search=" + searchText;
    }

    return queryString;
  };

  const handlePageChange = (_, value) => {
    setPage({ value });
    setLoading(true);
    setIssues([]);
  };
  useEffect(() => {
    navigate("?page=" + page.value + searchQuery);
    loadIssuesPage().then((_) => {
      setLoading(false);
    });
  }, [page]);

  const applyFilters = async () => {
    navigate("?page=" + page.value + searchQuery);
    loadIssuesPage().then((_) => {
      setLoading(false);
      setPage({ value: 1 });
    });
  };

  useEffect(() => {
    setLoading(true);
    setIssues([]);
    applyFilters();
  }, [filterParams]);

  const loadIssuesPage = async () => {
    try {
      const res = await baseRequest.get(
        "/issue" + getQueryString(page.value, filterParams),
        { params: { filterParams } },
      );
      if (res.data) {
        setTechnicians(Object.values(res.data.records.users));
        setFixingMethods(Object.values(res.data.records.fixingMethods));
        setTargets(Object.values(res.data.records.targets));
        setIssues(Object.values(res.data.records.issues));
        setCount(res.data.records.length);
        setLoading(false);
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
          enqueueSnackbar("Something went wrong retrieving the issues!", {
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
    loadIssuesPage();
  }, []);

  useEffect(() => {
    //This is for reloading home page
    const interval = window.setInterval(() => {
      setPage(({ value }) => {
        return { value };
      });
    }, 1000 * 30);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = (values) => {
    try {
      if (!clickedUpdate) {
        setClickedUpdate(true);
        baseRequest.put("/issue", { values, id: issue._id }).then((res) => {
          if (auth(res)) {
            enqueueSnackbar("Issue has been successfully updated!", {
              variant: "success",
            });
            setClickedUpdate(false);
          }
        });
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
          enqueueSnackbar("Something went wrong updating the location!", {
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
  };

  const formik = useFormik({
    initialValues: {
      technicians: [],
      extraTechnicians: [],
      superior: undefined,
      problem: undefined,
      start: "",
      stop: "",
      pauseStart: "",
      pauseStop: "",
      fixingMethod: "",
      comment: "",
    },
    onSubmit: handleSubmit,
    validationSchema: requiredOption
      ? yup.object().shape({
          problem: yup
            .mixed()
            .nullable()
            .test(
              "ID_CHECK",
              "You must select the problem, if you selected the problematic machine part!",
              (value) => {
                if (value.problem?._id) return true;
                else return false;
              },
            )
            .required(
              "You must select the problem, if you selected the problematic machine part!",
            ),
        })
      : undefined,
  });

  const getIssueColor = (item) => {
    if (item.paused === 1) {
      return colors.blueAccent[500];
    }
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
      return colors.ciboInnerGreen[500];
    }
  };

  const dialogDeleteApproved = async () => {
    try {
      if (!clickedDelete) {
        setClickedDelete(true);
        const res = await baseRequest.delete("/issue", {
          id: issue._id,
        });
        if (auth(res)) {
          setOpenDialog(false);
          loadIssuesPage().then(() => {
            setClickedDelete(false);
          });
          enqueueSnackbar("Issue has been successfully deleted!", {
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
          enqueueSnackbar("Something went wrong deleting the part!", {
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

  const handleUpload = (blob, id) => {
    try {
      if (blob) {
        const formData = new FormData();
        formData.append("file", blob, "image.jpeg");
        formData.append("id", id);
        baseRequest.put("/issue/upload", formData).then((res) => {
          if (auth(res)) {
            enqueueSnackbar("Picture has been successfully uploaded!", {
              variant: "success",
            });
          }
        });
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
          enqueueSnackbar("Something went wrong uploading the image!", {
            variant: "error",
          });
          break;
        case 500:
          enqueueSnackbar(
            "Something went wrong while uploading image to database!",
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
      <Header title="VIEW ISSUES" subtitle="Managing Issues" />
      <FilterTools targets={targets} />
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
            Do you really want to delete this issue?
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
      <Dialog
        fullScreen={fullScreen}
        open={openDetailsDialog}
        onClose={() => {
          setOpenDetailsDialog(false);
        }}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Item Details</DialogTitle>
        <DialogContent
          sx={{
            textAlign: "center",
            justifyContent: "center",
          }}
        >
          <Image fileName={detailsInfo?.image} width={100} />
          <DialogContentText
            id="alert-dialog-description"
            sx={{ fontWeight: "600" }}
          >
            {detailsInfo?.partName}
          </DialogContentText>
          <DialogContentText id="alert-dialog-vendor">
            {detailsInfo?.count + " in stock"}
          </DialogContentText>
          <DialogContentText id="alert-dialog-location">
            {detailsInfo?.location?.location}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              setOpenDetailsDialog(false);
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
      {loading ? (
        <img
          alt="loadingGIF"
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            margin: "auto",
          }}
          src={theme.palette.mode === "light" ? loadingBlack : loadingWhite}
          width={350}
        />
      ) : count <= 0 ? (
        <div
          style={{ textAlign: "center", fontWeight: "bold", fontSize: "20px" }}
        >
          No Data Found
        </div>
      ) : (
        <div>
          <Grid container spacing={3} justifyContent="center">
            {issues?.map((item, index) => {
              return (
                <Grid key={index} item sm={12} md={6} lg={4}>
                  <Zoom
                    in={Boolean(issues)}
                    style={{
                      transitionDelay: (index / 3 + (index % 3)) * 75,
                    }}
                  >
                    <div>
                      <Card
                        sx={{
                          minWidth: 270,
                          minHeight: 183,
                          background: getIssueColor(item),
                          transition: "0.2s",
                          "&:hover": {
                            transform: "scale(1.05) !important",
                            boxShadow: `0px 7px 40px ${getIssueColor(item)}}`,
                          },
                        }}
                      >
                        <CardHeader
                          avatar={
                            item.status === 0 ? (
                              <ErrorOutline />
                            ) : item.status === 1 ? (
                              item.paused === 1 ? (
                                <Pause sx={{ color: colors.primary[400] }} />
                              ) : (
                                <CircularProgress
                                  size={20}
                                  sx={{ color: colors.primary[400] }}
                                />
                              )
                            ) : item.paused === 2 ? (
                              <SvgIcon
                                component={DelayIcon}
                                inheritViewBox
                                sx={{
                                  "& .st0, .st1": { fill: colors.primary[400] },
                                }}
                              />
                            ) : (
                              <TaskAltIcon />
                            )
                          }
                          title={
                            <Typography variant="h4" fontWeight="bold">
                              {item.target.target}
                            </Typography>
                          }
                          subheader={
                            <Stack
                              direction="row"
                              spacing={3}
                              sx={{ color: colors.primary[400] }}
                            >
                              <Typography variant="h7">
                                {toStringDate(
                                  item.status === 0
                                    ? item.createdAt
                                    : item.start,
                                  {
                                    month: "short",
                                    year: "numeric",
                                    day: "numeric",
                                    hour: "numeric",
                                    minute: "numeric",
                                  },
                                )}
                              </Typography>
                              <Typography variant="h7" fontWeight="bold">
                                {(function () {
                                  const minute = minuteDifference(
                                    item.start,
                                    item.stop,
                                  );
                                  var start = moment(item.start).tz(
                                    "America/New_York",
                                  );
                                  if (item.status === 1) {
                                    if (item.paused === 1) {
                                      return (
                                        <CountUp
                                          start={moment(item.pauseStart).tz(
                                            "America/New_York",
                                          )}
                                        />
                                      );
                                    } else {
                                      return <CountUp start={start} />;
                                    }
                                  } else if (item.status === 2) {
                                    if (item.paused === 2) {
                                      const pauseDiff =
                                        minute -
                                        minuteDifference(
                                          item.pauseStart,
                                          item.pauseStop,
                                        );
                                      return (
                                        pauseDiff +
                                        (pauseDiff === 1 ? " min!" : " mins!")
                                      );
                                    } else {
                                      return (
                                        minute +
                                        (minute === 1 ? " min" : " mins")
                                      );
                                    }
                                  }
                                  return (
                                    <CountUp
                                      start={moment(item.createdAt).tz(
                                        "America/New_York",
                                      )}
                                    />
                                  );
                                })()}
                              </Typography>
                            </Stack>
                          }
                          sx={{ color: colors.primary[400] }}
                        />
                        <CardContent>
                          {item.status === 2 ? (
                            <Typography
                              variant="h5"
                              sx={{ color: colors.primary[400] }}
                            >
                              {item.problem ? (
                                item.problem.problem
                              ) : (
                                <span
                                  className="blink"
                                  style={{
                                    fontWeight: "bold",
                                  }}
                                >
                                  MISSING PROBLEM!
                                </span>
                              )}
                            </Typography>
                          ) : item.status === 1 ? (
                            <Typography
                              variant="h5"
                              sx={{ color: colors.primary[400] }}
                            >
                              {item.users?.length +
                                item.extraTechnicians?.length >
                              0 ? (
                                <Stack
                                  spacing={2}
                                  direction="row"
                                  justifyContent="center"
                                >
                                  <div>
                                    <Typography
                                      variant="h5"
                                      color={colors.primary[400]}
                                      fontWeight="bold"
                                      sx={{
                                        m: "15px 0 5px 0px",
                                        textAlign: "center",
                                      }}
                                    >
                                      TECHNICIANS
                                    </Typography>
                                    <Stack direction="column" spacing={1}>
                                      <Divider variant="middle" />
                                      {item.users.map((user) => (
                                        <Chip
                                          avatar={
                                            <Avatar
                                              src={
                                                "http://" +
                                                IP +
                                                "/uploads/thumbnail-" +
                                                user.image?.substring(
                                                  user.image?.indexOf("/") + 1,
                                                )
                                              }
                                            />
                                          }
                                          variant="filled"
                                          size="small"
                                          label={(
                                            user.name +
                                            " " +
                                            user.surname
                                          ).toUpperCase()}
                                          key={user.name}
                                          style={{
                                            fontSize: "12px",
                                            fontWeight: "600",
                                            color: colors.primary[400],
                                            backgroundColor:
                                              item.paused === 1
                                                ? colors.blueAccent[400]
                                                : item.issueType === 1
                                                  ? colors.omegaDeluxPurple[400]
                                                  : item.issueType === 2
                                                    ? colors.contrast[200]
                                                    : colors.orangeAccent[200],
                                            borderRadius: "4px",
                                            borderWidth: "0px",
                                          }}
                                        />
                                      ))}
                                      {item.extraTechnicians?.map((user) => (
                                        <Chip
                                          variant="filled"
                                          size="small"
                                          label={user}
                                          key={user}
                                          style={{
                                            fontSize: "12px",
                                            fontWeight: "600",
                                            color: colors.primary[400],
                                            backgroundColor:
                                              item.paused === 1
                                                ? colors.blueAccent[400]
                                                : item.issueType === 1
                                                  ? colors.omegaDeluxPurple[400]
                                                  : item.issueType === 2
                                                    ? colors.contrast[200]
                                                    : colors.orangeAccent[200],
                                            borderRadius: "4px",
                                            borderWidth: "0px",
                                          }}
                                        />
                                      ))}
                                    </Stack>
                                  </div>
                                  {item.log.length > 0 ? (
                                    <div>
                                      <Typography
                                        variant="h5"
                                        color={colors.primary[400]}
                                        fontWeight="bold"
                                        sx={{
                                          m: "15px 0 5px 0px",
                                          textAlign: "center",
                                        }}
                                      >
                                        ITEMS
                                      </Typography>
                                      <Stack direction="column" spacing={1}>
                                        <Divider variant="middle" />
                                        {item.log.map((log) => (
                                          <Chip
                                            clickable
                                            onClick={() => {
                                              setOpenDetailsDialog(true);
                                              setDetailsInfo(log?.logItem);
                                            }}
                                            sx={{
                                              "&.MuiButtonBase-root.MuiChip-clickable:hover":
                                                {
                                                  background:
                                                    "rgba(0, 0, 0, 0.08) !important",
                                                },
                                            }}
                                            variant="filled"
                                            size="small"
                                            label={
                                              getPartID(
                                                log.logItem?.partName,
                                                log.itemID,
                                              ).toUpperCase() +
                                              " x" +
                                              log.outputQuantity
                                            }
                                            key={log._id}
                                            style={{
                                              fontSize: "12px",
                                              fontWeight: "600",
                                              color: colors.primary[400],
                                              backgroundColor:
                                                item.issueType === 1
                                                  ? colors.omegaDeluxPurple[400]
                                                  : item.issueType === 2
                                                    ? colors.contrast[200]
                                                    : colors.orangeAccent[200],
                                              borderRadius: "4px",
                                              borderWidth: "0px",
                                            }}
                                          />
                                        ))}
                                      </Stack>
                                    </div>
                                  ) : null}
                                </Stack>
                              ) : item.paused === 1 ? (
                                "Issue has been paused!"
                              ) : (
                                "Technicians started working on this machine!"
                              )}
                            </Typography>
                          ) : (
                            <Typography
                              variant="h5"
                              sx={{ color: colors.primary[400] }}
                            >
                              An issue occured on this machine!
                            </Typography>
                          )}
                        </CardContent>
                        {verifyPermissions(user.permissions, "awud") ? (
                          <CardActions disableSpacing>
                            <Tooltip title="Warning">
                              <IconButton
                                onClick={() => {
                                  changeIssueType(item._id, 2);
                                }}
                              >
                                {item.issueType === 2 ? (
                                  <Warning
                                    sx={{
                                      color: colors.primary[400],
                                    }}
                                  />
                                ) : (
                                  <WarningAmber
                                    sx={{
                                      color: colors.primary[400],
                                    }}
                                  />
                                )}
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Waiting">
                              <IconButton
                                onClick={() => {
                                  changeIssueType(item._id, 1);
                                }}
                              >
                                {item.issueType === 1 ? (
                                  <AccessTimeFilled
                                    sx={{
                                      color: colors.primary[400],
                                    }}
                                  />
                                ) : (
                                  <AccessTime
                                    sx={{
                                      color: colors.primary[400],
                                    }}
                                  />
                                )}
                              </IconButton>
                            </Tooltip>
                            {item.status === 1 && item.paused !== 2 ? (
                              <Tooltip
                                title={item.paused === 0 ? "Pause" : "Continue"}
                              >
                                <IconButton
                                  onClick={() => {
                                    if (item.paused === 0) {
                                      pauseStartIssue(item._id);
                                    } else if (item.paused === 1) {
                                      pauseStopIssue(item._id);
                                    }
                                  }}
                                >
                                  {item?.paused === 0 ? (
                                    <Pause
                                      sx={{
                                        color: colors.primary[400],
                                      }}
                                    />
                                  ) : (
                                    <PlayCircleOutline
                                      sx={{ color: colors.primary[400] }}
                                    />
                                  )}
                                </IconButton>
                              </Tooltip>
                            ) : undefined}

                            <Tooltip title="Delete">
                              <IconButton
                                sx={{
                                  color: colors.primary[400],
                                }}
                                variant="outlined"
                                onClick={() => {
                                  setIssue(item);
                                  setOpenDialog(true);
                                }}
                              >
                                <Delete />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Edit">
                              <IconButton
                                sx={{
                                  display:
                                    item.status === 0 ? "none" : "inline-flex",
                                }}
                                onClick={async () => {
                                  setIssue(item);
                                  await loadSuperiors(item.targetID);
                                  formik.setValues({
                                    technicians: item.users,
                                    extraTechnicians:
                                      item.extraTechnicians?.map((item) => {
                                        return { title: item };
                                      }),
                                    fixingMethod: item?.fixingMethod,
                                    comment: item.comment,
                                  });

                                  const startTime = moment(item.start);
                                  const stopTime = moment(item.stop);
                                  if (item.paused && item.paused !== 0) {
                                    formik.setFieldValue(
                                      "pauseStart",
                                      item.pauseStart,
                                    );
                                  }
                                  if (item.paused && item.paused === 2) {
                                    formik.setFieldValue(
                                      "pauseStop",
                                      item.pauseStop,
                                    );
                                  }
                                  if (moment().diff(startTime, "years") < 30) {
                                    formik.setFieldValue("start", item.start);
                                  }
                                  if (moment().diff(stopTime, "years") < 30) {
                                    formik.setFieldValue("stop", item.stop);
                                  }

                                  if (item.problem && item.superior) {
                                    formik.setFieldValue(
                                      "superior",
                                      item?.superior,
                                    );

                                    loadProblems(item.problem.superiorID).then(
                                      (data) => {
                                        formik.setFieldValue(
                                          "problem",
                                          data.filter(
                                            (problem) =>
                                              problem.problem?._id ===
                                              item.problem?._id,
                                          )[0],
                                        );
                                      },
                                    );

                                    setDisabledProblem(false);
                                  }
                                  setOpen(true);
                                }}
                              >
                                <Edit sx={{ color: colors.grey[900] }} />
                              </IconButton>
                            </Tooltip>

                            <UploadImage
                              src={
                                item.image && item.image !== ""
                                  ? "http://" + IP + "/" + item.image
                                  : undefined
                              }
                              onChange={(blob) => {
                                handleUpload(blob, item._id);
                              }}
                              mode="mini"
                              iconStyle={{ color: colors.primary[400] }}
                            />

                            {item.status === 1 && item.paused !== 1 ? (
                              <Tooltip title="Stop">
                                <IconButton
                                  sx={{
                                    color: colors.yoggieRed[900],
                                    marginLeft: "auto",
                                  }}
                                  onClick={() => stopWorking(item._id)}
                                >
                                  <Stop />
                                </IconButton>
                              </Tooltip>
                            ) : null}
                            {item.status === 0 ? (
                              <Tooltip title="Start">
                                <IconButton
                                  sx={{
                                    color: colors.yoggieRed[900],
                                    marginLeft: "auto",
                                  }}
                                  onClick={() => workOnIssue(item._id)}
                                >
                                  <PlayArrow />
                                </IconButton>
                              </Tooltip>
                            ) : null}
                            <IconButton
                              sx={{
                                display:
                                  item.status === 2 ? "inline-flex" : "none",
                                transform: !expanded[index]
                                  ? "rotate(0deg)"
                                  : "rotate(180deg)",
                                marginLeft: "auto",
                                transition: theme.transitions.create(
                                  "transform",
                                  {
                                    duration:
                                      theme.transitions.duration.shortest,
                                  },
                                ),
                              }}
                              onClick={() => {
                                setExpanded({
                                  ...expanded,
                                  [index]: !expanded[index],
                                });
                              }}
                              aria-expanded={expanded[index]}
                              aria-label="show more"
                            >
                              <ExpandMoreIcon
                                sx={{ color: colors.grey[900] }}
                              />
                            </IconButton>
                          </CardActions>
                        ) : (
                          <CardActions>
                            <IconButton
                              sx={{
                                display:
                                  item.status === 2 ? "inline-flex" : "none",
                                transform: !expanded[index]
                                  ? "rotate(0deg)"
                                  : "rotate(180deg)",
                                marginLeft: "auto",
                                transition: theme.transitions.create(
                                  "transform",
                                  {
                                    duration:
                                      theme.transitions.duration.shortest,
                                  },
                                ),
                              }}
                              onClick={() => {
                                setExpanded({
                                  ...expanded,
                                  [index]: !expanded[index],
                                });
                              }}
                              aria-expanded={expanded[index]}
                              aria-label="show more"
                            >
                              <ExpandMoreIcon
                                sx={{ color: colors.grey[900] }}
                              />
                            </IconButton>
                          </CardActions>
                        )}

                        <Collapse
                          in={expanded[index]}
                          timeout="auto"
                          unmountOnExit
                        >
                          <Divider
                            sx={{ mt: "5px" }}
                            variant="middle"
                            color={colors.primary[400]}
                          />
                          <CardContent>
                            <Stack
                              spacing={2}
                              direction="row"
                              justifyContent="center"
                            >
                              <div>
                                <Typography
                                  variant="h5"
                                  color={colors.primary[400]}
                                  fontWeight="bold"
                                  sx={{
                                    m: "15px 0 5px 0px",
                                    textAlign: "center",
                                  }}
                                >
                                  TECHNICIANS
                                </Typography>
                                <Stack direction="column" spacing={1}>
                                  <Divider variant="middle" />
                                  {item.users.map((user) => (
                                    <Chip
                                      avatar={
                                        <Avatar
                                          src={
                                            "http://" +
                                            IP +
                                            "/uploads/thumbnail-" +
                                            user.image?.substring(
                                              user.image?.indexOf("/") + 1,
                                            )
                                          }
                                        />
                                      }
                                      variant="filled"
                                      size="small"
                                      label={(
                                        user.name +
                                        " " +
                                        user.surname
                                      ).toUpperCase()}
                                      key={user.name}
                                      style={{
                                        fontSize: "12px",
                                        fontWeight: "600",
                                        color: colors.primary[400],
                                        backgroundColor:
                                          item.issueType === 1
                                            ? colors.omegaDeluxPurple[400]
                                            : item.issueType === 2
                                              ? colors.contrast[200]
                                              : colors.ciboInnerGreen[400],
                                        borderRadius: "4px",
                                        borderWidth: "0px",
                                      }}
                                    />
                                  ))}
                                  {item.extraTechnicians?.map((user) => (
                                    <Chip
                                      variant="filled"
                                      size="small"
                                      label={user}
                                      key={user}
                                      style={{
                                        fontSize: "12px",
                                        fontWeight: "600",
                                        color: colors.primary[400],
                                        backgroundColor:
                                          item.issueType === 1
                                            ? colors.omegaDeluxPurple[400]
                                            : item.issueType === 2
                                              ? colors.contrast[200]
                                              : colors.ciboInnerGreen[400],
                                        borderRadius: "4px",
                                        borderWidth: "0px",
                                      }}
                                    />
                                  ))}
                                </Stack>
                              </div>
                              {item.log.length > 0 ? (
                                <div>
                                  <Typography
                                    variant="h5"
                                    color={colors.primary[400]}
                                    fontWeight="bold"
                                    sx={{
                                      m: "15px 0 5px 0px",
                                      textAlign: "center",
                                    }}
                                  >
                                    ITEMS
                                  </Typography>
                                  <Stack direction="column" spacing={1}>
                                    <Divider variant="middle" />
                                    {item.log?.map((log) => (
                                      <Chip
                                        onClick={() => {
                                          setOpenDetailsDialog(true);
                                          setDetailsInfo(log?.logItem);
                                        }}
                                        sx={{
                                          "&.MuiButtonBase-root.MuiChip-clickable:hover":
                                            {
                                              background:
                                                "rgba(0, 0, 0, 0.08) !important",
                                            },
                                        }}
                                        clickable
                                        variant="filled"
                                        size="small"
                                        label={
                                          getPartID(
                                            log.logItem.partName,
                                            log.itemID,
                                          ).toUpperCase() +
                                          " x" +
                                          log.outputQuantity
                                        }
                                        key={log._id}
                                        style={{
                                          fontSize: "12px",
                                          fontWeight: "600",
                                          color: colors.primary[400],
                                          backgroundColor:
                                            item.issueType === 1
                                              ? colors.omegaDeluxPurple[400]
                                              : item.issueType === 2
                                                ? colors.contrast[200]
                                                : colors.ciboInnerGreen[400],
                                          borderRadius: "4px",
                                          borderWidth: "0px",
                                        }}
                                      />
                                    ))}
                                  </Stack>
                                </div>
                              ) : null}
                            </Stack>
                          </CardContent>
                        </Collapse>
                      </Card>
                    </div>
                  </Zoom>
                </Grid>
              );
            })}
          </Grid>
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
              "& .Mui-disabled": {
                cursor: "not-allowed",
                pointerEvents: "all !important",
              },
            }}
            fullScreen={fullScreen}
            open={open}
            onClose={async () => {
              setOpen(false);
              formik.resetForm();
              setDisabledProblem(true);
              setRequiredOption(false);
              await loadIssuesPage();
            }}
          >
            <DialogTitle>Edit Issue</DialogTitle>
            <form onSubmit={formik.handleSubmit}>
              <DialogContent>
                <Stack spacing={2}>
                  <DialogContentText sx={{ color: colors.yoggieRed[500] }}>
                    You cannot reach the old data after you changed something on
                    this issue. It will effect all data connected to this issue.
                  </DialogContentText>
                  <TextField
                    sx={{
                      "& .Mui-disabled": {
                        color: colors.ciboInnerGreen[400],
                        fontWeight: "bold",
                      },
                    }}
                    disabled
                    margin="dense"
                    value={issue.target?.target}
                    label="Target"
                    fullWidth
                  />
                  <Autocomplete
                    disabled={
                      issue ? (issue.status === 0 ? true : false) : false
                    }
                    onFocus={(event) => {
                      event.stopPropagation();
                    }}
                    disableCloseOnSelect={true}
                    multiple
                    value={formik.values.technicians || []}
                    onChange={(_, value) => {
                      formik.setFieldValue("technicians", value);
                    }}
                    sx={{ gridColumn: "span 2" }}
                    options={technicians || []}
                    getOptionLabel={(option) =>
                      (option.name + " " + option.surname).toUpperCase()
                    }
                    renderOption={(props, option) => {
                      return (
                        <li {...props}>
                          <Stack
                            spacing={1}
                            direction="row"
                            sx={{
                              alignItems: "center !important",
                            }}
                          >
                            <Avatar
                              src={
                                "http://" +
                                IP +
                                "/uploads/thumbnail-" +
                                option.image?.substring(
                                  option.image?.indexOf("/") + 1,
                                )
                              }
                            />
                            <div>
                              {(
                                option.name +
                                " " +
                                option.surname
                              ).toUpperCase()}
                            </div>
                          </Stack>
                        </li>
                      );
                    }}
                    isOptionEqualToValue={(option, value) =>
                      option._id === value._id
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Technicians"
                        name="technicians"
                        onBlur={formik.handleBlur}
                        error={
                          !!formik.touched.technicians &&
                          !!formik.errors.technicians
                        }
                        helperText={
                          formik.touched.technicians &&
                          formik.errors.technicians
                        }
                      />
                    )}
                    renderTags={(tagValue, tagProps) => {
                      return tagValue.map((option, index) => {
                        return (
                          <Chip
                            avatar={
                              <Avatar
                                src={
                                  "http://" +
                                  IP +
                                  "/uploads/thumbnail-" +
                                  option.image?.substring(
                                    option.image?.indexOf("/") + 1,
                                  )
                                }
                              />
                            }
                            size="small"
                            color="primary"
                            style={{
                              backgroundColor: getIssueColor(issue),
                              color: colors.primary[400],
                              fontWeight: "bold",
                            }}
                            {...tagProps({ index })}
                            label={(
                              option.name +
                              " " +
                              option.surname
                            ).toUpperCase()}
                          />
                        );
                      });
                    }}
                  />
                  <Autocomplete
                    multiple
                    freeSolo
                    disableClearable
                    disabled={
                      issue ? (issue.status === 0 ? true : false) : false
                    }
                    sx={{ gridColumn: "span 2" }}
                    value={formik.values.extraTechnicians || []}
                    onChange={(_, value) => {
                      formik.setFieldValue(
                        "extraTechnicians",
                        value.map((item) => {
                          if (typeof item === "string") {
                            return { title: item.toUpperCase() };
                          } else if (item && item.inputValue) {
                            return { title: item.inputValue.toUpperCase() };
                          }
                          return item;
                        }),
                      );
                    }}
                    options={[]}
                    getOptionLabel={(option) => {
                      if (typeof option === "string") {
                        return option.toUpperCase();
                      }
                      if (option?.inputValue) {
                        return option.inputValue.toUpperCase();
                      }
                      return option?.title.toUpperCase();
                    }}
                    renderOption={(props, option) => {
                      const { key, ...optionProps } = props;
                      return (
                        <li key={key} {...optionProps}>
                          {option?.title}
                        </li>
                      );
                    }}
                    selectOnFocus
                    clearOnBlur
                    handleHomeEndKeys
                    filterOptions={(options, params) => {
                      const filtered = filter(options, params);

                      const { inputValue } = params;
                      if (inputValue.length > 0) {
                        filtered.push({
                          inputValue,
                          title: `Add "${inputValue}"`,
                        });
                      }

                      return filtered;
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Extra Technicians"
                        name="extraTechnicians"
                        onBlur={formik.handleBlur}
                        error={
                          issue.status === 2 &&
                          !!formik.touched.extraTechnicians &&
                          !!formik.errors.extraTechnicians
                        }
                        helperText={
                          issue.status === 2 &&
                          formik.touched.extraTechnicians &&
                          formik.errors.extraTechnicians
                        }
                      />
                    )}
                  />

                  <Autocomplete
                    disableClearable
                    disabled={
                      issue ? (issue.status === 2 ? false : true) : false
                    }
                    sx={{ gridColumn: "span 2" }}
                    value={formik.values.superior || null}
                    onChange={async (_, value) => {
                      formik.setFieldValue("superior", value);
                      await loadProblems(value._id);
                      setDisabledProblem(false);
                      formik.setFieldValue("problem", null);
                      setRequiredOption(true);
                    }}
                    options={superiors}
                    isOptionEqualToValue={(option, value) =>
                      option._id === value._id
                    }
                    getOptionLabel={(option) => option.superior}
                    renderInput={(params) => (
                      <TextField {...params} label="Superior" name="superior" />
                    )}
                  />
                  <Autocomplete
                    disableClearable
                    disabled={disabledProblem}
                    sx={{ gridColumn: "span 2" }}
                    value={formik.values.problem || null}
                    onChange={(_, value) => {
                      formik.setFieldValue("problem", value);
                    }}
                    options={problems}
                    isOptionEqualToValue={(option, value) =>
                      option.problem._id === value.problem._id
                    }
                    getOptionLabel={(option) => option.problem?.problem}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Problem"
                        name="problem"
                        onBlur={formik.handleBlur}
                        error={
                          requiredOption &&
                          !!formik.touched.problem &&
                          !!formik.errors.problem
                        }
                        helperText={
                          requiredOption &&
                          formik.touched.problem &&
                          formik.errors.problem
                        }
                      />
                    )}
                  />
                  <LocalizationProvider dateAdapter={AdapterMoment}>
                    <DateTimePicker
                      timeSteps={{ hours: 1, minutes: 1 }}
                      slotProps={{
                        toolbar: {
                          sx: {
                            "& span.MuiDateTimePickerToolbar-separator": {
                              marginTop: "10px",
                            },
                          },
                        },
                        popper: {
                          sx: {
                            "& .Mui-selected": {
                              background:
                                colors.ciboInnerGreen[600] + " !important",
                            },
                            "& .Mui-selected:hover": {
                              background: colors.ciboInnerGreen[700],
                            },
                            "& .MuiButtonBase-root:hover": {
                              background: colors.ciboInnerGreen[700],
                            },
                            "& .MuiButtonBase-root": {
                              color: colors.grey[100],
                            },
                          },
                        },
                        dialog: {
                          sx: {
                            "& button.Mui-selected": {
                              color: colors.ciboInnerGreen[500] + " !important",
                            },
                            "& .Mui-selected:hover": {
                              color: colors.ciboInnerGreen[700],
                            },
                            "& .MuiButtonBase-root:hover": {
                              color: colors.ciboInnerGreen[500],
                            },
                            "& .MuiButtonBase-root": {
                              color: colors.grey[100],
                            },
                            "& .MuiTabs-indicator": {
                              background: colors.ciboInnerGreen[500],
                            },
                            "& button.MuiButtonBase-root.MuiPickersDay-root.Mui-selected":
                              {
                                background: colors.ciboInnerGreen[500],
                                color: colors.primary[400] + " !important",
                              },
                          },
                        },
                      }}
                      disabled={
                        issue?.start?.substring(0, 1) === "1" //refers to first character of the default date value 1 in 1970
                      }
                      label="Start Time"
                      format="LLL"
                      value={
                        issue?.start?.substring(0, 1) === "1"
                          ? null
                          : moment(formik.values.start)
                      }
                      onChange={(value) => {
                        formik.setFieldValue("start", value.format());
                      }}
                      formatDensity="spacious"
                      views={["year", "month", "day", "hours", "minutes"]}
                    />
                    <DateTimePicker
                      timeSteps={{ hours: 1, minutes: 1 }}
                      disabled={
                        issue?.stop?.substring(0, 1) === "1" //refers to first character of the default date value 1 in 1970
                      }
                      slotProps={{
                        toolbar: {
                          sx: {
                            "& span.MuiDateTimePickerToolbar-separator": {
                              marginTop: "10px",
                            },
                          },
                        },
                        popper: {
                          sx: {
                            "& .Mui-selected": {
                              background:
                                colors.ciboInnerGreen[600] + " !important",
                            },
                            "& .Mui-selected:hover": {
                              background: colors.ciboInnerGreen[700],
                            },
                            "& .MuiButtonBase-root:hover": {
                              background: colors.ciboInnerGreen[700],
                            },
                            "& .MuiButtonBase-root": {
                              color: colors.grey[100],
                            },
                          },
                        },
                        dialog: {
                          sx: {
                            "& button.Mui-selected": {
                              color: colors.ciboInnerGreen[500] + " !important",
                            },
                            "& .Mui-selected:hover": {
                              color: colors.ciboInnerGreen[700],
                            },
                            "& .MuiButtonBase-root:hover": {
                              color: colors.ciboInnerGreen[500],
                            },
                            "& .MuiButtonBase-root": {
                              color: colors.grey[100],
                            },
                            "& .MuiTabs-indicator": {
                              background: colors.ciboInnerGreen[500],
                            },
                            "& button.MuiButtonBase-root.MuiPickersDay-root.Mui-selected":
                              {
                                background: colors.ciboInnerGreen[500],
                                color: colors.primary[400] + " !important",
                              },
                          },
                        },
                      }}
                      label="Stop Time"
                      format="LLL"
                      value={
                        issue?.stop?.substring(0, 1) === "1"
                          ? null
                          : moment(formik.values.stop)
                      }
                      onChange={(value) => {
                        formik.setFieldValue("stop", value.format());
                      }}
                      formatDensity="spacious"
                      views={["year", "month", "day", "hours", "minutes"]}
                    />
                    <DateTimePicker
                      timeSteps={{ hours: 1, minutes: 1 }}
                      slotProps={{
                        toolbar: {
                          sx: {
                            "& span.MuiDateTimePickerToolbar-separator": {
                              marginTop: "10px",
                            },
                          },
                        },
                        popper: {
                          sx: {
                            "& .Mui-selected": {
                              background:
                                colors.ciboInnerGreen[600] + " !important",
                            },
                            "& .Mui-selected:hover": {
                              background: colors.ciboInnerGreen[700],
                            },
                            "& .MuiButtonBase-root:hover": {
                              background: colors.ciboInnerGreen[700],
                            },
                            "& .MuiButtonBase-root": {
                              color: colors.grey[100],
                            },
                          },
                        },
                        dialog: {
                          sx: {
                            "& button.Mui-selected": {
                              color: colors.ciboInnerGreen[500] + " !important",
                            },
                            "& .Mui-selected:hover": {
                              color: colors.ciboInnerGreen[700],
                            },
                            "& .MuiButtonBase-root:hover": {
                              color: colors.ciboInnerGreen[500],
                            },
                            "& .MuiButtonBase-root": {
                              color: colors.grey[100],
                            },
                            "& .MuiTabs-indicator": {
                              background: colors.ciboInnerGreen[500],
                            },
                            "& button.MuiButtonBase-root.MuiPickersDay-root.Mui-selected":
                              {
                                background: colors.ciboInnerGreen[500],
                                color: colors.primary[400] + " !important",
                              },
                          },
                        },
                      }}
                      disabled={!issue.paused || issue.paused === 0}
                      label="Pause Start Time"
                      format="LLL"
                      value={
                        issue.paused && issue.paused !== 0
                          ? moment(formik.values.pauseStart)
                          : null
                      }
                      onChange={(value) => {
                        formik.setFieldValue("pauseStart", value.format());
                      }}
                      formatDensity="spacious"
                      views={["year", "month", "day", "hours", "minutes"]}
                    />
                    <DateTimePicker
                      timeSteps={{ hours: 1, minutes: 1 }}
                      disabled={!issue.paused || issue.paused !== 2}
                      slotProps={{
                        toolbar: {
                          sx: {
                            "& span.MuiDateTimePickerToolbar-separator": {
                              marginTop: "10px",
                            },
                          },
                        },
                        popper: {
                          sx: {
                            "& .Mui-selected": {
                              background:
                                colors.ciboInnerGreen[600] + " !important",
                            },
                            "& .Mui-selected:hover": {
                              background: colors.ciboInnerGreen[700],
                            },
                            "& .MuiButtonBase-root:hover": {
                              background: colors.ciboInnerGreen[700],
                            },
                            "& .MuiButtonBase-root": {
                              color: colors.grey[100],
                            },
                          },
                        },
                        dialog: {
                          sx: {
                            "& button.Mui-selected": {
                              color: colors.ciboInnerGreen[500] + " !important",
                            },
                            "& .Mui-selected:hover": {
                              color: colors.ciboInnerGreen[700],
                            },
                            "& .MuiButtonBase-root:hover": {
                              color: colors.ciboInnerGreen[500],
                            },
                            "& .MuiButtonBase-root": {
                              color: colors.grey[100],
                            },
                            "& .MuiTabs-indicator": {
                              background: colors.ciboInnerGreen[500],
                            },
                            "& button.MuiButtonBase-root.MuiPickersDay-root.Mui-selected":
                              {
                                background: colors.ciboInnerGreen[500],
                                color: colors.primary[400] + " !important",
                              },
                          },
                        },
                      }}
                      label="Pause Stop Time"
                      format="LLL"
                      value={
                        issue.paused && issue.paused === 2
                          ? moment(formik.values.pauseStop)
                          : null
                      }
                      onChange={(value) => {
                        formik.setFieldValue("pauseStop", value.format());
                      }}
                      formatDensity="spacious"
                      views={["year", "month", "day", "hours", "minutes"]}
                    />
                  </LocalizationProvider>
                  <Autocomplete
                    disableClearable
                    disabled={
                      issue ? (issue.status === 2 ? false : true) : false
                    }
                    sx={{ gridColumn: "span 2" }}
                    value={formik.values.fixingMethod || null}
                    onChange={(_, value) => {
                      formik.setFieldValue("fixingMethod", value);
                    }}
                    options={fixingMethods}
                    isOptionEqualToValue={(option, value) =>
                      option._id === value._id
                    }
                    getOptionLabel={(option) => option.fixingMethod}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Fixing Method"
                        name="fixingMethod"
                        onBlur={formik.handleBlur}
                        error={
                          issue.status === 2 &&
                          !!formik.touched.fixingMethod &&
                          !!formik.errors.fixingMethod
                        }
                        helperText={
                          issue.status === 2 &&
                          formik.touched.fixingMethod &&
                          formik.errors.fixingMethod
                        }
                      />
                    )}
                  />
                  <TextField
                    disabled={
                      issue ? (issue.status === 2 ? false : true) : false
                    }
                    sx={{
                      "& .Mui-disabled": {
                        color: colors.ciboInnerGreen[400],
                        fontWeight: "bold",
                      },
                    }}
                    multiline
                    rows={7}
                    inputProps={{
                      maxLength: 392,
                    }}
                    margin="dense"
                    id="comment"
                    value={formik.values.comment || ""}
                    onChange={formik.handleChange}
                    label="Comment"
                    type="comment"
                    fullWidth
                  />
                </Stack>
              </DialogContent>
              <DialogActions>
                <Button
                  variant="contained"
                  color="error"
                  onClick={async () => {
                    setOpen(false);
                    formik.resetForm();
                    setDisabledProblem(true);
                    setRequiredOption(false);
                    await loadIssuesPage();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="contained" color="secondary">
                  Edit
                </Button>
              </DialogActions>
            </form>
          </Dialog>

          <Box
            m="20px 0"
            justifyContent="center"
            alignItems="center"
            display="flex"
          >
            <Pagination
              page={page.value}
              color="secondary"
              onChange={handlePageChange}
              count={Math.ceil(count / 18)}
            />
          </Box>
        </div>
      )}
    </Box>
  );
};

export default ViewIssuesPage;
