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
import React, { useEffect, useRef, useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { BsCheck2All, BsFillImageFill } from "react-icons/bs";
import { selectedConversationAtom } from "../atoms/messagesAtom";
import { loggedInUserAtom } from "../atoms/loggedInUserAtom";
import { useSocket } from "../../context/SocketContext";
import { MdGif } from "react-icons/md";

export const Conversation = ({ conversation, isOnline, setBackButton }) => {
  const colorMode = useColorMode();
  const loggedInUser = useRecoilValue(loggedInUserAtom);
  const [selectedConversation, setSelectedConversation] = useRecoilState(
    selectedConversationAtom
  );
  const { socket } = useSocket();
  // const user = conversation.participants[0];
  const user = conversation.participants.find(
    (p) => p._id !== loggedInUser._id
  );
  const lastMessage = conversation.lastMessage;
  const [isUserTyping, setIsUserTyping] = useState(false);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    socket?.on("userTyping", ({ conversationId }) => {
      if (conversation._id === conversationId) {
        setIsUserTyping(true);

        // Clear previous timeout
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }

        // Set timeout to hide typing indicator after 3 seconds
        typingTimeoutRef.current = setTimeout(() => {
          setIsUserTyping(false);
        }, 2000);
      }
    });

    socket?.on("userStoppedTyping", ({ conversationId }) => {
      if (conversation._id === conversationId) {
        setIsUserTyping(false);
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
      }
    });

    return () => {
      socket?.off("userTyping");
      socket?.off("userStoppedTyping");
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [socket, selectedConversation?._id]);

  return (
    <Flex
      borderRadius={10}
      alignItems="center"
      p={2}
      gap={3}
      _hover={{
        cursor: "pointer",
        bg: useColorModeValue("gray.600", "gray.900"),
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
      <Flex gap={3} w="full">
        <Flex flex={8}>
          <WrapItem>
            <Avatar
              name={user.name}
              src={user.profilePic || "https://example.com/default-avatar.png"}
              boxSize={{ base: "40px", sm: "50px" }}
            >
              {isOnline ? (
                <AvatarBadge boxSize="1em" bg="green.300"></AvatarBadge>
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
          justifyContent="center"
        >
          <Flex alignItems="center" w="full" overflow="hidden">
            <Text
              fontSize={"sm"}
              fontWeight={"bold"}
              isTruncated
              maxW="100%" // Ensures it respects parent width
              whiteSpace="nowrap"
            >
              {user.name}
            </Text>
          </Flex>

          {!isUserTyping && (
            <Flex
              fontSize="xs"
              alignItems="center"
              gap={1}
              overflow="hidden"
              w="full"
            >
              {lastMessage.sender && loggedInUser._id === lastMessage.sender ? (
                <Box color={lastMessage.seen ? "blue.400" : ""}>
                  <BsCheck2All size={16}></BsCheck2All>
                </Box>
              ) : null}

              {lastMessage.sender && (
                <Flex w="full">
                  {lastMessage.text.length > 0 && (
                    <Text fontSize={"xs"} color="gray.400" isTruncated w="85%">
                      {lastMessage.text}
                    </Text>
                  )}
                  {!!lastMessage.img && <BsFillImageFill size={16} />}
                  {!!lastMessage.gif && <MdGif size={30} />}
                </Flex>
              )}
            </Flex>
          )}

          {isUserTyping && (
            <Flex
              fontSize="xs"
              alignItems="center"
              gap={1}
              overflow="hidden"
              w="full"
            >
              <Text
                color="#90EE90"
                fontWeight="bold"
                fontSize={{ base: "xs", sm: "sm" }}
              >
                Typing
              </Text>
              <Flex justifyContent="center" mt={1}>
                <div className="bouncing-loader">
                  <div></div>
                  <div></div>
                  <div></div>
                </div>
              </Flex>
            </Flex>
          )}
        </Flex>
      </Flex>
    </Flex>
  );
};
