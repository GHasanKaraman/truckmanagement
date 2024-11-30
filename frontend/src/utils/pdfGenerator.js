import { Box } from "@mui/material";
import QRGenerator from "./qrGenerator";

const PDFGenerator = (props) => {
  const styles = {
    view: {
      display: "flex",
      flexDirection: "row",
      justifyContent: "center",
      width: "75%",
      border: "1pt solid #000",
    },
    subView: {
      justifyContent: "center",
      textAlign: "center",
      padding: "5px 0px",
    },
    partText: {
      fontSize: props.location === "" ? "25px" : "13px",
      color: "black",
    },
    locText: {
      fontSize: "12px",
      color: "black",
    },
  };
  const { url, part, location } = props;

  return (
    <div style={styles.view}>
      <Box
        sx={{
          justifyContent: "center",
          textAlign: "center",
          px: 1,
          pt: 1,
          "& canvas": {
            width: "100%",
            maxWidth: "100px !important",
          },
        }}
      >
        <QRGenerator width={1920} url={url} />
      </Box>
      <div style={styles.subView}>
        <div style={styles.partText}>{part}</div>
        <div>
          <div style={styles.locText}>{location}</div>
        </div>
      </div>
    </div>
  );
};

export default PDFGenerator;
