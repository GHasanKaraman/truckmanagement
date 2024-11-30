import {
  Autocomplete,
  Avatar,
  Backdrop,
  Box,
  Button,
  CircularProgress,
  Dialog,
  IconButton,
  Skeleton,
  Stack,
  TextField,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import baseRequest from "../../core/baseRequest";

import * as yup from "yup";

import { IP } from "../../env";
import { tokens } from "../../theme";
import { ErrorOutline, TaskAlt } from "@mui/icons-material";
import { useFormik } from "formik";

import Result from "../Result";

const QRGivePage = (props) => {
  const params = useParams();

  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [part, setPart] = useState(null);

  const [openIssues, setOpenIssues] = useState();
  const [closedIssues, setClosedIssues] = useState();
  const [trigger, setTrigger] = useState(false);

  const [issue, setIssue] = useState();

  const [loading, setLoading] = useState(true);

  const [showFailedResult, setShowFailedResult] = useState(false);
  const [showSuccessfullResult, setShowSuccessfullResult] = useState(false);

  const [clicked, setClicked] = useState(false);

  const { id } = params;

  const isNonMobile = useMediaQuery("(min-width:600px)");

  const loadIssues = (issues) => {
    setOpenIssues(
      issues.filter((issue) => {
        if (issue.status !== 2) {
          return issue;
        }
      }),
    );
    setClosedIssues(
      issues.filter((issue) => {
        if (issue.status === 2) {
          return issue;
        }
      }),
    );
  };

  const loadGivePage = async () => {
    try {
      const res = await baseRequest.get("/qr", { params: { id } });
      if (res.data) {
        setPart(res.data.records.part);
        loadIssues(res.data.records.issues);
        setLoading(false);
      }
    } catch (error) {
      setTimeout(() => {
        setLoading(false);
      }, 3000);
    }
  };

  useEffect(() => {
    document.title = props.title || "";
  }, [props.title]);

  useEffect(() => {
    loadGivePage();
  }, []);

  const handleSubmit = async (values) => {
    try {
      setClicked(true);
      if (!clicked) {
        const data = {
          issueID: values.issue._id,
          technicianID: values.technician._id,
          outputQuantity: values.outputQuantity,
          locationID: part.location._id,
          id: part._id,
          count: part.count,
          price: part.price,
        };
        baseRequest.post("/qr/give", data).then((res) => {
          if (res.data) {
            setShowSuccessfullResult(true);
          }
        });
      }
    } catch (error) {
      setShowFailedResult(true);
    }
  };

  const formik = useFormik({
    initialValues: {
      issue: null,
      technician: null,
      outputQuantity: 1,
      location: null,
      item: null,
    },
    validationSchema: yup.object().shape({
      issue: yup
        .mixed()
        .nullable()
        .test("ID_CHECK", "Please select the issue!", (value) => {
          if (value._id) {
            return true;
          }
          return false;
        })
        .required("Please select the issue!"),
      technician: yup
        .mixed()
        .nullable()
        .test("ID_CHECK", "Please select the technician!", (value) => {
          if (value._id) {
            return true;
          }
          return false;
        })
        .required("Please select the technician!"),
    }),
    onSubmit: handleSubmit,
  });

  return part?.count === 0 ? (
    <Result
      status="500"
      title="This item is out of stock!"
      subTitle="Contact your supervisor!"
    />
  ) : clicked && !showFailedResult && !showSuccessfullResult ? (
    <Backdrop open={clicked}>
      <CircularProgress size={20} />
    </Backdrop>
  ) : showSuccessfullResult ? (
    <Result
      status="success"
      title="Successfull"
      subTitle="Go and get the items!"
    />
  ) : showFailedResult ? (
    <Result
      status="error"
      title="Something went wrong!"
      subTitle="Refresh the page and try again. If the problem still occurs, please contact to system admin!"
    />
  ) : (
    <Box m="0 20px ">
      {!part && !loading ? (
        <Result
          status="404"
          title="404"
          subTitle="We couldn't find this item. It might be removed in the system!"
        />
      ) : (
        <Dialog fullScreen={true} open={true}>
          {loading ? (
            <Skeleton
              sx={{ alignSelf: "center", p: 15, m: 5 }}
              width={100}
              height={100}
              animation="wave"
              variant="rectangular"
            />
          ) : (
            <img
              src={part?.image}
              alt="partImage"
              style={{ width: 250, padding: "20px 20px", alignSelf: "center" }}
            />
          )}

          <form onSubmit={formik.handleSubmit}>
            {!loading ? (
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
                  "& input": {
                    fontSize: 16,
                  },
                  px: 2,
                }}
              >
                <TextField
                  sx={{
                    gridColumn: "span 4",
                  }}
                  disabled
                  variant="outlined"
                  label="Part Name"
                  value={part ? part.partName : ""}
                />
                <TextField
                  sx={{ gridColumn: "span 4" }}
                  disabled
                  variant="outlined"
                  label="Count"
                  value={part ? part.count : ""}
                />
                <TextField
                  sx={{ gridColumn: "span 4" }}
                  disabled
                  variant="outlined"
                  label="Location"
                  value={part && part.location ? part.location.location : ""}
                />

                <Autocomplete
                  onChange={(_, value) => {
                    formik.setFieldValue("issue", value);
                    setIssue(value);
                    formik.setFieldValue("technician", null);
                  }}
                  value={formik.values.issue}
                  sx={{ gridColumn: "span 4", width: "100%", height: "100%" }}
                  options={(!trigger ? openIssues : closedIssues) || []}
                  getOptionLabel={(option) => option.target?.target}
                  isOptionEqualToValue={(option, value) =>
                    option._id === value._id
                  }
                  renderOption={(props, option) => {
                    return (
                      <li {...props} key={option._id}>
                        <Stack direction="row" spacing={1}>
                          {option?.status === 1 ? (
                            <CircularProgress
                              size={20}
                              sx={{ color: colors.orangeAccent[400] }}
                            />
                          ) : option?.status === 2 ? (
                            <TaskAlt
                              sx={{ color: colors.ciboInnerGreen[500] }}
                            />
                          ) : (
                            <ErrorOutline
                              sx={{ color: colors.yoggieRed[400] }}
                            />
                          )}

                          <div>
                            {option.target?.target +
                              " - " +
                              (option.problem?.problem || "UNDEFINED PROBLEM")}
                          </div>
                        </Stack>
                      </li>
                    );
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: (
                          <IconButton
                            onClick={() => {
                              setTrigger(!trigger);
                              formik.setFieldValue("issue", null);
                              formik.setFieldValue("technician", null);
                            }}
                          >
                            {!trigger ? (
                              <ErrorOutline
                                sx={{ color: colors.yoggieRed[400] }}
                              />
                            ) : (
                              <TaskAlt
                                sx={{ color: colors.ciboInnerGreen[500] }}
                              />
                            )}
                          </IconButton>
                        ),
                      }}
                      variant="outlined"
                      label="Issue"
                      onBlur={formik.handleBlur}
                      name="issue"
                      error={!!formik.touched.issue && !!formik.errors.issue}
                      helperText={formik.touched.issue && formik.errors.issue}
                    />
                  )}
                />

                <Autocomplete
                  disabled={
                    !issue ||
                    !issue.technicians ||
                    issue?.technicians.length === 0
                  }
                  onFocus={(event) => {
                    event.stopPropagation();
                  }}
                  value={formik.values.technician || []}
                  onChange={(_, value) => {
                    formik.setFieldValue("technician", value);
                  }}
                  sx={{ gridColumn: "span 4" }}
                  options={issue?.technicians || []}
                  getOptionLabel={(option) =>
                    option && option.name
                      ? (option.name + " " + option.surname).toUpperCase()
                      : ""
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
                      label="Technician"
                      name="technician"
                      onBlur={formik.handleBlur}
                      error={
                        !!formik.touched.technician &&
                        !!formik.errors.technician
                      }
                      helperText={
                        formik.touched.technician && formik.errors.technician
                      }
                    />
                  )}
                />
                <TextField
                  variant="outlined"
                  type="number"
                  aria-valuemin={2}
                  label="Output Quantity"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.outputQuantity}
                  name="outputQuantity"
                  error={
                    !!formik.touched.outputQuantity &&
                    !!formik.errors.outputQuantity
                  }
                  helperText={
                    formik.touched.outputQuantity &&
                    formik.errors.outputQuantity
                  }
                  sx={{ gridColumn: "span 4" }}
                  InputProps={{
                    inputProps: { min: 1, max: part ? part.count : 1 },
                  }}
                />
                <Button
                  color="secondary"
                  sx={{ gridColumn: "span 4", mb: 10 }}
                  type="submit"
                  variant="contained"
                >
                  Export
                </Button>
              </Box>
            ) : (
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
                  "& input": {
                    fontSize: 16,
                  },
                  px: 2,
                }}
              >
                <Skeleton
                  height={50}
                  sx={{ gridColumn: "span 4" }}
                  variant="rectangular"
                  animation="wave"
                />
                <Skeleton
                  height={50}
                  sx={{ gridColumn: "span 4" }}
                  variant="rectangular"
                  animation="wave"
                />
                <Skeleton
                  height={50}
                  sx={{ gridColumn: "span 4" }}
                  variant="rectangular"
                  animation="wave"
                />
                <Skeleton
                  height={50}
                  sx={{ gridColumn: "span 4" }}
                  variant="rectangular"
                  animation="wave"
                />
                <Skeleton
                  height={50}
                  sx={{ gridColumn: "span 4" }}
                  variant="rectangular"
                  animation="wave"
                />
                <Skeleton
                  height={50}
                  sx={{ gridColumn: "span 4" }}
                  variant="rectangular"
                  animation="wave"
                />
                <Skeleton
                  height={50}
                  sx={{ gridColumn: "span 4" }}
                  variant="rectangular"
                  animation="wave"
                />
              </Box>
            )}
          </form>
        </Dialog>
      )}
    </Box>
  );
};

export default QRGivePage;
