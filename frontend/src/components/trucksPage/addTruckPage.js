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

import { errorHandler } from "../../core/errorHandler";
import useControl from "../../hooks/useControl";
import useSignOut from "../../hooks/useSignOut";

const AddTruckPage = (props) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [auth] = useControl();
  const [controller] = useSignOut();

  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const isNonMobile = useMediaQuery("(min-width:600px)");

  const truckSchema = yup.object().shape({
    truck: yup.string().required("Please enter a truck name!"),
    facility: yup.string().required("Please select the facility!"),
  });
  const initialValues = {
    truck: "",
    facility: "",
  };

  useEffect(() => {
    document.title = props.title || "";
  }, [props.title]);

  const handleSubmit = async (values, { resetForm }) => {
    try {
      const res = await baseRequest.post("/truck", values);
      if (auth(res)) {
        enqueueSnackbar(res.data.result.truck + " is successfully created!", {
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
          enqueueSnackbar("Something went wrong while creating new truck!", {
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
      <Header title="ADD TRUCK" subtitle="Create a New Truck" />
      <Formik
        initialValues={initialValues}
        validationSchema={truckSchema}
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
                <MenuItem key={"T"} value={"T"}>
                  TAFT
                </MenuItem>
              </TextField>
              <Box sx={{ gridColumn: "span 1" }} />
              <Box sx={{ gridColumn: "span 1" }} />
              <TextField
                variant="filled"
                type="text"
                label="Truck Name"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.truck}
                name="truck"
                error={!!touched.truck && !!errors.truck}
                helperText={touched.truck && errors.truck}
                sx={{ gridColumn: "span 2" }}
              />
              <Box sx={{ gridColumn: "span 1" }} />
            </Box>
            <Box display="flex" justifyContent="center" mt="20px">
              <Button type="submit" color="secondary" variant="contained">
                Create New Truck
              </Button>
            </Box>
          </form>
        )}
      </Formik>
    </Box>
  );
};

export default AddTruckPage;
