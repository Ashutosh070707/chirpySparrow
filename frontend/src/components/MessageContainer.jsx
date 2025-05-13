import {
  Avatar,
  AvatarBadge,
  Button,
  Divider,
  Flex,
  Skeleton,
  SkeletonCircle,
  Text,
  useBreakpointValue,
} from "@chakra-ui/react";
import { Message } from "../components/Message.jsx";
import { MessageInput } from "./MessageInput.jsx";
import { useEffect, useRef, useState } from "react";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import {
  conversationsAtom,
  selectedConversationAtom,
} from "../atoms/messagesAtom.js";
import { useSocket } from "../../context/SocketContext.jsx";
import { useShowToast } from "../../hooks/useShowToast";
import { loggedInUserAtom } from "../atoms/loggedInUserAtom.js";
import { FaArrowLeft } from "react-icons/fa";
import { TypingIndicator } from "./TypingIndicator";

export const MessageContainer = ({ setBackButton }) => {
  const showToast = useShowToast();
  const [selectedConversation, setSelectedConversation] = useRecoilState(
    selectedConversationAtom
  );
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [messages, setMessages] = useState([]);
  const loggedInUser = useRecoilValue(loggedInUserAtom);
  const setConversations = useSetRecoilState(conversationsAtom);
  const { socket, onlineUsers } = useSocket();
  const messageEndRef = useRef(null);
  const messageContainerRef = useRef(null); // ✅ added
  const [isAtBottom, setIsAtBottom] = useState(true); // ✅ added
  const [isUserTyping, setIsUserTyping] = useState(false);
  const typingTimeoutRef = useRef(null);
  const screenSize = useBreakpointValue({
    base: "sm",
    sm: "sm",
    md: "md",
    lg: "lg",
    xl: "xl",
  });
  const isOnline = onlineUsers.includes(selectedConversation?.userId);

  useEffect(() => {
    if (!socket) return;
    const handleUserTyping = ({ conversationId }) => {
      if (selectedConversation._id === conversationId) {
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
    };

    const handleUserStoppedTyping = ({ conversationId }) => {
      if (selectedConversation._id === conversationId) {
        setIsUserTyping(false);
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
      }
    };

    socket?.on("userTyping", handleUserTyping);
    socket?.on("userStoppedTyping", handleUserStoppedTyping);

    return () => {
      socket?.off("userTyping", handleUserTyping);
      socket?.off("userStoppedTyping", handleUserStoppedTyping);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [socket, selectedConversation._id]);

  // ✅ Detect if user is at the bottom of the message list
  useEffect(() => {
    const container = messageContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const threshold = 100;
      const isBottom =
        container.scrollHeight - container.scrollTop - container.clientHeight <
        threshold;
      setIsAtBottom(isBottom);
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  // ✅ Scroll to bottom if loading or user is already at bottom
  const scrollToBottom = () => {
    if ((loadingMessages || isAtBottom) && messageEndRef.current) {
      setTimeout(() => {
        messageEndRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "end",
        });
      }, 100);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isUserTyping]);

  useEffect(() => {
    if (!socket) return;
    const handleNewMessage = (message) => {
      if (selectedConversation?._id === message.conversationId) {
        setMessages((prevMessages) => [...prevMessages, message]);
      }
      setConversations((prev) => {
        return prev.map((conversation) => {
          if (conversation._id === message.conversationId) {
            return {
              ...conversation,
              lastMessagePerUser: {
                ...(conversation.lastMessagePerUser || {}),
                [loggedInUser._id]: {
                  text: message.text,
                  sender: message.sender,
                  img: message.img,
                  gif: message.gif,
                  seen: false,
                },
              },
            };
          }
          return conversation;
        });
      });
    };
    socket?.on("newMessage", handleNewMessage);

    return () => socket?.off("newMessage", handleNewMessage);
  }, [socket, selectedConversation, setConversations]);

  useEffect(() => {
    const lastMessageIsFromOtherUser =
      messages.length &&
      messages[messages.length - 1].sender !== loggedInUser._id;

    if (lastMessageIsFromOtherUser) {
      socket?.emit("markMessagesAsSeen", {
        conversationId: selectedConversation._id,
        userId: selectedConversation.userId,
      });
    }

    const handleMessagesSeen = ({ conversationId }) => {
      if (selectedConversation._id === conversationId) {
        setMessages((prev) =>
          prev.map((message) =>
            !message.seen ? { ...message, seen: true } : message
          )
        );
      }
    };

    socket?.on("messagesSeen", handleMessagesSeen);

    return () => {
      socket?.off("messagesSeen", handleMessagesSeen);
    };
  }, [socket, selectedConversation, messages, setMessages, loggedInUser._id]);

  useEffect(() => {
    if (!socket) return;
    const handleMessageDeleted = ({
      messageId,
      selectedConversationId,
      updatedLastMessage,
    }) => {
      if (selectedConversation._id === selectedConversationId) {
        setMessages((prevMessages) =>
          prevMessages.filter((msg) => msg._id !== messageId)
        );

        setConversations((prev) => {
          return prev.map((conversation) => {
            if (conversation._id === selectedConversationId) {
              return {
                ...conversation,
                lastMessagePerUser: {
                  ...(conversation.lastMessagePerUser || {}),
                  [loggedInUser._id]: updatedLastMessage,
                },
              };
            }
            return conversation;
          });
        });
      }
    };
    socket?.on("messageDeleted", handleMessageDeleted);

    return () => socket?.off("messageDeleted");
  }, [socket, selectedConversation]);

  useEffect(() => {
    const getMessages = async () => {
      setLoadingMessages(true);
      setMessages([]);
      try {
        if (selectedConversation.mock) return;
        const res = await fetch(`/api/messages/${selectedConversation.userId}`);
        const data = await res.json();
        if (data.error) {
          showToast("Error", data.error, "error");
          return;
        }
        setMessages(data);
      } catch (error) {
        showToast("Error", error.message, "error");
      } finally {
        setLoadingMessages(false);
      }
    };
    getMessages();
  }, [showToast, selectedConversation.userId, selectedConversation.mock]);

  return (
    <Flex borderRadius="md" flexDirection="column" h="full" gap={1} p={1}>
      <Flex w="full" alignItems="center" gap={2} flex={10} overflow="hidden">
        {(screenSize === "xs" ||
          screenSize === "sm" ||
          screenSize === "md") && (
          <Button
            size={{ base: "xs", sm: "sm" }}
            borderRadius="full"
            onClick={() => {
              if (socket) {
                socket.emit("userLeftConversation", loggedInUser._id);
              }
              setBackButton(false);
              setSelectedConversation({
                _id: "",
                userId: "",
                username: "",
                userProfilePic: "",
                name: "",
              });
            }}
          >
            <FaArrowLeft />
          </Button>
        )}

        <Avatar
          name={selectedConversation.name}
          src={
            selectedConversation.userProfilePic ||
            "https://example.com/default-avatar.png"
          }
          boxSize={{ base: "40px", sm: "50px" }}
          flexShrink={0}
        >
          {isOnline && <AvatarBadge boxSize="1em" bg="green.300" />}
        </Avatar>

        <Flex flex={1} minW={0} overflow="hidden">
          <Text
            fontSize="sm"
            fontWeight="bold"
            isTruncated
            maxW="100%"
            whiteSpace="nowrap"
          >
            {selectedConversation.name}
          </Text>
        </Flex>
      </Flex>

      <Divider flex={2} />

      <Flex
        ref={messageContainerRef} // ✅ Added
        direction="column"
        gap={3}
        flex={80}
        my={4}
        w={"full"}
        overflowY={"auto"}
        className="custom-scrollbar"
      >
        {loadingMessages &&
          [...Array(7)].map((_, i) => (
            <Flex
              key={i}
              gap={2}
              alignItems={"center"}
              p={1}
              borderRadius="md"
              alignSelf={i % 2 == 0 ? "flex-start" : "flex-end"}
            >
              {i % 2 == 0 && <SkeletonCircle size={7}></SkeletonCircle>}
              <Flex flexDirection={"column"} gap={2}>
                <Skeleton h="8px" w="250px"></Skeleton>
                <Skeleton h="8px" w="250px"></Skeleton>
                <Skeleton h="8px" w="250px"></Skeleton>
              </Flex>
              {i % 2 !== 0 && <SkeletonCircle size={7} />}
            </Flex>
          ))}

        {!loadingMessages &&
          messages.map((message) => (
            <Flex key={message._id} direction={"column"}>
              <Message
                message={message}
                ownMessage={loggedInUser._id === message.sender}
                setMessages={setMessages}
              />
            </Flex>
          ))}

        {isUserTyping && (
          <Flex justifyContent={"flex-end"} alignItems="center" mt={4} pr={8}>
            <TypingIndicator />
          </Flex>
        )}

        <div ref={messageEndRef}></div>
      </Flex>

      <Flex flex={8} w="full" borderRadius={10}>
        <MessageInput setMessages={setMessages} />
      </Flex>
    </Flex>
  );
};
