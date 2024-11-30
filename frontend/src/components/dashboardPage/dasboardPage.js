import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useSnackbar } from "notistack";

import moment from "moment-timezone";

import { Box, IconButton, Typography, useTheme } from "@mui/material";

import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import PointOfSaleIcon from "@mui/icons-material/PointOfSale";
import TroubleshootOutlinedIcon from "@mui/icons-material/TroubleshootOutlined";
import EngineeringIcon from "@mui/icons-material/Engineering";
import PaidIcon from "@mui/icons-material/Paid";

import { tokens } from "../../theme";

import Header from "../../components/Header";
import LineChart from "../../components/LineChart";
import BarChart from "../../components/BarChart";
import PieChart from "../../components/PieChart";
import StatBox from "../../components/StatBox";

import baseRequest from "../../core/baseRequest";

import { minuteDifference } from "../../utils/helpers";

import loadingGIF from "../../images/fastLogo.gif";
import { errorHandler } from "../../core/errorHandler";
import useControl from "../../hooks/useControl";
import useSignOut from "../../hooks/useSignOut";

const DashboardPage = (props) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [auth] = useControl();
  const [controller] = useSignOut();

  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [barData, setBarData] = useState([]);
  const [lineData, setLineData] = useState([]);
  const [timePieData, setTimePieData] = useState([]);
  const [quantityPieData, setQuantityPieData] = useState([]);

  const [transactionData, setTransactionData] = useState([
    { issues: [], costs: [] },
  ]);

  const [issueStats, setIssueStats] = useState({ total: "", percent: 0 });
  const [spentMoneyStats, setSpentMoneyStats] = useState({
    total: "",
    percent: 0,
  });

  const [totalInventoryStats, setTotalInventoryStats] = useState({
    total: "",
    percent: 0,
  });

  const [laborCostStats, setLaborCostStats] = useState({
    total: "",
    percent: 0,
  });

  const [totalExpense, setTotalExpense] = useState("");

  const [loading, setLoading] = useState(false);

  const convert2Economic = (number) => {
    return number.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
  };

  useEffect(() => {
    document.title = props.title || "";
  }, [props.title]);

  const loadSpentStat = (currentWeek, lastWeek) => {
    const currentWeekSpentMoney = currentWeek.logs.reduce((acc, item) => {
      return acc + (item.wanted_count - item.returnQuantity) * item.item.price;
    }, 0);

    const lastWeekSpentMoney = lastWeek.logs.reduce((acc, item) => {
      return acc + (item.wanted_count - item.returnQuantity) * item.item.price;
    }, 0);

    setSpentMoneyStats({
      total: "$" + convert2Economic(Math.floor(currentWeekSpentMoney)),
      percent:
        (1 -
          Math.floor(currentWeekSpentMoney) / Math.floor(lastWeekSpentMoney)) *
        -1,
    });
  };

  const loadLaborCostStat = (currentWeek, lastWeek) => {
    const currentWeekLaborCost = currentWeek.issues.reduce((acc, item) => {
      const minute = minuteDifference(item.start, item.stop);
      return acc + item.technicians.length * 20 * (minute / 60);
    }, 0);
    const lastWeekLaborCost = lastWeek.issues.reduce((acc, item) => {
      const minute = minuteDifference(item.start, item.stop);
      return acc + item.technicians.length * 20 * (minute / 60);
    }, 0);

    setLaborCostStats({
      total: "$" + convert2Economic(Math.floor(currentWeekLaborCost)),
      percent:
        (1 - Math.floor(currentWeekLaborCost) / Math.floor(lastWeekLaborCost)) *
        -1,
    });
  };

  const loadTransactionData = (currentWeek) => {
    setTransactionData({
      issues: currentWeek.issues
        .sort((a, b) => {
          return (
            minuteDifference(b.start, b.stop) -
            minuteDifference(a.start, a.stop)
          );
        })
        .slice(0, 8),
      costs: currentWeek.issues
        .sort((a, b) => {
          return (
            minuteDifference(b.start, b.stop) -
            minuteDifference(a.start, a.stop)
          );
        })
        .slice(0, 8)
        .map((item) => {
          const minute = minuteDifference(item.start, item.stop);
          return (
            item.technicians.length * 20 * (minute / 60) +
            currentWeek.logs
              .filter((log) => log.issueID === item._id)
              .reduce((acc, flog) => {
                return (
                  acc +
                  (flog.wanted_count - flog.returnQuantity) * flog.item.price
                );
              }, 0)
          );
        }),
    });
  };

  const loadLineChart = (currentWeek, lastWeek) => {
    const vreelandObject = {};
    const madisonObject = {};

    [...lastWeek.issues.reverse(), ...currentWeek.issues.reverse()]
      .filter((issue) => issue.target.facility === "V")
      .map((item) => {
        const day = moment(item.createdAt).format("MM/DD");
        const minute = minuteDifference(item.start, item.stop);
        if (vreelandObject[day]) {
          vreelandObject[day] = Math.floor(
            vreelandObject[day] +
              20 * item.technicians.length * (minute / 60) +
              [...currentWeek.logs, lastWeek.logs]
                .filter((log) => log.issueID === item._id)
                .reduce((acc, flog) => {
                  return (
                    acc +
                    (flog.wanted_count - flog.returnQuantity) * flog.item.price
                  );
                }, 0),
          );
        } else {
          vreelandObject[day] = Math.floor(
            20 * item.technicians.length * (minute / 60) +
              [...currentWeek.logs, lastWeek.logs]
                .filter((log) => log.issueID === item._id)
                .reduce((acc, flog) => {
                  return (
                    acc +
                    (flog.wanted_count - flog.returnQuantity) * flog.item.price
                  );
                }, 0),
          );
        }
      });

    [...lastWeek.issues.reverse(), ...currentWeek.issues.reverse()]
      .filter((issue) => issue.target.facility === "M")
      .map((item) => {
        const day = moment(item.createdAt).format("MM/DD");
        const minute = minuteDifference(item.start, item.stop);
        if (madisonObject[day]) {
          madisonObject[day] = Math.floor(
            madisonObject[day] +
              20 * item.technicians.length * (minute / 60) +
              [...currentWeek.logs, lastWeek.logs]
                .filter((log) => log.issueID === item._id)
                .reduce((acc, flog) => {
                  return (
                    acc +
                    (flog.wanted_count - flog.returnQuantity) * flog.item.price
                  );
                }, 0),
          );
        } else {
          madisonObject[day] = Math.floor(
            20 * item.technicians.length * (minute / 60) +
              [...currentWeek.logs, lastWeek.logs]
                .filter((log) => log.issueID === item._id)
                .reduce((acc, flog) => {
                  return (
                    acc +
                    (flog.wanted_count - flog.returnQuantity) * flog.item.price
                  );
                }, 0),
          );
        }
      });

    setLineData([
      {
        id: "Vreeland",
        color: tokens("dark").ciboOuterGreen[500],
        data: Object.keys(vreelandObject).map((item) => {
          return { x: item, y: vreelandObject[item] };
        }),
      },
      {
        id: "Madison",
        color: tokens("dark").yoggieRed[500],
        data: Object.keys(vreelandObject).map((item) => {
          return { x: item, y: madisonObject[item] };
        }),
      },
    ]);

    setTotalExpense(
      "$" +
        convert2Economic(
          Math.floor(
            Object.keys(vreelandObject).reduce((acc, item) => {
              return acc + vreelandObject[item] + madisonObject[item];
            }, 0),
          ),
        ),
    );
  };

  const loadPieChart = (currentWeek) => {
    let uniqueTargets = [
      ...new Set(currentWeek.issues.map((item) => item.target.target)),
    ];

    const timePieData = uniqueTargets
      .map((target) => {
        return {
          target: target,
          workTime: currentWeek.issues
            .filter(
              (item) =>
                item.target.target === target &&
                item.fixingMethod.issueType === "M",
            )
            .reduce((acc, item) => {
              return acc + minuteDifference(item.start, item.stop);
            }, 0),
        };
      })
      .sort((a, b) => b.workTime - a.workTime)
      .slice(0, 5);

    const quantityPieData = uniqueTargets
      .map((target) => {
        return {
          target: target,
          quantity: currentWeek.issues.filter(
            (item) =>
              item.target.target === target &&
              item.fixingMethod.issueType === "M",
          ).length,
        };
      })
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    const pieColors = [
      "hsl(104, 70%, 50%)",
      "hsl(162, 70%, 50%)",
      "hsl(291, 70%, 50%)",
      "hsl(229, 70%, 50%)",
      "hsl(344, 70%, 50%)",
    ];

    setTimePieData(
      timePieData.map((item, index) => {
        return {
          id: item.target,
          label: item.target,
          value: item.workTime,
          color: pieColors[index],
        };
      }),
    );

    setQuantityPieData(
      quantityPieData.map((item, index) => {
        return {
          id: item.target,
          label: item.target,
          value: item.quantity,
          color: pieColors[index],
        };
      }),
    );
  };

  const loadBarChart = (currentWeek) => {
    var out = [];
    currentWeek.issues.forEach((item) => {
      return item.technicians.forEach((technician) => {
        out.push({
          technician,
          ...item,
          createdAt: moment(item.createdAt).format("MM/DD"),
        });
      });
    });

    out = out.reduce((group, product) => {
      const { createdAt } = product;
      group[createdAt] = group[createdAt] ?? [];
      group[createdAt].push(product);
      return group;
    }, {});

    setBarData(
      Object.keys(out)
        .map((outKey) => {
          const temp = out[outKey];
          return {
            id: outKey,
            data: [...new Set(temp.map((issue) => issue.technician))]
              .map((technician) => {
                return {
                  x: technician,
                  y: temp
                    .filter((item) => item.technician === technician)
                    .reduce((acc, item) => {
                      return acc + minuteDifference(item.start, item.stop);
                    }, 0),
                };
              })
              .sort((a, b) => b.workTime - a.workTime)
              .slice(0, 2),
          };
        })
        .sort((a, b) => {
          return b.id.localeCompare(a.id);
        }),
    );
  };

  const loadDashboard = async (response) => {
    const res = await baseRequest.post("/dashboard", {});
    const data = res.data;
    const products = data.products;
    const lastWeek = data.lastWeek;
    const currentWeek = data.currentWeek;
    setLoading(true);

    const totalInventory = products.reduce((acc, product) => {
      return acc + Number(product.total_price);
    }, 0);

    setTotalInventoryStats({
      total: convert2Economic(Math.floor(totalInventory)),
      percent: totalInventory / 1161163.6 - 1,
    });

    loadSpentStat(currentWeek, lastWeek);

    setIssueStats({
      total: currentWeek.issues.length,
      percent: (1 - currentWeek.issues.length / lastWeek.issues.length) * -1,
    });

    loadLaborCostStat(currentWeek, lastWeek);

    loadTransactionData(currentWeek);

    loadLineChart(currentWeek, lastWeek);
    loadPieChart(currentWeek);
    loadBarChart(currentWeek);
  };

  const loadDashboardPage = async () => {
    try {
      const res = await baseRequest.post("/dashboard", {});
      if (auth(res)) {
        await loadDashboard(res);
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
    loadDashboardPage();
  }, []);

  return !loading ? (
    <img
      alt="loading_gif"
      style={{
        position: "absolute",
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        margin: "auto",
      }}
      src={loadingGIF}
      width={350}
    />
  ) : (
    <Box m="20px">
      {/* HEADER */}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header title="DASHBOARD" subtitle="Welcome to your dashboard" />
      </Box>

      {/* GRID & CHARTS */}
      <Box
        display="grid"
        gridTemplateColumns="repeat(12, 1fr)"
        gridAutoRows="140px"
        gap="20px"
      >
        {/* ROW 1 */}
        <Box
          gridColumn="span 3"
          backgroundColor={colors.primary[400]}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <StatBox
            title={issueStats.total}
            subtitle="Issues Solved"
            percent={issueStats.percent}
            reversedColor={true}
            icon={
              <TroubleshootOutlinedIcon
                sx={{ color: colors.ciboInnerGreen[600], fontSize: "26px" }}
              />
            }
          />
        </Box>
        <Box
          gridColumn="span 3"
          backgroundColor={colors.primary[400]}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <StatBox
            title={spentMoneyStats.total}
            subtitle="Spent Money"
            percent={spentMoneyStats.percent}
            reversedColor={true}
            icon={
              <PaidIcon
                sx={{ color: colors.ciboInnerGreen[600], fontSize: "26px" }}
              />
            }
          />
        </Box>
        <Box
          gridColumn="span 3"
          backgroundColor={colors.primary[400]}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <StatBox
            title={"$" + totalInventoryStats.total}
            subtitle="Total Inventory"
            percent={totalInventoryStats.percent}
            icon={
              <PointOfSaleIcon
                sx={{ color: colors.ciboInnerGreen[600], fontSize: "26px" }}
              />
            }
          />
        </Box>
        <Box
          gridColumn="span 3"
          backgroundColor={colors.primary[400]}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <StatBox
            title={laborCostStats.total}
            subtitle="Average Labor Cost"
            percent={laborCostStats.percent}
            reversedColor={true}
            icon={
              <EngineeringIcon
                sx={{ color: colors.ciboInnerGreen[600], fontSize: "26px" }}
              />
            }
          />
        </Box>

        {/* ROW 2 */}
        <Box
          gridColumn="span 8"
          gridRow="span 2"
          backgroundColor={colors.primary[400]}
        >
          <Box
            mt="25px"
            p="0 30px"
            display="flex "
            justifyContent="space-between"
            alignItems="center"
          >
            <Box>
              <Typography
                variant="h5"
                fontWeight="600"
                color={colors.grey[100]}
              >
                Total Expense
              </Typography>
              <Typography
                variant="h3"
                fontWeight="bold"
                color={colors.ciboInnerGreen[500]}
              >
                {totalExpense}
              </Typography>
            </Box>
            <Box>
              <IconButton>
                <DownloadOutlinedIcon
                  sx={{ fontSize: "26px", color: colors.ciboInnerGreen[500] }}
                />
              </IconButton>
            </Box>
          </Box>
          <Box height="250px" m="-20px 0 0 0">
            <LineChart isDashboard={true} data={lineData} />
          </Box>
        </Box>
        <Box
          gridColumn="span 4"
          gridRow="span 2"
          backgroundColor={colors.primary[400]}
          overflow="auto"
        >
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            borderBottom={`2px solid ${colors.primary[500]}`}
            colors={colors.grey[100]}
            p="15px"
          >
            <Typography color={colors.grey[100]} variant="h5" fontWeight="600">
              Recent Important Issues
            </Typography>
          </Box>
          {transactionData?.issues?.map((transaction, i) => (
            <Box
              key={`${i}`}
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              borderBottom={`1px solid ${colors.primary[500]}`}
              p="15px"
            >
              <Box sx={{ width: "120px" }}>
                <Typography
                  color={colors.ciboInnerGreen[500]}
                  variant="h5"
                  fontWeight="600"
                >
                  {transaction?.target?.target}
                </Typography>
                <Typography color={colors.grey[100]}>
                  {transaction?.problem?.problem}
                </Typography>
              </Box>
              <Box color={colors.grey[100]}>
                {minuteDifference(transaction.start, transaction.stop) +
                  " mins"}
              </Box>
              <Box
                backgroundColor={colors.ciboInnerGreen[500]}
                p="5px 10px"
                borderRadius="4px"
              >
                ${Math.floor(transactionData.costs[i])}
              </Box>
            </Box>
          ))}
        </Box>

        {/* ROW 3 */}
        <Box
          gridColumn="span 4"
          gridRow="span 2"
          backgroundColor={colors.primary[400]}
          p="30px"
        >
          <Typography
            variant="h5"
            fontWeight="600"
            sx={{ marginBottom: "15px" }}
          >
            Most Problematic Machines of the Week (Issue Quantity)
          </Typography>
          <Box
            height="200px"
            sx={{
              "& span": {
                color: "black",
              },
            }}
          >
            <PieChart isDashboard={true} data={quantityPieData} />
          </Box>
        </Box>
        <Box
          gridColumn="span 4"
          gridRow="span 2"
          backgroundColor={colors.primary[400]}
        >
          <Typography
            variant="h5"
            fontWeight="600"
            sx={{ padding: "30px 30px 0 30px" }}
          >
            Technicians Performances
          </Typography>
          <Box height="250px" mt="-20px">
            <BarChart isDashboard={true} data={barData} />
          </Box>
        </Box>
        <Box
          gridColumn="span 4"
          gridRow="span 2"
          backgroundColor={colors.primary[400]}
          padding="30px"
        >
          <Typography
            variant="h5"
            fontWeight="600"
            sx={{ marginBottom: "15px" }}
          >
            Most Problematic Machines of the Week (Time)
          </Typography>
          <Box height="200px">
            <PieChart isDashboard={true} data={timePieData} />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardPage;
