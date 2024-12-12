import { Stack, useTheme } from "@mui/material";
import { tokens } from "../theme";

const StatusIndicator = ({ status }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  return (
    <Stack
      direction="row"
      spacing={1}
      justifyContent="center"
      alignItems="center"
    >
      <div
        style={{
          width: "15px",
          height: "15px",
          borderRadius: "15px",
          backgroundColor: status
            ? colors.ciboInnerGreen[500]
            : colors.yoggieRed[500],
        }}
      />
      <div>{status ? "Pass" : "Failed"}</div>
    </Stack>
  );
};

export default StatusIndicator;
