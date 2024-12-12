import { atom, selector } from "recoil";

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
