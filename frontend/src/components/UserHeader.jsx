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
    <Box w="full">
      <VStack gap={4} alignItems={"start"}>
        <Flex justifyContent={"space-between"} w={"full"} alignItems={"center"}>
          <Flex
            direction="column"
            g={2}
            justifyContent="center"
            w="72%"
            overflow="hidden"
          >
            <Text
              fontSize={{ base: "lg", sm: "2xl", md: "2xl", lg: "3xl" }}
              fontWeight={"bold"}
              isTruncated
            >
              {searchedUser.name}
            </Text>
            <Text
              fontSize={{ base: "sm", sm: "md", md: "lg" }}
              color="gray.light"
              isTruncated
            >
              @{searchedUser.username}{" "}
            </Text>
          </Flex>

          <Flex justifyContent={"center"} alignItems="center">
            <Avatar
              name={searchedUser.name}
              src={
                searchedUser.profilePic ||
                "https://example.com/default-avatar.png"
              }
              boxSize={{
                base: "70px",
                sm: "100px",
                md: "110px",
                lg: "120px",
              }}
            />
          </Flex>
        </Flex>

        <Flex w="full">
          <Text
            fontSize={{ base: "xs", sm: "sm", md: "md" }}
            wordBreak="break-word"
            overflowWrap="break-word"
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
              <Text fontSize={{ base: "sm", sm: "md", md: "lg" }}>
                {userPosts.length} posts
              </Text>
            </Flex>
          </GridItem>
          <GridItem>
            <Flex
              justifyContent={"center"}
              alignItems="center"
              color="gray.100"
            >
              <Text fontSize={{ base: "sm", sm: "md", md: "lg" }}>
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
              <Text fontSize={{ base: "sm", sm: "md", md: "lg" }}>
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
          >
            {following ? "Unfollow" : "Follow"}
          </Button>
        )}
      </VStack>
    </Box>
  );
};
