import { Avatar, Box, Button, Flex, Text } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { IoSendSharp } from "react-icons/io5";

export const Follower = ({ user }) => {
  return (
    <Flex gap={2} justifyContent={"space-between"} w="full">
      <Flex
        gap={2}
        as={Link}
        to={`/${user.username}`}
        w="80%"
        overflow="hidden"
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
        <Flex direction={"column"} w="70%">
          <Text fontSize={"md"} fontWeight={"bold"} isTruncated>
            {user.name}
          </Text>
          <Text color={"gray.light"} fontSize={"sm"} isTruncated>
            {user.username}
          </Text>
        </Flex>
      </Flex>
      <Button
        size={"sm"}
        color={"white"}
        bg={"blue.400"}
        _hover={{
          opacity: ".8",
        }}
      >
        <IoSendSharp size={18} />
      </Button>
    </Flex>
  );
};
