import { Box, Typography, useTheme } from "@mui/material";
import { tokens } from "../theme";
import ProgressCircle from "./ProgressCircle";

const StatBox = ({ title, subtitle, icon, percent, reversedColor = false }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  var primaryColor = null;

  if (reversedColor) {
    primaryColor =
      percent < 0 ? colors.ciboInnerGreen[600] : colors.yoggieRed[500];
  } else {
    primaryColor =
      percent < 0 ? colors.yoggieRed[500] : colors.ciboInnerGreen[600];
  }

  return (
    <Box width="100%" m="0 30px">
      <Box display="flex" justifyContent="space-between">
        <Box>
          {icon}
          <Typography
            variant="h4"
            fontWeight="bold"
            sx={{ color: colors.grey[100] }}
          >
            {title}
          </Typography>
        </Box>
        <Box>
          <ProgressCircle progress={percent} reversedColor={reversedColor} />
        </Box>
      </Box>
      <Box display="flex" justifyContent="space-between" mt="2px">
        <Typography variant="h5" sx={{ color: colors.ciboInnerGreen[500] }}>
          {subtitle}
        </Typography>
        <Typography
          variant="h5"
          fontStyle="italic"
          sx={{
            color: primaryColor,
          }}
        >
          {`${percent < 0 ? "-" : "+"}` +
            Math.floor(Math.abs(percent) * 100) +
            "%"}
        </Typography>
      </Box>
    </Box>
  );
};

export default StatBox;
