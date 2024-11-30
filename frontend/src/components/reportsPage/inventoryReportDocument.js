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
import { numberToCurrency } from "../../utils/helpers";
import { IP } from "../../env";

const InventoryReportDocument = (props) => {
  const [data, setData] = useState();
  const [parameter, setParameter] = useState();

  useEffect(() => {
    setData(props.data.records.parts);

    if (props.parameter) {
      setParameter(props.parameter);
    } else {
      setParameter("Without Images");
    }
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

  return data ? (
    <Document>
      <Page size="A4" style={styles.page}>
        <View fixed style={styles.border} />
        <View fixed style={styles.fixedHeader}>
          <Image src={logo} style={styles.logo} />
          <Text style={styles.title}>
            {(props.facility === "Vreeland" ? "VREELAND " : "MADISON ") +
              "INVENTORY REPORT"}
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
              <TD style={styles.tData}>Inventory Report</TD>
              <TD style={styles.tData}>
                {"Document: " +
                  (props.facility === "Vreeland" ? "V" : "M") +
                  "IR" +
                  moment().format("DDMMYY")}
              </TD>
            </TR>
            <TR>
              <TD style={styles.tData}>Version 1</TD>
              <TD style={styles.tData}>
                {"Issue Date: " + moment().format("MM.DD.YYYY")}
              </TD>
              <TD style={styles.tData}>
                {"Revision Date: " + moment().format("MM.DD.YYYY")}
              </TD>
            </TR>
          </Table>
        </View>
        <Text
          style={{
            fontFamily: "Helvetica-Bold",
            fontSize: 15,
            marginBottom: 15,
            marginTop: 5,
          }}
        >
          {(props.facility === "Vreeland" ? "VREELAND " : "MADISON ") +
            "INVENTORY"}
        </Text>

        <Table>
          <TR>
            <TD style={styles.tHeaderData} weighting={0.3}>
              TOTAL QUANTITY
            </TD>
            <TD style={styles.tHeaderData} weighting={0.2}>
              {data.reduce((acc, item) => {
                return acc + item.count;
              }, 0)}
            </TD>
          </TR>
          <TR>
            <TD style={styles.tHeaderData} weighting={0.3}>
              TOTAL INVENTORY VALUE
            </TD>
            <TD style={styles.tHeaderData} weighting={0.2}>
              {numberToCurrency(
                data.reduce((acc, item) => {
                  return acc + Number(item.totalPrice);
                }, 0),
              )}
            </TD>
          </TR>
        </Table>
        <Table style={{ width: "520px", marginTop: 20 }}>
          <TH>
            <TD style={styles.tHeaderData}>PICTURE</TD>
            <TD style={styles.tHeaderData}>PART NAME</TD>
            <TD style={styles.tHeaderData}>VENDOR</TD>
            <TD style={styles.tHeaderData}>LOCATION</TD>
            <TD style={styles.tHeaderData}>QUANTITY</TD>
            <TD style={styles.tHeaderData}>UNIT PRICE</TD>
            <TD style={styles.tHeaderData}>TOTAL PRICE</TD>
          </TH>
          {data.map((item) => {
            return (
              <TR key={item._id}>
                <TD style={{ ...styles.tData, justifyContent: "center" }}>
                  {parameter === "With Images" ? (
                    <Image
                      src={
                        "http://" +
                        IP +
                        "/uploads/thumbnail-" +
                        item.image.substring(item.image.indexOf("/") + 1)
                      }
                      style={{
                        width: "100pt",
                        paddingTop: 2,
                        paddingLeft: 2,
                        paddingBottom: 2,
                      }}
                    />
                  ) : undefined}
                </TD>
                <TD style={styles.tData}>{item.partName}</TD>
                <TD style={styles.tData}>{item.vendors[0].vendor}</TD>
                <TD style={styles.tData}>{item.location?.location}</TD>
                <TD style={styles.tData}>{item.count}</TD>
                <TD style={styles.tData}>
                  {numberToCurrency(Number(item.price))}
                </TD>
                <TD style={styles.tData}>
                  {numberToCurrency(Number(item.totalPrice))}
                </TD>
              </TR>
            );
          })}
        </Table>
      </Page>
    </Document>
  ) : null;
};

export default InventoryReportDocument;
