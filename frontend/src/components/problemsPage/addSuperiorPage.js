import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  TextField,
  Autocomplete,
  useTheme,
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

import "./tagAutocomplete.css";
import useControl from "../../hooks/useControl";
import useSignOut from "../../hooks/useSignOut";
import { errorHandler } from "../../core/errorHandler";

const AddSuperiorPage = (props) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [auth] = useControl();
  const [controller] = useSignOut();

  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [targets, setTargets] = useState([]);

  const isNonMobile = useMediaQuery("(min-width:600px)");

  const superiorSchema = yup.object().shape({
    superior: yup.string().required("Please define a superior problem!"),
    targets: yup
      .array()
      .required("Please select the targets related to the superior!")
      .min(1, "Please select the targets related to the superior!"),
  });
  const initialValues = {
    superior: "",
    targets: [],
  };

  const loadSuperiorsPage = async () => {
    try {
      const res = await baseRequest.get("/superior", {});
      if (res.data) {
        const targets = Object.values(res.data.records.targets);
        setTargets(targets);
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
    loadSuperiorsPage();
  }, []);

  useEffect(() => {
    //This is for reloading home page
    const interval = setInterval(() => {
      loadSuperiorsPage();
    }, TIME);

    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (values, { resetForm }) => {
    try {
      const res = await baseRequest.post("/superior", values);
      if (auth(res)) {
        enqueueSnackbar(
          res.data.result.superior + " is successfully created!",
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
            "Something went wrong while creating new superior problem!",
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
      <Header title="ADD SUPERIOR" subtitle="Create a New Superior" />
      <Formik
        initialValues={initialValues}
        validationSchema={superiorSchema}
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
              <TextField
                variant="filled"
                type="text"
                label="Superior"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.superior}
                name="superior"
                error={!!touched.superior && !!errors.superior}
                helperText={touched.superior && errors.superior}
                sx={{ gridColumn: "span 2" }}
              />

              <Box sx={{ gridColumn: "span 1" }} />
              <Box sx={{ gridColumn: "span 1" }} />
              <Autocomplete
                sx={{ gridColumn: "span 2" }}
                onFocus={(event) => {
                  event.stopPropagation();
                }}
                disableCloseOnSelect={true}
                multiple
                onChange={(_, value) => {
                  setFieldValue("targets", value);
                }}
                value={values.targets}
                options={targets}
                getOptionLabel={({ target }) => target}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="filled"
                    label="Targets"
                    onBlur={handleBlur}
                    name="targets"
                    error={!!touched.targets && !!errors.targets}
                    helperText={touched.targets && errors.targets}
                  />
                )}
                renderTags={(tagValue, tagProps) => {
                  return tagValue.map((option, index) => {
                    return (
                      <Chip
                        size="small"
                        variant="filled"
                        color="primary"
                        style={{
                          backgroundColor: colors.ciboInnerGreen[600],
                          color: colors.ciboInnerGreen[100],
                          fontWeight: "bold",
                        }}
                        {...tagProps({ index })}
                        label={option.target}
                      />
                    );
                  });
                }}
              />
            </Box>
            <Box display="flex" justifyContent="center" mt="20px">
              <Button type="submit" color="secondary" variant="contained">
                Create New Superior
              </Button>
            </Box>
          </form>
        )}
      </Formik>
    </Box>
  );
};

export default AddSuperiorPage;
