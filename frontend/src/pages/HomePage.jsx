import {
  Box,
  Flex,
  Skeleton,
  SkeletonCircle,
  Spinner,
  Text,
} from "@chakra-ui/react";
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
  const POSTS_PER_PAGE = 10;
  const loadingRef = useRef(false);

  const getFeedPosts = useCallback(
    async (pageNum) => {
      // Prevent simultaneous fetch requests
      if (loadingRef.current) return;

      loadingRef.current = true;

      if (pageNum === 1) {
        setInitialLoading(true);
        setFeedPosts([]);
      } else {
        setLoading(true);
      }

      try {
        const res = await fetch(
          `/api/posts/feed?page=${pageNum}&limit=${POSTS_PER_PAGE}`
        );

        const data = await res.json();

        if (data.error) {
          showToast("Error", data.error, "error");
          return;
        }

        // Check if we got fewer posts than requested (indicates end of data)
        if (data.length < POSTS_PER_PAGE) {
          setHasMore(false);
        }

        // Update the feed posts
        setFeedPosts((prev) => {
          // For first page, replace everything
          if (pageNum === 1) return data;

          // For subsequent pages, append new posts
          // Make sure we don't add duplicates
          const existingIds = new Set(prev.map((post) => post._id));
          const newPosts = data.filter((post) => !existingIds.has(post._id));

          return [...prev, ...newPosts];
        });
      } catch (error) {
        showToast("Error", error.message, "error");
      } finally {
        setLoading(false);
        setInitialLoading(false);
        loadingRef.current = false;
      }
    },
    [showToast, setFeedPosts]
  );

  useEffect(() => {
    getFeedPosts(page);
  }, [page, getFeedPosts]);

  const lastPostElementRef = useCallback(
    (node) => {
      // Don't observe if we're loading or there's no more content
      if (loading || initialLoading || !hasMore) return;

      // Disconnect previous observer
      if (observer.current) observer.current.disconnect();

      // Create new IntersectionObserver
      observer.current = new IntersectionObserver(
        (entries) => {
          // Only trigger if the element is intersecting AND we're not already loading
          if (entries[0].isIntersecting && !loadingRef.current) {
            // Add a small delay to prevent accidental double triggers
            setTimeout(() => {
              setPage((prevPage) => prevPage + 1);
            }, 100);
          }
        },
        {
          root: null,
          rootMargin: "0px",
          threshold: 0.1, // Trigger when at least 10% of the target is visible
        }
      );

      // Start observing the new last element
      if (node) observer.current.observe(node);
    },
    [loading, initialLoading, hasMore]
  );

  useEffect(() => {
    return () => {
      if (observer.current) observer.current.disconnect();
    };
  }, []);

  return (
    <Flex
      justifyContent={"center"}
      w={"full"}
      alignItems="center"
      minHeight="100vh"
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
        mt="2%"
      >
        <Box>
          {initialLoading && (
            <Flex justifyContent="center" alignItems="center" mt={4}>
              {/* <Spinner size={{ base: "md", sm: "xl" }} /> */}
              <Flex direction="column" w="full" gap={5}>
                {[...Array(7)].map((_, i) => (
                  <Flex direction={"column"} gap={3} key={i}>
                    <Flex justifyContent={"space-between"} w="full">
                      <Flex gap={3} alignItems="center">
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

          {!initialLoading && feedPosts.length === 0 && (
            <Flex justifyContent={"center"} alignItems="center">
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
                Follow someone to see the feed
              </Text>
            </Flex>
          )}

          {!initialLoading &&
            feedPosts.length > 0 &&
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

          {/* {loading && !initialLoading && hasMore && (
            <Flex justifyContent="center" alignItems="center" m={4}>
              <Spinner size={{ base: "sm", sm: "xl" }} />
            </Flex>
          )} */}
        </Box>
      </Box>
    </Flex>
  );
};
