import { atom } from "recoil";

export const replyingToMessageAtom = atom({
  key: "replyingToMessageAtom",
  default: {
    sender: null,
    text: "",
    image: "",
    gif: "",
  },
});
