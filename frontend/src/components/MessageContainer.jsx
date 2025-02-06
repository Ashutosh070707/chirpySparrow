import {
  Avatar,
  Divider,
  Flex,
  Image,
  Skeleton,
  SkeletonCircle,
  Text,
  useColorModeValue,
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

export const MessageContainer = () => {
  const showToast = useShowToast();
  const [selectedConversation, setselectedConversation] = useRecoilState(
    selectedConversationAtom
  );
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [messages, setMessages] = useState([]);
  const loggedInUser = useRecoilValue(loggedInUserAtom);
  const setConversations = useSetRecoilState(conversationsAtom);
  const { socket } = useSocket();
  const messageEndRef = useRef(null);

  useEffect(() => {
    socket.on("newMessage", (message) => {
      if (selectedConversation._id === message.conversationId) {
        setMessages((prevMessages) => [...prevMessages, message]);
      }
      if (!document.hasFocus()) {
        const sound = new Audio(messageSound);
        sound.play();
      }

      setConversations((prev) => {
        const updatedConversations = prev.map((conversation) => {
          if (conversation._id === message.conversationId) {
            return {
              ...conversation,
              lastMessage: {
                text: message.text,
                sender: message.sender,
              },
            };
          }
          return conversation;
        });
        return updatedConversations;
      });
    });

    return () => socket.off("newMessage");
  }, [socket, selectedConversation, setConversations]);

  useEffect(() => {
    const lastMessageIsFromOtherUser =
      messages.length &&
      messages[messages.length - 1].sender !== loggedInUser._id;
    if (lastMessageIsFromOtherUser) {
      socket.emit("markMessagesAsSeen", {
        conversationId: selectedConversation._id,
        userId: selectedConversation.userId,
      });
    }

    socket.on("messagesSeen", ({ conversationId }) => {
      if (selectedConversation._id === conversationId) {
        setMessages((prev) => {
          const updatedMessages = prev.map((message) => {
            if (!message.seen) {
              return {
                ...message,
                seen: true,
              };
            }
            return message;
          });
          return updatedMessages;
        });
      }
    });
  }, [socket, loggedInUser._id, messages, selectedConversation]);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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
    <Flex
      bg={useColorModeValue("gray.200", "gray.dark")}
      borderRadius="md"
      flexDirection="column"
      h="full"
      gap={2}
      p={3}
    >
      <Flex w="full" alignItems={"center"} gap={2} flex={10}>
        <Avatar
          name={selectedConversation.name}
          src={
            selectedConversation.userProfilePic ||
            "https://example.com/default-avatar.png"
          }
          size="md"
        ></Avatar>
        <Text display="flex" alignItems="center">
          {selectedConversation.name}
          <Image src="/verified.png" w={4} h={4} ml={1}></Image>
        </Text>
      </Flex>
      <Divider></Divider>

      <Flex
        direction="column"
        gap={4}
        flex={80}
        my={4}
        h="full"
        w={"full"}
        overflowY={"auto"}
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
            <Flex
              key={message._id}
              direction={"column"}
              ref={
                messages.length - 1 === messages.indexOf(message)
                  ? messageEndRef
                  : null
              }
            >
              <Message
                message={message}
                ownMessage={loggedInUser._id === message.sender}
                setMessages={setMessages}
              />
            </Flex>
          ))}
      </Flex>
      <Flex flex={10} w="full" borderRadius={10}>
        <MessageInput setMessages={setMessages} />
      </Flex>
    </Flex>
  );
};
