import { Box, Button, Flex, Text } from "@chakra-ui/react";
import React from "react";
import { useShowToast } from "../../hooks/useShowToast";
import { useLogout } from "../../hooks/useLogout";

export const FreezeAccount = () => {
  const showToast = useShowToast();
  const logout = useLogout();
  const freezeAccount = async () => {
    if (!window.confirm("Are you sure you want to freeze your account?"))
      return;

    try {
      const res = await fetch("/api/users/freeze", {
        method: "PUT",
        headers: { "content-type": "application/json" },
      });
      const data = await res.json();
      if (data.error) {
        showToast("Error", data.error, "error");
        return;
      }
      if (data.success) {
        await logout();
        showToast("Succes", "Your account has been frozen", "success");
      }
    } catch (error) {
      showToast("Error", error.message, "error");
    }
  };
  return (
    <Flex w="full" justifyContent="center">
      <Flex
        w={"50%"}
        mt="5%"
        justifyContent="center"
        direction="column"
        gap={15}
      >
        <Flex justifyContent="center">
          <Text fontSize="4xl" fontWeight={"bold"}>
            Freeze Account
          </Text>
        </Flex>
        <Flex justifyContent={"space-between"}>
          <Flex direction="column">
            <Text fontSize="md" fontWeight={"bold"}>
              Freeze Your Account
            </Text>
            <Text>You can unfreeze your account anytime by logging in.</Text>
          </Flex>
          <Button size={"sm"} colorScheme="red" onClick={freezeAccount}>
            Freeze
          </Button>
        </Flex>
      </Flex>
    </Flex>
  );
};
