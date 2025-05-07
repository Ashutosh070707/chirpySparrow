import {
  Flex,
  Box,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  Stack,
  Button,
  Heading,
  Text,
  useColorModeValue,
  Link,
} from "@chakra-ui/react";

import { useState } from "react";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import { useSetRecoilState } from "recoil";
import { authScreenAtom } from "../atoms/authAtom";
import { useShowToast } from "../../hooks/useShowToast";
import { loggedInUserAtom } from "../atoms/loggedInUserAtom";

export function LoginCard() {
  const [showPassword, setShowPassword] = useState(false);
  const setAuthScreen = useSetRecoilState(authScreenAtom);
  const showToast = useShowToast();
  const setLoggedInUser = useSetRecoilState(loggedInUserAtom);
  const [loading, setLoading] = useState(false);

  const [inputs, setInputs] = useState({
    username: "",
    password: "",
  });

  const handleLogin = async () => {
    if (loading) return;
    if (!inputs.username.trim() || !inputs.password.trim()) {
      showToast("Error", "Please fill all required fields", "error");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/users/login", {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({
          username: inputs.username.trim(),
          password: inputs.password.trim(),
        }),
      });
      const data = await res.json();
      if (data.error) {
        showToast("Error", data.error, "error");
        return;
      }
      localStorage.setItem("user-chirpySparrow", JSON.stringify(data));
      setLoggedInUser(data);
    } catch (error) {
      showToast("Error", error, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Flex
      alignItems={"center"}
      justifyContent={"center"}
      mt={8}
      mx={"auto"}
      maxW={"md"}
    >
      <Box
        rounded={"lg"}
        bgColor="#1e1e1e"
        border="1px solid gray"
        p={{ base: 6, sm: 8 }}
        w={{
          sm: "380px",
          base: "95%",
        }}
      >
        <Stack spacing={4}>
          <FormControl isRequired>
            <FormLabel fontSize={{ base: "sm", sm: "md" }}>Username</FormLabel>
            <Input
              type="text"
              onChange={(e) => {
                setInputs({ ...inputs, username: e.target.value });
              }}
              value={inputs.username}
              autoComplete="off"
            />
          </FormControl>
          <FormControl isRequired>
            <FormLabel fontSize={{ base: "sm", sm: "md" }}>Password</FormLabel>
            <InputGroup>
              <Input
                type={showPassword ? "text" : "password"}
                onChange={(e) => {
                  setInputs({ ...inputs, password: e.target.value });
                }}
                value={inputs.password}
                autoComplete="off"
              />
              <InputRightElement h={"full"}>
                <Button
                  variant={"ghost"}
                  onClick={() => {
                    showPassword
                      ? setShowPassword(false)
                      : setShowPassword(true);
                  }}
                >
                  {showPassword ? <ViewIcon /> : <ViewOffIcon />}
                </Button>
              </InputRightElement>
            </InputGroup>
          </FormControl>
          <Stack spacing={10} pt={2}>
            <Button
              size="lg"
              bg={useColorModeValue("gray.600", "gray.700")}
              color={"white"}
              _hover={{
                bg: useColorModeValue("gray.700", "gray.800"),
              }}
              onClick={handleLogin}
              isLoading={loading}
              fontSize={{ base: "md", sm: "lg" }}
            >
              Login
            </Button>
          </Stack>
          <Stack pt={6}>
            <Text align={"center"} fontSize={{ base: "sm", sm: "md" }}>
              Don't have an account?{" "}
              <Link
                color={"blue.400"}
                onClick={() => {
                  setAuthScreen("signup");
                }}
              >
                Sign up
              </Link>
            </Text>
          </Stack>
        </Stack>
      </Box>
    </Flex>
  );
}
