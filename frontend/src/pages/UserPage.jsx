import { useParams } from "react-router-dom";
import { UserHeader } from "../components/UserHeader";
import { useEffect, useState } from "react";
import {
  Box,
  Flex,
  Skeleton,
  SkeletonCircle,
  Spinner,
  Text,
} from "@chakra-ui/react";
import { Post } from "../components/Post";
import { useGetUserProfile } from "../../hooks/useGetUserProfile";
import { useRecoilState, useRecoilValue } from "recoil";
import { useShowToast } from "../../hooks/useShowToast";
import { userPostsAtom } from "../atoms/userPostsAtom";
import { loggedInUserAtom } from "../atoms/loggedInUserAtom";

export const UserPage = () => {
  const { username } = useParams();
  const { searchedUser, loading: userLoading } = useGetUserProfile(username);
  const showToast = useShowToast();
  const [userPosts, setUserPosts] = useRecoilState(userPostsAtom);
  const [fetchingPost, setFetchingPost] = useState(false);
  const loggedInUser = useRecoilValue(loggedInUserAtom);

  useEffect(() => {
    const getUserPosts = async () => {
      if (!searchedUser) {
        setUserPosts([]);
        return;
      }

      setFetchingPost(true);
      setUserPosts([]); // Clear previous posts

      try {
        const res = await fetch(`/api/posts/user/${searchedUser.username}`);
        const data = await res.json();
        if (data.error) {
          showToast("Error", data.error, "error");
        } else {
          setUserPosts(data);
        }
      } catch (error) {
        showToast("Error", "Failed to fetch posts", "error");
      } finally {
        setFetchingPost(false);
      }
    };

    if (!userLoading && searchedUser) {
      getUserPosts();
    }
  }, [searchedUser, userLoading, setUserPosts, showToast]);

  if (userLoading) {
    return (
      <Flex justifyContent="center" alignItems="center" w="full" h="100vh">
        <Spinner size="xl" />
      </Flex>
    );
  }

  if (!searchedUser) {
    return (
      <Flex w="full" h="100vh" justifyContent="center" alignItems="center">
        <Text fontSize="2xl">User not found</Text>
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
      <Box
        w={{
          base: "95%",
          sm: "80%",
          md: "60%",
          lg: "55%",
          xl: "40%",
        }}
        alignItems="center"
        mt="5%"
      >
        <Box w="full">
          <UserHeader searchedUser={searchedUser} />
        </Box>

        <Box w="full" mt={3} mb={3}>
          <Box w="full" h="1px" border="1px solid white" my="2%" />
          <Flex w="full" justifyContent="center">
            <Text fontWeight="bold" fontSize={{ base: "sm", sm: "md" }}>
              Posts
            </Text>
          </Flex>
          <Box w="full" h="1px" border="1px solid white" my="2%" />
        </Box>

        <Box
          w="full"
          maxW="800px" // Maximum width for the posts container
          h="800px" // Scrollable container
          overflowY="auto"
          className="custom-scrollbar"
          p={2}
          mb={1}
        >
          {fetchingPost && (
            <Flex justifyContent="center">
              {/* <Spinner size={{ base: "md", sm: "lg" }} /> */}
              <Flex direction="column" w="full" gap={4}>
                {[...Array(4)].map((_, i) => (
                  <Flex direction={"column"} gap={2} key={i}>
                    <Flex justifyContent={"space-between"} w="full">
                      <Flex gap={2} alignItems="center">
                        <SkeletonCircle size={"60px"}></SkeletonCircle>
                        <Skeleton h="10px" w="90px"></Skeleton>
                      </Flex>
                      <Flex alignItems="center">
                        <Skeleton h="10px" w="90px"></Skeleton>
                      </Flex>
                    </Flex>
                    <Flex alignItems="center" justifyContent="flex-start">
                      <Skeleton h="10px" w="full"></Skeleton>
                    </Flex>
                    <Flex>
                      <Skeleton h="280px" w="full"></Skeleton>
                    </Flex>
                    <Flex justifyContent={"flex-start"}>
                      <Skeleton h="10px" w="90px"></Skeleton>
                    </Flex>
                  </Flex>
                ))}
              </Flex>
            </Flex>
          )}

          {!fetchingPost && userPosts.length === 0 && (
            <Flex justifyContent="center" alignItems="center" w="full">
              <Text
                fontSize={{
                  base: "sm",
                  sm: "lg",
                  md: "xl",
                  lg: "2xl",
                  xl: "2xl",
                }}
                color="gray.400"
              >
                No Posts
              </Text>
            </Flex>
          )}

          {!fetchingPost &&
            userPosts.length > 0 &&
            userPosts.map((post) => (
              <Box key={post._id} mb={4}>
                <Post
                  post={post}
                  postedBy={post.postedBy}
                  showActions={
                    loggedInUser.username === username ? false : true
                  }
                />
              </Box>
            ))}
        </Box>
      </Box>
    </Flex>
  );
};
