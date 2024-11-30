import {
  Backdrop,
  ButtonBase,
  CircularProgress,
  Dialog,
  DialogTitle,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import baseRequest from "../../core/baseRequest";
import { errorHandler } from "../../core/errorHandler";
import Result from "../Result";

import { ReactComponent as CallCenterSVG } from "../../images/callCenter.svg";

const QROperatorIssueRequestPage = (props) => {
  const params = useParams();
  const { id } = params;

  const [target, setTarget] = useState();
  const [showExistedIssueResult, setShowExistedIssueResult] = useState(false);
  const [showSuccessfullRequest, setShowSuccessfullRequest] = useState(false);
  const [showNoTargetRequest, setNoTargetRequest] = useState(false);
  const [showFailedRequest, setShowFailedRequest] = useState(false);
  const [showErrorResult, setShowErrorResult] = useState(false);
  const [clicked, setClicked] = useState(false);

  const loadTarget = async () => {
    try {
      const res = await baseRequest.get("/qr/operator", { params: { id } });
      if (res.status === 200) {
        setTarget(res.data.records.target);
      }
    } catch (error) {
      const { status } = errorHandler(error);
      switch (status) {
        case 400:
          setShowExistedIssueResult(true);
          setTarget({});
          break;
        case 404:
          setNoTargetRequest(true);
          setTarget({});
          break;
        default:
          setShowErrorResult(true);
          break;
      }
    }
  };

  const handleRequest = async () => {
    try {
      setClicked(true);
      if (!clicked) {
        const res = await baseRequest.post("/qr/operator/request", { id });
        if (res.status === 201) {
          setShowSuccessfullRequest(true);
        }
      }
    } catch (error) {
      setShowFailedRequest(true);
    }
  };

  useEffect(() => {
    document.title = props.title || "";
  }, [props.title]);

  useEffect(() => {
    loadTarget();
  }, []);

  return showNoTargetRequest ? (
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
  ) : showExistedIssueResult ? (
    <Result
      status="warning"
      title="Warning"
      subTitle="We know there is an issue on this machine!"
      content="¡El equipo mecánico sabe que hay un problema en esta máquina!"
    />
  ) : showSuccessfullRequest ? (
    <Result
      status="success"
      title="Successfull"
      subTitle="You have successfully requested an issue!"
    />
  ) : clicked ? (
    <Backdrop open={clicked}>
      <CircularProgress size={20} />
    </Backdrop>
  ) : (
    <Dialog fullScreen={true} open={true} sx={{ textAlign: "center" }}>
      <DialogTitle
        sx={{ fontWeight: 700, fontSize: 60, color: "rgba(247,120,56,0.9)" }}
      >
        {target?.target}
      </DialogTitle>
      <ButtonBase
        onClick={handleRequest}
        sx={{
          width: 400,
          height: 400,
          borderRadius: "50%",
          alignSelf: "center",
          alignContent: "center",
        }}
      >
        <CallCenterSVG style={{ width: "90%" }} />
      </ButtonBase>
      <Stack sx={{ px: 2 }}>
        <Typography fontWeight={600} fontSize={20}>
          Call Mechanics by pressing on the image!
        </Typography>
        <Typography fontWeight={600} fontSize={18}>
          ¡Llama a los mecánicos presionando en la imagen!
        </Typography>
      </Stack>
    </Dialog>
  );
};

export default QROperatorIssueRequestPage;
