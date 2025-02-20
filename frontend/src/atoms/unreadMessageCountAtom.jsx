import { atom } from "recoil";

export const unreadMessageCountAtom = atom({
  key: "unreadMessageCountAtom",
  default: 10,
});
