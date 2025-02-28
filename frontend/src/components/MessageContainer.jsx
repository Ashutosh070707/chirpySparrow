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
import messageSound from "../../assets/sounds/notification.mp3";
import { loggedInUserAtom } from "../atoms/loggedInUserAtom.js";
import { FaArrowLeft } from "react-icons/fa";
import { TypingIndicator } from "./TypingIndicator";

export const MessageContainer = ({ setBackButton }) => {
  const showToast = useShowToast();
  const [selectedConversation, setselectedConversation] = useRecoilState(
    selectedConversationAtom
  );
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [messages, setMessages] = useState([]);
  const loggedInUser = useRecoilValue(loggedInUserAtom);
  const setConversations = useSetRecoilState(conversationsAtom);
  const { socket, onlineUsers } = useSocket();
  const messageEndRef = useRef(null);
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

  ///////////////////////////////////////////////////////////////////  socket.io functionality

  useEffect(() => {
    socket?.on("userTyping", ({ conversationId }) => {
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
    });

    socket?.on("userStoppedTyping", ({ conversationId }) => {
      if (selectedConversation._id === conversationId) {
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
  }, [socket, selectedConversation._id]);

  useEffect(() => {
    socket?.on("newMessage", (message) => {
      if (selectedConversation?._id === message.conversationId) {
        setMessages((prevMessages) => [...prevMessages, message]);
      }
      // if (!document.hasFocus()) {
      //   const sound = new Audio(messageSound);
      //   sound.play();
      // }

      setConversations((prev) => {
        const updatedConversations = prev.map((conversation) => {
          if (conversation._id === message.conversationId) {
            return {
              ...conversation,
              lastMessage: {
                text: message.text,
                sender: message.sender,
                img: message.img,
              },
            };
          }
          return conversation;
        });
        return updatedConversations;
      });
    });

    return () => socket?.off("newMessage");
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
      socket?.off("messagesSeen", handleMessagesSeen); // Cleanup listener on unmount
    };
  }, [socket, loggedInUser._id, messages, selectedConversation, setMessages]);

  useEffect(() => {
    socket?.on(
      "messageDeleted",
      ({ messageId, selectedConversationId, updatedLastMessage }) => {
        if (selectedConversation._id === selectedConversationId) {
          setMessages((prevMessages) =>
            prevMessages.filter((msg) => msg._id !== messageId)
          );

          setConversations((prev) =>
            prev.map((conversation) =>
              conversation._id === selectedConversationId
                ? {
                    ...conversation,
                    lastMessage: updatedLastMessage,
                  }
                : conversation
            )
          );
        }
      }
    );

    return () => socket?.off("messageDeleted");
  }, [socket, selectedConversation]);

  //////////////////////////////////////////////////////////  getMessages logic and scroll to the bottom of messagecontainer logic

  // const scrollToBottom = () => {
  //   if (messageEndRef.current) {
  //     setTimeout(() => {
  //       messageEndRef.current.scrollIntoView({
  //         behavior: "smooth",
  //         block: "end",
  //       });
  //     }, 500); // Small delay to ensure content is rendered
  //   }
  // };

  const scrollToBottom = () => {
    if (messageEndRef.current) {
      setTimeout(() => {
        if (messageEndRef.current) {
          // Add this check
          messageEndRef.current.scrollIntoView({
            behavior: "smooth",
            block: "end",
          });
        }
      }, 500);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isUserTyping]);

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
      {/* <Flex w="full" alignItems={"center"} gap={2} flex={10} overflow="hidden">
        {(screenSize == "xs" || screenSize == "sm" || screenSize == "md") && (
          <Button
            size={{ base: "xs", sm: "sm" }}
            borderRadius={"full"}
            // w={10}
            // h={10}
            onClick={() => {
              setBackButton(false);
              setselectedConversation({
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
          boxSize={{
            base: "40px",
            sm: "50px",
          }}
        >
          {isOnline ? (
            <AvatarBadge boxSize="1em" bg="green.300"></AvatarBadge>
          ) : (
            ""
          )}
        </Avatar>
        <Text
          display="flex"
          alignItems="center"
          fontSize={"sm"}
          fontWeight={"bold"}
          isTruncated
          maxW="100%" // Ensures it respects parent width
          whiteSpace="nowrap"
        >
          {selectedConversation.name}
        </Text>
      </Flex> */}
      <Flex w="full" alignItems="center" gap={2} flex={10} overflow="hidden">
        {/* Back Button (Only on Small Screens) */}
        {(screenSize === "xs" ||
          screenSize === "sm" ||
          screenSize === "md") && (
          <Button
            size={{ base: "xs", sm: "sm" }}
            borderRadius="full"
            onClick={() => {
              setBackButton(false);
              setselectedConversation({
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

        {/* Avatar */}
        <Avatar
          name={selectedConversation.name}
          src={
            selectedConversation.userProfilePic ||
            "https://example.com/default-avatar.png"
          }
          boxSize={{ base: "40px", sm: "50px" }}
          flexShrink={0} // Prevents shrinking
        >
          {isOnline && <AvatarBadge boxSize="1em" bg="green.300" />}
        </Avatar>

        {/* User Name (Proper Truncation) */}
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
      <Divider flex={2}></Divider>
      <Flex
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
