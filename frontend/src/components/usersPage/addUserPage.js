import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  TextField,
  MenuItem,
  useTheme,
  Autocomplete,
  Chip,
} from "@mui/material";
import { Formik } from "formik";
import * as yup from "yup";
import { useSnackbar } from "notistack";
import useMediaQuery from "@mui/material/useMediaQuery";

import Header from "../Header";

import { tokens } from "../../theme";

import baseRequest from "../../core/baseRequest";

import { TIME } from "../../utils/const";
import PhoneInput from "../phoneInput";
import { errorHandler } from "../../core/errorHandler";
import useSignOut from "../../hooks/useSignOut";
import { useRecoilValue } from "recoil";
import { userInfoParams } from "../../atoms/userAtoms";
import { verifyPermissions } from "../../utils/helpers";

const AddUserPage = (props) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [controller] = useSignOut();

  const user = useRecoilValue(userInfoParams);

  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const isNonMobile = useMediaQuery("(min-width:600px)");

  const userSchema = yup.object().shape({
    name: yup.string().required("Please enter the name!"),
    surname: yup.string().required("Please enter the surname!"),
    username: yup.string().required("Please enter a username!"),
    phone: yup
      .string()
      .required("Please enter the phone number!")
      .test(
        "PHONE_TEST",
        "Please enter the phone number!",
        (value) => value.length == 12,
      ),
    position: yup
      .string()
      .required("Please select which position this user is in!"),
  });
  const initialValues = {
    name: "",
    surname: "",
    username: "",
    phone: "",
    position: "",
    permissions: [],
  };

  const loadAddUserPage = async () => {
    try {
      await baseRequest.get("/user", {});
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
    loadAddUserPage();
  }, []);

  useEffect(() => {
    //This is for reloading home page
    const interval = setInterval(() => {
      loadAddUserPage();
    }, TIME);

    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (values, { resetForm }) => {
    try {
      values.permissions = values.permissions
        .map((permission) => permission.toLowerCase().charAt(0))
        .join("");

      if (values.permissions !== "" && !values.permissions.includes("r")) {
        values.permissions = "r" + values.permissions;
      }

      if (verifyPermissions(values.permissions, "iud")) {
        values.permissions = "rw";
      }

      const res = await baseRequest.post("/user", values);
      if (res.data) {
        enqueueSnackbar(res.data.result.name + " is successfully created!", {
          variant: "success",
        });
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
          enqueueSnackbar("Something went wrong while creating new user!", {
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

  return (
    <Box m="0 20px ">
      <Header title="ADD USER" subtitle="Create a New User" />
      <Formik
        initialValues={initialValues}
        validationSchema={userSchema}
        onSubmit={handleSubmit}
      >
        {({
          values,
          errors,
          touched,
          handleBlur,
          handleChange,
          handleSubmit,
          setFieldValue,
        }) => (
          <form onSubmit={handleSubmit}>
            <Box
              display="grid"
              gap="30px"
              gridTemplateColumns="repeat(4, minmax(0, 1fr))"
              sx={{
                "& > div": { gridColumn: isNonMobile ? undefined : "span 4" },
                "& .MuiInputBase-root::after": {
                  borderBottomColor: colors.crusta[500],
                },
                "& .MuiInputBase-root::before": {
                  borderBottomColor: colors.crusta[600],
                },
                "& .MuiFormLabel-root.Mui-focused": {
                  color: colors.crusta[300],
                },
              }}
            >
              <TextField
                variant="filled"
                type="text"
                label="Name"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.name}
                name="name"
                error={!!touched.name && !!errors.name}
                helperText={touched.name && errors.name}
                sx={{ gridColumn: "span 2" }}
              />
              <TextField
                variant="filled"
                type="text"
                label="Surname"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.surname}
                name="surname"
                error={!!touched.surname && !!errors.surname}
                helperText={touched.surname && errors.surname}
                sx={{ gridColumn: "span 2" }}
              />
              <TextField
                variant="filled"
                type="text"
                label="Username"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.username}
                name="username"
                error={!!touched.username && !!errors.username}
                helperText={touched.username && errors.username}
                sx={{ gridColumn: "span 2" }}
              />
              <PhoneInput
                variant="filled"
                type="text"
                label="Phone Number"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.phone}
                name="phone"
                error={!!touched.phone && !!errors.phone}
                helperText={touched.phone && errors.phone}
                sx={{ gridColumn: "span 2" }}
              />
              <TextField
                variant="filled"
                select
                label="Position"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.position}
                name="position"
                error={!!touched.position && !!errors.position}
                helperText={touched.position && errors.position}
                sx={{ gridColumn: "span 2" }}
              >
                <MenuItem key={"driver"} value={"Driver"}>
                  DRIVER
                </MenuItem>
              </TextField>
              <Autocomplete
                multiple={true}
                disableCloseOnSelect
                onChange={(_, value) => {
                  setFieldValue("permissions", value);
                }}
                value={values.permissions}
                sx={{ gridColumn: "span 2" }}
                options={
                  verifyPermissions(user?.permissions, "aw")
                    ? ["READ", "INSERT", "UPDATE", "DELETE"]
                    : ["READ", "INSERT"]
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="filled"
                    label="Permissions"
                    onBlur={handleBlur}
                    name="permissions"
                    error={!!touched.permissions && !!errors.permissions}
                    helperText={touched.permissions && errors.permissions}
                  />
                )}
                renderTags={(tagValue, tagProps) => {
                  return tagValue.map((option, index) => {
                    return (
                      <Chip
                        key={index}
                        size="small"
                        variant="filled"
                        color="primary"
                        style={{
                          backgroundColor: colors.crusta[600],
                          color: colors.crusta[50],
                          fontWeight: "bold",
                        }}
                        {...tagProps({ index })}
                        label={option}
                      />
                    );
                  });
                }}
              />
            </Box>
            <Box display="flex" justifyContent="center" mt="20px">
              <Button type="submit" color="secondary" variant="contained">
                Create New User
              </Button>
            </Box>
          </form>
        )}
      </Formik>
    </Box>
  );
};

export default AddUserPage;
