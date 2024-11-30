import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";
import { PDFViewer } from "@react-pdf/renderer";
import moment from "moment-timezone";

import CostReportDocument from "./costReportDocument";
import { TIME } from "../../utils/const";
import baseRequest from "../../core/baseRequest";
import MaintenanceReportDocument from "./maintenanceReportDocument";
import TechniciansReportDocument from "./techniciansReportDocument";
import { errorHandler } from "../../core/errorHandler";
import useControl from "../../hooks/useControl";
import useSignOut from "../../hooks/useSignOut";

const CustomReportPage = (props) => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [auth] = useControl();
  const [controller] = useSignOut();

  const [data, setData] = useState();
  const [start, setStart] = useState(moment(window.state.start));
  const [end, setEnd] = useState(moment(window.state.end).add(1, "days"));

  const [weeks, setWeeks] = useState();

  const getWeeks = () => {
    var daysOfYear = [];
    for (
      var d = start.toDate();
      d <= end.toDate();
      d.setDate(d.getDate() + 1)
    ) {
      daysOfYear.push(moment(d));
    }
    daysOfYear.pop();
    setWeeks(daysOfYear);
  };

  const loadTechniciansReportData = async () => {
    try {
      const res = await baseRequest.post("/report/technicians", {
        range: { start, end },
      });
      if (auth(res)) {
        const data = res.data;
        if (window.state) {
          var out = [];
          data.records.issues.forEach((item) => {
            return item.techniciansID.forEach((technicianID) => {
              if (
                window.state?.technicians.filter(
                  (tech) => tech._id === technicianID,
                )[0]._id
              ) {
                out.push({
                  technician: window.state?.technicians.filter(
                    (tech) => tech._id === technicianID,
                  )[0],
                  ...item,
                });
              }
            });
          });
        }
        if (out.length === 0) {
          enqueueSnackbar("There is no data to show!", {
            variant: "error",
          });
        }
        delete data.records.issues;
        setData({ issues: out, ...data.records });
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

  const loadData = async (res) => {
    if (window.state.type === "maintenance") {
      loadMaintenanceReportData();
    } else if (window.state.type === "cost") {
      loadCostReportData();
    } else if (window.state.type === "technicians") {
      loadTechniciansReportData();
    }
    setData(data);
  };

  const loadCustomReportData = async () => {
    loadData();
  };

  useEffect(() => {
    document.title = props.title || "";
  }, [props.title]);

  useEffect(() => {
    if (window.state.start && window.state.end) {
      loadCustomReportData();
    }
  }, []);

  useEffect(() => {
    //This is for reloading home page
    const interval = setInterval(() => {
      loadCustomReportData();
    }, TIME);

    return () => clearInterval(interval);
  }, []);

  return data ? (
    <PDFViewer showToolbar={true} style={{ width: "100%", height: "1000px" }}>
      {(function () {
        if (window.state.type === "maintenance") {
          return (
            <MaintenanceReportDocument
              data={data}
              weeks={weeks}
              custom
              issueTypes={window.state.issueTypes}
            />
          );
        } else if (window.state.type === "cost") {
          return (
            <CostReportDocument
              data={data}
              weeks={weeks}
              custom
              issueTypes={window.state.issueTypes}
            />
          );
        } else if (window.state.type === "technicians") {
          return <TechniciansReportDocument data={data} weeks={weeks} custom />;
        }
      })()}
    </PDFViewer>
  ) : null;
};

export default CustomReportPage;
