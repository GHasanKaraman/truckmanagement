import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, TextField, MenuItem, useTheme } from "@mui/material";
import { Formik } from "formik";
import * as yup from "yup";
import { useSnackbar } from "notistack";
import useMediaQuery from "@mui/material/useMediaQuery";

import Header from "../Header";

import { tokens } from "../../theme";

import baseRequest from "../../core/baseRequest";

import { TIME } from "../../utils/const";
import useControl from "../../hooks/useControl";
import { errorHandler } from "../../core/errorHandler";
import useSignOut from "../../hooks/useSignOut";

const AddFixingMethodPage = (props) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [auth] = useControl();
  const [controller] = useSignOut();

  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const isNonMobile = useMediaQuery("(min-width:600px)");

  const fixingMethodSchema = yup.object().shape({
    fixingMethod: yup.string().required("Please enter a fixing method name!"),
    issueType: yup.string().required("Please select the issue type!"),
  });
  const initialValues = {
    fixingMethod: "",
    issueType: "",
  };

  const loadFixingMethodsPage = async () => {
    try {
      await baseRequest.get("/fixingmethod", {});
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
    loadFixingMethodsPage();
  }, []);

  useEffect(() => {
    //This is for reloading home page
    const interval = setInterval(() => {
      loadFixingMethodsPage();
    }, TIME);

    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (values, { resetForm }) => {
    try {
      const res = await baseRequest.post("/fixingmethod", values);
      if (auth(res)) {
        enqueueSnackbar(
          res.data.result.fixingMethod + " is successfully created!",
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
            "Something went wrong while creating new fixing method!",
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
      <Header title="ADD FIXING METHOD" subtitle="Create a New Fixing Method" />
      <Formik
        initialValues={initialValues}
        validationSchema={fixingMethodSchema}
        onSubmit={handleSubmit}
      >
        {({
          values,
          errors,
          touched,
          handleBlur,
          handleChange,
          handleSubmit,
        }) => (
          <form onSubmit={handleSubmit}>
            <Box
              display="grid"
              gap="30px"
              gridTemplateColumns="repeat(4, minmax(0, 1fr))"
              sx={{
                "& > div": { gridColumn: isNonMobile ? undefined : "span 4" },
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
              <Box sx={{ gridColumn: "span 1" }} />
              <TextField
                autoFocus
                variant="filled"
                type="text"
                label="Fixing Method"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.fixingMethod}
                name="fixingMethod"
                error={!!touched.fixingMethod && !!errors.fixingMethod}
                helperText={touched.fixingMethod && errors.fixingMethod}
                sx={{ gridColumn: "span 2" }}
              />
              <Box sx={{ gridColumn: "span 1" }} />
              <Box sx={{ gridColumn: "span 1" }} />
              <TextField
                variant="filled"
                select
                label="Issue Type"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.issueType}
                name="issueType"
                error={!!touched.issueType && !!errors.issueType}
                helperText={touched.issueType && errors.issueType}
                sx={{ gridColumn: "span 2" }}
              >
                <MenuItem key={"M"} value={"M"}>
                  M
                </MenuItem>
                <MenuItem key={"PM"} value={"PM"}>
                  PM
                </MenuItem>
                <MenuItem key={"P"} value={"P"}>
                  P
                </MenuItem>
                <MenuItem key={"T"} value={"T"}>
                  T
                </MenuItem>
              </TextField>
            </Box>
            <Box display="flex" justifyContent="center" mt="20px">
              <Button type="submit" color="secondary" variant="contained">
                Create New Fixing Method
              </Button>
            </Box>
          </form>
        )}
      </Formik>
    </Box>
  );
};

export default AddFixingMethodPage;
