import { atom, selector } from "recoil";
import { getUserImage } from "../utils/getUserImage";

export const userInformations = atom({
  key: "userInformations",
  default: {
    image: "",
    name: "",
    surname: "",
    username: "",
    facility: "",
    position: "",
    zone: "",
    permissions: "",
    phone: "",
  },
});

export const userInfoParams = selector({
  key: "userInfo",
  get: ({ get }) => {
    const userInfo = get(userInformations);
    return userInfo;
  },
});

export const userImage = selector({
  key: "userImage",
  get: ({ get }) => {
    const { username } = get(userInformations);
    return getUserImage(username);
  },
});
