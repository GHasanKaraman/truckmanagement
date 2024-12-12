import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  CardHeader,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Grid,
  Pagination,
  Stack,
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
  Collapse,
} from "@mui/material";

import {
  Delete,
  ErrorOutline,
  Warning,
  WarningAmber,
  ExpandMore,
  Article,
} from "@mui/icons-material";
import TaskAltIcon from "@mui/icons-material/TaskAlt";

import { userInfoParams } from "../../atoms/userAtoms";

import { useSnackbar } from "notistack";

import Header from "../Header";

import { tokens } from "../../theme";

import baseRequest from "../../core/baseRequest";

import { toStringDate, verifyPermissions } from "../../utils/helpers";

import loadingWhite from "../../images/loadingWhite.gif";
import loadingBlack from "../../images/loadingBlack.gif";
import FilterTools from "./filterTools";

import { useRecoilValue } from "recoil";
import {
  issueFilterParams,
  issueSearchQueryParams,
} from "../../atoms/issueAtoms";
import useControl from "../../hooks/useControl";
import useSignOut from "../../hooks/useSignOut";
import { errorHandler } from "../../core/errorHandler";
import { IP } from "../../env";

import noIssueImage from "../../images/noIssue.gif";

const DashboardPage = (props) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [auth] = useControl();
  const [controller] = useSignOut();

  const user = useRecoilValue(userInfoParams);

  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));
  const [expanded, setExpanded] = useState({ 0: false });

  const [trucks, setTrucks] = useState([]);

  const [form, setForm] = useState([]);

  const [forms, setForms] = useState([]);

  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState({ value: 1 });
  const [count, setCount] = useState(1);

  const [openDialog, setOpenDialog] = useState(false);

  const filterParams = useRecoilValue(issueFilterParams);
  const searchQuery = useRecoilValue(issueSearchQueryParams);

  const [clickedFormType, setClickedFormType] = useState(false);
  const [clickedDelete, setClickedDelete] = useState(false);

  const changeFormType = (id, formType) => {
    try {
      if (!clickedFormType) {
        setClickedFormType(true);
        baseRequest
          .put("/form/changeType", {
            id,
            formType,
          })
          .then((res) => {
            if (auth(res)) {
              loadDashboardPage().then((_) => {
                setClickedFormType(false);
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
          enqueueSnackbar("Something went wrong while changing the status!", {
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

  const getQueryString = (page, filterParams) => {
    const { selectedCase, selectedRange, selectedTruck, searchText } =
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
    if (selectedTruck) {
      queryString += "&truck=" + selectedTruck;
    }
    if (searchText !== "") {
      queryString += "&search=" + searchText;
    }

    return queryString;
  };

  const handlePageChange = (_, value) => {
    setPage({ value });
    setLoading(true);
    setForms([]);
  };
  useEffect(() => {
    navigate("?page=" + page.value + searchQuery);
    loadDashboardPage().then((_) => {
      setLoading(false);
    });
  }, [page]);

  const applyFilters = async () => {
    navigate("?page=" + page.value + searchQuery);
    loadDashboardPage().then((_) => {
      setLoading(false);
      setPage({ value: 1 });
    });
  };

  useEffect(() => {
    setLoading(true);
    setForms([]);
    applyFilters();
  }, [filterParams]);

  const loadDashboardPage = async () => {
    try {
      const res = await baseRequest.get(
        "/form" + getQueryString(page.value, filterParams),
        { params: { filterParams } },
      );
      if (res.data) {
        setTrucks(Object.values(res.data.records.trucks));
        setForms(Object.values(res.data.records.forms));
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
          enqueueSnackbar("Something went wrong retrieving the forms!", {
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
    loadDashboardPage();
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

  const getFormColor = (item) => {
    if (item.formType === 1) {
      return colors.contrast[100];
    }
    if (item.status === 0) {
      return colors.crusta[500];
    } else if (item.status === 1) {
      return colors.ciboInnerGreen[500];
    }
  };

  const dialogDeleteApproved = async () => {
    try {
      if (!clickedDelete) {
        setClickedDelete(true);
        const res = await baseRequest.delete("/form", {
          id: form._id,
        });
        if (auth(res)) {
          setOpenDialog(false);
          loadDashboardPage().then(() => {
            setClickedDelete(false);
          });
          enqueueSnackbar("Form has been successfully deleted!", {
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

  return (
    <Box m="0 20px">
      <Header title="DASHBOARD" subtitle="Managing Forms" />
      <FilterTools trucks={trucks} />
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
            Do you really want to delete this form?
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
          style={{
            textAlign: "center",
            fontSize: "40px",
            fontWeight: "bold",
            color: colors.yoggieRed[500],
            marginTop: -30,
          }}
        >
          <img src={noIssueImage} alt="noIssue" width="50%" />
          <div style={{ width: "60%", justifySelf: "center" }}>
            Who needs data when you've got great music and a perfect brew?
          </div>
        </div>
      ) : (
        <div>
          <Grid container spacing={3} justifyContent="center">
            {forms?.map((item, index) => {
              return (
                <Grid key={index} item sm={12} md={6} lg={4}>
                  <Zoom
                    in={Boolean(forms)}
                    style={{
                      transitionDelay: (index / 3 + (index % 3)) * 75,
                    }}
                  >
                    <div>
                      <Card
                        sx={{
                          minWidth: 270,
                          minHeight: 183,
                          background: getFormColor(item),
                          transition: "0.2s",
                          "&:hover": {
                            transform: "scale(1.05) !important",
                            boxShadow: `0px 7px 40px ${getFormColor(item)}}`,
                          },
                        }}
                      >
                        <CardHeader
                          avatar={
                            item.status === 0 ? (
                              <ErrorOutline />
                            ) : (
                              <TaskAltIcon />
                            )
                          }
                          title={
                            <Typography variant="h4" fontWeight="bold">
                              {item.truck}
                            </Typography>
                          }
                          subheader={
                            <Stack
                              direction="row"
                              spacing={3}
                              sx={{ color: colors.primary[400] }}
                            >
                              <Typography variant="h7">
                                {toStringDate(item.createdAt, {
                                  month: "short",
                                  year: "numeric",
                                  day: "numeric",
                                  hour: "numeric",
                                  minute: "numeric",
                                })}
                              </Typography>
                            </Stack>
                          }
                          sx={{ color: colors.primary[400] }}
                        />
                        <CardContent>
                          <Typography
                            variant="h5"
                            sx={{ color: colors.primary[400] }}
                          >
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
                                  DRIVER
                                </Typography>
                                <Stack direction="column" spacing={1}>
                                  <Divider variant="middle" />
                                  <Chip
                                    avatar={
                                      <Avatar
                                        src={
                                          "http://" +
                                          IP +
                                          "/uploads/thumbnail-" +
                                          item.user.image?.substring(
                                            item.user.image?.indexOf("/") + 1,
                                          )
                                        }
                                      />
                                    }
                                    variant="filled"
                                    size="small"
                                    label={(
                                      item.user.name +
                                      " " +
                                      item.user.surname
                                    ).toUpperCase()}
                                    key={user.name}
                                    style={{
                                      fontSize: "12px",
                                      fontWeight: "600",
                                      color: colors.primary[400],
                                      backgroundColor:
                                        item.formType === 1
                                          ? colors.contrast[200]
                                          : item.status === 1
                                            ? colors.ciboInnerGreen[400]
                                            : colors.crusta[200],
                                      borderRadius: "4px",
                                      borderWidth: "0px",
                                    }}
                                  />
                                </Stack>
                              </div>
                            </Stack>
                          </Typography>
                        </CardContent>
                        {verifyPermissions(user.permissions, "awud") ? (
                          <CardActions disableSpacing>
                            <Tooltip title="Warning">
                              <IconButton
                                onClick={() => {
                                  changeFormType(item._id, 1);
                                }}
                              >
                                {item.formType === 1 ? (
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

                            <Tooltip title="Delete">
                              <IconButton
                                sx={{
                                  color: colors.primary[400],
                                }}
                                variant="outlined"
                                onClick={() => {
                                  setForm(item);
                                  setOpenDialog(true);
                                }}
                              >
                                <Delete />
                              </IconButton>
                            </Tooltip>

                            <Tooltip title="Details">
                              <IconButton
                                sx={{
                                  color: colors.primary[400],
                                }}
                                variant="outlined"
                                onClick={() => {
                                  navigate("/form/" + item._id);
                                }}
                              >
                                <Article />
                              </IconButton>
                            </Tooltip>

                            <IconButton
                              sx={{
                                display: "inline-flex",
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
                              <ExpandMore sx={{ color: colors.grey[900] }} />
                            </IconButton>
                          </CardActions>
                        ) : (
                          <CardActions>
                            <IconButton
                              sx={{
                                display: "inline-flex",
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
                              <ExpandMore sx={{ color: colors.grey[900] }} />
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
                              <Stack direction="row" spacing={2} px={1}>
                                {item.images.map((image) => {
                                  return (
                                    <a
                                      key={image._id}
                                      href={
                                        "http://" +
                                        IP +
                                        "/imgs/" +
                                        image.folderIndex +
                                        "/" +
                                        image.fileName
                                      }
                                      target="_blank"
                                      rel="noreferrer"
                                    >
                                      <img
                                        width={150}
                                        height={150}
                                        style={{ objectFit: "scale-down" }}
                                        alt="truck"
                                        src={
                                          "http://" +
                                          IP +
                                          "/imgs/" +
                                          image.folderIndex +
                                          "/thumbnail-" +
                                          image.fileName?.substr(
                                            0,
                                            image.fileName?.lastIndexOf("."),
                                          ) +
                                          ".jpeg"
                                        }
                                      />
                                    </a>
                                  );
                                })}
                              </Stack>
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

export default DashboardPage;
