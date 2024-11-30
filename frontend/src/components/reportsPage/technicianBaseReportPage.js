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
  Avatar,
  Chip,
} from "@mui/material";
import { Formik } from "formik";
import * as yup from "yup";
import Header from "../Header";

import { tokens } from "../../theme";

import baseRequest from "../../core/baseRequest";

import { TIME } from "../../utils/const";
import DateRangePicker, { useRangePicker } from "../issuesPage/dateRangePicker";
import moment from "moment-timezone";

import technician from "../../images/technician.png";
import { errorHandler } from "../../core/errorHandler";
import useSignOut from "../../hooks/useSignOut";
import { IP } from "../../env";

const TechnicianBaseReportPage = (props) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [controller] = useSignOut();

  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const isNonMobile = useMediaQuery("(min-width:600px)");

  const [switchState, setSwitchState] = useState(false);

  const [getter, setter] = useRangePicker();

  const [technicians, setTechnicians] = useState([]);

  const loadTechnicianBasePage = async () => {
    try {
      const res = await baseRequest.get("/report/techniciansForm", {});
      if (res.data) {
        setTechnicians(Object.values(res.data.records?.users));
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
    loadTechnicianBasePage();
  }, []);

  useEffect(() => {
    //This is for reloading home page
    const interval = setInterval(() => {
      loadTechnicianBasePage();
    }, TIME);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    document.title = props.title || "";
  }, [props.title]);

  const inventorySchema = yup.object().shape({
    technicians: yup
      .array()
      .required(
        "Please select the technicians you want to see the performance!",
      )
      .min(1, "Please select the technicians you want to see the performance!"),
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
    technicians: technicians,
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
      const newWindow = window.open("/reports/custom?technicians");
      newWindow.state = {
        start: tempStart,
        end: tempEnd,
        type: "technicians",
        technicians: values.technicians,
      };
    } else {
      const newWindow = window.open("/reports/technicians");
      newWindow.state = {
        technicians: values.technicians,
      };
    }
  };

  return (
    <Box m="0 20px">
      <Header
        title="PULL TECHNICIANS REPORTS"
        subtitle="Technician Performance Reports"
      />
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
                alt="bg"
                style={{
                  gridColumn: "span 2",
                  margin: "auto",
                  justifyContent: "center",
                }}
                src={technician}
              />
              <Box sx={{ gridColumn: "span 1" }} />
              <Box sx={{ gridColumn: "span 1" }} />

              <Autocomplete
                onFocus={(event) => {
                  event.stopPropagation();
                }}
                disableCloseOnSelect={true}
                multiple
                value={values.technicians || []}
                onChange={(_, value) => {
                  setFieldValue("technicians", value);
                }}
                sx={{ gridColumn: "span 2" }}
                options={technicians || []}
                getOptionLabel={(option) =>
                  (option.name + " " + option.surname).toUpperCase()
                }
                renderOption={(props, option) => {
                  return (
                    <li {...props}>
                      <Stack
                        spacing={1}
                        direction="row"
                        sx={{
                          alignItems: "center !important",
                        }}
                      >
                        <Avatar
                          src={
                            "http://" +
                            IP +
                            "/uploads/thumbnail-" +
                            option.image?.substring(
                              option.image?.indexOf("/") + 1,
                            )
                          }
                        />
                        <div>
                          {(option.name + " " + option.surname).toUpperCase()}
                        </div>
                      </Stack>
                    </li>
                  );
                }}
                isOptionEqualToValue={(option, value) =>
                  option._id === value._id
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Technicians"
                    name="technicians"
                    onBlur={handleBlur}
                    error={!!touched.technicians && !!errors.technicians}
                    helperText={touched.technicians && errors.technicians}
                  />
                )}
                renderTags={(tagValue, tagProps) => {
                  return tagValue.map((option, index) => {
                    return (
                      <Chip
                        avatar={
                          <Avatar
                            src={
                              "http://" +
                              IP +
                              "/uploads/thumbnail-" +
                              option.image?.substring(
                                option.image?.indexOf("/") + 1,
                              )
                            }
                          />
                        }
                        size="small"
                        color="primary"
                        style={{
                          backgroundColor: colors.contrast[100],
                          color: colors.primary[400],
                          fontWeight: "bold",
                        }}
                        {...tagProps({ index })}
                        label={(
                          option.name +
                          " " +
                          option.surname
                        ).toUpperCase()}
                      />
                    );
                  });
                }}
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

                {!!touched.technicians && !!errors.technicians ? undefined : (
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

export default TechnicianBaseReportPage;
