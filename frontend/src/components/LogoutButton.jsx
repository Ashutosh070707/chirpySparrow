import { Button } from "@chakra-ui/react";
import React from "react";
import { useShowToast } from "../../hooks/useShowToast";
import { useSetRecoilState } from "recoil";
import { loggedInUserAtom } from "../atoms/loggedInUserAtom";
import { FiLogOut } from "react-icons/fi";
export const LogoutButton = () => {
  const setUser = useSetRecoilState(loggedInUserAtom);
  const showToast = useShowToast();

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/users/logout", {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
      });
      const data = await res.json();
      if (data.error) {
        showToast("Error", data.error, "error");
        return;
      }

      localStorage.removeItem("user-threads");
      setUser(null);
    } catch (error) {
      showToast("Error", data.error, "error");
    }
  };
  return (
    <>
      <Button
        position={"fixed"}
        top={"30px"}
        right={"30px"}
        size={"sm"}
        onClick={handleLogout}
      >
        {" "}
        <FiLogOut size={20} />{" "}
      </Button>
    </>
  );
};
