import {
  Avatar,
  AvatarBadge,
  Box,
  Flex,
  Text,
  useColorMode,
  useColorModeValue,
  WrapItem,
} from "@chakra-ui/react";
import React, { useEffect, useRef, useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { BsCheck2All, BsFillImageFill } from "react-icons/bs";
import {
  conversationsAtom,
  selectedConversationAtom,
} from "../atoms/messagesAtom";
import { loggedInUserAtom } from "../atoms/loggedInUserAtom";
import { useSocket } from "../../context/SocketContext";
import { MdGif } from "react-icons/md";
import { useShowToast } from "../../hooks/useShowToast";

export const Conversation = ({ conversation, isOnline, setBackButton }) => {
  const showToast = useShowToast();
  const colorMode = useColorMode();
  const loggedInUser = useRecoilValue(loggedInUserAtom);
  const [selectedConversation, setSelectedConversation] = useRecoilState(
    selectedConversationAtom
  );
  const [conversations, setConversations] = useRecoilState(conversationsAtom);
  const { socket } = useSocket();
  const user = conversation.participants.find(
    (p) => p._id !== loggedInUser._id
  );
  const lastMessage = conversation.lastMessage;
  const [isUserTyping, setIsUserTyping] = useState(false);
  const typingTimeoutRef = useRef(null);

  const unreadMessageCount = conversation.unreadCount?.[loggedInUser._id] || 0;

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

  useEffect(() => {
    if (!socket) return;
    const handleUnreadMessageCount = async ({
      conversationId,
      unreadCount,
    }) => {
      if (
        conversation._id === conversationId &&
        selectedConversation?._id !== conversationId
      ) {
        setConversations((prev) =>
          prev.map((conv) =>
            conv._id === conversationId
              ? {
                  ...conv,
                  unreadCount: {
                    ...conv.unreadCount,
                    [loggedInUser._id]: unreadCount,
                  },
                }
              : conv
          )
        );
      }
    };
    socket?.on("updateUnreadCount", handleUnreadMessageCount);

    return () => {
      socket?.off("updateUnreadCount", handleUnreadMessageCount);
    };
  }, [
    socket,
    conversation._id,
    selectedConversation,
    loggedInUser._id,
    setConversations,
  ]);

  const resetUnreadMessageCount = async () => {
    try {
      const res = await fetch(`/api/messages/resetUnreadMessageCount`, {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({
          conversationId: conversation._id,
          userId: loggedInUser._id,
        }),
      });
      const data = await res.json();
      if (data.error) {
        showToast("Error", data.error, "error");
        return;
      }

      setConversations((prev) =>
        prev.map((conv) =>
          conv._id === conversation._id
            ? {
                ...conv,
                unreadCount: {
                  ...conv.unreadCount,
                  [loggedInUser._id]: 0,
                },
              }
            : conv
        )
      );
    } catch (error) {
      showToast("Error", error.message, "error");
    }
  };

  return (
    <Flex
      borderRadius={10}
      alignItems="center"
      p={2}
      _hover={{
        cursor: "pointer",
        bg: useColorModeValue("gray.600", "gray.900"),
        color: "white",
      }}
      w="full"
      onClick={() => {
        if (socket) {
          socket.emit("userViewingConversation", {
            userId: loggedInUser._id,
            conversationId: conversation._id,
          });
        }
        setSelectedConversation({
          _id: conversation._id,
          userId: user._id,
          userProfilePic: user.profilePic,
          username: user.username,
          name: user.name,
          mock: conversation.mock,
        });
        setBackButton(true);
        resetUnreadMessageCount();
      }}
      bg={
        selectedConversation?._id === conversation._id
          ? colorMode === "light"
            ? "gray.400"
            : "gray.700"
          : ""
      }
      justifyContent={"flex-start"}
    >
      <Flex gap={3} w="full" justifyContent={"flex-start"}>
        <Flex flexShrink={0} minW="10%" maxW="20%">
          <WrapItem>
            <Avatar
              name={user.name}
              src={user.profilePic || "https://example.com/default-avatar.png"}
              boxSize={{ base: "40px", sm: "50px" }}
            >
              {isOnline && (
                <AvatarBadge boxSize="1em" bg="green.300"></AvatarBadge>
              )}
            </Avatar>
          </WrapItem>
        </Flex>

        <Flex
          direction={"column"}
          flex={1}
          gap={1}
          overflow="hidden"
          justifyContent="center"
        >
          <Flex alignItems="center" w="95%" overflow="hidden">
            <Text
              fontSize={"sm"}
              fontWeight={"bold"}
              isTruncated
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
                <Flex w="full" overflow="hidden">
                  {lastMessage?.text?.length > 0 && (
                    <Text fontSize={"xs"} color="gray.400" isTruncated w="90%">
                      {lastMessage.text}
                    </Text>
                  )}
                  {!!lastMessage.img && <BsFillImageFill size={16} />}
                  {!!lastMessage.gif && <MdGif size={25} />}
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

        {unreadMessageCount > 0 && (
          <Flex
            w="6%"
            flexShrink={0}
            justifyContent="center"
            alignItems="center"
          >
            <Box
              bgColor="#0BDA51"
              borderRadius="50%"
              minW="20px"
              minH="20px"
              display={"flex"}
              justifyContent="center"
              alignItems="center"
            >
              <Flex
                w="full"
                h="full"
                borderRadius="full"
                justifyContent="center"
                alignItems="center"
                fontSize={unreadMessageCount > 50 ? "9px" : "10px"}
                color="black"
                fontWeight="bold"
              >
                {unreadMessageCount > 50 ? "50+" : unreadMessageCount}
              </Flex>
            </Box>
          </Flex>
        )}
      </Flex>
    </Flex>
  );
};
