import { SearchIcon } from "@chakra-ui/icons";
import {
  Avatar,
  Box,
  Button,
  Flex,
  Image,
  Input,
  Skeleton,
  SkeletonCircle,
  Stack,
  Text,
  useColorMode,
  useColorModeValue,
} from "@chakra-ui/react";
import React from "react";
import { useState } from "react";
import { useShowToast } from "../../hooks/useShowToast";
import { Link } from "react-router-dom";

export const Navbar = () => {
  const showToast = useShowToast();
  const { colorMode, toggleColorMode } = useColorMode();
  const [searchText, setSearchText] = useState("");
  const [searchedUser, setSearchedUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(false);
  const hoverBgColor = useColorModeValue("gray.600", "gray.800");

  const handleConversationSearch = async (e) => {
    e.preventDefault();
    setLoadingUser(true);
    try {
      const res = await fetch(`/api/users/profile/${searchText}`);
      const searchedUser = await res.json();
      if (searchedUser.error) {
        showToast("Error", searchedUser.error, "error");
        return;
      }
      setSearchedUser(searchedUser);
    } catch (error) {
      showToast("Error", error.message, "error");
    } finally {
      setLoadingUser(false);
      setSearchText("");
    }
  };

  return (
    <Flex
      justifyContent={"space-between"}
      alignItems="center"
      position="sticky"
      top="0"
      bg={colorMode === "dark" ? "gray.900" : "white"}
      h={"10%"}
      zIndex="1000"
    >
      <Flex>
        <Image
          cursor={"pointer"}
          alt="logo"
          w={10}
          src={colorMode == "dark" ? "/light-logo.svg" : "/dark-logo.svg"}
          onClick={toggleColorMode}
        ></Image>
        <Box fontSize="45px">Threads</Box>
      </Flex>

      <Box mr="2%" w="350px">
        <form onSubmit={(e) => handleConversationSearch(e)}>
          <Flex alignItems="center" gap={2}>
            <Input
              placeholder="Search here"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              spellCheck={false}
              borderRadius="20px"
            ></Input>
            <Button
              size="md"
              onClick={(e) => handleConversationSearch(e)}
              isLoading={loadingUser}
            >
              <SearchIcon></SearchIcon>
            </Button>
          </Flex>
        </form>

        {loadingUser &&
          [0, 1, 2, 3, 4].map((_, i) => (
            <Flex
              key={i}
              gap={4}
              alignItems={"center"}
              p={"1"}
              borderRadius={"md"}
            >
              <Box>
                <SkeletonCircle size={"10"} />
              </Box>
              <Flex w={"full"} flexDirection={"column"} gap={3}>
                <Skeleton h={"10px"} w="80px" />
                <Skeleton h={"10px"} w="90%" />
              </Flex>
            </Flex>
          ))}

        {!loadingUser && searchedUser && (
          <Flex
            gap={4}
            p={"1"}
            _hover={{
              cursor: "pointer",
              bg: hoverBgColor,
              color: "white",
            }}
            borderRadius={"md"}
          >
            <Flex
              gap={2}
              as={Link}
              to={`${searchedUser.username}`}
              alignItems={"center"}
              mt={"10px"}
              mb={"10px"}
            >
              <Avatar
                size={{ base: "xs", sm: "sm", md: "md" }}
                src={searchedUser?.profilePic}
              ></Avatar>

              <Stack direction={"column"} fontSize={"sm"}>
                <Text fontWeight="700" display="flex" alignItems="center">
                  {searchedUser.username.length > 18
                    ? searchedUser.username.substring(0, 24) + "..."
                    : searchedUser.username}
                  <Image src="/verified.png" w="4" h={4} ml={1}></Image>
                </Text>
              </Stack>
            </Flex>
          </Flex>
        )}
      </Box>
    </Flex>
  );
};
