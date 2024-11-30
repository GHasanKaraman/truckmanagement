import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";

import "./qrIssues.css";
import {
  Autocomplete,
  Avatar,
  Backdrop,
  Box,
  Button,
  ButtonBase,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Stack,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import Result from "../Result";
import { errorHandler } from "../../core/errorHandler";
import baseRequest from "../../core/baseRequest";
import { tokens } from "../../theme";
import { IP } from "../../env";
import { useFormik } from "formik";

import { ReactComponent as MechanicSVG } from "../../images/mechanic.svg";
import { ReactComponent as PauseSVG } from "../../images/pause.svg";
import { ReactComponent as DoneWorkingSVG } from "../../images/doneWorking.svg";
import { ReactComponent as TakePhotoSVG } from "../../images/takePhoto.svg";
import UploadImage from "../UploadImage";

const QRIssueManagementPage = (props) => {
  const params = useParams();
  const { id } = params;

  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [technicians, setTechnicians] = useState();
  const [superiors, setSuperiors] = useState();
  const [problems, setProblems] = useState([]);
  const [fixingMethods, setFixingMethods] = useState();
  const [target, setTarget] = useState();
  const [issue, setIssue] = useState();

  const [showNoTarget, setShowNoTarget] = useState(false);
  const [showSuccessfullRequest, setShowSuccessfullRequest] = useState(false);
  const [showFailedRequest, setShowFailedRequest] = useState(false);
  const [showErrorResult, setShowErrorResult] = useState(false);
  const [loading, setLoading] = useState(true);
  const [clicked, setClicked] = useState(false);
  const [image, setImage] = useState();

  const [showCloseIssue, setShowCloseIssue] = useState(false);
  const [showAddMechanic, setShowAddMechanic] = useState(false);
  const [showPause, setShowPause] = useState(false);

  const inputRef = useRef(null);
  const [updatedTechnicians, setUpdatedTechnicians] = useState([]);

  const loadTarget = async () => {
    try {
      const res = await baseRequest.get("/qr/target", { params: { id } });
      if (res.data) {
        setTarget(res.data.records.target);
        if (res.data.records.superiors) {
          setIssue(res.data.records.issue);
          setSuperiors(res.data.records.superiors);
          setFixingMethods(res.data.records.fixingMethods);
        }
        if (res.data.records.technicians) {
          setTechnicians(res.data.records.technicians);
        }
      }
    } catch (error) {
      const { status } = errorHandler(error);
      switch (status) {
        case 404:
          setShowNoTarget(true);
          break;
        default:
          setShowErrorResult(true);
          break;
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    document.title = props.title || "";
  }, [props.title]);

  useEffect(() => {
    loadTarget();
  }, []);

  const loadProblems = async (superiorID) => {
    try {
      const res = await baseRequest.get("/qr/problem/find", {
        params: { superiorID },
      });
      if (res.data) {
        setProblems(Object.values(res.data.records));
      }
    } catch (error) {
      const { status } = errorHandler(error);
      switch (status) {
        case 404:
          setShowFailedRequest(true);
          break;
        default:
          setShowErrorResult(true);
          break;
      }
    }
  };

  const handleSubmit = async (values) => {
    try {
      setClicked(true);
      const res = await baseRequest.post("/qr/issue/open", {
        targetID: id,
        technicians: values.technicians,
      });
      if (res.data) {
        setShowSuccessfullRequest(true);
      }
    } catch (error) {
      const { status } = errorHandler(error);
      switch (status) {
        case 400:
          setShowFailedRequest(true);
          break;
        default:
          setShowErrorResult(true);
      }
    }
  };

  const formik = useFormik({
    initialValues: { technicians: [] },
    onSubmit: handleSubmit,
  });

  const handleUpload = async (blob) => {
    try {
      setClicked(true);
      if (blob && issue._id) {
        const formData = new FormData();
        formData.append("file", blob, "image.jpeg");
        formData.append("id", issue._id);
        const res = await baseRequest.put("/qr/issue/upload", formData);
        if (res.data) {
          setShowSuccessfullRequest(true);
        }
      }
    } catch (error) {
      const { status } = errorHandler(error);
      switch (status) {
        case 400:
          setShowFailedRequest(true);
          break;
        default:
          setShowErrorResult(true);
          break;
      }
    }
  };

  const handlePauseStart = async () => {
    try {
      setClicked(true);
      const res = await baseRequest.put("/qr/issue/pause/start", {
        id: issue._id,
      });
      if (res.data) {
        setShowSuccessfullRequest(true);
      }
    } catch (error) {
      const { status } = errorHandler(error);
      switch (status) {
        case 400:
          setShowFailedRequest(true);
          break;
        default:
          setShowErrorResult(true);
          break;
      }
    }
  };

  const handlePauseStop = async () => {
    try {
      setClicked(true);
      const res = await baseRequest.put("/qr/issue/pause/stop", {
        id: issue._id,
      });
      if (res.data) {
        await loadTarget();
        setClicked(false);
      }
    } catch (error) {
      const { status } = errorHandler(error);
      switch (status) {
        case 400:
          setShowFailedRequest(true);
          break;
        default:
          setShowErrorResult(true);
          break;
      }
    }
  };

  const handleAddMechanic = async () => {
    if (updatedTechnicians.length > 0) {
      try {
        const res = await baseRequest.put("/qr/issue/technicians", {
          id: issue._id,
          technicians: updatedTechnicians,
        });
        if (res.data) {
          setShowSuccessfullRequest(true);
        }
      } catch (error) {
        const { status } = errorHandler(error);
        switch (status) {
          case 400:
            setShowFailedRequest(true);
            break;
          default:
            setShowErrorResult(true);
            break;
        }
      }
    } else {
      setShowFailedRequest(true);
    }
  };

  const handleCloseIssue = async (values) => {
    try {
      if (
        values.superior._id &&
        values.problem._id &&
        values.fixingMethod._id
      ) {
        const data = {
          problemID: values.problem.problem._id,
          fixingMethodID: values.fixingMethod._id,
          id: issue._id,
          comment: values.comment,
        };
        const res = await baseRequest.put("/qr/issue/close", data);
        if (res.data) {
          setShowSuccessfullRequest(true);
        }
      } else {
        setShowFailedRequest(true);
      }
    } catch (error) {
      const { status } = errorHandler(error);
      switch (status) {
        case 400:
          setShowFailedRequest(true);
          break;
        default:
          setShowErrorResult(true);
          break;
      }
    }
  };

  const closeFormik = useFormik({
    initialValues: {
      superior: null,
      problem: null,
      fixingMethod: null,
      comment: "",
    },
    onSubmit: handleCloseIssue,
  });

  return showNoTarget ? (
    <Result
      status="404"
      title="404"
      subTitle="We couldn't find this station. Contact any maintenance team supervisor!"
      content="¡Por favor, comuníquese con cualquiera de los gerentes del equipo de mecánica!"
    />
  ) : showErrorResult || showFailedRequest ? (
    <Result
      status="error"
      title="Something went wrong!"
      subTitle="Refresh the page and try again. If the problem still occurs, please contact to system admin!"
      content="Actualice la página e intente nuevamente. Si el problema persiste, comuníquese con el administrador del sistema."
    />
  ) : showSuccessfullRequest ? (
    <Result
      status="success"
      title="Successfull"
      subTitle="You have successfully fulfilled your request!"
    />
  ) : loading ? (
    <Backdrop open={loading}>
      <CircularProgress size={20} />
    </Backdrop>
  ) : clicked ? (
    <Backdrop open={clicked}>
      <CircularProgress size={20} />
    </Backdrop>
  ) : (
    <Dialog fullScreen={true} open={true} sx={{ textAlign: "center" }}>
      <DialogTitle>
        <Typography fontWeight={700} fontSize={50} color="rgba(247,120,56,0.9)">
          {target?.target}
        </Typography>
        <Typography
          fontSize={35}
          color={colors.ciboInnerGreen[500]}
          fontWeight={700}
        >
          {issue ? undefined : "Open New Issue"}
        </Typography>
      </DialogTitle>

      {issue ? (
        issue.paused === 1 ? (
          <Box width="100%">
            <Button
              onClick={handlePauseStop}
              variant="contained"
              color="secondary"
              sx={{
                color: "#fff",
                fontWeight: 700,
                fontSize: 20,
                width: "60%",
                height: 60,
              }}
            >
              PAUSE STOP
            </Button>
          </Box>
        ) : showCloseIssue ? (
          <Dialog
            fullScreen={true}
            open={true}
            onClose={() => {
              setShowCloseIssue(false);
            }}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
          >
            <DialogTitle id="alert-dialog-title" fontWeight={700} fontSize={18}>
              ISSUE CLOSING FORM
            </DialogTitle>
            <form onSubmit={closeFormik.handleSubmit}>
              <DialogContent>
                <Box
                  display="grid"
                  gap="30px"
                  gridTemplateColumns="repeat(4, minmax(0, 1fr))"
                  sx={{
                    "& > div": {
                      gridColumn: "span 4",
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
                    "& input": {
                      fontSize: 16,
                    },
                    "& textarea": {
                      fontSize: 16,
                    },
                  }}
                >
                  <Autocomplete
                    disableClearable
                    sx={{ gridColumn: "span 4" }}
                    value={closeFormik.values.superior || null}
                    onChange={async (_, value) => {
                      closeFormik.setFieldValue("superior", value);
                      await loadProblems(value._id);
                      closeFormik.setFieldValue("problem", null);
                    }}
                    options={superiors}
                    isOptionEqualToValue={(option, value) =>
                      option._id === value._id
                    }
                    getOptionLabel={(option) => option.superior}
                    renderInput={(params) => (
                      <TextField {...params} label="Superior" name="superior" />
                    )}
                  />
                  <Autocomplete
                    disabled={!Boolean(closeFormik.values.superior?._id)}
                    disableClearable
                    sx={{ gridColumn: "span 4" }}
                    value={closeFormik.values.problem || null}
                    onChange={(_, value) => {
                      closeFormik.setFieldValue("problem", value);
                    }}
                    options={problems}
                    isOptionEqualToValue={(option, value) =>
                      option.problem._id === value.problem._id
                    }
                    getOptionLabel={(option) => option.problem?.problem}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Problem"
                        name="problem"
                        onBlur={closeFormik.handleBlur}
                      />
                    )}
                  />
                  <Autocomplete
                    disableClearable
                    sx={{ gridColumn: "span 4" }}
                    value={closeFormik.values.fixingMethod || null}
                    onChange={(_, value) => {
                      closeFormik.setFieldValue("fixingMethod", value);
                    }}
                    options={fixingMethods}
                    isOptionEqualToValue={(option, value) =>
                      option._id === value._id
                    }
                    getOptionLabel={(option) => option.fixingMethod}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Fixing Method"
                        name="fixingMethod"
                        onBlur={closeFormik.handleBlur}
                      />
                    )}
                  />

                  <TextField
                    multiline
                    rows={7}
                    id="comment"
                    value={closeFormik.values.comment}
                    onChange={closeFormik.handleChange}
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
                  sx={{
                    width: "35%",
                    height: 50,
                    fontWeight: 700,
                    fontSize: 18,
                  }}
                  variant="contained"
                  color="error"
                  onClick={() => {
                    setShowCloseIssue(false);
                    closeFormik.resetForm();
                  }}
                >
                  CANCEL
                </Button>
                <Button
                  type="submit"
                  sx={{
                    width: "35%",
                    height: 50,
                    fontWeight: 700,
                    fontSize: 18,
                  }}
                  variant="contained"
                  color="info"
                  autoFocus
                >
                  OK
                </Button>
              </DialogActions>
            </form>
          </Dialog>
        ) : (
          <Box width="100%">
            <UploadImage
              onChange={handleUpload}
              mode="custom"
              customRef={inputRef}
            />

            <Dialog
              fullScreen={true}
              open={showAddMechanic}
              onClose={() => {
                setShowPause(false);
              }}
              aria-labelledby="alert-dialog-title"
              aria-describedby="alert-dialog-description"
            >
              <DialogTitle
                id="alert-dialog-title"
                fontWeight={700}
                fontSize={18}
              >
                TECHNICIANS
              </DialogTitle>
              <DialogContent>
                <TechnicianCheckBoxForm
                  initialValue={issue.techniciansID}
                  technicians={technicians}
                  onChange={(values) => {
                    setUpdatedTechnicians(values);
                  }}
                />
              </DialogContent>
              <DialogActions
                sx={{
                  justifyContent: "space-around",
                }}
              >
                <Button
                  sx={{
                    width: "40%",
                    height: 70,
                    fontWeight: 700,
                    fontSize: 18,
                  }}
                  variant="contained"
                  color="error"
                  onClick={() => {
                    setShowAddMechanic(false);
                  }}
                >
                  CLOSE
                </Button>
                <Button
                  sx={{
                    width: "40%",
                    height: 70,
                    fontWeight: 700,
                    fontSize: 18,
                  }}
                  variant="contained"
                  color="info"
                  onClick={handleAddMechanic}
                  autoFocus
                >
                  UPDATE
                </Button>
              </DialogActions>
            </Dialog>

            <Dialog
              sx={{ py: 20 }}
              fullScreen={true}
              open={showPause}
              onClose={() => {
                setShowPause(false);
              }}
              aria-labelledby="alert-dialog-title"
              aria-describedby="alert-dialog-description"
            >
              <DialogTitle id="alert-dialog-title" fontWeight={600}>
                Confirm the action
              </DialogTitle>
              <DialogContent>
                <DialogContentText id="alert-dialog-description" fontSize={20}>
                  Do you really want to pause this issue?
                </DialogContentText>
              </DialogContent>
              <DialogActions
                sx={{
                  justifyContent: "space-around",
                  pb: 10,
                }}
              >
                <Button
                  sx={{
                    width: "40%",
                    height: 70,
                    fontWeight: 700,
                    fontSize: 18,
                  }}
                  variant="contained"
                  color="error"
                  onClick={() => {
                    setShowPause(false);
                  }}
                >
                  NO
                </Button>
                <Button
                  sx={{
                    width: "40%",
                    height: 70,
                    fontWeight: 700,
                    fontSize: 18,
                  }}
                  variant="contained"
                  color="info"
                  onClick={handlePauseStart}
                  autoFocus
                >
                  YES
                </Button>
              </DialogActions>
            </Dialog>

            <Stack direction="column" spacing={2} px={4}>
              <ButtonBase
                onClick={() => {
                  setShowCloseIssue(true);
                }}
                sx={{
                  border: ".1px solid black",
                  p: 1,
                  borderRadius: 4,
                }}
              >
                <Stack sx={{ width: "80%" }}>
                  <DoneWorkingSVG />
                  <Typography fontWeight={700} fontSize={16}>
                    CLOSE ISSUE
                  </Typography>
                </Stack>
              </ButtonBase>

              <ButtonBase
                onClick={() => {
                  setShowAddMechanic(true);
                }}
                sx={{ border: ".1px solid black", p: 1, borderRadius: 4 }}
              >
                <Stack>
                  <MechanicSVG />
                  <Typography fontWeight={700} fontSize={16}>
                    UPDATE MECHANIC
                  </Typography>
                </Stack>
              </ButtonBase>

              <ButtonBase
                aria-hidden="true"
                sx={{
                  border: ".1px solid black",
                  p: 1,
                  borderRadius: 4,
                }}
                onClick={() => {
                  inputRef.current?.click();
                }}
              >
                <Stack sx={{ width: "60%" }}>
                  {image ? (
                    <img
                      src={URL.createObjectURL(image)}
                      alt="cropped_image"
                      width={178}
                    />
                  ) : issue.image ? (
                    <img
                      style={{ alignSelf: "center" }}
                      src={
                        issue.image !== ""
                          ? "http://" + IP + "/" + issue.image
                          : undefined
                      }
                      alt="cropped_image"
                      width={178}
                    />
                  ) : (
                    <TakePhotoSVG />
                  )}
                  <Typography fontWeight={700} fontSize={16}>
                    TAKE PICTURE
                  </Typography>
                </Stack>
              </ButtonBase>

              {issue.paused === 2 ? undefined : (
                <ButtonBase
                  onClick={() => {
                    setShowPause(true);
                  }}
                  sx={{
                    border: ".1px solid black",
                    p: 1,
                    borderRadius: 4,
                  }}
                >
                  <Stack sx={{ width: "60%" }}>
                    <PauseSVG />
                    <Typography fontWeight={700} fontSize={16}>
                      PAUSE
                    </Typography>
                  </Stack>
                </ButtonBase>
              )}
            </Stack>
          </Box>
        )
      ) : technicians ? (
        <Box width="100%" sx={{ display: "flex", justifyContent: "center" }}>
          <form onSubmit={formik.handleSubmit}>
            <TechnicianCheckBoxForm
              technicians={technicians}
              onChange={(values) => {
                formik.setFieldValue("technicians", values);
              }}
            />
            <Button
              type="submit"
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
              Start
            </Button>
          </form>
        </Box>
      ) : (
        <Result
          status="error"
          title="Server response error!"
          subTitle="Refresh the page and try again. If the problem still occurs, please contact to system admin!"
          content="Actualice la página e intente nuevamente. Si el problema persiste, comuníquese con el administrador del sistema."
        />
      )}
    </Dialog>
  );
};

