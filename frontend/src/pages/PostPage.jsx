import {
  Avatar,
  Box,
  Button,
  Divider,
  Flex,
  Image,
  Link,
  Spinner,
  Text,
} from "@chakra-ui/react";
import { Actions } from "../components/Actions";
import { useEffect, useState } from "react";
import { Comment } from "../components/Comment";
import { useShowToast } from "../../hooks/useShowToast";
import { Link as RouterLink, useParams } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";

export const PostPage = () => {
  const [loading, setLoading] = useState(true);
  const [fetchingProfile, setFetchingProfile] = useState(false);
  const [post, setPost] = useState(null);
  const [user, setUser] = useState(null);
  const showToast = useShowToast();
  const { pid } = useParams();

  useEffect(() => {
    const getPost = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/posts/${pid}`);
        const data = await res.json();
        if (data.error) {
          showToast("Error", data.error, "error");
          return;
        }
        setPost(data);
      } catch (error) {
        showToast("Error", error.message, "error");
        setPost(null);
      } finally {
        setLoading(false);
      }
    };
    getPost();
  }, [pid, showToast, setPost]);

  useEffect(() => {
    if (!post) return;

    const getUserProfile = async () => {
      setFetchingProfile(true);
      try {
        const res = await fetch(`/api/users/profile/${post.postedBy}`);
        const data = await res.json();
        if (data.error) {
          showToast("Error", data.error, "error");
          return;
        }
        setUser(data);
      } catch (error) {
        showToast("Error", error.message, "error");
        setUser(null);
      } finally {
        setFetchingProfile(false);
      }
    };
    if (!loading && post) {
      getUserProfile();
    }
  }, [loading, post, showToast]);

  if (loading || fetchingProfile) {
    return (
      <Flex justifyContent={"center"}>
        <Spinner size="xl"></Spinner>
      </Flex>
    );
  }

  if (!post || !user) return null;

  return (
    <Flex w="full" justifyContent="center" minHeight="100vh">
      <Flex
        w={{ base: "40%", sm: "80%", md: "60%", lg: "55%", xl: "42%" }}
        mt={10}
        // justifyContent="center"
        direction="column"
        gap={4}
      >
        <Flex alignItems="center" w="full">
          <Link
            as={RouterLink}
            to={`/${user.username}`}
            textDecoration="none"
            _hover={{ textDecoration: "none" }}
            w="70%"
          >
            <Flex w="full" alignItems={"center"} gap={2}>
              {user.profilePic && (
                <Avatar
                  name={user.name}
                  src={user.profilePic}
                  size="md"
                ></Avatar>
              )}
              {!user.profilePic && (
                <Avatar
                  name={user.name}
                  src="https://example.com/default-avatar.png"
                  size="md"
                ></Avatar>
              )}

              <Flex
                alignItems="center"
                justifyContent="center"
                overflow="hidden"
                g={2}
              >
                <Text
                  fontSize={"sm"}
                  fontWeight={"bold"}
                  isTruncated
                  maxW="100%" // Ensures it respects parent width
                  whiteSpace="nowrap"
                >
                  {user.name}
                </Text>
                <Image src="/verified.png" w="4" h={4} mt={1}></Image>
              </Flex>
            </Flex>
          </Link>
          <Flex w="30%" justifyContent={"flex-end"}>
            <Text fontSize="sm" color={"gray.light"}>
              {formatDistanceToNow(new Date(post.createdAt)).replace(
                "about ",
                ""
              )}{" "}
              ago
            </Text>
          </Flex>
        </Flex>
        <Text fontSize="sm">{post.text}</Text>

        <Box borderRadius={6} overflow={"hidden"}>
          {post.img && (
            <Box borderRadius={6} overflow={"hidden"} maxH="300px">
              <Image
                src={post.img}
                w={"full"}
                maxH={"300px"}
                objectFit={"contain"}
                borderRadius={6}
              ></Image>
            </Box>
          )}
        </Box>

        <Flex gap={3}>
          <Actions post={post}></Actions>
        </Flex>

        <Divider></Divider>

        <Box w="full">
          <Flex direction="column">
            {post.replies.length > 0 && (
              <Flex direction="column" gap={6}>
                <Text fontSize="1xl" fontWeight="bold">
                  Replies:
                </Text>
                <Flex direction="column" gap={5} w="full">
                  {post.replies.map((reply) => (
                    <Comment
                      key={reply._id}
                      reply={reply}
                      lastReply={
                        reply._id === post.replies[post.replies.length - 1]._id
                      }
                    />
                  ))}
                </Flex>
              </Flex>
            )}
            {post.replies.length === 0 && (
              <Flex justifyContent={"center"} alignItems="center">
                <Text
                  fontSize={{
                    base: "2xl",
                    sm: "md",
                    md: "lg",
                    lg: "lg",
                    xl: "xl",
                  }}
                  color="gray.400"
                >
                  "No replies"
                </Text>
              </Flex>
            )}
          </Flex>
        </Box>
      </Flex>
    </Flex>
  );
};
