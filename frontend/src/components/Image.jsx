import { Box } from "@mui/material";
import { IP } from "../env";

const Image = ({ fileName, width }) => {
  return (
    <Box mb="10px" mt="5px">
      <a
        href={"http://" + IP + "/" + fileName}
        target="_blank"
        style={{ cursor: "zoom-in" }}
      >
        <img
          width={width}
          src={
            "http://" +
            IP +
            "/uploads/" +
            "thumbnail-" +
            fileName?.substr(
              fileName?.indexOf("/") + 1,
              fileName?.lastIndexOf(".")
            )
          }
        />
      </a>
    </Box>
  );
};

export default Image;
