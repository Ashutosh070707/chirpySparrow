import { atom } from "recoil";

export const conversationsAtom = atom({
  key: "conversationsAtom",
  default: [],
});

export const selectedConversationAtom = atom({
  key: "selectedConversationAtom",
  default: {
    _id: "", // id of the conversation
    userId: "", // id of the recepient user
    username: "",
    userProfilePic: "",
    name: "",
  },
});
