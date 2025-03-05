import { useParams } from "react-router-dom";
import { UserHeader } from "../components/UserHeader";
import { useEffect, useState } from "react";
import { Box, Flex, Spinner, Text } from "@chakra-ui/react";
import { Post } from "../components/Post";
import { useGetUserProfile } from "../../hooks/useGetUserProfile";
import { useRecoilState } from "recoil";
import { useShowToast } from "../../hooks/useShowToast";
import { userPostsAtom } from "../atoms/userPostsAtom";

export const UserPage = () => {
  const { username } = useParams();
  const { searchedUser, loading: userLoading } = useGetUserProfile(username);
  const showToast = useShowToast();
  const [userPosts, setUserPosts] = useRecoilState(userPostsAtom);
  const [fetchingPost, setFetchingPost] = useState(false);

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
      {/* User Header */}
      <Box
        w={{ base: "90%", sm: "80%", md: "60%", lg: "60%", xl: "42%" }}
        mt={"5%"}
      >
        <UserHeader searchedUser={searchedUser} />
      </Box>

      {/* Posts Section */}
      <Box
        w={{ base: "95%", sm: "80%", md: "60%", lg: "60%", xl: "42%" }}
        mt={3}
        mb={3}
      >
        <Box w="full" h="1px" border="1px solid white" my="2%" />
        <Flex w="full" justifyContent="center">
          <Text fontWeight="bold" fontSize={{ base: "sm", sm: "md" }}>
            Posts
          </Text>
        </Flex>
        <Box w="full" h="1px" border="1px solid white" my="2%" />
      </Box>

      {/* Posts Container */}
      <Box
        w={{ base: "95%", sm: "80%", md: "60%", lg: "60%", xl: "42%" }}
        h="800px" // Scrollable container
        overflowY="auto"
        className="custom-scrollbar"
        p={2}
        mb={1}
      >
        {fetchingPost && (
          <Flex justifyContent="center">
            <Spinner size={{ base: "md", sm: "lg" }} />
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
              Ready to make your first post
            </Text>
          </Flex>
        )}

        {!fetchingPost &&
          userPosts.length > 0 &&
          userPosts.map((post) => (
            <Box key={post._id} mb={4}>
              <Post post={post} postedBy={post.postedBy} />
            </Box>
          ))}
      </Box>
    </Flex>
  );
};
