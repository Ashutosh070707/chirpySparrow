import { atom } from "recoil";

// We have created a seperate searchedUserAtom because user can just type directly username on the seachbar in browser of other user to visit their profile page. There loggedInUser atom will not work. Thats why seperate atom for this.

export const searchedUserAtom = atom({
  key: "searchedUserAtom",
  default: null,
});
