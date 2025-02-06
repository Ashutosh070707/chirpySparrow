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
    <Flex w="full" justifyContent="center">
      <Flex w="40%" justifyContent="center" direction="column" mt="5%" gap={6}>
        <Flex justifyContent={"space-between"} alignItems="center">
          <Link
            as={RouterLink}
            to={`/${user.username}`}
            textDecoration="none"
            _hover={{ textDecoration: "none" }}
          >
            <Flex w={"full"} alignItems={"center"} gap={3}>
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
              <Flex>
                <Text fontSize={"sm"} fontWeight={"bold"}>
                  {user.username}
                </Text>
                <Image src="/verified.png" w="4" h={4} ml={2} mt={1}></Image>
              </Flex>
            </Flex>
          </Link>
          <Flex gap={4} textAlign={"right"}>
            <Text fontSize="sm" width={"40"} color={"gray.light"} pr={"10px"}>
              {formatDistanceToNow(new Date(post.createdAt)).replace(
                "about ",
                ""
              )}{" "}
              ago
            </Text>
          </Flex>
        </Flex>
        <Text>{post.text}</Text>

        <Box borderRadius={6} overflow={"hidden"}>
          {post.img && (
            <Image
              src={post.img}
              w={"full"}
              h={"400px"}
              objectFit={"contain"}
            ></Image>
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
          </Flex>
        </Box>
      </Flex>
    </Flex>
  );
};
