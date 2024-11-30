import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  TextField,
  Autocomplete,
  MenuItem,
  useTheme,
} from "@mui/material";
import { Formik } from "formik";
import * as yup from "yup";
import { useSnackbar } from "notistack";
import useMediaQuery from "@mui/material/useMediaQuery";

import Header from "../Header";

import { tokens } from "../../theme";

import baseRequest from "../../core/baseRequest";

import { TIME } from "../../utils/const";
import { errorHandler } from "../../core/errorHandler";
import useControl from "../../hooks/useControl";
import useSignOut from "../../hooks/useSignOut";

const AddTargetPage = (props) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [auth] = useControl();
  const [controller] = useSignOut();

  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [machineTypes, setMachineTypes] = useState([]);

  const isNonMobile = useMediaQuery("(min-width:600px)");

  const targetSchema = yup.object().shape({
    target: yup.string().required("Please enter a machine name!"),
    machineType: yup
      .mixed()
      .nullable()
      .test("ID_CHECK", "Please select the machine type!", (value) => {
        if (value._id) return true;
        else return false;
      })
      .required("Please select the machine type!"),
    facility: yup.string().required("Please select the facility!"),
  });
  const initialValues = {
    target: "",
    machineType: null,
    facility: "",
  };

  const loadTargetsPage = async () => {
    try {
      const res = await baseRequest.get("/target", {});
      if (res.data) {
        const machineTypes = Object.values(res.data.records.machineTypes);
        setMachineTypes(machineTypes);
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
    loadTargetsPage();
  }, []);

  useEffect(() => {
    //This is for reloading home page
    const interval = setInterval(() => {
      loadTargetsPage();
    }, TIME);

    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (values, { resetForm }) => {
    try {
      const res = await baseRequest.post("/target", values);
      if (auth(res)) {
        enqueueSnackbar(res.data.result.target + " is successfully created!", {
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
          enqueueSnackbar("Something went wrong while creating new target!", {
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
      <Header title="ADD TARGET" subtitle="Create a New Target" />
      <Formik
        initialValues={initialValues}
        validationSchema={targetSchema}
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
                autoFocus
                variant="filled"
                select
                label="Facility"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.facility}
                name="facility"
                error={!!touched.facility && !!errors.facility}
                helperText={touched.facility && errors.facility}
                sx={{ gridColumn: "span 2" }}
                InputProps={{ type: "search" }}
              >
                <MenuItem key={"V"} value={"V"}>
                  VREELAND
                </MenuItem>
                <MenuItem key={"M"} value={"M"}>
                  MADISON
                </MenuItem>
              </TextField>
              <Box sx={{ gridColumn: "span 1" }} />
              <Box sx={{ gridColumn: "span 1" }} />
              <TextField
                variant="filled"
                type="text"
                label="Target"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.target}
                name="target"
                error={!!touched.target && !!errors.target}
                helperText={touched.target && errors.target}
                sx={{ gridColumn: "span 2" }}
              />
              <Box sx={{ gridColumn: "span 1" }} />
              <Box sx={{ gridColumn: "span 1" }} />
              <Autocomplete
                onChange={(_, value) => {
                  setFieldValue("machineType", value);
                }}
                value={values.machineType}
                sx={{ gridColumn: "span 2" }}
                options={machineTypes}
                getOptionLabel={({ machineType }) => machineType}
                onBlur={handleBlur}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="filled"
                    label="Machine Type"
                    name="machineType"
                    error={!!touched.machineType && !!errors.machineType}
                    helperText={touched.machineType && errors.machineType}
                  />
                )}
              />
            </Box>
            <Box display="flex" justifyContent="center" mt="20px">
              <Button type="submit" color="secondary" variant="contained">
                Create New Target
              </Button>
            </Box>
          </form>
        )}
      </Formik>
    </Box>
  );
};

export default AddTargetPage;
