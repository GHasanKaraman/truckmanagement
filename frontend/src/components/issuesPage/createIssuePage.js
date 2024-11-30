import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Autocomplete, Box, Button, TextField, useTheme } from "@mui/material";
import { Formik } from "formik";
import * as yup from "yup";
import { useSnackbar } from "notistack";
import useMediaQuery from "@mui/material/useMediaQuery";

import Header from "../Header";

import { tokens } from "../../theme";

import baseRequest from "../../core/baseRequest";
import { errorHandler } from "../../core/errorHandler";

import { TIME } from "../../utils/const";

import useControl from "../../hooks/useControl";
import useSignOut from "../../hooks/useSignOut";

const CreateIssuePage = (props) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [auth] = useControl();
  const [controller] = useSignOut();

  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const isNonMobile = useMediaQuery("(min-width:600px)");
  const [targets, setTargets] = useState([]);

  const [clicked, setClicked] = useState(false);

  const issueSchema = yup.object().shape({
    target: yup
      .mixed()
      .nullable()
      .test(
        "ID_CHECK",
        "Please select a target the issue occured!",
        (value) => {
          if (value._id) return true;
          else return false;
        },
      )
      .required("Please select a target the issue occured!"),
  });
  const initialValues = {
    target: null,
  };

  const loadIssuesPage = async () => {
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

  useEffect(() => {
    document.title = props.title || "";
  }, [props.title]);

  useEffect(() => {
    loadIssuesPage();
  }, []);

  useEffect(() => {
    //This is for reloading home page
    const interval = setInterval(() => {
      loadIssuesPage();
    }, TIME);

    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (values, { resetForm }) => {
    try {
      if (!clicked) {
        setClicked(true);
        baseRequest.post("/issue", values).then((res) => {
          if (auth(res)) {
            enqueueSnackbar(
              "Issue has been created on " + values.target.target + ".",
              {
                variant: "success",
              },
            );
            setClicked(false);
            resetForm();
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
          enqueueSnackbar("Something went wrong while creating the issue!", {
            variant: "error",
          });
          break;
        case 409:
          enqueueSnackbar("You already created an issue on this target!", {
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
      <Header title="CREATE ISSUE" subtitle="Create a New Issue" />
      <Formik
        initialValues={initialValues}
        validationSchema={issueSchema}
        onSubmit={handleSubmit}
      >
        {({
          setFieldValue,
          values,
          errors,
          touched,
          handleBlur,
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
              <Box sx={{ gridColumn: "span 1" }}></Box>
              <Autocomplete
                onChange={(_, value) => {
                  setFieldValue("target", value);
                }}
                value={values.target}
                sx={{ gridColumn: "span 2" }}
                options={targets.sort(
                  (a, b) =>
                    -b.machineType.machineType.localeCompare(
                      a.machineType.machineType,
                    ),
                )}
                getOptionLabel={(option) => option.target}
                groupBy={(option) => option.machineType.machineType}
                isOptionEqualToValue={(option, value) =>
                  option._id === value._id
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="filled"
                    label="Target"
                    onBlur={handleBlur}
                    name="target"
                    error={!!touched.target && !!errors.target}
                    helperText={touched.target && errors.target}
                  />
                )}
              />
            </Box>
            <Box display="flex" justifyContent="center" mt="20px">
              <Button type="submit" color="secondary" variant="contained">
                Create Issue
              </Button>
            </Box>
          </form>
        )}
      </Formik>
    </Box>
  );
};

export default CreateIssuePage;
