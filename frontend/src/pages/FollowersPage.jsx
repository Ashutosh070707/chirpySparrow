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
    const getUserProfile = async () => {
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
      getUserProfile();
    }
  }, [loggedInUser, showToast]);

  return (
    <Flex justify="center" align="center" w="full" h="100vh" p={4}>
      {fetchingProfile ? (
        <Spinner size="xl" />
      ) : followers.length === 0 ? (
        <Text fontSize="xl">No followers</Text>
      ) : (
        <Box
          w={{ base: "90%", sm: "100%", md: "80%", lg: "50%", xl: "50%" }}
          h="90vh"
          maxH="90vh"
          p={5}
          borderRadius="lg"
          border="1px solid white"
          overflowY="auto"
          className="custom-scrollbar"
        >
          <Text fontSize="lg" fontWeight="bold" mb={2}>
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
