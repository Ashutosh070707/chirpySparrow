import { useRecoilValue } from "recoil";
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
    const getUserFollowers = async () => {
      try {
        setFetchingProfile(true);
        const res = await fetch(`/api/users/profile/${loggedInUser.username}`);

        if (!res.ok) throw new Error("Failed to fetch profile");

        const data = await res.json();

        if (data.error) {
          showToast("Error", data.error, "error");
          setFollowers([]);
          return;
        }

        setFollowers(data.followers || []);
      } catch (error) {
        showToast("Error", error.message, "error");
        setFollowers([]);
      } finally {
        setFetchingProfile(false);
      }
    };

    if (loggedInUser) {
      getUserFollowers();
    }
  }, [loggedInUser, showToast]);

  return (
    <Flex justifyContent="center" alignItems="center" w="full" h="100vh">
      {fetchingProfile ? (
        <Spinner size={{ base: "lg", sm: "xl" }} />
      ) : followers.length === 0 ? (
        <Text fontSize={{ base: "md", md: "xl" }}>No followers</Text>
      ) : (
        <Box
          w={{ base: "100%", sm: "100%", md: "80%", lg: "50%", xl: "50%" }}
          h="90vh"
          maxH="90vh"
          p={{ base: 3, sm: 5 }}
          borderRadius="lg"
          border={{ base: "none", sm: "none", md: "1px solid white" }}
          overflowY="auto"
          className="custom-scrollbar"
        >
          <Text fontSize={{ base: "md", sm: "lg" }} fontWeight="bold" mb={2}>
            Followers:
          </Text>
          <Divider mb={3} />

          <Flex direction="column" gap={2}>
            {followers.map((user) => (
              <Follower key={user.followerId} user={user} />
            ))}
          </Flex>
        </Box>
      )}
    </Flex>
  );
};
