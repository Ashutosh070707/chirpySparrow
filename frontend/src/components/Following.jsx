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
      <Flex gap={2} as={Link} to={`/${user.username}`}>
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
        <Box>
          <Text fontSize={"md"} fontWeight={"bold"}>
            {user.name}
          </Text>
          <Text color={"gray.light"} fontSize={"sm"}>
            {user.username}
          </Text>
        </Box>
      </Flex>
      <Button
        size={"sm"}
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
