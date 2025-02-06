import {
  Avatar,
  AvatarBadge,
  Box,
  Flex,
  Image,
  useColorMode,
  useColorModeValue,
  WrapItem,
} from "@chakra-ui/react";
import React from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { BsCheck2All, BsFillImageFill } from "react-icons/bs";
import { selectedConversationAtom } from "../atoms/messagesAtom";
import { loggedInUserAtom } from "../atoms/loggedInUserAtom";

export const Conversation = ({ conversation, isOnline }) => {
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
      gap={4}
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
      }}
      bg={
        selectedConversation?._id === conversation._id
          ? colorMode === "light"
            ? "gray.400"
            : "gray.dark"
          : ""
      }
    >
      <Flex flex={5}>
        <WrapItem>
          <Avatar
            name={user.name}
            src={user.profilePic || "https://example.com/default-avatar.png"}
            size="md"
          >
            {isOnline ? (
              <AvatarBadge boxSize="1em" bg="green.500"></AvatarBadge>
            ) : (
              ""
            )}
          </Avatar>
        </WrapItem>
      </Flex>

      <Flex direction={"column"} flex={95}>
        <Box
          fontSize={"sm"}
          fontWeight="700"
          display="flex"
          alignItems="center"
        >
          <Flex alignItems="center">
            {user.name.length > 13
              ? user.name.substring(0, 13) + "..."
              : user.name}
            <Image src="/verified.png" w="4" h={4} ml={1}></Image>
          </Flex>
        </Box>

        <Box as="span" fontSize="xs" display="flex" alignItems="center" gap={1}>
          {loggedInUser._id === lastMessage.sender ? (
            <Box color={lastMessage.seen ? "blue.400" : ""}>
              <BsCheck2All size={16}></BsCheck2All>
            </Box>
          ) : null}
          {lastMessage.text.length > 20
            ? lastMessage.text.substring(0, 20) + "..."
            : lastMessage.text}
          {/* <BsFillImageFill size={15}/> */}
        </Box>
      </Flex>
    </Flex>
  );
};
