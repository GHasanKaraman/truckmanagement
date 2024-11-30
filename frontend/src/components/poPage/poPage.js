import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import moment from "moment-timezone";

import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";

import {
  Box,
  TextField,
  Button,
  IconButton,
  useTheme,
  useMediaQuery,
  Stack,
} from "@mui/material";
import UploadIcon from "@mui/icons-material/Upload";
import { useSnackbar } from "notistack";

import { useFormik } from "formik";
import * as yup from "yup";

import Header from "../Header";

import { tokens } from "../../theme";

import baseRequest from "../../core/baseRequest";

import { TIME } from "../../utils/const";

import { errorHandler } from "../../core/errorHandler.js";
import useControl from "../../hooks/useControl";
import useSignOut from "../../hooks/useSignOut";

const POPage = (props) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isNonMobile = useMediaQuery("(min-width:600px)");

  const [auth] = useControl();
  const [controller] = useSignOut();

  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState("");

  const SUPPORTED_FORMATS = ["application/pdf"];

  const handleFileChange = (file) => {
    if (file) {
      getBase64(file, (url) => {
        setImageUrl(url);
        setLoading(true);
      });
    } else {
      setImageUrl("");
      setLoading(false);
    }
  };

  const getBase64 = (img, callback) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => callback(reader.result));
    reader.readAsDataURL(img);
  };

  const loadItemsPage = async () => {
    try {
      const res = await baseRequest.get("/po", {});
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
          enqueueSnackbar("Something went wrong retrieving the table!", {
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
    setImageUrl("");

    loadItemsPage();
  }, []);

  useEffect(() => {
    //This is for reloading home page
    const interval = setInterval(() => {
      loadItemsPage();
    }, TIME);

    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (values, { resetForm }) => {
    try {
      values["file"] = formik.values.file;
      values.parts = values.parts.toUpperCase();
      values.vendor = values.vendor.toUpperCase();

      const formData = new FormData();
      for (const name in values) {
        formData.append(name, values[name]);
      }
      const res = await baseRequest.post("/po", formData);

      if (auth(res)) {
        resetForm();
        setLoading(false);
        setImageUrl("");
        enqueueSnackbar("PO record has been successfully created!", {
          variant: "success",
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
          enqueueSnackbar("Something went wrong while creating new PO!", {
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

  const formik = useFormik({
    initialValues: {
      parts: "",
      date: "",
      price: "",
      vendor: "",
      file: null,
    },
    onSubmit: handleSubmit,
    validationSchema: yup.object().shape({
      parts: yup.string().required("Please enter the part name!"),
      date: yup.string().required("Please enter the PO date!"),
      price: yup.string().required("Please enter the price of the PO!"),
      vendor: yup.string().required("Please select the vendor!"),
      file: yup
        .mixed()
        .nullable()
        .required("Please upload the document of the PO!")
        .test("FILE_SIZE", "Document must smaller than 10MB!", (value) => {
          return !value || (value && value.size < 1024 * 1024 * 10);
        })
        .test("FILE_FORMAT", "You can only upload PDF files!", (value) => {
          return !value || (value && SUPPORTED_FORMATS.includes(value?.type));
        }),
    }),
  });

  return (
    <Box m="0 20px ">
      <Header title="ADD PO" subtitle="Create a PO Record" />

      <form encType="multipart/form-data" onSubmit={formik.handleSubmit}>
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
          <Box
            sx={{
              gridColumn: "span 4",
              textAlign: "center",
              my: "10px",
            }}
          >
            <IconButton
              color="secondary"
              component="label"
              sx={{
                width: "100px",
                height: "100px",
                borderRadius: "1px",
                outline: formik.values.file ? undefined : "1px dashed",
              }}
            >
              <Stack direction="column" alignItems="center">
                {loading ? (
                  formik.values.file ? (
                    <iframe src={imageUrl} title="Preview PDF" />
                  ) : null
                ) : (
                  <div>
                    <UploadIcon fontSize="large" />
                    Upload
                  </div>
                )}
              </Stack>

              <input
                hidden
                accept="application/pdf"
                type="file"
                onChange={async (e) => {
                  handleFileChange(e.target.files[0]);
                  if (e.target.files.length > 0) {
                    setLoading(true);
                    await formik.setTouched({ ...formik.touched, file: true });
                    await formik.setFieldValue("file", e.target.files[0]);
                  } else {
                    setLoading(false);
                    formik.setFieldValue("file", null);
                  }
                }}
              />
            </IconButton>
            <p
              style={{
                marginTop: "5px",
                fontSize: 11,
                color:
                  !!formik.touched.file && !!formik.errors.file
                    ? "red"
                    : "black",
              }}
            >
              {formik.touched.file && formik.errors.file}
            </p>
          </Box>
          <TextField
            variant="filled"
            type="text"
            label="PO Name"
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            value={formik.values.parts}
            name="parts"
            error={!!formik.touched.parts && !!formik.errors.parts}
            helperText={formik.touched.parts && formik.errors.parts}
            sx={{ gridColumn: "span 2" }}
          />
          <LocalizationProvider dateAdapter={AdapterMoment}>
            <DatePicker
              label="PO Date"
              format="LL"
              value={moment(formik.values.date)}
              onChange={(value) => {
                formik.setFieldValue("date", value.format());
              }}
              formatDensity="spacious"
              slotProps={{
                textField: {
                  error: !!formik.touched.date && !!formik.errors.date,
                  helperText: formik.touched.date && formik.errors.date,
                  variant: "filled",
                  sx: { gridColumn: "span 2" },
                },
                popper: {
                  sx: {
                    "& .Mui-selected": {
                      background: colors.ciboInnerGreen[600] + " !important",
                    },
                    "& .Mui-selected:hover": {
                      background: colors.ciboInnerGreen[700],
                    },
                    "& .MuiButtonBase-root:hover": {
                      background: colors.ciboInnerGreen[700],
                    },
                    "& .MuiButtonBase-root": {
                      color: colors.grey[100],
                    },
                  },
                },
                dialog: {
                  sx: {
                    "& button.Mui-selected": {
                      color: colors.ciboInnerGreen[500] + " !important",
                    },
                    "& .Mui-selected:hover": {
                      color: colors.ciboInnerGreen[700],
                    },
                    "& .MuiButtonBase-root:hover": {
                      color: colors.ciboInnerGreen[500],
                    },
                    "& .MuiButtonBase-root": {
                      color: colors.grey[100],
                    },
                    "& .MuiTabs-indicator": {
                      background: colors.ciboInnerGreen[500],
                    },
                    "& button.MuiButtonBase-root.MuiPickersDay-root.Mui-selected":
                      {
                        background: colors.ciboInnerGreen[500],
                        color: colors.primary[400] + " !important",
                      },
                  },
                },
              }}
            />
          </LocalizationProvider>
          <TextField
            variant="filled"
            type="number"
            aria-valuemin={2}
            label="PO Price"
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            value={formik.values.price}
            name="price"
            error={!!formik.touched.price && !!formik.errors.price}
            helperText={formik.touched.price && formik.errors.price}
            sx={{ gridColumn: "span 2" }}
            InputProps={{
              inputProps: { inputMode: "decimal", min: 1, step: 0.01 },
            }}
          />
          <TextField
            variant="filled"
            type="text"
            label="Vendor"
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            value={formik.values.vendor}
            name="vendor"
            error={!!formik.touched.vendor && !!formik.errors.vendor}
            helperText={formik.touched.vendor && formik.errors.vendor}
            sx={{ gridColumn: "span 2" }}
          />
        </Box>
        <Box display="flex" justifyContent="center" mt="20px">
          <Button type="submit" color="secondary" variant="contained">
            Create New PO
          </Button>
        </Box>
      </form>
    </Box>
  );
};

export default POPage;
