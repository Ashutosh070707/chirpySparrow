import { Avatar, Box, Flex, Image, Link, Text } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { Actions } from "./Actions";
import { useShowToast } from "../../hooks/useShowToast";
import { formatDistanceToNow } from "date-fns";
import { useRecoilValue } from "recoil";
import { loggedInUserAtom } from "../atoms/loggedInUserAtom";
import { PostActions } from "./DeleteButton";

export const Post = ({ post, postedBy }) => {
  const [user, setUser] = useState(null);
  const showToast = useShowToast();
  const loggedInUser = useRecoilValue(loggedInUserAtom);

  useEffect(() => {
    const getUser = async () => {
      try {
        const res = await fetch("/api/users/profile/" + postedBy);
        const data = await res.json();
        if (data.error) {
          showToast("Error", data.error, "error");
          return;
        }
        setUser(data);
      } catch (error) {
        showToast("Error", error, "error");
        setUser(null);
      }
    };
    getUser();
  }, [postedBy, showToast]);

  if (!user) return null;

  return (
    <Box mt="3%" mb="3%" borderRadius={6}>
      <Flex direction={"column"} gap={4}>
        <Flex justifyContent={"space-between"} alignItems="center" w="full">
          <Link
            as={RouterLink}
            to={`/${user.username}`}
            textDecoration="none"
            _hover={{ textDecoration: "none" }}
            w="70%"
          >
            <Flex gap={2}>
              {user.profilePic && (
                <Avatar
                  name={user.name}
                  src={user.profilePic}
                  boxSize={{ base: "40px", sm: "50px", md: "60px", lg: "60px" }}
                ></Avatar>
              )}
              {!user.profilePic && (
                <Avatar
                  name={user.name}
                  src="https://example.com/default-avatar.png"
                  boxSize={{ base: "40px", sm: "50px", md: "60px", lg: "60px" }}
                ></Avatar>
              )}
              <Flex
                gap={1}
                justifyContent="center"
                alignItems="center"
                overflow="hidden"
              >
                <Text
                  fontSize={{ base: "xs", sm: "sm" }}
                  fontWeight={"bold"}
                  isTruncated
                  maxW="90%"
                >
                  {user?.username}
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
            alignItems="center"
            justifyContent="flex-end"
            w="30%"
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
        <Flex direction="column" w="full" gap={1}>
          <Flex w="full">
            <Flex w="98%">
              <Link
                as={RouterLink}
                to={`/${user.username}/post/${post._id}`}
                textDecoration={"none"}
                _hover={{ textDecoration: "none" }}
              >
                <Text
                  fontSize={{ base: "xs", sm: "sm" }}
                  mb="2%"
                  wordBreak="break-word"
                  overflowWrap="break-word"
                >
                  {post.text}
                </Text>
              </Link>
            </Flex>
            {post.postedBy === loggedInUser._id && (
              <Flex justifyContent="center" alignItems="center" flex={1}>
                <PostActions post={post} />
              </Flex>
            )}
          </Flex>

          <Link
            as={RouterLink}
            to={`/${user.username}/post/${post._id}`}
            textDecoration={"none"}
            _hover={{ textDecoration: "none" }}
          >
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
          </Link>
        </Flex>
        <Flex gap={1}>
          <Actions post={post}></Actions>
        </Flex>
        <Box border="1px solid" borderRadius={10} borderColor="gray.600"></Box>
      </Flex>
    </Box>
  );
};
