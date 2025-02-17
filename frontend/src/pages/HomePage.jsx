import { Box, Flex, Spinner, Text } from "@chakra-ui/react";
import React, { useEffect, useState, useRef, useCallback } from "react";
import { Post } from "../components/Post.jsx";
import { useRecoilState } from "recoil";
import { useShowToast } from "../../hooks/useShowToast.js";
import { feedPostsAtom } from "../atoms/feedPostsAtom.js";

export const HomePage = () => {
  const [feedPosts, setFeedPosts] = useRecoilState(feedPostsAtom);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef();
  const showToast = useShowToast();
  const POSTS_PER_PAGE = 10; // Adjust number as needed

  const lastPostElementRef = useCallback(
    (node) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prevPage) => prevPage + 1);
        }
      });

      if (node) observer.current.observe(node);
    },
    [loading, hasMore]
  );

  const getFeedPosts = async (pageNum) => {
    if (pageNum === 1) setInitialLoading(true);
    else setLoading(true);

    try {
      const res = await fetch(
        `/api/posts/feed?page=${pageNum}&limit=${POSTS_PER_PAGE}`
      );
      const data = await res.json();

      if (data.error) {
        showToast("Error", data.error, "error");
        return;
      }

      if (data.length < POSTS_PER_PAGE) {
        setHasMore(false);
      }

      if (pageNum === 1) {
        setFeedPosts(data);
      } else {
        setFeedPosts((prev) => [...prev, ...data]);
      }
    } catch (error) {
      showToast("Error", error.message, "error");
    } finally {
      setInitialLoading(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    getFeedPosts(page);
  }, [page]);

  return (
    <Flex
      justifyContent={"center"}
      w={"full"}
      alignItems="center"
      minHeight="100vh"
    >
      <Box
        w={{ base: "40%", sm: "80%", md: "60%", lg: "55%", xl: "42%" }}
        alignItems="center"
        mt="2%"
      >
        <Box>
          {feedPosts.length === 0 && !initialLoading && (
            <Flex justifyContent={"center"} alignItems="center">
              <Text
                fontSize={{
                  base: "2xl",
                  sm: "lg",
                  md: "xl",
                  lg: "2xl",
                  xl: "2xl",
                }}
                color="gray.400"
              >
                "Follow others to see the feed"
              </Text>
            </Flex>
          )}

          {feedPosts.length > 0 &&
            feedPosts.map((post, index) => {
              if (feedPosts.length === index + 1) {
                return (
                  <Box ref={lastPostElementRef} key={post._id}>
                    <Post post={post} postedBy={post.postedBy} />
                  </Box>
                );
              } else {
                return (
                  <Box key={post._id}>
                    <Post post={post} postedBy={post.postedBy} />
                  </Box>
                );
              }
            })}

          {initialLoading && (
            <Flex justifyContent="center" alignItems="center" mt={4}>
              <Spinner size="xl" />
            </Flex>
          )}

          {loading && !initialLoading && hasMore && (
            <Flex justifyContent="center" alignItems="center" mt={4}>
              <Spinner
                size={{ base: "md", sm: "sm", md: "md", lg: "md", xl: "md" }}
              />
            </Flex>
          )}

          {/* {!hasMore && feedPosts.length > 0 && (
            <Text textAlign="center" mt={4} color="gray.500">
              No more posts to load
            </Text>
          )} */}
        </Box>
      </Box>
    </Flex>
  );
};