const TechnicianCheckBoxForm = ({
  technicians,
  onChange,
  initialValue = null,
}) => {
  const [checkedList, setCheckedList] = useState({});
  const [_done, _set] = useState(false);

  const handleClick = (id) => {
    const { ...values } = checkedList;
    values[id] = !Boolean(values[id]);
    setCheckedList(values);

    const arr_values = [];
    for (let key in values) {
      if (values[key]) {
        arr_values.push(key);
      }
    }
    onChange(arr_values);
  };

  useEffect(() => {
    if (initialValue && !_done) {
      _set(true);
      setCheckedList(
        initialValue.reduce((acc, curr) => ((acc[curr] = true), acc), {}),
      );
    }
  }, [initialValue]);

  return (
    <Stack direction="column" spacing={1}>
      {technicians.map((technician) => {
        const status = Boolean(checkedList[technician._id]);
        return (
          <ButtonBase
            disableRipple
            key={technician._id}
            sx={{
              display: "inline-block !important",
              p: 1,
              borderRadius: 10,
              backgroundColor: status ? "rgba(0,0,0,0.1)" : undefined,
            }}
            onClick={() => handleClick(technician._id)}
          >
            <Stack
              direction="row"
              spacing={1}
              sx={{ alignItems: "center", width: "100%" }}
            >
              {status ? (
                <Avatar
                  src={
                    "http://" +
                    IP +
                    "/uploads/thumbnail-" +
                    technician.image?.substring(
                      technician.image?.indexOf("/") + 1,
                    )
                  }
                />
              ) : (
                <Box
                  width={40}
                  height={40}
                  sx={{
                    backgroundColor: "#bdbdbd",
                    borderRadius: 20,
                    alignContent: "center",
                    textAlign: "-webkit-center",
                  }}
                >
                  <Box
                    width={20}
                    height={20}
                    sx={{ backgroundColor: "#fff", borderRadius: 10 }}
                  />
                </Box>
              )}
              <Typography
                color={status ? "green" : "rgba(0,0,0,0.3)"}
                fontWeight={700}
                fontSize={18}
              >
                {(technician.name + " " + technician.surname).toUpperCase()}
              </Typography>
            </Stack>
          </ButtonBase>
        );
      })}
    </Stack>
  );
};

export default QRIssueManagementPage;
