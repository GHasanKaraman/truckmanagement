import { Typography, Box, useTheme } from "@mui/material";
import { tokens } from "../theme";

const Label = ({ title, subtitle, style }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  return (
    <Box mb="10px" mt="5px" {...style}>
      <Typography variant="h6" color={colors.grey[300]} sx={{ m: "0 0 0px 0" }}>
        {title}
      </Typography>
      <Typography variant="h5" fontWeight="bold" color={colors.grey[300]}>
        {subtitle}
      </Typography>
    </Box>
  );
};

export default Label;
