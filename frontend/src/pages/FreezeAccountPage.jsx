import { Button, Flex, Text } from "@chakra-ui/react";
import { useShowToast } from "../../hooks/useShowToast";
import { useLogout } from "../../hooks/useLogout";

export const FreezeAccountPage = () => {
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
        w={{ base: "90%", sm: "70%", md: "70%", lg: "50%", xl: "50%" }}
        mt={{ base: "10%", sm: "10%", md: "8%", lg: "5%", xl: "5%" }}
        justifyContent="center"
        direction="column"
        gap={5}
      >
        <Flex justifyContent="center" mb="4%" w="full">
          <Text
            fontSize={{
              base: "xl",
              sm: "3xl",
              md: "4xl",
              lg: "4xl",
              xl: "4xl",
            }}
            fontWeight={"bold"}
          >
            Freeze Account
          </Text>
        </Flex>
        <Flex justifyContent={"space-between"} w="full">
          <Flex direction="column" gap={3}>
            <Text fontSize={{ base: "md", sm: "lg" }} fontWeight={"bold"}>
              Freeze Your Account :
            </Text>
            <Text fontSize={{ base: "sm", sm: "md" }}>
              You can unfreeze your account anytime by logging in.
            </Text>
          </Flex>
          <Button
            size={{ base: "sm", sm: "md" }}
            bgColor="red.500"
            onClick={freezeAccount}
          >
            Freeze
          </Button>
        </Flex>
      </Flex>
    </Flex>
  );
};
