import React, { useEffect, useState } from "react";
import {
  Document,
  Text,
  Page,
  StyleSheet,
  View,
  Image,
} from "@react-pdf/renderer";
import { Table, TR, TH, TD } from "@ag-media/react-pdf-table";
import moment from "moment-timezone";
import humanizeDuration from "humanize-duration";

import logo from "../../images/logo.png";
import { minuteDifference, toStringDate } from "../../utils/helpers";

const MaintenanceReportDocument = (props) => {
  const [startDate, setStartDate] = useState();
  const [endDate, setEndDate] = useState();

  const [data, setData] = useState();

  const [weeks, setWeeks] = useState();
  const [targets, setTargets] = useState();

  const [issueTypes, setIssueTypes] = useState();

  useEffect(() => {
    setData(props.data.records.issues);
    setWeeks(props.weeks);
    setStartDate(props.weeks[0]);
    setEndDate(props.weeks[props.weeks.length - 1]);
    setIssueTypes(props.issueTypes);

    setTargets(
      props.issueTypes
        .map((issueType) => {
          let data = [
            ...new Set(
              props.data.records.issues.map((item) => item.target.target),
            ),
          ]
            .map((target) => {
              return {
                target: target,
                workTime: props.data.records.issues
                  .filter(
                    (item) =>
                      item.fixingMethod.issueType === issueType &&
                      item.target.target === target,
                  )
                  .reduce((acc, item) => {
                    return acc + minuteDifference(item.start, item.stop);
                  }, 0),
              };
            })
            .sort((a, b) => b.workTime - a.workTime);

          return {
            data: data,
          };
        })[0]
        .data.map(({ target }) => target),
    );
  }, []);

  const styles = StyleSheet.create({
    page: {
      paddingTop: 15,
      paddingBottom: 85,
      paddingHorizontal: 35,
      margin: 10,
    },
    text: {
      margin: 10,
      fontSize: 14,
      textAlign: "justify",
      fontFamily: "Times-Roman",
    },
    logo: {
      width: 150,
      height: 50,
    },
    fixedHeader: {
      flexDirection: "row",
      marginBottom: 10,
    },
    title: {
      marginLeft: 30,
      marginTop: 5,
      fontSize: 17,
      fontFamily: "Courier-Bold",
    },
    border: {
      position: "absolute",
      border: "1pt solid #000",
      width: 575,
      height: 820,
    },
    pageNumber: {
      marginTop: 5,
      marginLeft: 50,
    },
    tData: {
      paddingTop: 2,
      paddingLeft: 5,
      paddingBottom: 2,
      paddingRight: 10,
      fontSize: 10,
    },
    tHeaderData: {
      fontFamily: "Helvetica-Bold",
      paddingLeft: 5,
      paddingRight: 5,
      paddingBottom: 2,
      fontSize: 10,
    },
    tDataMin: {
      paddingTop: 2,
      paddingLeft: 5,
      paddingBottom: 2,
      paddingRight: 10,
      fontSize: 9,
    },
    tHeaderDataMin: {
      fontFamily: "Helvetica-Bold",
      paddingTop: 3,
      paddingLeft: 5,
      paddingRight: 5,
      paddingBottom: 2,
      fontSize: 9,
      justifyContent: "center",
    },
  });

  return data && weeks ? (
    <Document>
      <Page size="A4" style={styles.page}>
        <View fixed style={styles.border} />
        <View fixed style={styles.fixedHeader}>
          <Image src={logo} style={styles.logo} />
          <Text style={styles.title}>
            {props.custom
              ? "MAINTENANCE TEAM REPORT"
              : "WEEKLY MAINTENANCE TEAM REPORT"}
          </Text>
          <Text
            style={styles.pageNumber}
            render={({ pageNumber, _ }) => `${pageNumber}`}
            fixed
          />
        </View>
        <View fixed style={{ marginTop: 10 }}>
          <Table
            style={{ width: "510", paddingTop: 680, position: "absolute" }}
          >
            <TR>
              <TD style={styles.tData}>Prepared By: CiboENG </TD>
              <TD style={styles.tData}>
                {"Revs: " + props.data.records.user.name}
              </TD>
              <TD style={styles.tData}>Authorized By: Burhan Uresin</TD>
            </TR>
            <TR>
              <TD style={styles.tData}>Issued By: Engineering</TD>
              <TD style={styles.tData}>
                {props.custom
                  ? "Custom Maintenance Report"
                  : "Weekly Maintenance Report"}
              </TD>
              <TD style={styles.tData}>
                {props.custom
                  ? "Document: CMTR" +
                    startDate.format("DDMMYY") +
                    endDate.format("DDMMYY")
                  : "Document: WMTR" + startDate.week()}
              </TD>
            </TR>
            <TR>
              <TD style={styles.tData}>Version 3</TD>
              <TD style={styles.tData}>
                {"Issue Date: " + moment().format("MM.DD.YYYY")}
              </TD>
              <TD style={styles.tData}>
                {"Revision Date: " + endDate.format("MM.DD.YYYY")}
              </TD>
            </TR>
          </Table>
        </View>
        <Text
          style={{
            fontFamily: "Helvetica-Bold",
            fontSize: 13,
            marginBottom: 15,
            marginTop: 5,
          }}
        >
          {"DAILY ISSUE TABLE - WEEK " +
            startDate.week() +
            " - " +
            toStringDate(startDate, {
              month: "long",
              day: "numeric",
              year: "numeric",
            }).toUpperCase() +
            " TO " +
            toStringDate(endDate, {
              month: "long",
              day: "numeric",
              year: "numeric",
            }).toUpperCase()}
        </Text>
        <Table style={{ paddingBottom: 20 }}>
          <TH>
            <TD
              style={styles.tHeaderDataMin}
              weighting={
                issueTypes.length === 3
                  ? 0.1
                  : issueTypes.length === 2
                    ? 0.1044
                    : 0.1084
              }
            >
              DATE
            </TD>
            {issueTypes.map((issueType) => {
              return (
                <TD
                  style={styles.tHeaderDataMin}
                  weighting={
                    issueTypes.length === 3
                      ? 0.3
                      : issueTypes.length === 2
                        ? 0.3127
                        : 0.325
                  }
                >
                  {issueType === "M"
                    ? "MAINTENANCE"
                    : issueType === "PM"
                      ? "PREVENTIVE MAINTENANCE"
                      : "PRODUCTION"}
                </TD>
              );
            })}
          </TH>
          <TH>
            <TD
              weighting={
                issueTypes.length === 3
                  ? 0.1
                  : issueTypes.length === 2
                    ? 0.1025
                    : 0.1044
              }
              style={{
                paddingLeft: 13.5,
              }}
            />
            {issueTypes.map((_) => {
              return [
                <TD
                  style={styles.tHeaderDataMin}
                  weighting={
                    issueTypes.length === 3
                      ? 0.15
                      : issueTypes.length === 2
                        ? 0.1531
                        : 0.1559
                  }
                >
                  ISSUE
                </TD>,
                <TD
                  style={styles.tHeaderDataMin}
                  weighting={
                    issueTypes.length === 3
                      ? 0.15
                      : issueTypes.length === 2
                        ? 0.1533
                        : 0.1564
                  }
                >
                  WORK TIME (MIN)
                </TD>,
              ];
            })}
          </TH>
          {weeks.map((date) => {
            return (
              <TR>
                <TD
                  weighting={0.1}
                  style={{ ...styles.tDataMin, paddingLeft: 7 }}
                >
                  {date.format("MM/DD/YYYY")}
                </TD>
                {issueTypes.map((issueType) => {
                  return [
                    <TD weighting={0.15} style={styles.tDataMin}>
                      {
                        data.filter(
                          (item) =>
                            item.fixingMethod.issueType === issueType &&
                            date.isSame(item.createdAt, "date"),
                        ).length
                      }
                    </TD>,
                    <TD weighting={0.15} style={styles.tDataMin}>
                      {data
                        .filter(
                          (item) =>
                            item.fixingMethod.issueType === issueType &&
                            date.isSame(item.createdAt, "date"),
                        )
                        .reduce((acc, item) => {
                          return (
                            acc +
                            minuteDifference(item.start, item.stop) -
                            minuteDifference(item.pauseStart, item.pauseStop)
                          );
                        }, 0)}
                    </TD>,
                  ];
                })}
              </TR>
            );
          })}
          <TH>
            <TD
              weighting={
                issueTypes.length === 3
                  ? 0.1
                  : issueTypes.length === 2
                    ? 0.1025
                    : 0.1047
              }
              style={{
                ...styles.tHeaderDataMin,
                paddingLeft: 8.5,
                justifyContent: "flex-end",
              }}
            >
              TOTAL
            </TD>
            {issueTypes.map((issueType) => {
              return [
                <TD
                  style={styles.tHeaderDataMin}
                  weighting={
                    issueTypes.length === 3
                      ? 0.15
                      : issueTypes.length === 2
                        ? 0.153
                        : 0.1559
                  }
                >
                  {
                    data.filter(
                      (item) => item.fixingMethod.issueType === issueType,
                    ).length
                  }
                </TD>,
                <TD
                  style={styles.tHeaderDataMin}
                  weighting={
                    issueTypes.length === 3
                      ? 0.15
                      : issueTypes.length === 2
                        ? 0.1533
                        : 0.1559
                  }
                >
                  {data
                    .filter((item) => item.fixingMethod.issueType === issueType)
                    .reduce((acc, item) => {
                      return (
                        acc +
                        minuteDifference(item.start, item.stop) -
                        minuteDifference(item.pauseStart, item.pauseStop)
                      );
                    }, 0)}
                </TD>,
              ];
            })}
          </TH>
        </Table>
        <View
          style={{
            fontFamily: "Helvetica-Bold",
            fontSize: 13,
            marginTop: 5,
            marginLeft: 10,
          }}
        >
          <Text style={{ paddingTop: 2 }}>
            Maintenance (technical issues, mechanical, electrical etc.)
          </Text>
          <Text style={{ paddingTop: 2, paddingBottom: 10 }}>
            Production (operational issues, employees, management etc.)
          </Text>
        </View>
        <Text
          style={{
            fontFamily: "Helvetica-Bold",
            fontSize: 13,
            marginBottom: 15,
            marginTop: 5,
          }}
        >
          {"MACHINES ISSUE TABLE - WEEK " +
            startDate.week() +
            " - " +
            toStringDate(startDate, {
              month: "long",
              day: "numeric",
              year: "numeric",
            }).toUpperCase() +
            " TO " +
            toStringDate(endDate, {
              month: "long",
              day: "numeric",
              year: "numeric",
            }).toUpperCase()}
        </Text>
        <Table style={{ paddingBottom: 20 }}>
          <TH>
            <TD
              style={styles.tHeaderDataMin}
              weighting={
                issueTypes.length === 3
                  ? 0.1
                  : issueTypes.length === 2
                    ? 0.1044
                    : 0.1084
              }
            >
              MACHINES
            </TD>
            {issueTypes.map((issueType) => {
              return (
                <TD
                  style={styles.tHeaderDataMin}
                  weighting={
                    issueTypes.length === 3
                      ? 0.3
                      : issueTypes.length === 2
                        ? 0.3127
                        : 0.325
                  }
                >
                  {issueType === "M"
                    ? "MAINTENANCE"
                    : issueType === "PM"
                      ? "PREVENTIVE MAINTENANCE"
                      : "PRODUCTION"}
                </TD>
              );
            })}
          </TH>
          <TH>
            <TD
              weighting={
                issueTypes.length === 3
                  ? 0.1
                  : issueTypes.length === 2
                    ? 0.1025
                    : 0.1044
              }
              style={{ paddingLeft: 13.5 }}
            />

            {issueTypes.map((issueType) => {
              return [
                <TD
                  style={styles.tHeaderDataMin}
                  weighting={
                    issueTypes.length === 3
                      ? 0.15
                      : issueTypes.length === 2
                        ? 0.1531
                        : 0.1559
                  }
                >
                  ISSUE
                </TD>,
                <TD
                  style={styles.tHeaderDataMin}
                  weighting={
                    issueTypes.length === 3
                      ? 0.15
                      : issueTypes.length === 2
                        ? 0.1533
                        : 0.1564
                  }
                >
                  WORK TIME (MIN)
                </TD>,
              ];
            })}
          </TH>
          {targets.map((target) => {
            return (
              <TR>
                <TD
                  weighting={0.1}
                  style={{ ...styles.tDataMin, paddingLeft: 7 }}
                >
                  {target}
                </TD>
                {issueTypes.map((issueType) => {
                  return [
                    <TD weighting={0.15} style={styles.tDataMin}>
                      {
                        data.filter(
                          (item) =>
                            item.fixingMethod.issueType === issueType &&
                            item.target.target === target,
                        ).length
                      }
                    </TD>,
                    <TD weighting={0.15} style={styles.tDataMin}>
                      {data
                        .filter(
                          (item) =>
                            item.fixingMethod.issueType === issueType &&
                            item.target.target === target,
                        )
                        .reduce((acc, item) => {
                          return (
                            acc +
                            minuteDifference(item.start, item.stop) -
                            minuteDifference(item.pauseStart, item.pauseStop)
                          );
                        }, 0)}
                    </TD>,
                  ];
                })}
              </TR>
            );
          })}
        </Table>
        <View style={{ fontSize: 12 }}>
          <Text
            style={{
              fontFamily: "Helvetica-Bold",
              fontSize: 13,
              marginBottom: 10,
              marginTop: 5,
            }}
          >
            RESULTS
          </Text>
          <Text style={{ paddingLeft: 10, paddingBottom: 10 }}>
            {(function () {
              const sorted = weeks
                .map((date) => {
                  return {
                    date: date,
                    len: data.filter((item) =>
                      date.isSame(item.createdAt, "date"),
                    ).length,
                  };
                })
                .sort((a, b) => b.len - a.len)[0];
              return (
                "• " +
                sorted.len +
                " issues (max) occured on " +
                moment(sorted.date).format("dddd") +
                " (non-maintenance issues not included)."
              );
            })()}
          </Text>
          <Text style={{ paddingLeft: 10, paddingBottom: 10 }}>
            {(function () {
              const sorted = targets
                .map((target) => {
                  return {
                    target: target,
                    len: data.filter((item) => item.target.target === target)
                      .length,
                  };
                })
                .sort((a, b) => b.len - a.len)[0];
              return (
                "• " +
                sorted.len +
                " issues occured on machine " +
                sorted.target +
                " (Max counted issues)."
              );
            })()}
          </Text>
          <Text style={{ paddingLeft: 10, paddingBottom: 10 }}>
            {(function () {
              const sorted = targets
                .map((target) => {
                  return {
                    target: target,
                    minute: data
                      .filter((item) => item.target.target === target)
                      .reduce((acc, item) => {
                        return (
                          acc +
                          minuteDifference(item.start, item.stop) -
                          minuteDifference(item.pauseStart, item.pauseStop)
                        );
                      }, 0),
                  };
                })
                .sort((a, b) => b.minute - a.minute)[0];
              return (
                "• " +
                humanizeDuration(
                  moment.duration(sorted.minute, "minutes").asMilliseconds(),
                  { conjunction: " ", serialComma: false, delimiter: " " },
                ) +
                " spent on " +
                sorted.target +
                " (max time)."
              );
            })()}
          </Text>
        </View>
        {weeks.map((date) => {
          return (
            <View break>
              <Text
                style={{
                  textAlign: "right",
                  fontSize: 13,
                  paddingBottom: 10,
                }}
              >
                {"DATE: " + date.format("MM/DD/YYYY")}
              </Text>
              <Table>
                <TH>
                  <TD
                    weighting={0.15}
                    style={{ ...styles.tHeaderData, justifyContent: "center" }}
                  >
                    MACHINE NAME
                  </TD>
                  <TD
                    weighting={0.13}
                    style={{ ...styles.tHeaderData, justifyContent: "center" }}
                  >
                    SUPERIOR
                  </TD>
                  <TD
                    weighting={0.27}
                    style={{ ...styles.tHeaderData, justifyContent: "center" }}
                  >
                    EXPLANATION
                  </TD>
                  <TD
                    weighting={0.05}
                    style={{ ...styles.tHeaderData, justifyContent: "center" }}
                  >
                    IT
                  </TD>
                  <TD
                    weighting={0.15}
                    style={{ ...styles.tHeaderData, justifyContent: "center" }}
                  >
                    ACTION PLAN
                  </TD>
                  <TD
                    weighting={0.2}
                    style={{ ...styles.tHeaderData, justifyContent: "center" }}
                  >
                    TECHNICIAN NAME
                  </TD>
                  <TD
                    weighting={0.05}
                    style={{ ...styles.tHeaderData, justifyContent: "center" }}
                  >
                    WT (MIN)
                  </TD>
                </TH>
                {data
                  .filter((item) => {
                    return date.isSame(item.createdAt, "date");
                  })
                  .map((item) => {
                    return (
                      <TR>
                        <TD
                          weighting={0.15}
                          style={{
                            ...styles.tHeaderData,
                            fontSize: 10,
                            fontFamily: "Helvetica",
                          }}
                        >
                          {item.target.target}
                        </TD>
                        <TD
                          weighting={0.13}
                          style={{
                            ...styles.tHeaderData,
                            fontSize: 9,
                            fontFamily: "Helvetica",
                          }}
                        >
                          {item.superior.superior.split("(")[0]}
                        </TD>
                        <TD
                          weighting={0.27}
                          style={{
                            ...styles.tHeaderData,
                            fontSize: 9,
                            fontFamily: "Helvetica",
                          }}
                        >
                          {item.problem.problem}
                        </TD>
                        <TD
                          weighting={0.05}
                          style={{
                            ...styles.tHeaderData,
                            fontSize: 10,
                            fontFamily: "Helvetica",
                            justifyContent: "center",
                          }}
                        >
                          {item.fixingMethod.issueType}
                        </TD>
                        <TD
                          weighting={0.15}
                          style={{
                            ...styles.tHeaderData,
                            fontSize: 10,
                            fontFamily: "Helvetica",
                          }}
                        >
                          {item.fixingMethod.fixingMethod}
                        </TD>
                        <TD
                          weighting={0.2}
                          style={{
                            ...styles.tHeaderData,
                            fontSize: 10,
                            fontFamily: "Helvetica",
                            justifyContent: "center",
                          }}
                        >
                          {item.technicians
                            .map((item) => item.name + " " + item.surname)
                            .join("\n")}
                        </TD>
                        <TD
                          weighting={0.05}
                          style={{
                            ...styles.tHeaderData,
                            fontSize: 10,
                            fontFamily: "Helvetica",
                          }}
                        >
                          <Text>{minuteDifference(item.start, item.stop)}</Text>
                          {item.paused === 2 ? (
                            <Text style={{ color: "red" }}>
                              {" -" +
                                minuteDifference(
                                  item.pauseStart,
                                  item.pauseStop,
                                )}
                            </Text>
                          ) : undefined}
                        </TD>
                      </TR>
                    );
                  })}
                <TH>
                  <TD
                    weighting={0.909}
                    style={{
                      ...styles.tHeaderData,
                      justifyContent: "flex-end",
                    }}
                  >
                    TOTAL
                  </TD>
                  <TD weighting={0.091} style={{ ...styles.tHeaderData }}>
                    {data
                      .filter((item) => {
                        return date.isSame(item.createdAt, "date");
                      })
                      .reduce((acc, item) => {
                        return (
                          acc +
                          minuteDifference(item.start, item.stop) -
                          minuteDifference(item.pauseStart, item.pauseStop)
                        );
                      }, 0)}
                  </TD>
                </TH>
              </Table>
            </View>
          );
        })}
      </Page>
    </Document>
  ) : null;
};

export default MaintenanceReportDocument;
