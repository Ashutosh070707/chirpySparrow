import { atom } from "recoil";

export const feedPostsAtom = atom({
  key: "feedPostsAtom",
  default: [],
});

export const feedPageAtom = atom({
  key: "feedPageAtom",
  default: 1,
});

export const feedHasMoreAtom = atom({
  key: "feedHasMoreAtom",
  default: true,
});

export const feedScrollAtom = atom({
  key: "feedScrollAtom",
  default: 0,
});

export const feedLastSeenPostAtom = atom({
  key: "feedLastSeenPostAtom",
  default: null, // will hold post._id (string) or null
});
