import { useRecoilState, useRecoilValue } from "recoil";
import { loggedInUserAtom } from "../atoms/loggedInUserAtom";
import { useEffect, useState } from "react";
import { Box, Divider, Flex, Spinner, Text } from "@chakra-ui/react";
import { Following } from "../components/Following";
import { followingAtom } from "../atoms/followingAtom";
import { useShowToast } from "../../hooks/useShowToast";

export const FollowingPage = () => {
  const loggedInUser = useRecoilValue(loggedInUserAtom);
  const showToast = useShowToast();
  const [following, setFollowing] = useRecoilState(followingAtom);
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
          setFollowing([]);
          return;
        }

        setFollowing(data.following || []);
      } catch (error) {
        showToast("Error", error.message, "error");
        setFollowing([]);
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
      ) : following.length === 0 ? (
        <Text fontSize="xl">Follow someone</Text>
      ) : (
        <Box
          w={{ base: "90%", sm: "100%", md: "80%", lg: "50%", xl: "50%" }}
          maxH="90vh"
          p={5}
          borderRadius="lg"
          border="1px solid white"
          overflowY="auto"
          className="custom-scrollbar"
        >
          <Text fontSize="lg" fontWeight="bold" mb={2}>
            Following:
          </Text>
          <Divider mb={3} />

          <Flex direction="column" gap={2}>
            {following.map((user) => (
              <Following key={user.followerId} user={user} />
            ))}
          </Flex>
        </Box>
      )}
    </Flex>
  );
};
