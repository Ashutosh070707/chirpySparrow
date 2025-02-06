import { atom } from "recoil";

export const loggedInUserAtom = atom({
  key: "loggedInUserAtom",
  default: JSON.parse(localStorage.getItem("user-chirpySparrow")) || null,
});
