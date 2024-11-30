import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";
import { PDFViewer } from "@react-pdf/renderer";
import moment from "moment-timezone";

import CostReportDocument from "./costReportDocument";
import { TIME } from "../../utils/const";
import baseRequest from "../../core/baseRequest";
import { errorHandler } from "../../core/errorHandler";
import useSignOut from "../../hooks/useSignOut";
import useControl from "../../hooks/useControl";

const CostReportPage = (props) => {
  const { enqueueSnackbar } = useSnackbar();
  const [controller] = useSignOut();
  const [auth] = useControl();

  const [data, setData] = useState();
  const [start, setStart] = useState(
    moment().startOf("isoweek").tz("America/New_York"),
  );
  const [end, setEnd] = useState(
    moment().endOf("isoweek").tz("America/New_York"),
  );
  const [weeks, setWeeks] = useState();
  const navigate = useNavigate();

  const getWeeks = () => {
    var daysOfYear = [];
    for (
      var d = start.toDate();
      d <= end.toDate();
      d.setDate(d.getDate() + 1)
    ) {
      daysOfYear.push(moment(d));
    }
    setWeeks(daysOfYear);
  };

  const loadCostReportData = async () => {
    try {
      const res = await baseRequest.post("/report/cost", {
        range: { start, end },
      });
      if (auth(res)) {
        const data = res.data;
        if (window.state) {
          data.records.logs = data.records.logs
            .filter((log) => window.state?.targets.includes(log.target.target))
            .filter((log) =>
              log?.item?.vendors.some((i) =>
                window.state?.vendors.includes(i.vendor),
              ),
            );
        }
        if (data.records.logs.length === 0) {
          enqueueSnackbar("There is no data to show!", {
            variant: "error",
          });
        }
        setData(data);
        getWeeks();
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
    loadCostReportData();
  }, []);

  useEffect(() => {
    //This is for reloading home page
    const interval = setInterval(() => {
      loadCostReportData();
    }, TIME);

    return () => clearInterval(interval);
  }, []);

  return data && data.records.logs.length > 0 ? (
    <PDFViewer showToolbar={true} style={{ width: "100%", height: "1000px" }}>
      <CostReportDocument data={data} weeks={weeks} />
    </PDFViewer>
  ) : null;
};

export default CostReportPage;
