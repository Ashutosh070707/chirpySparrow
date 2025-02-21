import {
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Stack,
  useColorModeValue,
  Avatar,
  Center,
  Box,
} from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import { useRecoilState } from "recoil";

import { loggedInUserAtom } from "../atoms/loggedInUserAtom";
import { usePreviewImg } from "../../hooks/usePreviewImg";
import { useShowToast } from "../../hooks/useShowToast";
import { useNavigate } from "react-router-dom";

export function UpdateProfilePage() {
  const [loggedInUser, setLoggedInUser] = useRecoilState(loggedInUserAtom);
  const navigate = useNavigate();
  const [inputs, setInputs] = useState({
    name: loggedInUser.name,
    username: loggedInUser.username,
    email: loggedInUser.email,
    bio: loggedInUser.bio,
    profilePic: loggedInUser.profilePic,
    password: "",
  });
  const fileRef = useRef(null);
  const [updating, setUpdating] = useState(false);

  const showToast = useShowToast();

  const { handleImageChange, imgUrl } = usePreviewImg();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (updating) return;
    setUpdating(true);
    try {
      const res = await fetch(`/api/users/update/${loggedInUser._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...inputs, profilePic: imgUrl }),
      });
      const data = await res.json();
      if (data.error) {
        showToast("Error", data.error, "error");
        return;
      }
      showToast("Success", "Profile updated successfully", "success");
      setLoggedInUser(data);
      localStorage.setItem("user-chirpySparrow", JSON.stringify(data));
      navigate(`/${data.username}`);
    } catch (error) {
      showToast("Error", error.message, "error");
    } finally {
      setUpdating(false);
    }
  };

  const handleCancel = () => {
    navigate(`/${loggedInUser.username}`);
  };

  return (
    <Flex
      justifyContent={"center"}
      w={"full"}
      alignItems="center"
      minHeight="100vh"
    >
      <Box
        w={{ base: "40%", sm: "90%", md: "60%", lg: "60%", xl: "45%" }}
        alignItems="center"
        mt="2%"
      >
        <form onSubmit={handleSubmit}>
          <Flex alignItems={"center"} justifyContent={"center"}>
            <Stack
              spacing={2}
              w={"full"}
              maxW={"md"}
              bg={useColorModeValue("white", "gray.dark")}
              rounded={"xl"}
              boxShadow={"lg"}
              p={6}
            >
              <Flex alignItems="center" justifyContent="center" mb="2%">
                <Heading lineHeight={1.1} fontSize={{ base: "3xl" }}>
                  Update Profile
                </Heading>
              </Flex>
              <FormControl id="userName">
                <Stack direction={["column", "row"]} spacing={6}>
                  <Center>
                    <Avatar
                      name={loggedInUser.name}
                      src={
                        imgUrl ||
                        loggedInUser.profilePic ||
                        "https://example.com/default-avatar.png"
                      }
                      size="xl"
                      boxShadow={"md"}
                    />
                  </Center>

                  <Center w="full">
                    <Button w="full" onClick={() => fileRef.current.click()}>
                      Change Avatar
                    </Button>
                    <Input
                      type="file"
                      hidden
                      ref={fileRef}
                      onChange={handleImageChange}
                    />
                  </Center>
                </Stack>
              </FormControl>
              <FormControl>
                <FormLabel>Full name</FormLabel>
                <Input
                  placeholder="John Doe"
                  value={inputs.name}
                  onChange={(e) =>
                    setInputs({ ...inputs, name: e.target.value })
                  }
                  _placeholder={{ color: "gray.500" }}
                  type="text"
                />
              </FormControl>
              <FormControl>
                <FormLabel>Username</FormLabel>
                <Input
                  placeholder="johndoe"
                  value={inputs.username}
                  onChange={(e) =>
                    setInputs({ ...inputs, username: e.target.value })
                  }
                  _placeholder={{ color: "gray.500" }}
                  type="text"
                />
              </FormControl>
              <FormControl>
                <FormLabel>Email</FormLabel>
                <Input
                  placeholder="your-email@example.com"
                  value={inputs.email}
                  onChange={(e) =>
                    setInputs({ ...inputs, email: e.target.value })
                  }
                  _placeholder={{ color: "gray.500" }}
                  type="email"
                />
              </FormControl>
              <FormControl>
                <FormLabel>Bio</FormLabel>
                <Input
                  placeholder="Your bio."
                  value={inputs.bio}
                  onChange={(e) =>
                    setInputs({ ...inputs, bio: e.target.value })
                  }
                  _placeholder={{ color: "gray.500" }}
                  type="text"
                />
              </FormControl>
              <FormControl>
                <FormLabel>Password</FormLabel>
                <Input
                  placeholder="password"
                  value={inputs.password}
                  onChange={(e) =>
                    setInputs({ ...inputs, password: e.target.value })
                  }
                  _placeholder={{ color: "gray.500" }}
                  type="password"
                />
              </FormControl>
              <Stack spacing={6} direction={["column", "row"]}>
                <Button
                  bg={"red.400"}
                  color={"white"}
                  w="full"
                  _hover={{
                    bg: "red.500",
                  }}
                  onClick={handleCancel}
                >
                  Cancel
                </Button>
                <Button
                  bg={"green.400"}
                  color={"white"}
                  w="full"
                  _hover={{
                    bg: "green.500",
                  }}
                  type="submit"
                  isLoading={updating}
                >
                  Submit
                </Button>
              </Stack>
            </Stack>
          </Flex>
        </form>
      </Box>
    </Flex>
  );
}
