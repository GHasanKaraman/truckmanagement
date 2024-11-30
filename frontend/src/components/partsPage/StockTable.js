import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  DataGrid,
  getGridSingleSelectOperators,
  GridActionsCellItem,
} from "@mui/x-data-grid";

import { useSnackbar } from "notistack";
import useMediaQuery from "@mui/material/useMediaQuery";

import { Formik, useFormik } from "formik";
import * as yup from "yup";

import DeleteIcon from "@mui/icons-material/DeleteOutlined";
import PrintIcon from "@mui/icons-material/Print";
import EditIcon from "@mui/icons-material/Edit";
import OutputIcon from "@mui/icons-material/Output";
import { Construction, ErrorOutline, TaskAlt } from "@mui/icons-material";

import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Stack,
  TextField,
  Autocomplete,
  useTheme,
  Typography,
  CircularProgress,
  Backdrop,
  Avatar,
  IconButton,
  Tooltip,
} from "@mui/material";

import Image from "../Image";
import Header from "../Header";

import { tokens } from "../../theme";

import baseRequest from "../../core/baseRequest";

import { TIME } from "../../utils/const";
import { IP } from "../../env";
import {
  QuickSearchToolbar,
  requestSearch,
} from "../../scenes/DataGrid/CustomGridToolBar";

import { getPartID, toStringDate } from "../../utils/helpers";

import PrintComponent from "../../utils/print";
import useControl from "../../hooks/useControl";
import { errorHandler } from "../../core/errorHandler";
import useSignOut from "../../hooks/useSignOut";
import UploadImage from "../UploadImage";
import Highlighter from "react-highlight-words";

