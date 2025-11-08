// Description:
// Renders the Signup component.

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

    // Define trimmed values for consistent checking and submission
    const trimmedFullName = inputs.fullName.trim();
    const trimmedUsername = inputs.username.trim();
    const trimmedEmail = inputs.email.trim();
    const trimmedPassword = inputs.password.trim();

    // 1. Check for missing/empty fields (using the trimmed constants)
    if (
      !trimmedFullName ||
      !trimmedUsername ||
      !trimmedEmail ||
      !trimmedPassword
    ) {
      showToast("Error", "Please fill all required fields", "error");
      return;
    }

    // 1.1. Username validation:
    // - Continuous (no spaces)
    // - Only characters, numbers, underscore, and hyphen allowed (to cover common special chars)
    // - Minimum length (e.g., 3)
    const usernameRegex = /^[a-z0-9_-]+$/;
    // Check against the trimmed value
    if (!usernameRegex.test(trimmedUsername) || trimmedUsername.length < 3) {
      showToast(
        "Error",
        "Username must be at least 3 characters long, continuous (no spaces), and contain only lowercase letters, numbers, hyphens, or underscores."
      );
      return;
    }

    // 1.3. Password validation:
    // - No capital letters allowed (must be all lowercase, numbers, and allowed special characters)
    // - Minimum length (e.g., 6)
    // - Allowed characters: lowercase letters, numbers, and common special characters
    // 3. Password validation:
    const passwordRegex = /^[a-z0-9!@#$%^&*()_+]{6,}$/;

    // Check against the trimmed value
    if (trimmedPassword.length < 6) {
      showToast(
        "Error",
        "Password must be at least 6 characters long.",
        "error"
      );
      return;
    }
    // Check against the trimmed value
    if (/[A-Z]/.test(trimmedPassword)) {
      showToast(
        "Error",
        "Password must not contain any capital letters.",
        "error"
      );
      return;
    }
    // Check against the trimmed value
    if (!passwordRegex.test(trimmedPassword)) {
      showToast(
        "Error",
        "Password contains disallowed characters or formatting issues."
      );
      return;
    }

    // 4. Email validation:
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    // Check against the trimmed value
    if (!emailRegex.test(trimmedEmail)) {
      showToast("Error", "Please enter a valid email address.", "error");
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
          fullName: trimmedFullName,
          username: trimmedUsername,
          email: trimmedEmail,
          password: trimmedPassword,
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
