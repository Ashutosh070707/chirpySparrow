// Description:
// Renders the Signup component.

import {
  Flex,
  Box,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  HStack,
  InputRightElement,
  Stack,
  Button,
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

export function SignUpCard() {
  const [showPassword, setShowPassword] = useState(false);
  const setAuthScreen = useSetRecoilState(authScreenAtom);
  const showToast = useShowToast();
  const setLoggedInUser = useSetRecoilState(loggedInUserAtom);
  const [loading, setLoading] = useState(false);
  const [inputs, setInputs] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
  });

  // What it does:
  // Call the backend to create the user, if user exists - throw error. If user does not exists, create a JWT token named 'jwt' and store it in cookie in response of life - 15 days. And finally return the details of user which we store in loggedInUser atom and in our localStorage.

  const handleSignup = async () => {
    if (loading) return;
    if (
      !inputs.fullName.trim() ||
      !inputs.username.trim() ||
      !inputs.email.trim() ||
      !inputs.password.trim()
    ) {
      showToast("Error", "Please fill all required fields", "error");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/users/signup", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          fullName: inputs.fullName.trim(),
          username: inputs.username.trim(),
          email: inputs.email.trim(),
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
      showToast("Error in signupCard", data.error, "error");
    } finally {
      setLoading(false);
      setInputs({
        fullName: "",
        username: "",
        email: "",
        password: "",
      });
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
        <Stack spacing={2}>
          <FormControl isRequired>
            <FormLabel fontSize={{ base: "sm", sm: "md" }}>Full name</FormLabel>
            <Input
              type="text"
              onChange={(e) => {
                setInputs({ ...inputs, fullName: e.target.value });
              }}
              value={inputs.fullName}
              autoComplete="off"
            />
          </FormControl>
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
            <FormLabel fontSize={{ base: "sm", sm: "md" }}>
              Email address
            </FormLabel>
            <Input
              type="email"
              onChange={(e) => {
                setInputs({ ...inputs, email: e.target.value });
              }}
              value={inputs.email}
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
                  variant="ghost"
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
          <Stack pt={4}>
            <Button
              size="lg"
              bg={useColorModeValue("gray.600", "gray.700")}
              color={"white"}
              _hover={{
                bg: useColorModeValue("gray.700", "gray.600"),
              }}
              onClick={handleSignup}
              isLoading={loading}
              fontSize={{ base: "md", sm: "lg" }}
            >
              Sign up
            </Button>
          </Stack>
          <Stack pt={6}>
            <Text align={"center"} fontSize={{ base: "sm", sm: "md" }}>
              Already an user?{" "}
              <Link
                color={"blue.400"}
                onClick={() => {
                  setAuthScreen("login");
                }}
              >
                Login
              </Link>
            </Text>
          </Stack>
        </Stack>
      </Box>
    </Flex>
  );
}
