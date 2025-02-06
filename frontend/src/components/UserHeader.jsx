import {
  Avatar,
  Box,
  Button,
  Flex,
  Grid,
  GridItem,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useRecoilValue } from "recoil";
import { loggedInUserAtom } from "../atoms/loggedInUserAtom";
import { useFollowUnfollow } from "../../hooks/useFollowUnfollow";
import { userPostsAtom } from "../atoms/userPostsAtom";

export const UserHeader = ({ searchedUser }) => {
  const loggedInUser = useRecoilValue(loggedInUserAtom);
  const { handleFollowUnfollow, updating, following } =
    useFollowUnfollow(searchedUser);
  const userPosts = useRecoilValue(userPostsAtom);

  return (
    <Box>
      <VStack gap={3} alignItems={"start"}>
        <Flex justifyContent={"space-between"} w={"full"} alignItems={"center"}>
          <Flex direction="column" g={3}>
            <Text fontSize={"3xl"} fontWeight={"bold"}>
              {searchedUser.name}
            </Text>
            <Text fontSize={"1xl"} color="gray.light">
              @{searchedUser.username}{" "}
            </Text>
          </Flex>

          <Box>
            {searchedUser.profilePic && (
              <Avatar
                name={searchedUser.name}
                src={searchedUser.profilePic}
                size="xl"
              ></Avatar>
            )}
            {!searchedUser.profilePic && (
              <Avatar
                name={searchedUser.name}
                src="https://example.com/default-avatar.png"
                size="xl"
              ></Avatar>
            )}
          </Box>
        </Flex>

        <Flex mt="5%">
          <Text fontFamily={"Comic Sans MS, Comic Sans, cursive"} mb="20px">
            {searchedUser.bio}
          </Text>
        </Flex>

        <Grid
          w="full"
          templateRows="repeat(1, 1fr)"
          templateColumns="repeat(3, 1fr)"
          gap={4}
        >
          <GridItem>
            <Flex
              justifyContent={"center"}
              alignItems="center"
              color="gray.100"
            >
              <Text fontSize="18px">{userPosts.length} posts</Text>
            </Flex>
          </GridItem>
          <GridItem>
            <Flex
              justifyContent={"center"}
              alignItems="center"
              color="gray.100"
            >
              <Text fontSize="18px">
                {searchedUser.followers.length} followers
              </Text>
            </Flex>
          </GridItem>
          <GridItem>
            <Flex
              justifyContent={"center"}
              alignItems="center"
              color="gray.100"
            >
              <Text fontSize="18px">
                {searchedUser.following.length} following
              </Text>
            </Flex>
          </GridItem>
        </Grid>

        {loggedInUser?._id !== searchedUser._id && (
          <Button
            size={"sm"}
            onClick={handleFollowUnfollow}
            color={following ? "black" : "white"}
            bg={following ? "white" : "blue.400"}
            isLoading={updating}
            _hover={{
              color: following ? "black" : "white",
              opacity: ".8",
            }}
            w="full"
            mt="20px"
          >
            {following ? "Unfollow" : "Follow"}
          </Button>
        )}
      </VStack>
    </Box>
  );
};
