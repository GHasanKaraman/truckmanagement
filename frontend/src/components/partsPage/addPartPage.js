import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import {
  Box,
  TextField,
  Autocomplete,
  Button,
  Chip,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { useSnackbar } from "notistack";

import { useFormik } from "formik";
import * as yup from "yup";

import Header from "../Header";

import { tokens } from "../../theme";

import baseRequest from "../../core/baseRequest";

import { TIME } from "../../utils/const";

import useControl from "../../hooks/useControl";
import useSignOut from "../../hooks/useSignOut";
import { errorHandler } from "../../core/errorHandler";
import UploadImage from "../UploadImage";

const AddPartPage = (props) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isNonMobile = useMediaQuery("(min-width:600px)");

  const [auth] = useControl();
  const [controller] = useSignOut();

  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [locations, setLocations] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [tags, setTags] = useState([]);

  const SUPPORTED_FORMATS = ["image/jpg", "image/jpeg", "image/png"];

  const loadAddPartPage = async () => {
    try {
      const res = await baseRequest.get("/parts/add", {});
      if (res.data) {
        const vendors = Object.values(res.data.records.vendors);
        const locations = Object.values(res.data.records.locations);
        const tags = Object.values(res.data.records.tags);

        setVendors(vendors);
        setLocations(locations);
        setTags(tags);
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
    loadAddPartPage();
  }, []);

  useEffect(() => {
    //This is for reloading home page
    const interval = setInterval(() => {
      loadAddPartPage();
    }, TIME);

    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (values, { resetForm }) => {
    try {
      const file = values.file;
      values.partName = values.partName.toUpperCase();
      values.tagsID = values.tags.map(({ _id }) => _id);
      values.vendorsID = values.vendors.map(({ _id }) => _id);
      values.locationID = values.location._id;

      delete values.tags;
      delete values.vendors;
      delete values.file;
      delete values.location;

      const formData = new FormData();
      for (const name in values) {
        formData.append(name, values[name]);
      }
      formData.append("file", file, "image.jpeg");

      const res = await baseRequest.post("/parts", formData);
      if (auth(res)) {
        enqueueSnackbar(
          res.data.result.partName + " is successfully created!",
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
          enqueueSnackbar("Something went wrong while creating new part!", {
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
      partName: "",
      count: "",
      price: "",
      minQuantity: "",
      vendors: [],
      location: null,
      tags: [],
      file: null,
    },
    onSubmit: handleSubmit,
    validationSchema: yup.object().shape({
      partName: yup.string().required("Please enter a part name!"),
      count: yup.string().required("Please enter the count of the item!"),
      price: yup.string().required("Please enter the price of the item!"),
      minQuantity: yup.string().required("Please enter min quantity!"),
      vendors: yup
        .array()
        .min(1, "Please select the vendors!")
        .required("Please select the vendors!"),
      location: yup
        .mixed()
        .nullable()
        .test("ID_CHECK", "Please select the location!", (value) => {
          if (value._id) {
            return true;
          }
          return false;
        })
        .required("Please select the location!"),
      file: yup
        .mixed()
        .nullable()
        .required("Please upload the image of the part!")
        .test("FILE_SIZE", "Image must smaller than 10MB!", (value) => {
          return !value || (value && value.size < 1024 * 1024 * 10);
        })
        .test(
          "FILE_FORMAT",
          "You can only upload JPG/JPEG/PNG files!",
          (value) => {
            return !value || (value && SUPPORTED_FORMATS.includes(value?.type));
          },
        ),
    }),
  });

  return (
    <Box m="0 20px ">
      <Header title="ADD PART" subtitle="Create a New Part" />

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
          <UploadImage
            value={formik.values.file}
            sx={{ gridColumn: "span 4", justifySelf: "center" }}
            onChange={(blob) => {
              formik.setFieldValue("file", blob);
            }}
            error={!!formik.touched.file && !!formik.errors.file}
            helperText={formik.touched.file && formik.errors.file}
          />

          <TextField
            variant="filled"
            type="text"
            label="Part Name"
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            value={formik.values.partName}
            name="partName"
            error={!!formik.touched.partName && !!formik.errors.partName}
            helperText={formik.touched.partName && formik.errors.partName}
            sx={{ gridColumn: "span 2" }}
          />
          <TextField
            variant="filled"
            type="number"
            aria-valuemin={2}
            label="Count"
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            value={formik.values.count}
            name="count"
            error={!!formik.touched.count && !!formik.errors.count}
            helperText={formik.touched.count && formik.errors.count}
            sx={{ gridColumn: "span 2" }}
            InputProps={{
              inputProps: {
                min: 1,
                inputMode: "numeric",
                step: 1,
              },
            }}
          />
          <TextField
            variant="filled"
            type="number"
            aria-valuemin={2}
            label="Price"
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            value={formik.values.price}
            name="price"
            error={!!formik.touched.price && !!formik.errors.price}
            helperText={formik.touched.price && formik.errors.price}
            sx={{ gridColumn: "span 2" }}
            InputProps={{
              inputProps: { inputMode: "decimal", min: 0.1, step: 0.01 },
            }}
          />
          <TextField
            variant="filled"
            type="number"
            aria-valuemin={2}
            label="Min Quantity"
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            value={formik.values.minQuantity}
            name="minQuantity"
            error={!!formik.touched.minQuantity && !!formik.errors.minQuantity}
            helperText={formik.touched.minQuantity && formik.errors.minQuantity}
            sx={{ gridColumn: "span 2" }}
            InputProps={{
              inputProps: { min: 1, inputMode: "numeric", step: 1 },
            }}
          />
          <Autocomplete
            disableCloseOnSelect
            multiple={true}
            onChange={(_, value) => {
              formik.setFieldValue("vendors", value);
            }}
            value={formik.values.vendors}
            sx={{ gridColumn: "span 2" }}
            options={vendors}
            getOptionLabel={({ vendor }) => vendor}
            isOptionEqualToValue={(option, value) => option._id === value._id}
            onBlur={formik.handleBlur}
            renderInput={(params) => (
              <TextField
                {...params}
                variant="filled"
                label="Vendor"
                name="vendors"
                error={!!formik.touched.vendors && !!formik.errors.vendors}
                helperText={formik.touched.vendors && formik.errors.vendors}
              />
            )}
          />
          <Autocomplete
            onChange={(_, value) => {
              formik.setFieldValue("location", value);
            }}
            value={formik.values.location}
            sx={{ gridColumn: "span 2" }}
            options={locations}
            getOptionLabel={({ location }) => location}
            isOptionEqualToValue={(option, value) => option._id === value._id}
            onBlur={formik.handleBlur}
            renderInput={(params) => (
              <TextField
                {...params}
                variant="filled"
                label="Location"
                name="location"
                error={!!formik.touched.location && !!formik.errors.location}
                helperText={formik.touched.location && formik.errors.location}
              />
            )}
          />
          <Autocomplete
            onFocus={(event) => {
              event.stopPropagation();
            }}
            disableCloseOnSelect={true}
            multiple
            onChange={(_, value) => {
              formik.setFieldValue("tags", value);
            }}
            value={formik.values.tags}
            sx={{ gridColumn: "span 4" }}
            options={tags}
            getOptionLabel={({ name }) => name}
            isOptionEqualToValue={(option, value) => option._id === value._id}
            renderInput={(params) => (
              <TextField
                {...params}
                variant="filled"
                label="Tags"
                onBlur={formik.handleBlur}
                name="tags"
                error={!!formik.touched.tags && !!formik.errors.tags}
                helperText={formik.touched.tags && formik.errors.tags}
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
                      backgroundColor: option.color,
                      color: "white",
                      fontWeight: "bold",
                    }}
                    {...tagProps({ index })}
                    label={option.name}
                  />
                );
              });
            }}
          />
        </Box>
        <Box display="flex" justifyContent="center" mt="20px">
          <Button type="submit" color="secondary" variant="contained">
            Create New Part
          </Button>
        </Box>
      </form>
    </Box>
  );
};

export default AddPartPage;
