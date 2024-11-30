import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DataGrid, GridActionsCellItem } from "@mui/x-data-grid";

import { useSnackbar } from "notistack";
import useMediaQuery from "@mui/material/useMediaQuery";

import { useFormik } from "formik";
import * as yup from "yup";

import DeleteIcon from "@mui/icons-material/DeleteOutlined";
import PrintIcon from "@mui/icons-material/Print";
import EditIcon from "@mui/icons-material/Edit";
import UploadIcon from "@mui/icons-material/Upload";

import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Stack,
  TextField,
  useTheme,
} from "@mui/material";

import { DatePicker } from "@mui/x-date-pickers";

import Header from "../Header";

import { tokens } from "../../theme";

import baseRequest from "../../core/baseRequest";

import { TIME } from "../../utils/const";
import { IP } from "../../env";
import {
  QuickSearchToolbar,
  requestSearch,
} from "../../scenes/DataGrid/CustomGridToolBar";

import { toStringDate } from "../../utils/helpers";

import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import moment from "moment-timezone";
import { PictureAsPdf } from "@mui/icons-material";

import useControl from "../../hooks/useControl";
import useSignOut from "../../hooks/useSignOut";
import { errorHandler } from "../../core/errorHandler";

const ViewPOPage = (props) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [auth] = useControl();
  const [controller] = useSignOut();

  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);

  const [selectedPO, setSelectedPO] = useState(null);

  const [data, setData] = useState([]);
  const [pos, setPOs] = useState([]);

  //Filter Variables
  const [searchText, setSearchText] = useState("");

  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState("");

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

  useEffect(() => {
    document.title = props.title || "";
  }, [props.title]);

  const loadViewPOsPage = async () => {
    try {
      const res = await baseRequest.get("/po", {});
      if (auth(res)) {
        const data = Object.values(res.data.records);
        setData(data);
        setPOs(data);
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
    loadViewPOsPage();
  }, []);

  useEffect(() => {
    //This is for reloading home page
    const interval = setInterval(() => {
      loadViewPOsPage();
    }, TIME);

    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (values, { resetForm }) => {
    try {
      const pipeline = { ...values };
      if (pipeline.file && typeof pipeline.file == "object") {
        pipeline["file"] = formik.values.file;
      } else {
        delete pipeline.file;
      }

      const formData = new FormData();
      for (const name in pipeline) {
        formData.append(name, pipeline[name]);
      }
      formData.append("id", selectedPO._id);

      const res = await baseRequest.put("/po", formData);
      if (auth(res)) {
        enqueueSnackbar("PO has been successfully updated!", {
          variant: "success",
        });
        await loadViewPOsPage();
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
          enqueueSnackbar("Something went wrong updating the tag!", {
            variant: "error",
          });
          break;
        case 500:
          enqueueSnackbar(
            "Something went wrong while updating from database!",
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
      date: yup.string().required("Please enter the date of the PO!"),
      price: yup.string().required("Please enter the price of the PO!"),
      vendor: yup.string().required("Please select the vendor!"),
    }),
  });

  const columns = [
    {
      field: "date",
      headerName: "PO Date",
      type: "date",
      flex: 0.4,
      cellClassName: "date-column--cell",
      valueGetter: ({ value }) => value && new Date(value),
      renderCell: ({ row }) => {
        return toStringDate(row.date, {
          month: "short",
          year: "numeric",
          day: "numeric",
        });
      },
    },
    {
      field: "doc",
      headerName: "Document",
      flex: 0.2,
      cellClassName: "doc-column--cell",
      filterable: false,
      sortable: false,
      renderCell: ({ value }) => {
        return (
          <Box sx={{ margin: "auto" }}>
            <IconButton
              sx={{
                borderRadius: 1,
              }}
              onClick={() => {
                window.open("http://" + IP + "/" + value, "_blank");
              }}
            >
              <PictureAsPdf />
            </IconButton>
          </Box>
        );
      },
    },
    {
      field: "parts",
      headerName: "PO Name",
      flex: 0.6,
      cellClassName: "parts-column--cell",
    },
    {
      field: "vendor",
      headerName: "Vendor",
      flex: 0.3,
      cellClassName: "vendor-column--cell",
    },
    {
      field: "price",
      headerName: "Price",
      type: "number",
      flex: 0.2,
      cellClassName: "price-column--cell",
      renderCell: ({ value }) => {
        return "$" + value;
      },
    },
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      flex: 0.5,
      getActions: ({ row, id }) => {
        return [
          <GridActionsCellItem
            title="Edit"
            icon={
              <EditIcon
                sx={{
                  padding: "3px",
                  background: colors.ciboInnerGreen[400],
                  borderRadius: 1,
                  color: colors.primary[400],
                  fontSize: "25px",
                }}
              />
            }
            label="Edit"
            className="textPrimary"
            onClick={() => {
              setSelectedPO(row);
              setOpenEdit(true);
              const fileName = row.doc;
              formik.setFieldValue(
                "file",
                "http://" +
                  IP +
                  "/uploads/" +
                  fileName?.substr(
                    fileName?.indexOf("/") + 1,
                    fileName?.lastIndexOf("."),
                  ),
              );
              setImageUrl(
                "http://" +
                  IP +
                  "/uploads/" +
                  fileName?.substr(
                    fileName?.indexOf("/") + 1,
                    fileName?.lastIndexOf("."),
                  ),
              );
              setLoading(true);
              formik.setFieldValue("parts", row.parts);
              formik.setFieldValue("date", row.date);
              formik.setFieldValue("price", row.price);
              formik.setFieldValue("vendor", row.vendor);
            }}
            color="inherit"
          />,
          <GridActionsCellItem
            title="Delete"
            icon={
              <DeleteIcon
                sx={{
                  padding: "2px",
                  background: colors.yoggieRed[500],
                  borderRadius: 1,
                  color: colors.primary[400],
                  fontSize: "25px",
                }}
              />
            }
            label="Delete"
            onClick={() => {
              setSelectedPO(row);
              setOpenDelete(true);
            }}
            color="inherit"
          />,
        ];
      },
    },
  ];

  const handleDelete = async () => {
    try {
      const res = await baseRequest.delete("/po", { id: selectedPO._id });
      if (res.data) {
        enqueueSnackbar("PO has been successfully deleted!", {
          variant: "success",
        });

        await loadViewPOsPage();
        setOpenDelete(false);
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
          enqueueSnackbar("Something went wrong deleting the PO!", {
            variant: "error",
          });
          break;
        case 500:
          enqueueSnackbar(
            "Something went wrong while deleting from database!",
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
      <Header title="VIEW POs" subtitle="View & Edit POs" />
      <Dialog
        fullScreen={fullScreen}
        open={openDelete}
        onClose={() => {
          setOpenDelete(false);
        }}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Confirm the action"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Do you really want to delete this PO?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            color="info"
            onClick={() => {
              setOpenDelete(false);
            }}
          >
            Disagree
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDelete}
            autoFocus
          >
            Agree
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        sx={{
          "& .MuiInputBase-root::after": {
            borderBottomColor: colors.ciboInnerGreen[500],
          },
          "& .MuiInputBase-root::before": {
            borderBottomColor: colors.ciboInnerGreen[600],
          },
          "& .MuiFormLabel-root.Mui-focused": {
            color: colors.ciboInnerGreen[300],
          },
          "& .Mui-disabled": {
            cursor: "not-allowed",
            pointerEvents: "all !important",
          },
        }}
        fullScreen={fullScreen}
        open={openEdit}
        onClose={async () => {
          setOpenEdit(false);
          formik.resetForm();
          await loadViewPOsPage();
        }}
      >
        <DialogTitle>Edit PO Record</DialogTitle>
        <form onSubmit={formik.handleSubmit}>
          <DialogContent>
            <Stack spacing={2}>
              <DialogContentText>
                You cannot reach the old data after you changed something on
                this PO!
              </DialogContentText>
              <Box
                sx={{ gridColumn: "span 4", textAlign: "center", py: "20px" }}
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
                      formik.values.file && true ? (
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
                        await formik.setTouched({
                          ...formik.touched,
                          file: true,
                        });
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
                label="Part Name"
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
                          background:
                            colors.ciboInnerGreen[600] + " !important",
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
                label="Price"
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
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button
              variant="contained"
              color="error"
              onClick={async () => {
                setOpenEdit(false);
                formik.resetForm();
                await loadViewPOsPage();
              }}
            >
              Cancel
            </Button>
            <Button type="submit" variant="contained" color="secondary">
              Edit
            </Button>
          </DialogActions>
        </form>
      </Dialog>
      <Box
        m="40px 0 0 0"
        height="75vh"
        sx={{
          "& .MuiDataGrid-root": {
            border: "none",
          },
          "& .MuiDataGrid-cell": {
            borderBottom: "none",
          },
          "& .name-column--cell": {
            color: colors.ciboInnerGreen[300],
          },
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: colors.ciboInnerGreen[500],
            borderBottom: "none",
          },
          "& .MuiDataGrid-virtualScroller": {
            backgroundColor: colors.primary[400],
          },
          "& .MuiDataGrid-footerContainer": {
            borderTop: "none",
            backgroundColor: colors.ciboInnerGreen[500],
          },
          "& .MuiCheckbox-root": {
            color: `${colors.ciboInnerGreen[200]} !important`,
          },
          "& .MuiDataGrid-toolbarContainer .MuiButton-text": {
            color: `${colors.grey[100]} !important`,
          },
          "& .MuiDataGrid-cell:focus": {
            outlineColor: colors.primary[400],
          },
          "& .MuiDataGrid-cell:focus-within": {
            outlineColor: colors.primary[400],
          } /*,
      "& .MuiDataGrid-row--editing .MuiDataGrid-cell--editing": {
        backgroundColor: "red",
      }*/,
          "& .MuiInputBase-root::after": {
            borderBottomColor: colors.ciboInnerGreen[500],
          },
          "& .MuiInputBase-root::before": {
            borderBottomColor: colors.ciboInnerGreen[600],
          },
        }}
      >
        <DataGrid
          getRowHeight={() => "auto"}
          disableRowSelectionOnClick={true}
          rows={pos}
          columns={columns}
          slots={{
            toolbar: QuickSearchToolbar,
            moreActionsIcon: () => {
              return (
                <PrintIcon
                  sx={{
                    padding: "2px",
                    borderRadius: 1,
                    color: colors.grey[200],
                    fontSize: "25px",
                  }}
                />
              );
            },
          }}
          slotProps={{
            toolbar: {
              value: searchText,
              onChange: (event) => {
                setSearchText(event.target.value);
                requestSearch(data, setPOs, event.target.value);
              },
              clearSearch: () => {
                setSearchText("");
                requestSearch(data, setPOs, "");
              },
            },
          }}
          getRowId={(purchase) => purchase._id}
        />
      </Box>
    </Box>
  );
};

export default ViewPOPage;
