import { useRecoilState, useRecoilValue } from "recoil";
import { loggedInUserAtom } from "../atoms/loggedInUserAtom";
import { useEffect, useState } from "react";
import { Box, Divider, Flex, Spinner, Text } from "@chakra-ui/react";
import { useShowToast } from "../../hooks/useShowToast";
import { Follower } from "../components/Follower";

export const FollowersPage = () => {
  const loggedInUser = useRecoilValue(loggedInUserAtom);
  const showToast = useShowToast();
  const [followers, setFollowers] = useState([]);
  const [fetchingProfile, setFetchingProfile] = useState(true);

  useEffect(() => {
    const getUserProfile = async () => {
      try {
        setFetchingProfile(true);
        const res = await fetch(`/api/users/profile/${loggedInUser.username}`);
        const data = await res.json();
        if (data.error) {
          showToast("Error", data.error, "error");
        }
        setFollowers(data.followers);
      } catch (error) {
        showToast("Error", error.message, "error");
        setFollowers(null);
      } finally {
        setFetchingProfile(false);
      }
    };

    if (loggedInUser) {
      getUserProfile();
    }
  }, [loggedInUser, showToast]);

  return (
    <Flex justifyContent="center" w="full" h="100vh">
      {fetchingProfile ? (
        <Flex justifyContent={"center"} alignItems="center" w="full" h="100vh">
          <Spinner size="xl" />
        </Flex>
      ) : followers.length === 0 ? (
        <Flex w="full" h="100vh" justifyContent="center" alignItems="center">
          <Text fontSize="2xl">"No followers"</Text>
        </Flex>
      ) : (
        <Flex
          w={{ base: "60%", sm: "90%", md: "80%", lg: "60%", xl: "60%" }}
          m="8%"
          bg="gray.800"
          borderRadius={10}
          justifyContent="center"
          alignItems="center"
          h="500px"
        >
          <Flex
            direction="column"
            gap={3}
            h="full" // Adjust this if needed
            // maxH="500px" // This ensures a fixed height
            overflowY="auto" // Adds scroll functionality
            w="full"
            p={5}
          >
            <Text fontSize="md" fontWeight="bold">
              Followers:
            </Text>
            <Divider></Divider>

            <Flex direction="column" w="full" gap={2}>
              {followers.map((user) => (
                <Follower key={user.followerId} user={user} />
              ))}
            </Flex>
          </Flex>
        </Flex>
      )}
    </Flex>
  );
};
