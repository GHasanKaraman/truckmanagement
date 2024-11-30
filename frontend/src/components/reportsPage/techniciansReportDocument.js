import React, { useEffect, useState } from "react";
import moment from "moment-timezone";
import {
  Document,
  Text,
  Page,
  StyleSheet,
  View,
  Image,
} from "@react-pdf/renderer";
import { Table, TR, TH, TD } from "@ag-media/react-pdf-table";
import humanizeDuration from "humanize-duration";

import logo from "../../images/logo.png";
import {
  minuteDifference,
  numberToCurrency,
  toStringDate,
} from "../../utils/helpers";
import { IP } from "../../env";

const TechniciansReportDocument = (props) => {
  const [startDate, setStartDate] = useState();
  const [endDate, setEndDate] = useState();

  const [data, setData] = useState();
  const [logs, setLogs] = useState();

  const [technicians, setTechnicians] = useState();
  const [technicianPerformances, setTechnicianPerformances] = useState();

  useEffect(() => {
    setData(props.data.issues);
    setLogs(props.data.logs);
    setStartDate(props.weeks[0]);
    setEndDate(props.weeks[props.weeks.length - 1]);
    setTechnicians([
      ...new Set(props.data.issues.map((issue) => issue.technician)),
    ]);

    setTechnicianPerformances(
      [...new Set(props.data.issues.map((issue) => issue.technician))]
        .map((technician) => {
          return {
            technician,
            noIssueSolved: props.data.issues.filter(
              (item) => item.technician._id === technician._id,
            ).length,
            workTime: humanizeDuration(
              moment
                .duration(
                  props.data.issues
                    .filter((item) => item.technician._id === technician._id)
                    .reduce((acc, item) => {
                      return acc + minuteDifference(item.start, item.stop);
                    }, 0),
                  "minutes",
                )
                .asMilliseconds(),
              { conjunction: " ", serialComma: false, delimiter: " " },
            ),
          };
        })
        .sort((a, b) => b.noIssueSolved - a.noIssueSolved),
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
      paddingTop: 3,
      paddingLeft: 5,
      paddingRight: 5,
      paddingBottom: 2,
      fontSize: 10,
      textAlign: "center",
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

  return data && logs ? (
    <Document>
      <Page size="A4" style={styles.page}>
        <View fixed style={styles.border} />
        <View fixed style={styles.fixedHeader}>
          <Image src={logo} style={styles.logo} />
          <Text style={styles.title}>
            {props.custom
              ? "TECHNICIAN PERFORMANCES"
              : "WEEKLY TECHNICIAN PERFORMANCES"}
          </Text>
          <Text
            style={styles.pageNumber}
            render={({ pageNumber, _ }) => `${pageNumber}`}
            fixed
          />
        </View>
        <View fixed style={{ marginTop: 10 }}>
          <Table style={{ marginTop: 680, position: "absolute", width: "510" }}>
            <TR>
              <TD style={styles.tData}>Prepared By: CiboENG </TD>
              <TD style={styles.tData}>
                {"Revs: " +
                  props.data.user.name +
                  " " +
                  props.data.user.surname}
              </TD>
              <TD style={styles.tData}>Authorized By: Burhan Uresin</TD>
            </TR>
            <TR>
              <TD style={styles.tData}>Issued By: Engineering</TD>
              <TD style={styles.tData}>
                {props.custom
                  ? "Custom Technicians Report"
                  : "Weekly Technicians Report"}
              </TD>
              <TD style={styles.tData}>
                {props.custom
                  ? "Document: CTR" +
                    startDate.format("DDMMYY") +
                    endDate.format("DDMMYY")
                  : "Document No: WTR" + startDate.week()}
              </TD>
            </TR>
            <TR>
              <TD style={styles.tData}>Version 1</TD>
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
          {"TECHNICIAN PERFORMANCES - WEEK - " +
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
            <TD style={styles.tHeaderDataMin} weighting={0.3}>
              TECHNICIAN
            </TD>
            <TD style={styles.tHeaderDataMin} weighting={0.3}>
              No of ISSUE SOLVED
            </TD>
            <TD style={styles.tHeaderDataMin} weighting={0.3}>
              WORK TIME
            </TD>
          </TH>
          {technicianPerformances.map((performance) => {
            return (
              <TR>
                <TD
                  weighting={0.299}
                  style={{
                    ...styles.tDataMin,
                    fontSize: 10,
                  }}
                >
                  {performance.technician.name +
                    " " +
                    performance.technician.surname}
                </TD>
                <TD
                  weighting={0.299}
                  style={{
                    ...styles.tDataMin,
                    justifyContent: "center",
                  }}
                >
                  {performance.noIssueSolved}
                </TD>
                <TD
                  weighting={0.299}
                  style={{
                    ...styles.tDataMin,
                  }}
                >
                  {performance.workTime}
                </TD>
              </TR>
            );
          })}
        </Table>

        <Table>
          <TH>
            <TD style={styles.tHeaderDataMin} weighting={0.3}>
              TECHNICIAN
            </TD>
            <TD style={styles.tHeaderDataMin} weighting={0.3}>
              No of PART TAKEN
            </TD>
          </TH>
          {technicians
            .map((technician) => {
              return {
                technician: technician,
                noOfPart: logs
                  .filter((log) => log.technicianID === technician._id)
                  .reduce((acc, log) => {
                    return acc + log.outputQuantity;
                  }, 0),
              };
            })
            .sort((a, b) => b.noOfPart - a.noOfPart)
            .map((item) => {
              return (
                <TR>
                  <TD style={styles.tDataMin} weighting={0.296}>
                    {item.technician.name + " " + item.technician.surname}
                  </TD>
                  <TD style={styles.tDataMin} weighting={0.296}>
                    {item.noOfPart}
                  </TD>
                </TR>
              );
            })}
        </Table>

        {technicians.map((technician) => {
          return (
            <View break>
              <Text
                style={{
                  textAlign: "right",
                  fontSize: 13,
                  paddingBottom: 10,
                }}
              >
                {"TECHNICIAN: " + technician.name + " " + technician.surname}
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
                    return item.technician._id === technician._id;
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
                          {technicians
                            .filter((tech) =>
                              item.techniciansID.some(
                                (element) => element === tech._id,
                              ),
                            )
                            .map((tech) => tech.name + " " + tech.surname)
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
                          {minuteDifference(item.start, item.stop)}
                        </TD>
                      </TR>
                    );
                  })}
                <TH>
                  <TD
                    weighting={0.9555}
                    style={{
                      ...styles.tHeaderData,
                      justifyContent: "flex-end",
                    }}
                  >
                    TOTAL
                  </TD>
                  <TD weighting={0.0445} style={{ ...styles.tHeaderData }}>
                    {data
                      .filter((item) => {
                        return item.technician._id === technician._id;
                      })
                      .reduce((acc, item) => {
                        return acc + minuteDifference(item.start, item.stop);
                      }, 0)}
                  </TD>
                </TH>
              </Table>
              <Table style={{ width: "520px", marginTop: 20 }}>
                <TH>
                  <TD style={styles.tHeaderData}>PICTURE</TD>
                  <TD style={styles.tHeaderData}>PART NAME</TD>
                  <TD style={styles.tHeaderData}>TARGET</TD>
                  <TD style={styles.tHeaderData}>QUANTITY</TD>
                  <TD style={styles.tHeaderData}>UNIT PRICE</TD>
                  <TD style={styles.tHeaderData}>TOTAL PRICE</TD>
                </TH>
                {logs
                  .filter((item) => item.technicianID === technician._id)
                  .map((item) => {
                    return (
                      <TR>
                        <TD
                          style={{ ...styles.tData, justifyContent: "center" }}
                        >
                          <Image
                            src={
                              "http://" +
                              IP +
                              "/uploads/thumbnail-" +
                              item.item.image.substring(
                                item.item.image.indexOf("/") + 1,
                              )
                            }
                            style={{
                              width: "100pt",
                              paddingTop: 2,
                              paddingLeft: 2,
                              paddingBottom: 2,
                            }}
                          />
                        </TD>
                        <TD style={styles.tData}>{item.item.partName}</TD>
                        <TD style={styles.tData}>{item.target.target}</TD>
                        <TD style={styles.tData}>{item.outputQuantity}</TD>
                        <TD style={styles.tData}>
                          {item.item.price.toFixed(2)}
                        </TD>
                        <TD style={styles.tData}>
                          {(item.item.price * item.outputQuantity).toFixed(2)}
                        </TD>
                      </TR>
                    );
                  })}
                <TR>
                  <TD
                    style={{
                      ...styles.tHeaderData,
                      justifyContent: "flex-end",
                      paddingLeft: 147.5,
                    }}
                  >
                    TOTAL
                  </TD>
                  <TD
                    style={{
                      ...styles.tHeaderData,
                      justifyContent: "center",
                    }}
                  >
                    {logs
                      .filter((item) => item.technicianID === technician._id)
                      .reduce((acc, item) => {
                        return acc + item.outputQuantity;
                      }, 0)}
                  </TD>
                  <TD
                    style={{
                      ...styles.tHeaderData,
                      paddingRight: 29.5,
                      justifyContent: "flex-end",
                    }}
                  >
                    {numberToCurrency(
                      logs
                        .filter((item) => item.technicianID === technician._id)
                        .reduce((acc, item) => {
                          return acc + item.outputQuantity * item.item.price;
                        }, 0),
                    )}
                  </TD>
                </TR>
              </Table>
            </View>
          );
        })}
      </Page>
    </Document>
  ) : null;
};

export default TechniciansReportDocument;
