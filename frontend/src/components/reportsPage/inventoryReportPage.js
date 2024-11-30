import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { PDFViewer } from "@react-pdf/renderer";

import { useSnackbar } from "notistack";
import InventoryReportDocument from "./inventoryReportDocument";
import { TIME } from "../../utils/const";
import baseRequest from "../../core/baseRequest";

import useControl from "../../hooks/useControl";
import useSignOut from "../../hooks/useSignOut";
import { errorHandler } from "../../core/errorHandler";

const InventoryReportPage = (props) => {
  const [auth] = useControl();
  const [controller] = useSignOut();

  const [data, setData] = useState();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { search } = useLocation();
  const parameters = new URLSearchParams(search);

  const loadInventoryReportData = async () => {
    try {
      const res = await baseRequest.post("/report/inventory", {
        facility: parameters.get("facility").charAt(0),
      });

      if (auth(res)) {
        const data = res.data;
        setData(data);
      }
    } catch (error) {
      const { data, status } = errorHandler();
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
    if (
      parameters.get("facility") === "Vreeland" ||
      parameters.get("facility") === "Madison"
    ) {
      loadInventoryReportData();
    }
  }, []);

  useEffect(() => {
    //This is for reloading home page
    const interval = setInterval(() => {
      loadInventoryReportData();
    }, TIME);

    return () => clearInterval(interval);
  }, []);

  return data ? (
    <PDFViewer showToolbar={true} style={{ width: "100%", height: "1000px" }}>
      <InventoryReportDocument
        data={data}
        facility={parameters.get("facility")}
        parameter={window.state?.parameter}
      />
    </PDFViewer>
  ) : (
    "No Content"
  );
};

export default InventoryReportPage;
