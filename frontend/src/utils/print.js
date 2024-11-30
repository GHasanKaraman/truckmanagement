import React, { useRef } from "react";
import ReactToPrint from "react-to-print";
import QRCodeGenerator from "./generator";
import { Button, Typography } from "@mui/material";

import QRCodeIcon from "@mui/icons-material/QrCode";

export default function PrintComponent(props) {
  let componentRef = useRef();

  return (
    <div>
      <ReactToPrint
        trigger={() => (
          <Button
            variant="filled"
            startIcon={<QRCodeIcon />}
            sx={{ width: "100%", justifyContent: "flex-start" }}
          >
            <Typography>{props.label ? props.label : "Print"}</Typography>
          </Button>
        )}
        content={() => componentRef}
      />
      <div style={{ display: "none" }}>
        <QRCodeGenerator ref={(el) => (componentRef = el)} {...props} />
      </div>
    </div>
  );
}
