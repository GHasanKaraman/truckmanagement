import { useEffect, useState } from "react";
import {
  Box,
  CardHeader,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  Zoom,
  useTheme,
  Card,
  Stack,
  CardContent,
  Typography,
  Dialog,
  DialogActions,
  Button,
  useMediaQuery,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Avatar,
} from "@mui/material";

import { tokens } from "../../theme";

import { useSnackbar } from "notistack";
import { AccessTime, ErrorOutline, Warning } from "@mui/icons-material";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import LiveTvIcon from "@mui/icons-material/LiveTv";

import { getPartID, minuteDifference, toStringDate } from "../../utils/helpers";
import moment from "moment-timezone";
import "../issuesPage/issues.css";
import CountUp from "../../utils/countUp";

import Image from "../Image";
import { errorHandler } from "../../core/errorHandler";
import baseRequest from "../../core/baseRequest";
import useControl from "../../hooks/useControl";
import useSignOut from "../../hooks/useSignOut";
import { useNavigate } from "react-router-dom";
import { IP } from "../../env";

import noIssueImage from "../../images/noIssue.gif";

const IssueMonitoringPage = (props) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));

  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [auth] = useControl();
  const [controller] = useSignOut();

  const [issues, setIssues] = useState();
  const [giveLogs, setGiveLogs] = useState([]);

  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [openCamera, setOpenCamera] = useState(false);
  const [detailsInfo, setDetailsInfo] = useState();
  const [cameraIP, setIP] = useState("");
  const loadIssues = async () => {
    try {
      const res = await baseRequest.get("/monitoring/issue", {});
      if (auth(res)) {
        setIssues(res.data.records.issues);
        setGiveLogs(res.data.records.giveLogs);
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

  useEffect(() => {
    document.title = props.title || "";
  }, [props.title]);

  useEffect(() => {
    loadIssues();
  }, []);

  useEffect(() => {
    //This is for reloading monitoring page
    const interval = setInterval(() => {
      loadIssues();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

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

  const customizeRenderEmpty = () => (
    <div
      style={{
        textAlign: "center",
        fontSize: "40px",
        fontWeight: "bold",
        color: colors.yoggieRed[500],
      }}
    >
      <img src={noIssueImage} alt="noIssue" width="50%" />
      <div>Machines working without any issue!</div>
    </div>
  );
  return (
    <Box m="20px 30px">
      <Dialog
        fullScreen={fullScreen}
        open={openDetailsDialog}
        onClose={() => {
          setOpenCamera(false);
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
            {detailsInfo?.parts}
          </DialogContentText>
          <DialogContentText id="alert-dialog-vendor">
            {detailsInfo?.from_where}
          </DialogContentText>
          <DialogContentText id="alert-dialog-location">
            {detailsInfo?.new_location}
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

      <Dialog
        fullScreen={fullScreen}
        open={openCamera}
        onClose={() => {
          setOpenDetailsDialog(false);
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
      {issues?.length === 0 ? (
        customizeRenderEmpty()
      ) : (
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
                        minWidth: 350,
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
                            <CircularProgress
                              size={20}
                              sx={{ color: colors.primary[400] }}
                            />
                          ) : (
                            <TaskAltIcon />
                          )
                        }
                        action={
                          <Box mr="10px" className="blink">
                            {item.issueType === 2 ? (
                              <Warning />
                            ) : item.issueType === 1 ? (
                              <AccessTime />
                            ) : null}
                          </Box>
                        }
                        title={
                          <Stack
                            spacing={2}
                            direction="row"
                            sx={{ alignItems: "center" }}
                          >
                            <Typography variant="h4" fontWeight="bold">
                              {item.target.target}
                            </Typography>
                            <IconButton
                              onClick={() => {
                                setOpenCamera(true);
                                setIP(item.target.IP);
                              }}
                            >
                              <LiveTvIcon
                                size={50}
                                sx={{ color: colors.primary[400] }}
                              />
                            </IconButton>
                          </Stack>
                        }
                        subheader={
                          <Stack
                            direction="row"
                            spacing={3}
                            sx={{ color: colors.primary[400] }}
                          >
                            <Typography variant="h7">
                              {toStringDate(
                                item.status === 0 ? item.createdAt : item.start,
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
                        <Typography
                          variant="h6"
                          sx={{
                            color: colors.primary[400],
                            textAlign: "center",
                          }}
                        >
                          <Stack
                            spacing={2}
                            direction="row"
                            justifyContent="center"
                          >
                            {item.users.length > 0 ? (
                              <div>
                                <Typography
                                  variant="h6"
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
                                      key={user._id}
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
                            ) : null}
                            {giveLogs.filter((log) => log.issueID === item._id)
                              .length > 0 ? (
                              <div>
                                <Typography
                                  variant="h6"
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
                                  {giveLogs
                                    .filter((log) => log.issueID === item._id)
                                    .map((log) => (
                                      <Chip
                                        clickable
                                        onClick={() => {
                                          setOpenDetailsDialog(true);
                                          setDetailsInfo(log?.item);
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
                                            log.item.partName,
                                            log.item._id,
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
                                                : item.status === 0
                                                  ? colors.yoggieRed[400]
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
                          {item.users.length === 0 &&
                          giveLogs.filter((log) => log.issueID === item._id)
                            .length === 0
                            ? item.status === 0
                              ? "An issue occured on this machine!"
                              : "Technicians started working on this machine!"
                            : null}
                        </Typography>
                      </CardContent>
                    </Card>
                  </div>
                </Zoom>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Box>
  );
};

export default IssueMonitoringPage;
