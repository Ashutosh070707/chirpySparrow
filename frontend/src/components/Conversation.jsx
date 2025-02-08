import {
  Avatar,
  AvatarBadge,
  Box,
  Flex,
  Image,
  Text,
  useColorMode,
  useColorModeValue,
  WrapItem,
} from "@chakra-ui/react";
import React from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { BsCheck2All, BsFillImageFill } from "react-icons/bs";
import { selectedConversationAtom } from "../atoms/messagesAtom";
import { loggedInUserAtom } from "../atoms/loggedInUserAtom";

export const Conversation = ({ conversation, isOnline, setBackButton }) => {
  const colorMode = useColorMode();
  const loggedInUser = useRecoilValue(loggedInUserAtom);
  const [selectedConversation, setSelectedConversation] = useRecoilState(
    selectedConversationAtom
  );
  const user = conversation.participants[0];
  const lastMessage = conversation.lastMessage;

  return (
    <Flex
      borderRadius={10}
      alignItems="center"
      p={2}
      gap={3}
      _hover={{
        cursor: "pointer",
        bg: useColorModeValue("gray.600", "gray.dark"),
        color: "white",
      }}
      w="full"
      onClick={() => {
        setSelectedConversation({
          _id: conversation._id,
          userId: user._id,
          userProfilePic: user.profilePic,
          username: user.username,
          name: user.name,
          mock: conversation.mock,
        });
        setBackButton(true);
      }}
      bg={
        selectedConversation?._id === conversation._id
          ? colorMode === "light"
            ? "gray.400"
            : "gray.dark"
          : ""
      }
    >
      <Flex gap={2} w="full">
        <Flex flex={8}>
          <WrapItem>
            <Avatar
              name={user.name}
              src={user.profilePic || "https://example.com/default-avatar.png"}
              size="md"
            >
              {isOnline ? (
                <AvatarBadge boxSize="1em" bg="green.400"></AvatarBadge>
              ) : (
                ""
              )}
            </Avatar>
          </WrapItem>
        </Flex>

        <Flex
          direction={"column"}
          flex={92}
          gap={1}
          overflow="hidden"
          justifyContent={"flex-start"}
        >
          <Flex alignItems="center" w="full" overflow="hidden">
            <Text fontSize={"sm"} fontWeight={"bold"}>
              {user.name}
            </Text>
          </Flex>

          <Flex
            fontSize="xs"
            alignItems="center"
            gap={1}
            overflow="hidden"
            w="full"
          >
            {loggedInUser._id === lastMessage.sender ? (
              <Box color={lastMessage.seen ? "blue.400" : ""}>
                <BsCheck2All size={16}></BsCheck2All>
              </Box>
            ) : null}

            {lastMessage.text.length > 0 && (
              <Text fontSize={"xs"} color="gray.400" isTruncated w="85%">
                {lastMessage.text}
              </Text>
            )}
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  );
};
