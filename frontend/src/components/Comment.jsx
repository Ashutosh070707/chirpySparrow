import { Avatar, Divider, Flex, Link, Text } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useShowToast } from "../../hooks/useShowToast";
import { Link as RouterLink } from "react-router-dom";

export const Comment = ({ reply, lastReply }) => {
  const [user, setUser] = useState(null);
  const showToast = useShowToast();
  useEffect(() => {
    const getUser = async () => {
      try {
        const res = await fetch(`/api/users/profile/${reply.userId}`);
        const data = await res.json();
        if (data.error) {
          showToast("Error", data.error, "error");
          return;
        }
        setUser(data);
      } catch (error) {
        showToast("Error", error, "error");
      }
    };

    getUser();
  }, [reply]);

  if (!user) return null;
  return (
    <Flex w={"full"} gap={4}>
      <Link
        as={RouterLink}
        to={`/${user.username}`}
        textDecoration="none"
        _hover={{ textDecoration: "none" }}
      >
        {user.profilePic && (
          <Avatar name={user.name} src={user.profilePic} size="md"></Avatar>
        )}
        {!user.profilePic && (
          <Avatar
            name={user.name}
            src="https://example.com/default-avatar.png"
            size="md"
          ></Avatar>
        )}
      </Link>
      <Flex gap={1} w={"full"} flexDirection={"column"}>
        <Flex w={"full"} justifyContent={"space-between"} alignItems={"center"}>
          <Link
            as={RouterLink}
            to={`/${user.username}`}
            textDecoration="none"
            _hover={{ textDecoration: "none" }}
          >
            <Text fontSize="sm" fontWeight="bold">
              {user.username}
            </Text>
          </Link>
        </Flex>
        <Text>{reply.text}</Text>
      </Flex>

      {!lastReply && <Divider my={2} mb={"10px"}></Divider>}
      {lastReply && <Text mb="20%"></Text>}
    </Flex>
  );
};
