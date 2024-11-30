import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PDFViewer } from "@react-pdf/renderer";
import moment from "moment-timezone";

import { useSnackbar } from "notistack";
import MaintenanceReportDocument from "./maintenanceReportDocument";
import { TIME } from "../../utils/const";
import baseRequest from "../../core/baseRequest";
import useControl from "../../hooks/useControl";
import useSignOut from "../../hooks/useSignOut";
import { errorHandler } from "../../core/errorHandler";

const MaintenanceReportPage = (props) => {
  const [auth] = useControl();
  const [controller] = useSignOut();

  const [data, setData] = useState();
  const [start, setStart] = useState(
    moment().startOf("isoweek").tz("America/New_York"),
  );
  const [end, setEnd] = useState(
    moment().endOf("isoweek").tz("America/New_York"),
  );
  const [weeks, setWeeks] = useState();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

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

  const loadMaintenanceReportData = async (res) => {
    try {
      const res = await baseRequest.post("/report/maintenance", {
        range: { start, end },
      });
      if (auth(res)) {
        const data = res.data;
        if (window.state) {
          data.records.issues = data.records.issues.filter(
            (issue) =>
              window.state.issueTypes.includes(issue.fixingMethod.issueType) &&
              window.state.targets.includes(issue.target.target),
          );
        }
        if (data.records.issues.length === 0) {
          enqueueSnackbar("There is no data to show!", {
            variant: "error",
          });
        }
        console.log(data.records);
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
    loadMaintenanceReportData();
  }, []);

  useEffect(() => {
    //This is for reloading home page
    const interval = setInterval(() => {
      loadMaintenanceReportData();
    }, TIME);

    return () => clearInterval(interval);
  }, []);

  return data && data.records.issues.length > 0 ? (
    <PDFViewer showToolbar={true} style={{ width: "100%", height: "1000px" }}>
      <MaintenanceReportDocument
        data={data}
        weeks={weeks}
        issueTypes={window.state ? window.state.issueTypes : ["M", "PM", "P"]}
      />
    </PDFViewer>
  ) : null;
};

export default MaintenanceReportPage;
