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
        <Avatar
          name={user.name}
          src={user.profilePic || "https://example.com/default-avatar.png"}
          boxSize={{ base: "40px", sm: "50px" }}
        />

        <Flex direction={"column"} w="full" overflow="hidden">
          <Text
            fontSize={{ base: "sm", sm: "md" }}
            fontWeight={"bold"}
            isTruncated
          >
            {user.name}
          </Text>
          <Text
            color={"gray.light"}
            fontSize={{ base: "xs", sm: "sm" }}
            isTruncated
          >
            @{user.username}
          </Text>
        </Flex>
      </Flex>
    </Flex>
  );
};
