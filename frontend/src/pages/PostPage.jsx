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
    <Flex
      w="full"
      justifyContent="center"
      alignItems="center"
      direction="column"
      gap={2}
    >
      <Flex
        w={{ base: "90%", sm: "80%", md: "60%", lg: "55%", xl: "42%" }}
        mt={{ base: 5, sm: 10 }}
        // justifyContent="center"
        direction="column"
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
                  boxSize={{ base: "50px", sm: "50px", md: "60px", lg: "70px" }}
                ></Avatar>
              )}
              {!user.profilePic && (
                <Avatar
                  name={user.name}
                  src="https://example.com/default-avatar.png"
                  boxSize={{ base: "50px", sm: "50px", md: "60px", lg: "70px" }}
                ></Avatar>
              )}

              <Flex
                alignItems="center"
                justifyContent="center"
                overflow="hidden"
                g={1}
              >
                <Text
                  fontSize={{ base: "xs", sm: "sm" }}
                  fontWeight={"bold"}
                  isTruncated
                  maxW="90%" // Ensures it respects parent width
                >
                  {user.name}
                </Text>
                <Image
                  src="/verified.png"
                  w={{ base: 3, sm: 4 }}
                  h={{ base: 3, sm: 4 }}
                ></Image>
              </Flex>
            </Flex>
          </Link>
          <Flex
            w="30%"
            justifyContent={"flex-end"}
            alignItems="center"
            overflow="hidden"
          >
            <Text
              fontSize={{ base: "xs", sm: "sm" }}
              color={"gray.light"}
              isTruncated
              maxW="100%"
            >
              {formatDistanceToNow(new Date(post.createdAt)).replace(
                "about ",
                ""
              )}{" "}
              ago
            </Text>
          </Flex>
        </Flex>
        <Text
          fontSize={{ base: "xs", sm: "sm" }}
          mb="2%"
          wordBreak="break-word"
          overflowWrap="break-word"
        >
          {post.text}
        </Text>

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

        <Flex gap={1}>
          <Actions post={post}></Actions>
        </Flex>
      </Flex>
      <Divider
        w={{ base: "90%", sm: "80%", md: "60%", lg: "55%", xl: "42%" }}
      ></Divider>
      <Flex w={{ base: "95%", sm: "80%", md: "60%", lg: "60%", xl: "42%" }}>
        <Box
          w="full"
          h="400px" // Scrollable container
          overflowY="auto"
          className="custom-scrollbar"
          p={2}
        >
          {post.replies.length > 0 && (
            <Flex direction="column" gap={6}>
              <Text fontSize={{ base: "md", sm: "lg" }} fontWeight="bold">
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
                  base: "md",
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
        </Box>
      </Flex>
    </Flex>
  );
};
