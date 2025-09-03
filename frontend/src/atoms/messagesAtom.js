import { atom } from "recoil";

export const conversationsAtom = atom({
  // list of conversations loggedInUser is part in.
  key: "conversationsAtom",
  default: [],
});

export const selectedConversationAtom = atom({
  // currently opened/active conversation
  key: "selectedConversationAtom",
  default: {
    _id: "", // id of the conversation
    userId: "", // id of the recepient user
    username: "",
    userProfilePic: "",
    name: "",
  },
});
