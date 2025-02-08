import { SearchIcon } from "@chakra-ui/icons";
import {
  Avatar,
  Box,
  Button,
  Divider,
  Flex,
  Input,
  Link,
  Spinner,
  Text,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
} from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import { useShowToast } from "../../hooks/useShowToast";
import { useRecoilValue } from "recoil";
import { loggedInUserAtom } from "../atoms/loggedInUserAtom";
import { SuggestedUser } from "../components/SuggestedUser";
import { debounce } from "lodash";
import { Link as RouterLink } from "react-router-dom";

export const SearchUserPage = () => {
  const showToast = useShowToast();
  const loggedInUser = useRecoilValue(loggedInUserAtom);
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [fetchingSuggestedUsers, setFetchingSuggestedUsers] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [searchingUser, setSearchingUser] = useState(false);
  const [searchedUsers, setSearchedUsers] = useState([]);
  const prevSearchText = useRef("");
  const inputRef = useRef(null);

  useEffect(() => {
    const getSuggestedUsers = async () => {
      setFetchingSuggestedUsers(true);
      try {
        const res = await fetch(`/api/users/suggested`);
        const data = await res.json();
        if (data.error) {
          showToast("Error", data.error, "error");
          return;
        }
        setSuggestedUsers(data);
      } catch (error) {
        showToast("Error", error.message, "error");
      } finally {
        setFetchingSuggestedUsers(false);
      }
    };

    if (loggedInUser) {
      getSuggestedUsers();
    }
  }, [loggedInUser, showToast]);

  const handleSearchUser = async () => {
    if (!searchText.trim()) return; // Skip search if input is empty
    setSearchingUser(true);
    try {
      const res = await fetch(`/api/users/searching/${searchText}`, {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({ username: searchText }),
      });
      const data = await res.json();
      if (data.error) {
        showToast("Error", data.error, "error");
        return;
      }
      setSearchedUsers(data);
    } catch (error) {
      showToast("Error", error.message, "error");
    } finally {
      setSearchingUser(false);
    }
  };

  // Debounce the search function
  const debouncedSearch = debounce(handleSearchUser, 400);

  useEffect(() => {
    // Check if searchText is non-empty and different from the previous value
    if (searchText.trim() && searchText !== prevSearchText.current) {
      debouncedSearch();
      prevSearchText.current = searchText; // Update the previous searchText
    }

    // Cleanup to cancel pending debounced calls on unmount or searchText change
    return () => debouncedSearch.cancel();
  }, [searchText, debouncedSearch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchText.length > 0) {
      handleSearchUser();
    }
    setSearchText("");
  };

  return (
    <Flex w="full" justifyContent="center" h="100vh">
      <Flex
        w={{ base: "60%", sm: "90%", md: "80%", lg: "70%", xl: "60%" }}
        bg="gray.800"
        p={{ base: 6, sm: 4, md: 4, lg: 6, xl: 6 }}
        direction="column"
        // m="10%"
        mt={{ base: "6%", sm: "10%", md: "10%", lg: "6%", xl: "6%" }}
        h="75%"
        borderRadius={10}
        gap={8}
      >
        <form
          onSubmit={
            searchText.length > 0 ? handleSubmit : (e) => e.preventDefault()
          }
        >
          <Flex alignItems="center" gap={2}>
            <Input
              placeholder="Search here"
              value={searchText}
              onChange={(e) => {
                setSearchText(e.target.value); // Just update state here
                setSearchedUsers([]);
              }}
              spellCheck={false}
              borderRadius={20}
            />
            <Button
              type="submit"
              size="md"
              isLoading={searchingUser}
              borderRadius={100}
            >
              <SearchIcon />
            </Button>
          </Flex>
        </form>

        {searchedUsers.length > 0 && (
          <Flex
            w="full"
            direction="column"
            h="240px"
            maxH="240px"
            overflowY="auto"
            gap={1}
            borderRadius={10}
            bgColor="gray.700"
          >
            {searchedUsers.map((user) => (
              <Flex
                key={user._id}
                justifyContent="flex-start"
                alignItems="center"
                p={2}
                borderRadius="md"
                _hover={{
                  bg: "gray.600",
                  cursor: "pointer",
                }}
              >
                <Avatar
                  name={user.name}
                  src={
                    user.profilePic || "https://example.com/default-avatar.png"
                  }
                  size="md"
                />
                <Link
                  as={RouterLink}
                  to={`/${user.username}`}
                  textDecoration="none"
                  _hover={{ textDecoration: "none" }}
                  ml={3}
                >
                  <Flex direction="column">
                    <Text fontSize="md" fontWeight="bold">
                      {user.name}
                    </Text>
                    <Text color="gray.500" fontSize="sm">
                      {user.username}
                    </Text>
                  </Flex>
                </Link>
              </Flex>
            ))}
          </Flex>
        )}
        {/* {searchedUsers.length > 0 && (
          <Popover isOpen={searchedUsers.length > 0} placement="bottom-start">
            <PopoverTrigger>
              <Box />
            </PopoverTrigger>
            <PopoverContent mt={2}>
              <PopoverBody p={0}>
                <Flex
                  direction="column"
                  h="240px"
                  maxH="240px"
                  overflowY="auto"
                  gap={1}
                  borderRadius={10}
                  bgColor="gray.700"
                >
                  {searchedUsers.map((user) => (
                    <Flex
                      key={user._id}
                      justifyContent="flex-start"
                      alignItems="center"
                      p={2}
                      borderRadius="md"
                      _hover={{
                        bg: "gray.600",
                        cursor: "pointer",
                      }}
                    >
                      <Avatar
                        name={user.name}
                        src={
                          user.profilePic ||
                          "https://example.com/default-avatar.png"
                        }
                        size="md"
                      />
                      <Link
                        as={RouterLink}
                        to={`/${user.username}`}
                        textDecoration="none"
                        _hover={{ textDecoration: "none" }}
                        ml={3}
                      >
                        <Flex direction="column">
                          <Text fontSize="md" fontWeight="bold">
                            {user.name}
                          </Text>
                          <Text color="gray.500" fontSize="sm">
                            {user.username}
                          </Text>
                        </Flex>
                      </Link>
                    </Flex>
                  ))}
                </Flex>
              </PopoverBody>
            </PopoverContent>
          </Popover>
        )} */}

        {fetchingSuggestedUsers && (
          <Flex
            direction="column"
            gap={5}
            h="400px"
            w="full"
            borderRadius={5}
            justifyContent="center"
            alignItems="center"
            p={10}
          >
            <Flex>
              <Spinner size="xl"></Spinner>
            </Flex>
          </Flex>
        )}
        {!fetchingSuggestedUsers && suggestedUsers.length > 0 && (
          <Flex
            direction="column"
            gap={3}
            h="400px"
            maxH="400px"
            overflowY="auto"
            border="1px solid gray"
            borderRadius={20}
            w="full"
            p={5}
          >
            <Text
              fontSize={{ base: "md", sm: "sm", md: "md", lg: "md", xl: "md" }}
              fontWeight="bold"
            >
              Suggested User:
            </Text>
            <Divider></Divider>
            <Flex direction="column" w="full" gap={2}>
              {suggestedUsers.map((suggestedUser) => (
                <SuggestedUser
                  key={suggestedUser._id}
                  suggestedUser={suggestedUser}
                ></SuggestedUser>
              ))}
            </Flex>
          </Flex>
        )}
      </Flex>
    </Flex>
  );
};
