import { useSetRecoilState } from "recoil";
import { useShowToast } from "./useShowToast";
import { loggedInUserAtom } from "../src/atoms/loggedInUserAtom";
import { useNavigate } from "react-router-dom";

export const useLogout = () => {
  const setUser = useSetRecoilState(loggedInUserAtom);
  const showToast = useShowToast();
  const navigate = useNavigate();
  const logout = async () => {
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

      localStorage.removeItem("user-chirpySparrow");
      setUser(null);
      navigate("/auth");
    } catch (error) {
      showToast("Error", data.error, "error");
    }
  };
  return logout;
};
