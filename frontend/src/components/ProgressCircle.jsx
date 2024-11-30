import { Box, useTheme } from "@mui/material";
import { tokens } from "../theme";

const ProgressCircle = ({
  progress = 0.75,
  size = "40",
  reversedColor = false,
}) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const angle = Math.abs(progress) * 360;
  var primaryColor = null;

  if (reversedColor) {
    primaryColor =
      progress < 0 ? colors.ciboInnerGreen[500] : colors.yoggieRed[500];
  } else {
    primaryColor =
      progress < 0 ? colors.yoggieRed[500] : colors.ciboInnerGreen[500];
  }
  return (
    <Box
      sx={{
        background: `radial-gradient(${colors.primary[400]} 55%, transparent 56%),
            conic-gradient(transparent 0deg ${angle}deg, ${colors.blueAccent[500]} ${angle}deg 360deg),
            ${primaryColor}`,
        borderRadius: "50%",
        width: `${size}px`,
        height: `${size}px`,
      }}
    />
  );
};

export default ProgressCircle;
