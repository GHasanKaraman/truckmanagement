import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, TextField, Autocomplete, useTheme } from "@mui/material";
import { Formik } from "formik";
import * as yup from "yup";
import { useSnackbar } from "notistack";
import useMediaQuery from "@mui/material/useMediaQuery";

import Header from "../Header";

import { tokens } from "../../theme";

import baseRequest from "../../core/baseRequest";

import useControl from "../../hooks/useControl.js";
import useSignOut from "../../hooks/useSignOut.js";

import { errorHandler } from "../../core/errorHandler";

import { TIME } from "../../utils/const";

const AddProblemPage = (props) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [auth] = useControl();
  const [controller] = useSignOut();

  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [superiors, setSuperiors] = useState([]);

  const isNonMobile = useMediaQuery("(min-width:600px)");

  const problemSchema = yup.object().shape({
    problem: yup.string().required("Please define a problem!"),
    superior: yup
      .mixed()
      .nullable()
      .test("ID_CHECK", "Please select the superior problem!", (value) => {
        if (value._id) return true;
        else return false;
      })
      .required("Please select the superior problem!"),
  });

  const initialValues = {
    problem: "",
    superior: null,
  };

  const loadProblemsPage = async () => {
    try {
      const res = await baseRequest.get("/problem", {});
      if (res.data) {
        const superiors = Object.values(res.data.records.superiors);
        setSuperiors(superiors);
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
    loadProblemsPage();
  }, []);

  useEffect(() => {
    //This is for reloading home page
    const interval = setInterval(() => {
      loadProblemsPage();
    }, TIME);

    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (values, { resetForm }) => {
    try {
      const res = await baseRequest.post("/problem", values);
      if (auth(res)) {
        enqueueSnackbar(res.data.result.problem + " is successfully created!", {
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
          enqueueSnackbar("Something went wrong while creating new problem!", {
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
      <Header title="ADD PROBLEM" subtitle="Create a New Problem" />
      <Formik
        initialValues={initialValues}
        validationSchema={problemSchema}
        onSubmit={handleSubmit}
      >
        {({
          setFieldValue,
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

              <Autocomplete
                onChange={(_, value) => {
                  setFieldValue("superior", value);
                }}
                value={values.superior}
                sx={{ gridColumn: "span 2" }}
                options={superiors}
                getOptionLabel={({ superior }) => superior}
                isOptionEqualToValue={(option, value) =>
                  option._id === value._id
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="filled"
                    label="Superior"
                    onBlur={handleBlur}
                    name="superior"
                    error={!!touched.superior && !!errors.superior}
                    helperText={touched.superior && errors.superior}
                  />
                )}
              />
              <Box sx={{ gridColumn: "span 1" }} />
              <Box sx={{ gridColumn: "span 1" }} />
              <TextField
                autoFocus
                variant="filled"
                type="text"
                label="Problem"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.problem}
                name="problem"
                error={!!touched.problem && !!errors.problem}
                helperText={touched.problem && errors.problem}
                sx={{ gridColumn: "span 2" }}
              />
            </Box>
            <Box display="flex" justifyContent="center" mt="20px">
              <Button type="submit" color="secondary" variant="contained">
                Create New Problem
              </Button>
            </Box>
          </form>
        )}
      </Formik>
    </Box>
  );
};

export default AddProblemPage;
