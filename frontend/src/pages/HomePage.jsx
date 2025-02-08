import { Box, Flex, Spinner, Text } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { Post } from "../components/Post.jsx";
import { useRecoilState } from "recoil";
import { useShowToast } from "../../hooks/useShowToast.js";
import { feedPostsAtom } from "../atoms/feedPostsAtom.js";

export const HomePage = () => {
  const [feedPosts, setFeedPosts] = useRecoilState(feedPostsAtom);
  const [loading, setLoading] = useState(true);
  const showToast = useShowToast();

  useEffect(() => {
    const getFeedPosts = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/posts/feed`);
        const data = await res.json();
        if (data.error) {
          showToast("Error", data.error, "error");
          return;
        }

        setFeedPosts(data);
      } catch (error) {
        showToast("Error", error.message, "error");
      } finally {
        setLoading(false);
      }
    };
    getFeedPosts();
  }, []);

  return (
    <Flex
      justifyContent={"center"}
      w={"full"}
      alignItems="center"
      minHeight="100vh"
    >
      <Box
        w={{ base: "40%", sm: "90%", md: "60%", lg: "50%", xl: "42%" }}
        alignItems="center"
        mt="2%"
      >
        <Box>
          {feedPosts.length === 0 && !loading && (
            <Flex justifyContent={"center"} alignItems="center">
              <Text
                fontSize={{
                  base: "2xl",
                  sm: "lg",
                  md: "xl",
                  lg: "2xl",
                  xl: "2xl",
                }}
              >
                "Follow others to see the feed"
              </Text>
            </Flex>
          )}

          {!loading &&
            feedPosts.length > 0 &&
            feedPosts.map((post) => (
              <Box key={post._id}>
                <Post post={post} postedBy={post.postedBy} />
              </Box>
            ))}

          {loading && (
            <Flex justifyContent="center" alignItems="center" mt={4}>
              <Spinner
                size={{ base: "xl", sm: "lg", md: "xl", lg: "xl", xl: "xl" }}
              />
            </Flex>
          )}
        </Box>
      </Box>
    </Flex>
  );
};
