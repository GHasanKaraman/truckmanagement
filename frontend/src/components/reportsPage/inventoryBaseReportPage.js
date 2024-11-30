import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useSnackbar } from "notistack";
import useMediaQuery from "@mui/material/useMediaQuery";
import { Box, Button, TextField, Autocomplete, useTheme } from "@mui/material";
import { Formik } from "formik";
import * as yup from "yup";
import Header from "../Header";

import { tokens } from "../../theme";

import baseRequest from "../../core/baseRequest";
import { control } from "../../utils/userAuth";

import { TIME } from "../../utils/const";
import inventory from "../../images/inventory.webp";

const InventoryBaseReportPage = (props) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const isNonMobile = useMediaQuery("(min-width:600px)");

  const loadInventoryBasePage = async () => {
    const res = await baseRequest.post("/report", {});
    const status = control(res);
    if (status) {
    } else {
      enqueueSnackbar("You should sign in again!", {
        variant: "error",
      });
      navigate("/login");
    }
  };

  useEffect(() => {
    loadInventoryBasePage();
  }, []);

  useEffect(() => {
    //This is for reloading home page
    const interval = setInterval(() => {
      loadInventoryBasePage();
    }, TIME);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    document.title = props.title || "";
  }, [props.title]);

  const inventorySchema = yup.object().shape({
    facility: yup.string().required("Please select the facility!"),
    parameter: yup.string().required("Please select the parameter!"),
  });

  const initialValues = {
    facility: "Vreeland",
    parameter: "Without Images",
  };

  const handleSubmit = async (values, { resetForm }) => {
    const { facility, parameter } = values;
    if (facility === "Madison") {
      const newWindow = window.open("/reports/inventory?facility=Madison");
      newWindow.state = {
        parameter: parameter,
      };
    } else {
      const newWindow = window.open("/reports/inventory?facility=Vreeland");
      newWindow.state = {
        parameter: parameter,
      };
    }
  };

  return (
    <Box m="0 20px">
      <Header
        title="PULL INVENTORY REPORTS"
        subtitle="Inventory/Stock Reports"
      />

      <Formik
        initialValues={initialValues}
        validationSchema={inventorySchema}
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
              <img
                style={{
                  gridColumn: "span 2",
                  margin: "auto",
                  justifyContent: "center",
                }}
                src={inventory}
              />
              <Box sx={{ gridColumn: "span 1" }} />
              <Box sx={{ gridColumn: "span 1" }} />

              <Autocomplete
                onChange={(_, value) => {
                  setFieldValue("facility", value);
                }}
                value={values.facility}
                sx={{ gridColumn: "span 2" }}
                options={["Vreeland", "Madison"]}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="filled"
                    label="Facility"
                    onBlur={handleBlur}
                    name="facility"
                    error={!!touched.facility && !!errors.facility}
                    helperText={touched.facility && errors.facility}
                  />
                )}
              />
              <Box sx={{ gridColumn: "span 1" }} />
              <Box sx={{ gridColumn: "span 1" }} />
              <Autocomplete
                onChange={(_, value) => {
                  setFieldValue("parameter", value);
                }}
                value={values.parameter}
                sx={{ gridColumn: "span 2" }}
                options={["With Images", "Without Images"]}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="filled"
                    label="Parameter"
                    onBlur={handleBlur}
                    name="parameter"
                    error={!!touched.parameter && !!errors.parameter}
                    helperText={touched.parameter && errors.parameter}
                  />
                )}
              />
            </Box>
            <Box display="flex" justifyContent="center" mt="20px">
              <Button type="submit" color="secondary" variant="contained">
                Pull The Report
              </Button>
            </Box>
          </form>
        )}
      </Formik>
    </Box>
  );
};

export default InventoryBaseReportPage;
