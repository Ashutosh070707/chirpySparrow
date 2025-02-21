import { Avatar, Box, Button, Flex, Text } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useSetRecoilState } from "recoil";
import { followingAtom } from "../atoms/followingAtom";
import { useShowToast } from "../../hooks/useShowToast";

export const Following = ({ user }) => {
  const [updating, setUpdating] = useState(false);
  const setFollowing = useSetRecoilState(followingAtom);
  const showToast = useShowToast();

  const handleUnfollow = async () => {
    if (updating) return;
    setUpdating(true);
    try {
      const res = await fetch(`/api/users/follow/${user.followerId}`, {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({ id: user.followerId }),
      });
      const data = await res.json();
      if (data.error) {
        showToast("Error", data.error, "error");
        return;
      }
      showToast("Success", `${data.message}`, "success");
      setFollowing((prevFollowing) =>
        prevFollowing.filter(
          (followedUser) => followedUser.followerId !== user.followerId
        )
      );
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
        to={`/${user.username}`}
        w="80%"
        overflow="hidden"
      >
        {user.profilePic && (
          <Avatar
            name={user.name}
            src={user.profilePic}
            boxSize={{ base: "40px", sm: "50px" }}
          ></Avatar>
        )}
        {!user.profilePic && (
          <Avatar
            name={user.name}
            src="https://example.com/default-avatar.png"
            boxSize={{ base: "40px", sm: "50px" }}
          ></Avatar>
        )}
        <Flex direction="column" w="70%" overflow="hidden">
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
      <Button
        size={{ base: "xs", sm: "sm" }}
        color={true ? "black" : "white"}
        bg={true ? "white" : "blue.400"}
        onClick={handleUnfollow}
        isLoading={updating}
        _hover={{
          color: true ? "black" : "white",
          opacity: ".8",
        }}
      >
        {true ? "Unfollow" : "Follow"}
      </Button>
    </Flex>
  );
};
