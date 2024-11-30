import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PDFViewer } from "@react-pdf/renderer";
import moment from "moment-timezone";
import { useSnackbar } from "notistack";

import TechniciansReportDocument from "./techniciansReportDocument";
import { TIME } from "../../utils/const";
import baseRequest from "../../core/baseRequest";
import useControl from "../../hooks/useControl";
import useSignOut from "../../hooks/useSignOut";
import { errorHandler } from "../../core/errorHandler";

const TechniciansReportPage = (props) => {
  const [data, setData] = useState();
  const [start, setStart] = useState(
    moment()
      .startOf("week")
      .add(1, "days")
      .add("4", "hours")
      .tz("America/New_York"),
  );
  const [end, setEnd] = useState(
    moment()
      .endOf("week")
      .add(1, "day")
      .add("4", "hours")
      .tz("America/New_York"),
  );
  const [weeks, setWeeks] = useState();

  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [auth] = useControl();
  const [controller] = useSignOut();

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

  useEffect(() => {
    document.title = props.title || "";
  }, [props.title]);

  useEffect(() => {
    loadTechniciansReportData();
  }, []);

  useEffect(() => {
    //This is for reloading home page
    const interval = setInterval(() => {
      loadTechniciansReportData();
    }, TIME);

    return () => clearInterval(interval);
  }, []);

  return data && data.issues.length > 0 ? (
    <PDFViewer showToolbar={true} style={{ width: "100%", height: "1000px" }}>
      <TechniciansReportDocument data={data} weeks={weeks} />
    </PDFViewer>
  ) : null;
};

export default TechniciansReportPage;
