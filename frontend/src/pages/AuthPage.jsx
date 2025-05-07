import React from "react";
import { SignUpCard } from "../components/SignUpCard";
import { LoginCard } from "../components/LoginCard";
import { authScreenAtom } from "../atoms/authAtom";
import { useRecoilValue } from "recoil";
import { Brand } from "../components/Brand";
import { Box, Flex } from "@chakra-ui/react";

export const AuthPage = () => {
  const authScreenState = useRecoilValue(authScreenAtom);
  return (
    <Box
      minH="100vh"
      bgImage="url('/back5.png')"
      bgSize="cover"
      bgPosition="center"
      bgRepeat="no-repeat"
      display="flex"
      flexDir="column"
      justifyContent="center"
      pt={10}
      pb={10}
    >
      <Flex direction="column" alignItems="center" justifyContent="center">
        <Brand />
        {authScreenState === "login" ? <LoginCard /> : <SignUpCard />}
      </Flex>
    </Box>
  );
};
