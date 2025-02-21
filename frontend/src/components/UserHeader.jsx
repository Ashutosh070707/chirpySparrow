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
    <Box w="full" mt="5%">
      <VStack gap={3} alignItems={"start"}>
        <Flex justifyContent={"space-between"} w={"full"} alignItems={"center"}>
          <Flex direction="column" g={3} justifyContent="center" w="72%">
            <Text
              fontSize={{ base: "3xl", sm: "xl", md: "2xl", lg: "3xl" }}
              fontWeight={"bold"}
              isTruncated
            >
              {searchedUser.name}
            </Text>
            <Text
              fontSize={{ base: "xl", sm: "md", md: "lg" }}
              color="gray.light"
              isTruncated
            >
              @{searchedUser.username}{" "}
            </Text>
          </Flex>

          <Box>
            {searchedUser.profilePic && (
              <Avatar
                name={searchedUser.name}
                src={searchedUser.profilePic}
                size={{
                  base: "xl",
                  sm: "lg",
                  md: "xl",
                  lg: "xl",
                  xl: "xl",
                }}
              ></Avatar>
            )}
            {!searchedUser.profilePic && (
              <Avatar
                name={searchedUser.name}
                src="https://example.com/default-avatar.png"
                size={{
                  base: "xl",
                  sm: "lg",
                  md: "xl",
                  lg: "xl",
                  xl: "xl",
                }}
              ></Avatar>
            )}
          </Box>
        </Flex>

        <Flex mt="5%">
          <Text
            fontSize={{ base: "md", sm: "sm", md: "md", lg: "md", xl: "md" }}
            mb="20px"
          >
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
              <Text fontSize="lg">{userPosts.length} posts</Text>
            </Flex>
          </GridItem>
          <GridItem>
            <Flex
              justifyContent={"center"}
              alignItems="center"
              color="gray.100"
            >
              <Text fontSize="lg">
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
              <Text fontSize="lg">
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
