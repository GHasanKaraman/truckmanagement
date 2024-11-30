import { useSnackbar } from "notistack";
import { useNavigate } from "react-router-dom";
import { useResetRecoilState } from "recoil";
import { userInformations } from "../atoms/userAtoms";

const useSignOut = () => {
  const navigate = useNavigate();
  const reset = useResetRecoilState(userInformations);
  const { enqueueSnackbar } = useSnackbar();

  const logout = () => {
    localStorage.clear();
    navigate("/login");
    reset();
  };

  const forceLogin = () => {
    enqueueSnackbar("You are not authorized! Please sign in to the system!", {
      variant: "error",
    });
    localStorage.clear();
    navigate("/login");
    reset();
  };

  const controller = { logout, forceLogin };

  return [controller];
};

export default useSignOut;
