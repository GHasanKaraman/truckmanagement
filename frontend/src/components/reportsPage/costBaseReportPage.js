import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useSnackbar } from "notistack";
import useMediaQuery from "@mui/material/useMediaQuery";
import {
  Box,
  Button,
  TextField,
  Autocomplete,
  useTheme,
  Switch,
  Stack,
  Typography,
} from "@mui/material";
import { Formik } from "formik";
import * as yup from "yup";
import Header from "../Header";

import DateRangePicker, { useRangePicker } from "../issuesPage/dateRangePicker";
import { tokens } from "../../theme";
import baseRequest from "../../core/baseRequest";
import useSignOut from "../../hooks/useSignOut";
import { errorHandler } from "../../core/errorHandler.js";
import { TIME } from "../../utils/const";
import moment from "moment-timezone";
import finance from "../../images/finance.webp";

const CostBaseReportPage = (props) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const isNonMobile = useMediaQuery("(min-width:600px)");

  const [controller] = useSignOut();

  const [switchState, setSwitchState] = useState(false);

  const [getter, setter] = useRangePicker();

  const [vendors, setVendors] = useState([]);
  const [targets, setTargets] = useState([]);

  const loadCostBasePage = async () => {
    try {
      const res = await baseRequest.get("/report/costForm", {});
      if (res.data) {
        setVendors(Object.values(res.data.records?.vendors));
        setTargets(Object.values(res.data.records?.targets));
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
    loadCostBasePage();
  }, []);

  useEffect(() => {
    //This is for reloading home page
    const interval = setInterval(() => {
      loadCostBasePage();
    }, TIME);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    document.title = props.title || "";
  }, [props.title]);

  const inventorySchema = yup.object().shape({
    vendors: yup
      .array()
      .required(
        "Please select the vendors you want to see how much you spent on!",
      )
      .min(
        1,
        "Please select the vendors you want to see how much you spent on!",
      ),
    targets: yup
      .array()
      .required(
        "Please select the targets you want to see how much you spent on!",
      )
      .min(
        1,
        "Please select the targets you want to see how much you spent on!",
      ),
    range: yup
      .mixed()
      .nullable()
      .required("Please enter the range!")
      .test("RANGE", "Please enter the range!", (value) => {
        if (switchState) {
          return getter.startDate !== "" && getter.endDate !== "";
        } else {
          return true;
        }
      }),
  });

  const initialValues = {
    vendors: vendors.map((item) => item.vendor),
    targets: targets.map((item) => item.target),
    range: "DATE",
  };

  const handleSubmit = async (values, { resetForm }) => {
    const tempStart = moment(getter.startDate).toDate();
    tempStart.setHours(4);
    tempStart.setMinutes(0);
    tempStart.setSeconds(0);

    const tempEnd = moment(getter.endDate).toDate();
    tempStart.setHours(4);
    tempStart.setMinutes(0);
    tempStart.setSeconds(0);
    if (switchState) {
      const newWindow = window.open("/reports/custom?cost");
      newWindow.state = {
        start: tempStart,
        end: tempEnd,
        type: "cost",
        vendors: values.vendors,
        targets: values.targets,
      };
    } else {
      const newWindow = window.open("/reports/cost");
      newWindow.state = {
        vendors: values.vendors,
        targets: values.targets,
      };
    }
  };

  return (
    <Box m="0 20px">
      <Header title="PULL COST REPORTS" subtitle="Cost of Spending Report" />
      <Formik
        enableReinitialize
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
                alt="finance"
                style={{
                  gridColumn: "span 2",
                  margin: "auto",
                  justifyContent: "center",
                }}
                src={finance}
              />
              <Box sx={{ gridColumn: "span 1" }} />
              <Box sx={{ gridColumn: "span 1" }} />

              <Autocomplete
                limitTags={3}
                multiple
                disableCloseOnSelect={true}
                onChange={(_, value) => {
                  setFieldValue("vendors", value);
                }}
                value={values.vendors}
                sx={{ gridColumn: "span 2" }}
                options={vendors.map((item) => item.vendor)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="filled"
                    label="Vendors"
                    onBlur={handleBlur}
                    name="vendors"
                    error={!!touched.vendors && !!errors.vendors}
                    helperText={touched.vendors && errors.vendors}
                  />
                )}
              />

              <Box sx={{ gridColumn: "span 1" }} />
              <Box sx={{ gridColumn: "span 1" }} />
              <Autocomplete
                limitTags={3}
                multiple
                disableCloseOnSelect={true}
                onChange={(_, value) => {
                  setFieldValue("targets", value);
                }}
                value={values.targets}
                sx={{ gridColumn: "span 2" }}
                options={targets.map((item) => item.target)}
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
              />

              <Box sx={{ gridColumn: "span 1" }} />
              <Box sx={{ gridColumn: "span 1" }} />

              <Box sx={{ gridColumn: "span 2" }}>
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  sx={{ justifyContent: "center" }}
                >
                  <Typography>Weekly</Typography>
                  <Switch
                    sx={{
                      width: 58,
                      height: 34,
                      padding: 1.2,
                      "& .MuiSwitch-switchBase": {
                        padding: 0,
                        margin: 0.5,
                      },
                      "& .MuiSwitch-thumb": {
                        width: 24,
                        height: 24,
                      },
                    }}
                    value={switchState}
                    color="secondary"
                    onChange={(_, target) => {
                      setSwitchState(target);
                    }}
                  />
                  <Typography>Custom</Typography>
                </Stack>
              </Box>

              <Box sx={{ gridColumn: "span 1" }} />
              <Box sx={{ gridColumn: "span 1" }} />

              <Box
                sx={{
                  gridColumn: "span 2",
                  display: switchState ? "block" : "none",
                }}
              >
                <DateRangePicker getter={getter} setter={setter} />

                {!!touched.vendors && !!errors.vendors ? undefined : (
                  <Typography
                    sx={{
                      fontSize: "0.64rem",
                      color: "#d32f2f",
                      marginLeft: 1,
                      marginTop: 0.5,
                    }}
                  >
                    {touched.range && errors.range}
                  </Typography>
                )}
              </Box>
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

export default CostBaseReportPage;