const StockTable = (props) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [auth] = useControl();
  const [controller] = useSignOut();

  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [openGive, setOpenGive] = useState(false);
  const [openConsume, setOpenConsume] = useState(false);

  const [selectedItem, setSelectedItem] = useState(null);

  const [openIssues, setOpenIssues] = useState();
  const [closedIssues, setClosedIssues] = useState();
  const [trigger, setTrigger] = useState(false);

  const [data, setData] = useState([]);
  const [stock, setStock] = useState([]);
  const [tags, setTags] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [locations, setLocations] = useState([]);
  const [issue, setIssue] = useState();
  const [technicians, setTechnicians] = useState([]);

  //Filter Variables
  const [searchText, setSearchText] = useState("");

  const [clicked, setClicked] = useState(false);
  const [clickedDelete, setClickedDelete] = useState(false);

  const [issueLoading, setIssueLoading] = useState(true);

  useEffect(() => {
    document.title = props.title || "";
  }, [props.title]);

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

  const loadStockPage = async () => {
    try {
      const res = await baseRequest.get(
        `/parts?facility=${props.facility}`,
        {},
      );
      if (res.data) {
        requestSearch(
          Object.values(res.data.records.parts),
          setStock,
          searchText,
        );
        setData(Object.values(res.data.records.parts));
        setLocations(Object.values(res.data.records.locations));
        setVendors(Object.values(res.data.records.vendors));
        setTags(Object.values(res.data.records.tags));
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
        case 500:
          enqueueSnackbar("Something went wrong on server!", {
            variant: "error",
          });
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
    loadStockPage();
  }, []);

  useEffect(() => {
    //This is for reloading home page
    const interval = setInterval(() => {
      loadStockPage();
    }, TIME);

    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (values, { resetForm }) => {
    try {
      const pipeline = { ...values };
      if (pipeline.file && typeof pipeline.file == "object") {
        var file = formik.values.file;
      } else {
        delete pipeline.file;
      }

      pipeline.partName = values.partName.toUpperCase();
      pipeline.tagsID = values.tags.map(({ _id }) => _id);
      pipeline.vendorsID = values.vendors.map(({ _id }) => _id);
      pipeline.locationID = values.location._id;

      delete pipeline.tags;
      delete pipeline.vendors;
      delete pipeline.location;
      delete pipeline.file;

      const formData = new FormData();
      for (const name in pipeline) {
        formData.append(name, pipeline[name]);
      }
      formData.append("id", selectedItem._id);
      if (file) {
        formData.append("file", file, "image.jpeg");
      }

      const res = await baseRequest.put("/parts", formData);
      if (auth(res)) {
        await loadStockPage();
        setOpenEdit(false);
        enqueueSnackbar("Part has been successfully updated!", {
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
          enqueueSnackbar("Something went wrong updating the superior!", {
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
          if (value.size) {
            return !value || (value && value.size < 1024 * 1024 * 10);
          }
          return true;
        }),
    }),
  });

  const columns = [
    {
      field: "image",
      headerName: "Image",
      flex: 0.22,
      cellClassName: "image-column--cell",
      filterable: false,
      sortable: false,
      renderCell: ({ value }) => {
        return (
          <Box sx={{ margin: "auto", marginBottom: "-5px" }}>
            <Image width={50} fileName={value} />
          </Box>
        );
      },
    },
    {
      field: "_id",
      headerName: "Part ID",
      flex: 0.3,
      cellClassName: "partid-column--cell",
      valueGetter: ({ value, row }) =>
        getPartID(row.partName, value).toUpperCase(),
      renderCell: ({ value }) => {
        const ID = value;
        return (
          <Chip
            variant="filled"
            size="small"
            label={ID}
            key={value}
            style={{
              fontSize: "12px",
              fontWeight: "600",
              color: colors.primary[400],
              backgroundColor: colors.ciboInnerGreen[400],
              borderRadius: "4px",
              borderWidth: "0px",
              margin: "auto",
            }}
          />
        );
      },
    },
    {
      field: "partName",
      headerName: "Part Name",
      flex: 0.8,
      cellClassName: "parts-column--cell",
      renderCell: ({ value }) => {
        return (
          <Highlighter
            searchWords={[searchText]}
            autoEscape
            textToHighlight={value}
            highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }}
          />
        );
      },
    },
    {
      field: "count",
      headerName: "Count",
      flex: 0.1,
      cellClassName: "count-column--cell",
      type: "number",
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
      field: "totalPrice",
      headerName: "Inventory Value",
      flex: 0.3,
      cellClassName: "total-price-column--cell",
      type: "number",
      renderCell: ({ value }) => {
        return "$" + value.toFixed(2);
      },
    },
    {
      field: "vendors",
      headerName: "Vendor",
      flex: 0.3,
      cellClassName: "vendor-column--cell",
      type: "singleSelect",
      valueOptions: vendors,
      filterOperators: getGridSingleSelectOperators()
        .filter((op) => op.value === "is")
        .map((operator) => {
          const newOperator = { ...operator };
          newOperator.getApplyFilterFn = (filterItem, column) => {
            return (params) => {
              if (!filterItem.value) return true;
              return params.value
                ?.map(({ _id }) => _id)
                .some((cellValue) => cellValue === filterItem?.value);
            };
          };

          return newOperator;
        }),
      getOptionValue: (value) => {
        return value?._id;
      },
      getOptionLabel: ({ vendor }) => vendor,
      renderCell: ({ value }) => {
        return (
          <Stack width="100%" direction="column">
            {value?.map(({ vendor }) => {
              return (
                <Chip
                  variant="filled"
                  size="small"
                  label={vendor.toUpperCase()}
                  key={vendor}
                  style={{
                    fontSize: "12px",
                    fontWeight: "600",
                    color: colors.primary[400],
                    backgroundColor: colors.ciboInnerGreen[300],
                    borderRadius: "4px",
                    borderWidth: "0px",
                    margin: "5px 0px",
                  }}
                />
              );
            })}
          </Stack>
        );
      },
    },
    {
      field: "minQuantity",
      headerName: "Min Quantity",
      flex: 0.2,
      cellClassName: "min-quantity-column--cell",
      type: "number",
    },
    {
      field: "location",
      headerName: "Location",
      flex: 0.3,
      cellClassName: "location-column--cell",
      type: "singleSelect",
      valueOptions: locations,
      filterOperators: getGridSingleSelectOperators()
        .filter((op) => op.value === "is")
        .map((operator) => {
          const newOperator = { ...operator };
          newOperator.getApplyFilterFn = (filterItem, column) => {
            return (params) => {
              if (!filterItem.value) return true;
              return filterItem?.value === params.value?._id;
            };
          };

          return newOperator;
        }),
      getOptionValue: (value) => {
        return value?._id;
      },
      getOptionLabel: ({ location }) => location,
      renderCell: ({ value }) => {
        return value.location;
      },
    },
    {
      field: "tags",
      headerName: "Tags",
      flex: 0.3,
      cellClassName: "tags-column--cell",
      filterable: true,
      valueOptions: tags,
      type: "singleSelect",
      filterOperators: getGridSingleSelectOperators()
        .filter((op) => op.value === "is")
        .map((operator) => {
          const newOperator = { ...operator };
          newOperator.getApplyFilterFn = (filterItem, column) => {
            return (params) => {
              if (!filterItem.value) return true;
              return params?.value
                ?.map(({ _id }) => _id)
                .some((cellValue) => cellValue === filterItem?.value);
            };
          };

          return newOperator;
        }),

      renderCell: ({ value }) => {
        return value.length === 0 ? (
          <Chip
            variant="filled"
            size="small"
            label="NTAG"
            key="ntag"
            style={{
              width: "100%",
              fontSize: "12px",
              fontWeight: "600",
              color: colors.primary[400],
              borderRadius: "4px",
              borderWidth: "0px",
              margin: "5px 0px",
            }}
          />
        ) : (
          <Stack width="100%" direction="column">
            {value?.map(({ name, color }) => {
              return (
                <Chip
                  variant="filled"
                  size="small"
                  label={name.toUpperCase()}
                  key={name}
                  style={{
                    fontSize: "12px",
                    fontWeight: "600",
                    color: colors.primary[400],
                    backgroundColor: color,
                    borderRadius: "4px",
                    borderWidth: "0px",
                    margin: "5px 0px",
                  }}
                />
              );
            })}
          </Stack>
        );
      },
      getOptionValue: (value) => {
        return value?._id;
      },
      getOptionLabel: ({ name }) => name,
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
              setSelectedItem(row);
              setOpenEdit(true);
              const fileName = row.image;
              formik.setFieldValue(
                "file",
                "http://" +
                  IP +
                  "/uploads/" +
                  "thumbnail-" +
                  fileName?.substr(
                    fileName?.indexOf("/") + 1,
                    fileName?.lastIndexOf("."),
                  ),
              );
              formik.setFieldValue("partName", row.partName);
              formik.setFieldValue("count", row.count);
              formik.setFieldValue("price", row.price);
              formik.setFieldValue("minQuantity", row.minQuantity);
              formik.setFieldValue("vendors", row.vendors);
              formik.setFieldValue("location", row.location);
              formik.setFieldValue("tags", row.tags);
            }}
            color="inherit"
          />,
          <GridActionsCellItem
            title="Consumable"
            icon={
              <Construction
                sx={{
                  padding: "2px",
                  background: colors.omegaDeluxPurple[500],
                  borderRadius: 1,
                  color: colors.primary[400],
                  fontSize: "25px",
                }}
              />
            }
            label="Consumable"
            onClick={() => {
              setSelectedItem(row);
              try {
                baseRequest.get("/user", {}).then((res) => {
                  if (auth(res)) {
                    const technicians = Object.values(res.data.records);
                    setTechnicians(technicians);
                    setOpenConsume(true);
                  }
                });
              } catch (error) {
                const { data, status } = errorHandler(error);
                switch (status) {
                  case 401:
                    controller.forceLogin();
                    break;
                  case 403:
                    navigate("/noaccess");
                    break;
                  case 500:
                    enqueueSnackbar("Something went wrong on server!", {
                      variant: "error",
                    });
                    break;
                  default:
                    enqueueSnackbar(data, {
                      variant: "error",
                    });
                    break;
                }
              }
            }}
            color="inherit"
          />,
          <GridActionsCellItem
            title="Export"
            icon={
              <OutputIcon
                sx={{
                  padding: "2px",
                  background: colors.blueAccent[500],
                  borderRadius: 1,
                  color: colors.primary[400],
                  fontSize: "25px",
                }}
              />
            }
            label="Export"
            onClick={() => {
              setSelectedItem(row);
              try {
                baseRequest.get("/parts/issues", {}).then((res) => {
                  if (auth(res)) {
                    const issues = Object.values(res.data.records);
                    if (issues?.length > 0) {
                      loadIssues(issues);
                      setOpenGive(true);
                      setIssueLoading(false);
                    } else {
                      setOpenGive(false);
                      enqueueSnackbar(
                        "There are no issues occured in last 2 weeks!",
                        { variant: "info" },
                      );
                    }
                  }
                });
              } catch (error) {
                const { data, status } = errorHandler(error);
                switch (status) {
                  case 401:
                    controller.forceLogin();
                    break;
                  case 403:
                    navigate("/noaccess");
                    break;
                  case 500:
                    enqueueSnackbar("Something went wrong on server!", {
                      variant: "error",
                    });
                    break;
                  default:
                    enqueueSnackbar(data, {
                      variant: "error",
                    });
                    break;
                }
              }
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
              setSelectedItem(row);
              setOpenDelete(true);
            }}
            color="inherit"
          />,
          <GridActionsCellItem
            component={function () {
              return (
                <PrintComponent
                  buttonType="primary"
                  url={(
                    "http://" +
                    window.location.hostname +
                    `:${window.location.port}/qr/${id}`
                  ).trim()}
                  part={row.partName}
                  location={row.location.location}
                />
              );
            }}
            label="Target QR"
            showInMenu
          />,
        ];
      },
    },
  ];

  const handleConsume = async (values) => {
    try {
      if (!clicked) {
        setClicked(true);

        const id = selectedItem._id;
        const count = selectedItem.count;
        const price = selectedItem.price;
        const technicianID = values.technician._id;
        const outputQuantity = values.count;
        const locationID = selectedItem.locationID;

        const res = await baseRequest.put("/parts/consume", {
          id,
          count,
          technicianID,
          outputQuantity,
          locationID,
          price,
        });
        if (auth(res)) {
          loadStockPage().then((_) => {
            setOpenConsume(false);
            enqueueSnackbar("You can give the items!", {
              variant: "success",
            });
            setClicked(false);
          });
        }
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
          enqueueSnackbar("Something went wrong giving the part!", {
            variant: "error",
          });
          break;
        case 500:
          enqueueSnackbar("Something went wrong while logging on database!", {
            variant: "error",
          });
          break;
        default:
          enqueueSnackbar(data, {
            variant: "error",
          });
          break;
      }
    }
  };

  const handleGive = async (values) => {
    try {
      if (!clicked) {
        setClicked(true);

        const id = selectedItem._id;
        const count = selectedItem.count;
        const price = selectedItem.price;
        const technicianID = values.technician._id;
        const outputQuantity = values.count;
        const locationID = selectedItem.locationID;
        const issueID = values.issue?._id;

        const res = await baseRequest.put("/parts/give", {
          id,
          count,
          technicianID,
          outputQuantity,
          locationID,
          issueID,
          price,
        });
        if (auth(res)) {
          loadStockPage().then((_) => {
            setOpenGive(false);
            enqueueSnackbar("You can give the items!", {
              variant: "success",
            });
            giveFormik.resetForm();
            setClicked(false);
          });
        }
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
          enqueueSnackbar("Something went wrong giving the part!", {
            variant: "error",
          });
          break;
        case 500:
          enqueueSnackbar("Something went wrong while logging on database!", {
            variant: "error",
          });
          break;
        default:
          enqueueSnackbar(data, {
            variant: "error",
          });
          break;
      }
    }
  };

  const giveFormik = useFormik({
    initialValues: {
      issue: null,
      technician: null,
      count: 1,
    },
    validationSchema: yup.object().shape({
      issue: yup
        .mixed()
        .nullable()
        .test("ISSUE_CHECK", "Please select an issue!", (value) => {
          if (value._id) {
            return true;
          }
          return false;
        })
        .required("Please select an issue!"),
      technician: yup
        .mixed()
        .nullable()
        .test("ID_CHECK", "You must select a technician!", (value) => {
          if (value?._id) return true;
          else return false;
        })
        .required("You must select a technician!"),
      count: yup
        .number()
        .required(
          "Please enter how many of this item you are going to export? ",
        ),
    }),
    onSubmit: handleGive,
  });

  const dialogDeleteApproved = async () => {
    try {
      if (!clickedDelete) {
        setClickedDelete(true);
        const res = await baseRequest.delete("/parts", {
          id: selectedItem._id,
        });
        if (auth(res)) {
          setOpenDelete(false);
          loadStockPage().then(() => {
            setClickedDelete(false);
          });
          enqueueSnackbar("Part has been successfully deleted!", {
            variant: "success",
          });
        }
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
          enqueueSnackbar("Something went wrong deleting the part!", {
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
      <Header
        title={props.facility === "V" ? "VREELAND STOCK" : "MADISON STOCK"}
        subtitle="View & Control Inventory"
      />

      {/* =============== DELETE DIALOG ===============*/}
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
            Do you really want to delete this item?
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
            onClick={dialogDeleteApproved}
            autoFocus
          >
            Agree
          </Button>
        </DialogActions>
      </Dialog>
      {/* =============== GIVE DIALOG ===============*/}
      <Dialog
        fullScreen={fullScreen}
        open={openGive}
        onClose={() => {
          setOpenGive(false);
          setIssueLoading(true);
          setTrigger(false);
          giveFormik.resetForm();
        }}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Export Item"}</DialogTitle>
        <form onSubmit={giveFormik.handleSubmit}>
          <DialogContent>
            <Backdrop
              open={issueLoading}
              sx={{
                color: "#fff",
                zIndex: (theme) => theme.zIndex.drawer + 1,
              }}
            >
              <CircularProgress color="inherit" />
            </Backdrop>
            <Stack
              spacing={2}
              sx={{ textAlign: "center", justifyContent: "center" }}
            >
              <Image fileName={selectedItem?.image} width={"50%"} />
              <Typography variant="h5" fontWeight={700}>
                {selectedItem?.partName}
              </Typography>
              <TextField
                sx={{
                  "& input": { fontWeight: "bold", fontSize: "15px" },
                  "& label": { fontWeight: "bold" },
                }}
                variant="outlined"
                label="Current Quantity"
                value={selectedItem?.count}
                disabled
              />
              <TextField
                sx={{
                  "& input": { fontWeight: "bold", fontSize: "15px" },
                  "& label": { fontWeight: "bold" },
                }}
                variant="outlined"
                label="Location"
                value={selectedItem?.location?.location}
                disabled
              />

              <Autocomplete
                onChange={(_, value) => {
                  giveFormik.setFieldValue("issue", value);
                  setIssue(value);
                  giveFormik.setFieldValue("technician", null);
                }}
                value={giveFormik.values.issue}
                sx={{ gridColumn: "span 4", width: "100%", height: "100%" }}
                options={(!trigger ? openIssues : closedIssues) || []}
                getOptionLabel={(option) => option.target?.target}
                isOptionEqualToValue={(option, value) =>
                  option._id === value._id
                }
                renderOption={(props, option) => {
                  return (
                    <li {...props} key={option._id}>
                      <Tooltip
                        componentsProps={{
                          tooltip: {
                            sx: {
                              backgroundColor:
                                option.status === 0
                                  ? colors.yoggieRed[500]
                                  : option.status === 1
                                    ? colors.orangeAccent[400]
                                    : colors.ciboInnerGreen[500],
                            },
                          },
                        }}
                        title={
                          <div style={{ fontWeight: "bold", fontSize: 15 }}>
                            {toStringDate(option.createdAt, {
                              month: "short",
                              year: "numeric",
                              day: "numeric",
                              hour: "numeric",
                              minute: "numeric",
                            })}
                          </div>
                        }
                        placement="right"
                      >
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
                      </Tooltip>
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
                            giveFormik.setFieldValue("issue", null);
                            giveFormik.setFieldValue("technician", null);
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
                    onBlur={giveFormik.handleBlur}
                    name="issue"
                    error={
                      !!giveFormik.touched.issue && !!giveFormik.errors.issue
                    }
                    helperText={
                      giveFormik.touched.issue && giveFormik.errors.issue
                    }
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
                value={giveFormik.values.technician || []}
                onChange={(_, value) => {
                  giveFormik.setFieldValue("technician", value);
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
                    onBlur={giveFormik.handleBlur}
                    error={
                      !!giveFormik.touched.technician &&
                      !!giveFormik.errors.technician
                    }
                    helperText={
                      giveFormik.touched.technician &&
                      giveFormik.errors.technician
                    }
                  />
                )}
              />

              <TextField
                type="number"
                InputProps={{
                  inputProps: { min: 1, max: selectedItem?.count },
                }}
                onChange={giveFormik.handleChange}
                value={giveFormik.values.count}
                variant="filled"
                label="Count"
                onBlur={giveFormik.handleBlur}
                name="count"
                error={!!giveFormik.touched.count && !!giveFormik.errors.count}
                helperText={giveFormik.touched.count && giveFormik.errors.count}
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button
              variant="contained"
              color="info"
              onClick={() => {
                setOpenGive(false);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" variant="contained" color="error" autoFocus>
              Export
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* =============== EDIT DIALOG ===============*/}
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
          await loadStockPage();
        }}
      >
        <DialogTitle>Edit Item</DialogTitle>
        <form onSubmit={formik.handleSubmit}>
          <DialogContent>
            <Stack spacing={2}>
              <DialogContentText sx={{ color: colors.yoggieRed[500] }}>
                Edit proccess may effect every data in the system. Be careful!
              </DialogContentText>

              <UploadImage
                formEdit={false}
                value={formik.values.file}
                src={
                  "http://" +
                  IP +
                  "/uploads/" +
                  "thumbnail-" +
                  selectedItem?.image?.substr(
                    selectedItem?.image?.indexOf("/") + 1,
                    selectedItem?.image?.lastIndexOf("."),
                  )
                }
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
                error={
                  !!formik.touched.minQuantity && !!formik.errors.minQuantity
                }
                helperText={
                  formik.touched.minQuantity && formik.errors.minQuantity
                }
                sx={{ gridColumn: "span 2" }}
                InputProps={{ inputProps: { min: 1 } }}
              />
              <Autocomplete
                onChange={(_, value) => {
                  formik.setFieldValue("vendors", value);
                }}
                multiple
                disableCloseOnSelect={true}
                value={formik.values.vendors}
                sx={{ gridColumn: "span 2" }}
                options={vendors}
                getOptionLabel={({ vendor }) => vendor}
                isOptionEqualToValue={(option, value) =>
                  option._id === value._id
                }
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
                isOptionEqualToValue={(option, value) =>
                  option._id === value._id
                }
                onBlur={formik.handleBlur}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="filled"
                    label="Location"
                    name="location"
                    error={
                      !!formik.touched.location && !!formik.errors.location
                    }
                    helperText={
                      formik.touched.location && formik.errors.location
                    }
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
                isOptionEqualToValue={(option, value) =>
                  option._id === value._id
                }
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
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button
              variant="contained"
              color="error"
              onClick={async () => {
                setOpenEdit(false);
                formik.resetForm();
                await loadStockPage();
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

      {/* =============== CONSUMABLE DIALOG ===============*/}
      <Dialog
        fullScreen={fullScreen}
        open={openConsume}
        onClose={() => {
          setOpenConsume(false);
        }}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Consume Part</DialogTitle>
        <Formik
          initialValues={{
            technician: null,
            count: 1,
          }}
          validationSchema={yup.object().shape({
            technician: yup
              .mixed()
              .nullable()
              .test("ID_CHECK", "You must select a technician!", (value) => {
                if (value?._id) return true;
                else return false;
              })
              .required("You must select a technician!"),
            count: yup
              .number()
              .required(
                "Please enter how many items you are going to consume? ",
              ),
          })}
          onSubmit={handleConsume}
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
              <DialogContent>
                <Stack
                  spacing={2}
                  sx={{ textAlign: "center", justifyContent: "center" }}
                >
                  <Image fileName={selectedItem?.image} width={"50%"} />
                  <Typography variant="h5" fontWeight={700}>
                    {selectedItem?.partName}
                  </Typography>
                  <TextField
                    sx={{
                      "& input": { fontWeight: "bold", fontSize: "15px" },
                      "& label": { fontWeight: "bold" },
                    }}
                    variant="outlined"
                    label="Current Quantity"
                    value={selectedItem?.count}
                    disabled
                  />
                  <TextField
                    sx={{
                      "& input": { fontWeight: "bold", fontSize: "15px" },
                      "& label": { fontWeight: "bold" },
                    }}
                    variant="outlined"
                    label="Location"
                    value={selectedItem?.location?.location}
                    disabled
                  />
                  <Autocomplete
                    onChange={async (_, value) => {
                      setFieldValue("technician", value);
                    }}
                    value={values.technician}
                    sx={{ gridColumn: "span 2" }}
                    options={technicians}
                    getOptionLabel={({ name, surname }) => name + " " + surname}
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
                              {(
                                option.name +
                                " " +
                                option.surname
                              ).toUpperCase()}
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
                        variant="filled"
                        label="Technician"
                        onBlur={handleBlur}
                        name="technician"
                        error={!!touched.technician && !!errors.technician}
                        helperText={touched.technician && errors.technician}
                      />
                    )}
                  />
                  <TextField
                    type="number"
                    InputProps={{
                      inputProps: { min: 1, max: selectedItem.count },
                    }}
                    onChange={handleChange}
                    value={values.count}
                    variant="filled"
                    label="Count"
                    onBlur={handleBlur}
                    name="count"
                    error={!!touched.count && !!errors.count}
                    helperText={touched.count && errors.count}
                  />
                </Stack>
              </DialogContent>
              <DialogActions>
                <Button
                  variant="contained"
                  color="info"
                  onClick={() => {
                    setOpenConsume(false);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="error"
                  autoFocus
                >
                  Consume
                </Button>
              </DialogActions>
            </form>
          )}
        </Formik>
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
          rows={stock}
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
                requestSearch(data, setStock, event.target.value);
              },
              clearSearch: () => {
                setSearchText("");
                requestSearch(data, setStock, "");
              },
            },
          }}
          getRowId={(stock) => stock._id}
        />
      </Box>
    </Box>
  );
};

export default StockTable;
