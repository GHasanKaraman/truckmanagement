import { Typography, Box, useTheme } from "@mui/material";
import { tokens } from "../theme";
import { IP } from "../env";

const ImageLabel = ({ title, folderIndex, fileName }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  return (
    <Box mb="10px" mt="5px">
      <Typography variant="h6" color={colors.grey[300]} sx={{ m: "0 0 0px 0" }}>
        {title}
      </Typography>
      <a
        href={"http://" + IP + "/imgs/" + +folderIndex + "/" + fileName}
        target="_blank"
        rel="noreferrer"
      >
        <img
          src={
            "http://" +
            IP +
            "/imgs/" +
            folderIndex +
            "/thumbnail-" +
            fileName?.substr(0, fileName?.lastIndexOf(".")) +
            ".jpeg"
          }
        />
      </a>
    </Box>
  );
};

export default ImageLabel;
