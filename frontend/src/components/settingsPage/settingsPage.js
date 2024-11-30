import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  Divider,
  Stack,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { useSnackbar } from "notistack";
import useMediaQuery from "@mui/material/useMediaQuery";

import Header from "../Header";

import { tokens } from "../../theme";

import baseRequest from "../../core/baseRequest";

import { TIME } from "../../utils/const";
import useControl from "../../hooks/useControl";
import useSignOut from "../../hooks/useSignOut";
import { errorHandler } from "../../core/errorHandler";
import { useRecoilState } from "recoil";
import { userInformations } from "../../atoms/userAtoms";
import UploadImage from "../UploadImage";

import defaultUserImage from "../../images/defaultUser.jpg";
import { IP } from "../../env";

const SettingsPage = (props) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const isNonMobile = useMediaQuery("(min-width:600px)");

  const [auth] = useControl();
  const [controller] = useSignOut();

  const [user, setUser] = useRecoilState(userInformations);

  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const loadSettingsPage = async () => {
    try {
      const res = await baseRequest.get("/user/profile", {});
      if (res.data) {
        const user = res.data.records;
        setUser(user);
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

  useEffect(() => {
    document.title = props.title || "";
  }, [props.title]);

  useEffect(() => {
    loadSettingsPage();
  }, []);

  useEffect(() => {
    //This is for reloading home page
    const interval = setInterval(() => {
      loadSettingsPage();
    }, TIME);

    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (values, { resetForm }) => {
    try {
      const res = await baseRequest.post("/machinetype", values);
      if (auth(res)) {
        enqueueSnackbar(
          res.data.result.machineType + " is successfully created!",
          {
            variant: "success",
          },
        );
        resetForm();
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
          enqueueSnackbar(
            "Something went wrong while creating new machine type!",
            {
              variant: "error",
            },
          );
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

  return (
    <Box m="0 20px ">
      <Header title="Settings" subtitle="Change Local Settings" />
      <Box m="40px 0 0 0" height="75vh">
        <Typography variant="h4" fontWeight="bold">
          Coming soon...
        </Typography>
      </Box>
    </Box>
  );
};

export default SettingsPage;
