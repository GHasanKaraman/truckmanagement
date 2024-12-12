import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  useTheme,
  useMediaQuery,
  TextField,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  CircularProgress,
  Backdrop,
} from "@mui/material";

import CheckBoxIcon from "@mui/icons-material/CheckBox";
import CloseIcon from "@mui/icons-material/Close";

import { useFormik } from "formik";
import * as yup from "yup";

import { useSnackbar } from "notistack";

import { tokens } from "../../theme";

import ToggleButtonCheck from "../ToggleButtonCheck";
import UploadImage from "../UploadImage";
import baseRequest from "../../core/baseRequest";
import { errorHandler } from "../../core/errorHandler";

import Result from "../Result.jsx";
import UserSelectBox from "../UserSelectBox.jsx";

const TruckPreOperationalChecklist = (props) => {
  const params = useParams();
  const { id } = params;

  const SUPPORTED_FORMATS = ["image/jpg", "image/jpeg", "image/png"];
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isNonMobile = useMediaQuery("(min-width:600px)");
  const { enqueueSnackbar } = useSnackbar();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [truck, setTruck] = useState([]);
  const [users, setUsers] = useState([]);

  const [step, setStep] = useState(false);
  const [driver, setDriver] = useState([]);

  useEffect(() => {
    document.title = props.title || "";
  }, [props.title]);

  const loadPreOperationalPage = async () => {
    try {
      const res = await baseRequest.get("/qr/truck", { params: { id } });
      if (res.data) {
        setTruck(res.data.records.truck);
        setUsers(res.data.records.users);
      }
    } catch (error) {
      const { data, status } = errorHandler(error);
      switch (status) {
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
    loadPreOperationalPage();
  }, []);

  const handleSubmit = async (values, { resetForm }) => {
    setLoading(true);
    values.truck = truck.truck;
    values.userID = driver[0];

    const formData = new FormData();
    for (const name in values) {
      if (values[name]?.constructor?.name === "Blob") {
        formData.append(name, values[name], name + ".jpeg");
      } else {
        formData.append(name, values[name]);
      }
    }

    const res = await baseRequest.post("/qr/preoperational", formData);
    if (res?.data) {
      enqueueSnackbar("You have successfully created the form!", {
        variant: "success",
      });
      setLoading(false);
      setOpen(true);
    } else {
      switch (res.response?.status) {
        case 404:
          enqueueSnackbar(
            "Something went wrong! Please contact to system administrators.",
            {
              variant: "error",
            },
          );
          break;
        case 500:
          enqueueSnackbar("Something went wrong on the server side!", {
            variant: "error",
          });
          break;
        default:
          break;
      }
    }
  };

  const uploadRequired = (message) => {
    return yup
      .mixed()
      .nullable()
      .required(message)
      .test("FILE_SIZE", "Image must smaller than 10MB!", (value) => {
        return !value || (value && value.size < 1024 * 1024 * 10);
      })
      .test(
        "FILE_FORMAT",
        "You can only upload JPG/JPEG/PNG files!",
        (value) => {
          return !value || (value && SUPPORTED_FORMATS.includes(value?.type));
        },
      );
  };

  const formik = useFormik({
    initialValues: {
      truck: null,

      isCabinClean: null,
      isBackClean: null,
      isThereProblem: null,
      areLightsWorking: null,
      areThereDEF: null,

      frontPicture: null,
      backPicture: null,
      comment: "",
    },
    onSubmit: handleSubmit,
    validationSchema: yup.object().shape({
      isCabinClean: yup.string().required(),
      isBackClean: yup.string().required(),
      isThereProblem: yup.string().required(),
      areLightsWorking: yup.string().required(),
      areThereDEF: yup.string().required(),
      frontPicture: uploadRequired("Please upload the picture for frontside!"),
      backPicture: uploadRequired("Please upload the picture for backside!"),
    }),
  });

  return loading ? (
    <Backdrop open={true}>
      <CircularProgress size={25} />
    </Backdrop>
  ) : open ? (
    <Result
      status="success"
      title="Successfull"
      subTitle="You have successfully filed a report!"
    />
  ) : !step ? (
    <Dialog fullScreen={true} open={true} sx={{ textAlign: "center" }}>
      <DialogTitle
        sx={{
          fontWeight: 700,
          fontSize: 50,
          color: colors.crusta[600],
        }}
      >
        DRIVER LIST
      </DialogTitle>

      <Box width="100%" sx={{ display: "flex", justifyContent: "center" }}>
        <form>
          {users.length === 0 ? (
            "No users have been found. Please contact to system administrator!"
          ) : (
            <UserSelectBox
              limit={1}
              technicians={users}
              onChange={(value) => {
                setDriver(value);
              }}
            />
          )}
          <Button
            onClick={() => {
              if (driver.length === 0) {
                enqueueSnackbar("Please select your name!", {
                  variant: "error",
                });
              } else {
                setStep(true);
              }
            }}
            variant="contained"
            color="secondary"
            sx={{
              width: "100%",
              color: "#fff",
              fontWeight: 700,
              fontSize: 18,
              mt: 3,
              mb: 5,
            }}
          >
            Select
          </Button>
        </form>
      </Box>
    </Dialog>
  ) : (
    <Dialog fullScreen={true} open={true} sx={{ textAlign: "center" }}>
      <DialogTitle
        sx={{
          fontWeight: 700,
          fontSize: 50,
          color: colors.crusta[600],
        }}
      >
        {truck?.truck +
          " - " +
          (truck?.facility === "V"
            ? "VREELAND"
            : truck?.facility === "M"
              ? "MADISON"
              : "TAFT")}
      </DialogTitle>
      <Divider />
      <form
        encType="multipart/form-data"
        onSubmit={(e) => {
          if (!formik.isValid && !formik.isValidating) {
            enqueueSnackbar("Please fill out all the missing fields!", {
              variant: "error",
            });
          }
          formik.handleSubmit(e);
        }}
        style={{ paddingBottom: "10px", fontSize: "16px !important" }}
      >
        <DialogContent>
          <Box
            display="grid"
            gap="30px"
            gridTemplateColumns="repeat(4, minmax(0, 1fr))"
            sx={{
              "& > div": {
                gridColumn: isNonMobile ? undefined : "span 4",
              },
              "& .MuiInputBase-root::after": {
                borderBottomColor: colors.ciboInnerGreen[500],
              },
              "& .MuiInputBase-root::before": {
                borderBottomColor: colors.ciboInnerGreen[600],
              },
              "& .MuiFormLabel-root.Mui-focused": {
                color: colors.ciboInnerGreen[300],
              },
              "& h6": {
                gridColumn: "span 4",
              },
            }}
          >
            <Typography
              variant="h6"
              color={colors.grey[100]}
              fontWeight="600"
              sx={{ m: "0 0 -20px 0", minWidth: "250px" }}
            >
              Is the cabin inside clean?
            </Typography>
            <ToggleButtonCheck
              style={{ gridColumn: "span 4" }}
              alignment={formik.values.isCabinClean}
              onChange={(value) => {
                formik.setFieldValue("isCabinClean", value);
              }}
              error={
                !!formik.touched.isCabinClean && !!formik.errors.isCabinClean
              }
              options={[
                {
                  label: "Yes",
                  icon: (
                    <CheckBoxIcon
                      sx={{
                        fill: colors.ciboInnerGreen[500],
                      }}
                    />
                  ),
                },
                {
                  label: "No",
                  icon: (
                    <CloseIcon
                      sx={{
                        color: colors.yoggieRed[500],
                        stroke: colors.yoggieRed[500],
                        strokeWidth: "2",
                      }}
                    />
                  ),
                },
              ]}
            />
            <Typography
              variant="h6"
              color={colors.grey[100]}
              fontWeight="600"
              sx={{ m: "0 0 -20px 0", minWidth: "250px" }}
            >
              Is the back of the truck inside clean?
            </Typography>
            <ToggleButtonCheck
              style={{ gridColumn: "span 4" }}
              alignment={formik.values.isBackClean}
              onChange={(value) => {
                formik.setFieldValue("isBackClean", value);
              }}
              error={
                !!formik.touched.isBackClean && !!formik.errors.isBackClean
              }
              options={[
                {
                  label: "Yes",
                  icon: (
                    <CheckBoxIcon
                      sx={{
                        fill: colors.ciboInnerGreen[500],
                      }}
                    />
                  ),
                },
                {
                  label: "No",
                  icon: (
                    <CloseIcon
                      sx={{
                        color: colors.yoggieRed[500],
                        stroke: colors.yoggieRed[500],
                        strokeWidth: "2",
                      }}
                    />
                  ),
                },
              ]}
            />
            <Typography
              variant="h6"
              color={colors.grey[100]}
              fontWeight="600"
              sx={{ m: "0 0 -20px 0", minWidth: "250px" }}
            >
              Is there any problem in the body side?
            </Typography>
            <ToggleButtonCheck
              style={{ gridColumn: "span 4" }}
              alignment={formik.values.isThereProblem}
              onChange={(value) => {
                formik.setFieldValue("isThereProblem", value);
              }}
              error={
                !!formik.touched.isThereProblem &&
                !!formik.errors.isThereProblem
              }
              options={[
                {
                  label: "Yes",
                  icon: (
                    <CheckBoxIcon
                      sx={{
                        fill: colors.ciboInnerGreen[500],
                      }}
                    />
                  ),
                },
                {
                  label: "No",
                  icon: (
                    <CloseIcon
                      sx={{
                        color: colors.yoggieRed[500],
                        stroke: colors.yoggieRed[500],
                        strokeWidth: "2",
                      }}
                    />
                  ),
                },
              ]}
            />
            <Typography
              variant="h6"
              color={colors.grey[100]}
              fontWeight="600"
              sx={{ m: "0 0 -20px 0", minWidth: "250px" }}
            >
              Are the lights working properly?
            </Typography>
            <ToggleButtonCheck
              style={{ gridColumn: "span 4" }}
              alignment={formik.values.areLightsWorking}
              onChange={(value) => {
                formik.setFieldValue("areLightsWorking", value);
              }}
              error={
                !!formik.touched.areLightsWorking &&
                !!formik.errors.areLightsWorking
              }
              options={[
                {
                  label: "Yes",
                  icon: (
                    <CheckBoxIcon
                      sx={{
                        fill: colors.ciboInnerGreen[500],
                      }}
                    />
                  ),
                },
                {
                  label: "No",
                  icon: (
                    <CloseIcon
                      sx={{
                        color: colors.yoggieRed[500],
                        stroke: colors.yoggieRed[500],
                        strokeWidth: "2",
                      }}
                    />
                  ),
                },
              ]}
            />
            <Typography
              variant="h6"
              color={colors.grey[100]}
              fontWeight="600"
              sx={{ m: "0 0 -20px 0", minWidth: "250px" }}
            >
              Are there enough DEF for truck?
            </Typography>
            <ToggleButtonCheck
              style={{ gridColumn: "span 4" }}
              alignment={formik.values.areThereDEF}
              onChange={(value) => {
                formik.setFieldValue("areThereDEF", value);
              }}
              error={
                !!formik.touched.areThereDEF && !!formik.errors.areThereDEF
              }
              options={[
                {
                  label: "Yes",
                  icon: (
                    <CheckBoxIcon
                      sx={{
                        fill: colors.ciboInnerGreen[500],
                      }}
                    />
                  ),
                },
                {
                  label: "No",
                  icon: (
                    <CloseIcon
                      sx={{
                        color: colors.yoggieRed[500],
                        stroke: colors.yoggieRed[500],
                        strokeWidth: "2",
                      }}
                    />
                  ),
                },
              ]}
            />

            <Typography
              variant="h6"
              color={colors.grey[100]}
              fontWeight="600"
              sx={{ m: "0 0 -20px 0", minWidth: "250px" }}
            >
              PICTURE (FRONT/OUTSIDE)
            </Typography>
            <UploadImage
              sx={{ gridColumn: "span 4", justifySelf: "center" }}
              value={formik.values.frontPicture}
              error={
                !!formik.touched.frontPicture && !!formik.errors.frontPicture
              }
              helperText={
                formik.touched.frontPicture && formik.errors.frontPicture
              }
              onChange={(blob) => {
                formik.setFieldValue("frontPicture", blob);
              }}
            />
            <Typography
              variant="h6"
              color={colors.grey[100]}
              fontWeight="600"
              sx={{ m: "0 0 -20px 0", minWidth: "250px" }}
            >
              PICTURE (BACK/OUTSIDE)
            </Typography>
            <UploadImage
              sx={{ gridColumn: "span 4", justifySelf: "center" }}
              value={formik.values.backPicture}
              error={
                !!formik.touched.backPicture && !!formik.errors.backPicture
              }
              helperText={
                formik.touched.backPicture && formik.errors.backPicture
              }
              onChange={(blob) => {
                formik.setFieldValue("backPicture", blob);
              }}
            />
            <TextField
              multiline
              rows={7}
              sx={{ gridColumn: "span 4" }}
              id="comment"
              value={formik.values.comment}
              onChange={formik.handleChange}
              label="Comment"
              name="comment"
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions
          sx={{
            justifyContent: "space-around",
          }}
        >
          <Button
            type="submit"
            sx={{
              width: "90%",
              height: 50,
              fontWeight: 700,
              fontSize: 18,
              background: colors.crusta[600],
              "&.MuiButton-root:hover": {
                background: colors.crusta[400],
              },
            }}
            variant="contained"
            color="info"
          >
            SUBMIT
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default TruckPreOperationalChecklist;
