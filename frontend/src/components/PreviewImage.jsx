import { CircularProgress } from "@mui/material";

const PreviewImage = ({ preview }) => {
  return preview ? (
    <img src={preview} width="130px" />
  ) : (
    <CircularProgress size={30} sx={{ color: "#73b569" }} />
  );
};

export default PreviewImage;
