import { useEffect } from "react";
import { Box, IconButton, Typography } from "@mui/material";
import Logout from "@mui/icons-material/Logout";
import { Home } from "@mui/icons-material";

import logo from "../../images/ezgif.com-crop.gif";
import useSignOut from "../../hooks/useSignOut";
import { useNavigate } from "react-router-dom";

const NoAccessPage = (props) => {
  const [controller] = useSignOut();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = props.title || "";
  }, [props.title]);

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
      }}
    >
      <Box sx={{ textAlign: "end", p: 1 }}>
        <IconButton
          onClick={() => {
            navigate("/dashboard");
          }}
        >
          <Home fontSize="large" />
        </IconButton>

        <IconButton
          onClick={() => {
            controller.logout();
          }}
        >
          <Logout fontSize="large" />
        </IconButton>
      </Box>
      <Box
        sx={{
          textAlign: "center",
          alignContent: "center",
          width: "100%",
          height: "100%",
        }}
      >
        <img alt="logo" src={logo} style={{ marginTop: -100 }} />
        <Typography variant="h2" fontWeight="bold" sx={{ pt: 10 }}>
          Forbidden (403)
        </Typography>
        <Typography>Sorry, you cannot access this page</Typography>
      </Box>
    </Box>
  );
};

export default NoAccessPage;
