import { Dialog, Typography, useTheme } from "@mui/material";
import { tokens } from "../theme";

import missingImage from "../images/missing.webp";
import okayImage from "../images/okay.jpg";
import errorImage from "../images/error.jpg";
import soldOutImage from "../images/soldOut.jpg";
import warningImage from "../images/warning.jpg";
import infoImage from "../images/info.jpg";

const Result = ({ status, title, subTitle, content }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  return (
    <Dialog fullScreen={true} open={true} sx={{ textAlign: "center" }}>
      <img
        alt={status}
        src={
          status === "error"
            ? errorImage
            : status === "info"
              ? infoImage
              : status === "warning"
                ? warningImage
                : status === "404"
                  ? missingImage
                  : status === "500"
                    ? soldOutImage
                    : okayImage
        }
      />

      <Typography
        fontSize="32px"
        fontWeight={600}
        lineHeight={1.33}
        color={
          status === "success"
            ? colors.ciboInnerGreen[500]
            : status === "warning"
              ? colors.orangeAccent[500]
              : status === "404" || status === "info"
                ? colors.blueAccent[500]
                : colors.yoggieRed[500]
        }
        marginBlock={2}
      >
        {title}
      </Typography>
      <Typography
        px={2}
        fontSize="20px"
        lineHeight={1.57}
        color="rgba(0,0,0,0.45)"
      >
        {subTitle}
      </Typography>
      <Typography
        px={2}
        fontSize="20px"
        lineHeight={1.57}
        color="rgba(0,0,0,0.45)"
      >
        {content}
      </Typography>
    </Dialog>
  );
};

export default Result;
