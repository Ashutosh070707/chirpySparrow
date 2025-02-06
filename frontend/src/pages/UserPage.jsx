import { useParams } from "react-router-dom";
import { UserHeader } from "../components/UserHeader";
import { useEffect, useState } from "react";

import { Box, Flex, Spinner, Text } from "@chakra-ui/react";
import { Post } from "../components/Post";
import { useGetUserProfile } from "../../hooks/useGetUserProfile";
import { useRecoilState, useRecoilValue } from "recoil";
import { useShowToast } from "../../hooks/useShowToast";
import { userPostsAtom } from "../atoms/userPostsAtom";
import { loggedInUserAtom } from "../atoms/loggedInUserAtom";

export const UserPage = () => {
  const { username } = useParams();

  const { searchedUser, loading } = useGetUserProfile(username);

  const showToast = useShowToast();
  const [userPosts, setUserPosts] = useRecoilState(userPostsAtom);
  const [fetchingPost, setFetchingPost] = useState(false);

  useEffect(() => {
    const getUserPosts = async () => {
      if (!searchedUser) {
        setFetchingPost(false);
        return;
      }
      setFetchingPost(true);
      try {
        const res = await fetch(`/api/posts/user/${searchedUser.username}`);
        const data = await res.json();
        if (data.error) {
          showToast("Error", data.error, "error");
          return;
        }
        setUserPosts(data);
      } catch (error) {
        showToast("Error", error, "error");
        setUserPosts([]);
      } finally {
        setFetchingPost(false);
      }
    };

    if (!loading && searchedUser) {
      getUserPosts();
    }
  }, [searchedUser, showToast, setUserPosts]);

  if (loading) {
    return (
      <Flex justifyContent={"center"} alignItems="center" w="full" h="100vh">
        <Spinner size="xl" />
      </Flex>
    );
  }
  if (!searchedUser && !loading) {
    return (
      <Flex w="full" h="100vh" justifyContent="center" alignItems="center">
        <Text fontSize="2xl">"User not found"</Text>
      </Flex>
    );
  }

  return (
    <Flex
      w="full"
      justifyContent="center"
      alignItems="center"
      direction="column"
    >
      {/* <Box w="40%" mt="5%"> */}
      <Box
        w={{ base: "40%", sm: "75%", md: "60%", lg: "60%", xl: "45%" }}
        mt="5%"
      >
        <UserHeader searchedUser={searchedUser} />
      </Box>
      <Box
        mt="2%"
        w={{ base: "40%", sm: "75%", md: "60%", lg: "60%", xl: "45%" }}
      >
        <Box w="full" h="1px" border="1px solid white" mt="3%" mb="2%"></Box>
        <Flex w="full" justifyContent={"center"}>
          <Text fontWeight="bold" fontSize={{ base: "lg", sm: "md" }}>
            Posts
          </Text>
        </Flex>
        <Box w="full" h="1px" border="1px solid white" mt="2%" mb="3%"></Box>
      </Box>
      <Flex
        justifyContent={"center"}
        w={{ base: "40%", sm: "75%", md: "60%", lg: "60%", xl: "45%" }}
        direction="column"
      >
        {fetchingPost && (
          <Flex>
            <Spinner size="xl"></Spinner>
          </Flex>
        )}

        {!fetchingPost && userPosts.length === 0 && (
          <Flex justifyContent="center" alignItems="center" w="full">
            <Text fontSize="2xl">"Ready to make your first post"</Text>
          </Flex>
        )}

        {!fetchingPost &&
          userPosts.length !== 0 &&
          userPosts.map((post, index) => (
            <Box key={post._id}>
              <Post post={post} postedBy={post.postedBy}></Post>
            </Box>
          ))}
      </Flex>
    </Flex>
  );
};
