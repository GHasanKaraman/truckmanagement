import { useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";

const useControl = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const isMatched = (respUser, user) => {
    if (user) {
      if (respUser) {
        const conds = [
          respUser.username === user.username,
          respUser.name === user.name,
          respUser.surname === user.surname,
          respUser.image === user.image,
          respUser.permissions === user.permissions,
          respUser.position === user.position,
          respUser._id === user._id,
        ];

        let result = true;

        for (let index = 0; index < conds.length; index++) {
          result &= conds[index];
        }

        return result;
      }
    }

    return false;
  };

  function fail() {
    enqueueSnackbar("You are not authorized! Please sign in to the system!", {
      variant: "error",
    });
    localStorage.clear();
    navigate("/login");
  }

  const control = (res, cond = false, inLogin = false) => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));
    if (token && user) {
      if (cond) {
        if (isMatched(res?.data?.records, user)) {
          return true;
        }
        fail();
        return false;
      }
      if (!inLogin && (res.status === 200 || res.status === 201)) {
        return true;
      }
      return true;
    } else {
      if (!inLogin) {
        fail();
        return false;
      }
      return false;
    }
  };

  return [control];
};
export default useControl;
