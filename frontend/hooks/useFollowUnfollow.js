import { useEffect, useState } from "react";
import { useShowToast } from "./useShowToast";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { loggedInUserAtom } from "../src/atoms/loggedInUserAtom";
import { searchedUserAtom } from "../src/atoms/searchedUserAtom";

export const useFollowUnfollow = (searchedUser) => {
  const showToast = useShowToast();
  const loggedInUser = useRecoilValue(loggedInUserAtom);
  const setSearchedUser = useSetRecoilState(searchedUserAtom);
  const [updating, setUpdating] = useState(false);
  const [following, setFollowing] = useState(false);

  useEffect(() => {
    if (searchedUser && loggedInUser) {
      setFollowing(
        searchedUser.followers.some(
          (follower) => follower.followerId === loggedInUser._id
        )
      );
    }
  }, [searchedUser, loggedInUser]);

  const handleFollowUnfollow = async () => {
    if (updating) return;
    setUpdating(true);
    try {
      const res = await fetch(`/api/users/follow/${searchedUser._id}`, {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({ id: searchedUser._id }),
      });
      const data = await res.json();
      if (data.error) {
        showToast("Error", data.error, "error");
        return;
      }
      showToast("Success", `${data.message}`, "success");

      setSearchedUser((prevSearchedUser) => {
        let updatedFollowers;

        if (following) {
          updatedFollowers = prevSearchedUser.followers.filter(
            (follower) => follower.followerId !== loggedInUser._id
          );
        } else {
          updatedFollowers = [
            ...prevSearchedUser.followers,
            {
              followerId: loggedInUser._id,
              name: loggedInUser.name,
              username: loggedInUser.username,
              profilePic: loggedInUser.profilePic,
            },
          ];
        }

        return {
          ...prevSearchedUser,
          followers: updatedFollowers,
        };
      });

      setFollowing(!following);
    } catch (error) {
      showToast("Error", error, "error");
    } finally {
      setUpdating(false);
    }
  };
  return { handleFollowUnfollow, updating, following };
};
