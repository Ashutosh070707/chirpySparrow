import { Avatar, Box, Button, Flex, Text } from "@chakra-ui/react";
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useShowToast } from "../../hooks/useShowToast";

export const SuggestedUser = ({ suggestedUser }) => {
  const [updating, setUpdating] = useState(false);
  const [following, setFollowing] = useState(false);
  const showToast = useShowToast();

  const handleFollow = async () => {
    if (updating) return;
    setUpdating(true);
    try {
      const res = await fetch(`/api/users/follow/${suggestedUser._id}`, {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({ id: suggestedUser._id }),
      });
      const data = await res.json();
      if (data.error) {
        showToast("Error", data.error, "error");
        return;
      }
      showToast("Success", `${data.message}`, "success");
      setFollowing(!following);
    } catch (error) {
      showToast("Error", error, "error");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <Flex gap={2} justifyContent={"space-between"} w="full">
      <Flex
        gap={2}
        as={Link}
        to={`/${suggestedUser.username}`}
        w="80%"
        overflow="hidden"
      >
        {suggestedUser.profilePic && (
          <Avatar
            name={suggestedUser.name}
            src={suggestedUser.profilePic}
            size="md"
          ></Avatar>
        )}
        {!suggestedUser.profilePic && (
          <Avatar
            name={suggestedUser.name}
            src="https://example.com/default-avatar.png"
            size="md"
          ></Avatar>
        )}
        <Box>
          <Text fontSize={"md"} fontWeight={"bold"} isTruncated>
            {suggestedUser.name}
          </Text>
          <Text color={"gray.light"} fontSize={"sm"} isTruncated>
            {suggestedUser.username}
          </Text>
        </Box>
      </Flex>
      <Flex w="20%" justifyContent="flex-end">
        <Button
          size={"sm"}
          color={following ? "black" : "white"}
          bg={following ? "white" : "blue.400"}
          onClick={handleFollow}
          isLoading={updating}
          _hover={{
            color: following ? "black" : "white",
            opacity: ".8",
          }}
        >
          {following ? "Unfollow" : "Follow"}
        </Button>
      </Flex>
    </Flex>
  );
};
