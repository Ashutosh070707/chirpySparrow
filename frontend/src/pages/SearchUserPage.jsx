import { SearchIcon } from "@chakra-ui/icons";
import {
  Avatar,
  Button,
  Divider,
  Flex,
  Input,
  Link,
  Spinner,
  Text,
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
  const prevSearchText = useRef(""); // Use ref to store previous search text without triggering re-renders

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
      const res = await fetch(`/api/users/searching/${searchText.trim()}`, {
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
    if (!searchText.trim()) {
      prevSearchText.current = ""; // Clear previous search text when input is empty
      return;
    }

    // Only trigger the search if the search text has changed
    if (searchText !== prevSearchText.current) {
      debouncedSearch();
      prevSearchText.current = searchText; // Update prevSearchText
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
    prevSearchText.current = ""; // Reset after search submission
  };

  return (
    <Flex w="full" justifyContent="center" h="100vh">
      <Flex
        w={{ base: "60%", sm: "100%", md: "100%", lg: "90%", xl: "90%" }}
        h={{ base: "75%", sm: "100%", md: "100%", lg: "90%", xl: "90%" }}
        p={{ base: 6, sm: 4, md: 4, lg: 6, xl: 6 }}
        border={{
          base: "1px solid white",
          sm: "none",
          md: "none",
          lg: "1px solid white",
          xl: "1px solid white",
        }}
        borderRadius={10}
        direction="column"
        mt={{ base: "6%", sm: "0", md: "0", lg: "3%", xl: "3%" }}
        gap={4}
      >
        {/* Search form remains the same */}
        <form
          onSubmit={
            searchText.length > 0 ? handleSubmit : (e) => e.preventDefault()
          }
        >
          <Flex alignItems="center" gap={2} w="full" mt={2}>
            <Input
              placeholder="Search here"
              value={searchText}
              onChange={(e) => {
                setSearchText(e.target.value);
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
            h={{ base: "20%", sm: "20%", md: "20%", lg: "25%", xl: "25%" }}
            maxH={{ base: "30%", sm: "20%", md: "35%", lg: "25%", xl: "25%" }}
            overflowY="auto"
            gap={1}
            borderRadius={10}
            className="custom-scrollbar"
          >
            {searchedUsers.map((user) => (
              <Link
                as={RouterLink}
                to={`/${user.username}`}
                textDecoration="none"
                _hover={{ textDecoration: "none" }}
                key={user._id}
                ml={3}
              >
                <Flex
                  justifyContent="flex-start"
                  alignItems="center"
                  p={2}
                  borderRadius="md"
                  _hover={{
                    bg: "gray.900",
                    cursor: "pointer",
                  }}
                  gap={3}
                >
                  <Avatar
                    name={user.name}
                    src={
                      user.profilePic ||
                      "https://example.com/default-avatar.png"
                    }
                    size="md"
                  />

                  <Flex direction="column">
                    <Text fontSize="md" fontWeight="bold">
                      {user.name}
                    </Text>
                    <Text color="gray.500" fontSize="sm">
                      {user.username}
                    </Text>
                  </Flex>
                </Flex>
              </Link>
            ))}
          </Flex>
        )}

        {fetchingSuggestedUsers && (
          <Flex
            direction="column"
            gap={5}
            h="60%"
            w="full"
            borderRadius={5}
            justifyContent="center"
            alignItems="center"
            p={10}
          >
            <Flex h="full" alignItems="center" justifyContent="center">
              <Spinner size="xl" />
            </Flex>
          </Flex>
        )}

        {!fetchingSuggestedUsers && suggestedUsers.length > 0 && (
          <Flex
            direction="column"
            className="custom-scrollbar"
            gap={3}
            h={{ base: "50%", sm: "60%", md: "60%", lg: "60%", xl: "60%" }}
            maxH={{ base: "60%", sm: "85%", md: "85%", lg: "85%", xl: "85%" }}
            overflowY="auto"
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
            <Divider />
            <Flex direction="column" w="full" gap={2}>
              {suggestedUsers.map((suggestedUser) => (
                <SuggestedUser
                  key={suggestedUser._id}
                  suggestedUser={suggestedUser}
                />
              ))}
            </Flex>
          </Flex>
        )}
      </Flex>
    </Flex>
  );
};
