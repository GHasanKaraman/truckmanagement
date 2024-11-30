import { useEffect } from "react";
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

const MyProfilePage = (props) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const isNonMobile = useMediaQuery("(min-width:600px)");

  const [auth] = useControl();
  const [controller] = useSignOut();

  const [user, setUser] = useRecoilState(userInformations);

  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const loadMyProfilePage = async () => {
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
    loadMyProfilePage();
  }, []);

  useEffect(() => {
    //This is for reloading home page
    const interval = setInterval(() => {
      loadMyProfilePage();
    }, TIME);

    return () => clearInterval(interval);
  }, []);

  const handleUpdateProfilePicture = async (file) => {
    try {
      if (file) {
        const formData = new FormData();
        formData.append("file", file, "image.jpeg");
        const res = await baseRequest.put("/user/profile/upload", formData);
        if (auth(res)) {
          await loadMyProfilePage();
          enqueueSnackbar(
            "Your profile picture has been successfully updated!",
            {
              variant: "success",
            },
          );
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
          enqueueSnackbar(
            "Something went wrong while updating the profile picture!",
            {
              variant: "error",
            },
          );
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

  const handleChange = () => {
    enqueueSnackbar({
      message: "Please contact the system admin for this!",
      variant: "error",
      preventDuplicate: true,
    });
  };

  return (
    <Box m="0 20px ">
      <Header title="MY PROFILE" subtitle="User Dashboard" />

      <Box m="40px 0 0 0" height="75vh" sx={{ textAlign: "-webkit-center" }}>
        <Stack direction="column" spacing={4}>
          <Stack
            direction="row"
            sx={{ width: "100%", px: [0, 20] }}
            spacing={4}
          >
            <Card sx={{ width: "100%", p: 1, pt: 2, px: 3 }}>
              <UploadImage
                button3={{ text: "UPLOAD", color: "success" }}
                onChange={handleUpdateProfilePicture}
                stencil="circle"
                src={
                  user.image === ""
                    ? defaultUserImage
                    : "http://" + IP + "/" + user.image
                }
              />
              <Divider sx={{ py: 1 }} />
              <Typography
                variant="h4"
                fontWeight="bold"
                sx={{ textAlign: "left", py: 1, pb: 2 }}
              >
                My Profile
              </Typography>

              <form>
                <Box
                  display="grid"
                  gap="30px"
                  gridTemplateColumns="repeat(4, minmax(0, 1fr))"
                  sx={{
                    "& > div": {
                      gridColumn: isNonMobile ? undefined : "span 4",
                    },
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
                  <TextField
                    variant="standard"
                    type="text"
                    label="Name"
                    value={user?.name}
                    name="name"
                    onChange={handleChange}
                    sx={{
                      gridColumn: "span 2",
                    }}
                  />
                  <TextField
                    variant="standard"
                    type="text"
                    label="Surname"
                    value={user?.surname}
                    name="surname"
                    onChange={handleChange}
                    sx={{
                      gridColumn: "span 2",
                    }}
                  />
                  <TextField
                    variant="standard"
                    type="text"
                    label="Username"
                    value={user?.username}
                    name="username"
                    onChange={handleChange}
                    sx={{
                      gridColumn: "span 2",
                    }}
                  />
                  <TextField
                    variant="standard"
                    type="text"
                    label="Zone"
                    value={user?.zone?.toUpperCase()}
                    name="zone"
                    onChange={handleChange}
                    sx={{
                      gridColumn: "span 2",
                    }}
                  />
                  <TextField
                    variant="standard"
                    type="text"
                    label="Position"
                    value={user?.position}
                    name="position"
                    onChange={handleChange}
                    sx={{
                      gridColumn: "span 4",
                    }}
                  />
                </Box>
              </form>
            </Card>
            <Stack direction="column" sx={{ width: "100%" }} spacing={4}>
              <Card sx={{ width: "100%", heigh: "50%", p: 1, px: 3 }}>
                <Typography
                  variant="h4"
                  fontWeight="bold"
                  sx={{ textAlign: "left", pt: 1 }}
                >
                  Your Notifications
                </Typography>

                <Typography sx={{ py: 10 }} variant="h5">
                  Coming soon...
                </Typography>
              </Card>
              <Card sx={{ width: "100%", height: "50%", p: 1, px: 3 }}>
                <Typography
                  variant="h4"
                  fontWeight="bold"
                  sx={{ textAlign: "left", pt: 1 }}
                >
                  Your Issues
                </Typography>

                <Typography sx={{ py: 10 }} variant="h5">
                  Coming soon...
                </Typography>
              </Card>
            </Stack>
          </Stack>
          <Stack sx={{ width: "100%", px: [0, 20] }}>
            <Card sx={{ width: "100%", p: 1, px: 3 }}>
              <Typography
                variant="h4"
                fontWeight="bold"
                sx={{ textAlign: "left", pt: 1 }}
              >
                Your Performance
              </Typography>

              <Typography sx={{ py: 10 }} variant="h5">
                Coming soon...
              </Typography>
            </Card>
          </Stack>
        </Stack>
      </Box>
    </Box>
  );
};

export default MyProfilePage;
