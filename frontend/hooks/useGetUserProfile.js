import { useEffect, useState } from "react";
import { useShowToast } from "./useShowToast";
import { useRecoilState } from "recoil";
import { searchedUserAtom } from "../src/atoms/searchedUserAtom";

export const useGetUserProfile = (username) => {
  const [searchedUser, setSearchedUser] = useRecoilState(searchedUserAtom);
  const [loading, setLoading] = useState(true);
  const showToast = useShowToast();

  useEffect(() => {
    const getSearchedUser = async () => {
      try {
        const res = await fetch(`/api/users/profile/${username}`);
        const data = await res.json();
        if (data.error) {
          showToast("Error", data.error, "error");
          return;
        }
        if (data.isFrozen) {
          setSearchedUser(null);
          return;
        }
        setSearchedUser(data);
      } catch (error) {
        showToast("Error", error, "error");
      } finally {
        setLoading(false);
      }
    };
    getSearchedUser();
  }, [username, showToast]);

  return { searchedUser, loading };
};
