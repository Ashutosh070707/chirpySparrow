import React from "react";
import { SignUpCard } from "../components/SignUpCard";
import { LoginCard } from "../components/LoginCard";
import { authScreenAtom } from "../atoms/authAtom";
import { useRecoilValue } from "recoil";
import { LoginSignupHeader } from "../components/LoginSignupHeader";

export const AuthPage = () => {
  const authScreenState = useRecoilValue(authScreenAtom);
  return (
    <>
      <LoginSignupHeader />
      {authScreenState === "login" ? <LoginCard /> : <SignUpCard />}
    </>
  );
};
