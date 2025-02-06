import React, { useState } from "react";
import { useShowToast } from "./useShowToast";
import { useSetRecoilState } from "recoil";
import { loggedInUserAtom } from "../src/atoms/loggedInUserAtom";

export const usePreviewImg = () => {
  const [imgUrl, setImgUrl] = useState(null);
  const showToast = useShowToast();
  const setLoggedInUser = useSetRecoilState(loggedInUserAtom);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader(); // javascript API
      reader.onloadend = () => {
        setImgUrl(reader.result);
        setLoggedInUser((prevUser) => ({
          ...prevUser,
          profilePic: reader.result, // Update the profilePic in the user state
        }));
      };
      reader.readAsDataURL(file); // turn file into base 64 string
    } else {
      showToast("Invalid file type", "Please select an image file.", "error");
      setImgUrl(null);
    }
  };
  return { handleImageChange, imgUrl, setImgUrl };
};
