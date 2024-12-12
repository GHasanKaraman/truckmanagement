import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { Box, Divider, Stack, Backdrop, CircularProgress } from "@mui/material";
import { useSnackbar } from "notistack";
import { useTheme } from "@emotion/react";

import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import ThumbDownIcon from "@mui/icons-material/ThumbDown";

import { toStringDate } from "../../utils/helpers";
import Header from "../Header";
import { tokens } from "../../theme";
import baseRequest from "../../core/baseRequest";
import Label from "../Label";
import StatusIndicator from "../StatusIndicator";
import LabelResult from "../LabelResult";
import useControl from "../../hooks/useControl";
import useSignOut from "../../hooks/useSignOut";
import { errorHandler } from "../../core/errorHandler";
import ImageLabel from "../ImageLabel";

const ViewFormPage = (props) => {
  const params = useParams();
  const { id } = params;

  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [controller] = useSignOut();

  const [data, setData] = useState();
  const [open, setOpen] = useState(false);

  const loadViewFormPage = async () => {
    try {
      setOpen(true);
      const res = await baseRequest.get("/form/details", { params: { id } });
      console.log(res.data.records.form);
      if (res.data) {
        setData(res.data.records.form);
      } else {
        navigate("/login");
        localStorage.removeItem("token");
        localStorage.removeItem("username");
        enqueueSnackbar("Please sign in again!", {
          variant: "error",
        });
      }
      setOpen(false);
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
    loadViewFormPage();
  }, []);

  useEffect(() => {
    document.title = props.title || "";
  }, [props.title]);

  return (
    <Box
      m="0 20px"
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
    >
      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={open}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Header title={data?.truck} subtitle={"Truck Inspection Form"} />
        <Stack
          direction="row"
          spacing={1.5}
          alignItems="center"
          sx={{ pl: "20px" }}
        >
          <div className="swing">
            {data ? (
              data?.status === 1 ? (
                <ThumbUpIcon
                  sx={{
                    color: colors.ciboInnerGreen[500],
                    fontSize: "25px",
                  }}
                />
              ) : (
                <ThumbDownIcon
                  sx={{
                    color: colors.yoggieRed[500],
                  }}
                />
              )
            ) : undefined}
          </div>
          <Box
            sx={{
              fontWeight: "600",
              fontSize: "18px",
            }}
          >
            {data ? (data?.status === 1 ? "Passed" : "Failed") : undefined}
          </Box>
        </Stack>
      </Stack>
      <Divider />
      <Label
        title="Completed By"
        subtitle={
          data?.user.name +
          " " +
          data?.user.surname +
          " • " +
          toStringDate(data?.createdAt, {
            month: "short",
            year: "numeric",
            day: "numeric",
            hour: "numeric",
            minute: "numeric",
          })
        }
      />
      <Divider />
      <Stack direction="row" justifyContent="space-between">
        <Label
          title="Is the cabin inside clean?"
          subtitle={
            <LabelResult
              text={data?.isCabinClean}
              status={data?.isCabinClean === "Yes"}
            />
          }
        />
        <StatusIndicator status={data?.isCabinClean === "Yes"} />
      </Stack>
      <Divider />
      <Stack direction="row" justifyContent="space-between">
        <Label
          title="Is the back of the truck inside clean?"
          subtitle={
            <LabelResult
              text={data?.isBackClean}
              status={data?.isBackClean === "Yes"}
            />
          }
        />
        <StatusIndicator status={data?.isBackClean === "Yes"} />
      </Stack>
      <Divider />
      <Stack direction="row" justifyContent="space-between">
        <Label
          title="Is there any problem in the body side?"
          subtitle={
            <LabelResult
              text={data?.isThereProblem}
              status={data?.isThereProblem === "Yes"}
            />
          }
        />
        <StatusIndicator status={data?.isThereProblem === "Yes"} />
      </Stack>
      <Divider />
      <Stack direction="row" justifyContent="space-between">
        <Label
          title="Are the lights working properly?"
          subtitle={
            <LabelResult
              text={data?.areLightsWorking}
              status={data?.areLightsWorking === "Yes"}
            />
          }
        />
        <StatusIndicator status={data?.areLightsWorking === "Yes"} />
      </Stack>
      <Divider />
      <Stack direction="row" justifyContent="space-between">
        <Label
          title="Are there enough DEF for truck?"
          subtitle={
            <LabelResult
              text={data?.areThereDEF}
              status={data?.areThereDEF === "Yes"}
            />
          }
        />
        <StatusIndicator status={data?.areThereDEF === "Yes"} />
      </Stack>
      <Divider />
      <Stack direction="row" justifyContent="space-between">
        <ImageLabel
          title="
              Front Picture"
          folderIndex={data?.images[0]?.folderIndex}
          fileName={data?.images[0]?.fileName}
        />
        <StatusIndicator status={Boolean(data?.images[0])} />
      </Stack>
      <Divider />
      <Stack direction="row" justifyContent="space-between">
        <ImageLabel
          title="
              Back Picture"
          folderIndex={data?.images[1]?.folderIndex}
          fileName={data?.images[1]?.fileName}
        />
        <StatusIndicator status={Boolean(data?.images[1])} />
      </Stack>
      <Divider />
      <Stack direction="row" justifyContent="space-between">
        <Label
          title="Comment"
          subtitle={data?.comment === "" ? "No Comment" : data?.comment}
        />
      </Stack>
    </Box>
  );
};

export default ViewFormPage;
