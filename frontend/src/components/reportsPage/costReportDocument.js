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

import logo from "../../images/logo.png";
import { numberToCurrency, toStringDate } from "../../utils/helpers";
import { IP } from "../../env";

const CostReportDocument = (props) => {
  const [startDate, setStartDate] = useState();
  const [endDate, setEndDate] = useState();

  const [data, setData] = useState();
  const [weeks, setWeeks] = useState();
  const [purchases, setPurchases] = useState();
  const [pos, setPOs] = useState();

  useEffect(() => {
    setData(props.data.records.logs);
    setPurchases(props.data.records.purchases);
    setPOs(props.data.records.pos);
    setWeeks(props.weeks);
    setStartDate(props.weeks[0]);
    setEndDate(props.weeks[props.weeks.length - 1]);
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
  });

  return data && weeks ? (
    <Document>
      <Page size="A4" style={styles.page}>
        <View fixed style={styles.border} />
        <View fixed style={styles.fixedHeader}>
          <Image src={logo} style={styles.logo} />
          <Text style={styles.title}>
            {props.custom ? "COSTS OF SPENDING" : "WEEKLY COSTS OF SPENDING"}
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
                {"Revs: " + props.data.records.user.name}
              </TD>
              <TD style={styles.tData}>Authorized By: Burhan Uresin</TD>
            </TR>
            <TR>
              <TD style={styles.tData}>Issued By: Engineering</TD>
              <TD style={styles.tData}>
                {props.custom
                  ? "Custom Cost of Spending"
                  : "Weekly Cost of Spending"}
              </TD>
              <TD style={styles.tData}>
                {props.custom
                  ? "Document: CCS" +
                    startDate.format("DDMMYY") +
                    endDate.format("DDMMYY")
                  : "Document No: WCS" + startDate.week()}
              </TD>
            </TR>
            <TR>
              <TD style={styles.tData}>Version 2.2</TD>
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
          {(props.custom
            ? "COSTS OF SPENDING - WEEK - "
            : "WEEKLY COSTS OF SPENDING - WEEK ") +
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

        <Table style={{ width: "280px" }}>
          <TH>
            <TD style={styles.tHeaderData}>NAME</TD>
            <TD style={styles.tHeaderData}>COST $</TD>
          </TH>
          <TR>
            <TD style={styles.tData}>REPLACED PARTS</TD>
            <TD style={styles.tData}>
              {numberToCurrency(
                data.reduce((a, b) => {
                  return a + b.outputQuantity * b.item.price;
                }, 0),
              ).substring(1)}
            </TD>
          </TR>
          <TR>
            <TD style={{ ...styles.tHeaderData, justifyContent: "flex-end" }}>
              TOTAL
            </TD>

            <TD style={styles.tHeaderData}>
              {numberToCurrency(
                data.reduce((acc, item) => {
                  return acc + item.outputQuantity * item.item.price;
                }, 0),
              ).substring(1)}
            </TD>
          </TR>
        </Table>
        <Text
          style={{
            fontFamily: "Helvetica-Bold",
            fontSize: 13,
            marginBottom: 15,
            marginTop: 10,
          }}
        >
          {props.custom
            ? "TABLE OF MATERIALS COSTS"
            : "WEEKLY TABLE OF MATERIALS COSTS"}
        </Text>
        <Table style={{ width: "250px" }}>
          <TH>
            <TD style={styles.tHeaderData}>DATE</TD>
            <TD style={styles.tHeaderData}>QUANTITIES OF REPLACED PARTS</TD>
            <TD style={styles.tHeaderData}>COST $</TD>
          </TH>
          {weeks.map((date) => {
            return (
              <TR>
                <TD style={styles.tData}>{date.format("MM/DD/YYYY")}</TD>
                <TD style={{ ...styles.tData, justifyContent: "center" }}>
                  {data
                    .filter((item) => {
                      return date.isSame(item.createdAt, "date");
                    })
                    .reduce((acc, item) => {
                      return acc + item.outputQuantity;
                    }, 0)}
                </TD>
                <TD style={styles.tData}>
                  {numberToCurrency(
                    data
                      .filter((item) => {
                        return date.isSame(item.createdAt, "date");
                      })
                      .reduce((acc, item) => {
                        return acc + item.outputQuantity * item.item.price;
                      }, 0),
                  ).substring(1)}
                </TD>
              </TR>
            );
          })}
          <TR>
            <TD style={{ ...styles.tHeaderData, justifyContent: "flex-end" }}>
              TOTAL
            </TD>
            <TD style={{ ...styles.tHeaderData, justifyContent: "center" }}>
              {data.reduce((acc, item) => {
                return acc + item.outputQuantity;
              }, 0)}
            </TD>
            <TD style={styles.tHeaderData}>
              {numberToCurrency(
                data.reduce((acc, item) => {
                  return acc + item.outputQuantity * item.item.price;
                }, 0),
              ).substring(1)}
            </TD>
          </TR>
        </Table>
        <Table style={{ width: "500px", marginTop: 20 }}>
          <TH>
            <TD style={{ ...styles.tHeaderData }}>NAME OF THE PART</TD>
            <TD style={styles.tHeaderData}>VENDOR</TD>
            <TD style={{ ...styles.tHeaderData, justifyContent: "center" }}>
              QUANTITY
            </TD>
            <TD style={styles.tHeaderData}>COST $</TD>
          </TH>
          {data.map((item) => {
            return (
              <TR>
                <TD style={{ ...styles.tData }}>{item.item.partName}</TD>
                <TD style={styles.tData}>{item.item.vendors[0].vendor}</TD>
                <TD style={{ ...styles.tData, justifyContent: "center" }}>
                  {item.outputQuantity}
                </TD>
                <TD style={styles.tData}>
                  {(item.outputQuantity * item.item.price).toFixed(2)}
                </TD>
              </TR>
            );
          })}
        </Table>
        <Text
          style={{
            fontFamily: "Helvetica-Bold",
            fontSize: 12,
            marginBottom: 15,
            marginTop: 20,
          }}
        >
          {(props.custom
            ? "COSTS OF PURCHASES - WEEK - "
            : "WEEKLY TABLE OF PURCHASING - WEEK ") +
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
        <Table style={{ width: "500px", marginTop: 0 }}>
          <TH>
            <TD style={{ ...styles.tHeaderData }}>DATE</TD>
            <TD style={{ ...styles.tHeaderData }}>NAME OF THE PART</TD>
            <TD style={styles.tHeaderData}>VENDOR</TD>
            <TD style={styles.tHeaderData}>PURCHASE $</TD>
          </TH>
          {purchases.map((item) => {
            return (
              <TR>
                <TD style={{ ...styles.tData }}>
                  {toStringDate(item.date, {
                    month: "short",
                    year: "numeric",
                    day: "numeric",
                  })}
                </TD>
                <TD style={{ ...styles.tData }}>{item.parts}</TD>
                <TD style={styles.tData}>{item.vendor}</TD>
                <TD style={styles.tData}>{item.price}</TD>
              </TR>
            );
          })}
          <TR>
            <TD
              style={{
                ...styles.tHeaderData,
                justifyContent: "flex-end",
                paddingLeft: 339,
              }}
            >
              TOTAL
            </TD>

            <TD style={styles.tHeaderData}>
              {numberToCurrency(
                purchases.reduce((acc, item) => {
                  return acc + item.price;
                }, 0),
              ).substring(1)}
            </TD>
          </TR>
        </Table>

        <Text
          style={{
            fontFamily: "Helvetica-Bold",
            fontSize: 12,
            marginBottom: 15,
            marginTop: 20,
          }}
        >
          {(props.custom
            ? "COSTS OF POs - WEEK - "
            : "WEEKLY TABLE OF POs - WEEK ") +
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
        <Table style={{ width: "500px", marginTop: 0 }}>
          <TH>
            <TD style={{ ...styles.tHeaderData }}>DATE</TD>
            <TD style={{ ...styles.tHeaderData }}>NAME OF THE PART</TD>
            <TD style={styles.tHeaderData}>VENDOR</TD>
            <TD style={styles.tHeaderData}>PURCHASE $</TD>
          </TH>
          {pos.map((item) => {
            return (
              <TR>
                <TD style={{ ...styles.tData }}>
                  {toStringDate(item.date, {
                    month: "short",
                    year: "numeric",
                    day: "numeric",
                  })}
                </TD>
                <TD style={{ ...styles.tData }}>{item.parts}</TD>
                <TD style={styles.tData}>{item.vendor}</TD>
                <TD style={styles.tData}>{item.price}</TD>
              </TR>
            );
          })}
          <TR>
            <TD
              style={{
                ...styles.tHeaderData,
                justifyContent: "flex-end",
                paddingLeft: 339,
              }}
            >
              TOTAL
            </TD>

            <TD style={styles.tHeaderData}>
              {numberToCurrency(
                pos.reduce((acc, item) => {
                  return acc + item.price;
                }, 0),
              ).substring(1)}
            </TD>
          </TR>
        </Table>
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
              <Table style={{ width: "520px", marginTop: 20 }}>
                <TH>
                  <TD style={styles.tHeaderData}>PICTURE</TD>
                  <TD style={styles.tHeaderData}>PART NAME</TD>
                  <TD style={styles.tHeaderData}>VENDOR</TD>
                  <TD style={styles.tHeaderData}>TARGET</TD>
                  <TD style={styles.tHeaderData}>TECHNICIAN</TD>
                  <TD style={styles.tHeaderData}>QUANTITY</TD>
                  <TD style={styles.tHeaderData}>UNIT PRICE</TD>
                  <TD style={styles.tHeaderData}>TOTAL PRICE</TD>
                </TH>
                {data
                  .filter((item) => {
                    return date.isSame(item.createdAt, "date");
                  })
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
                        <TD style={styles.tData}>
                          {item.item.vendors[0].vendor}
                        </TD>
                        <TD style={styles.tData}>{item.target.target}</TD>
                        <TD style={styles.tData}>{item.user.name}</TD>
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
                      paddingLeft: 266,
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
                    {data
                      .filter((item) => {
                        return date.isSame(item.createdAt, "date");
                      })
                      .reduce((acc, item) => {
                        return acc + item.outputQuantity;
                      }, 0)}
                  </TD>
                  <TD style={{ ...styles.tHeaderData, paddingRight: 70.5 }}>
                    {numberToCurrency(
                      data
                        .filter((item) => {
                          return date.isSame(item.createdAt, "date");
                        })
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

export default CostReportDocument;
