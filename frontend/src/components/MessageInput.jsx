import {
  Box,
  Button,
  Flex,
  Image,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Spinner,
} from "@chakra-ui/react";
import { useEffect, useRef, useState, useCallback } from "react";
import { IoSendSharp, IoSparkles } from "react-icons/io5";
import { useRecoilState, useRecoilValue } from "recoil";
import {
  conversationsAtom,
  selectedConversationAtom,
} from "../atoms/messagesAtom";
import { useShowToast } from "../../hooks/useShowToast";
import { BsFillImageFill } from "react-icons/bs";
import { usePreviewImg } from "../../hooks/usePreviewImg";
import { useSocket } from "../../context/SocketContext.jsx";
import { MdGif } from "react-icons/md";

export const MessageInput = ({ setMessages }) => {
  const [messageText, setMessageText] = useState("");
  const selectedConversation = useRecoilValue(selectedConversationAtom);
  const [conversations, setConversations] = useRecoilState(conversationsAtom);
  const showToast = useShowToast();
  const imageRef = useRef(null);
  const { handleImageChange, imgUrl, setImgUrl } = usePreviewImg();
  const [isSending, setIsSending] = useState(false);
  const { socket } = useSocket();
  const [improvingLoader, setImprovingLoader] = useState(false);
  const typingTimeoutRef = useRef(null);
  const [fetchingGif, setFetchingGif] = useState(false);
  const [gifs, setGifs] = useState([]);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    setMessageText("");
  }, [selectedConversation]);

  const handleTyping = useCallback(() => {
    if (!socket || !selectedConversation?._id) return;

    socket?.emit("typing", {
      conversationId: selectedConversation._id,
      userId: selectedConversation.userId,
    });

    // Clear any existing timeout before starting a new one
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stopTyping", {
        conversationId: selectedConversation._id,
        userId: selectedConversation.userId,
      });
    }, 3000); // Always ensure it stops typing after 3 seconds
  }, [socket, selectedConversation]);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current); // Cleanup timeout on unmount
      }
    };
  }, []);

  // Improve Message with AI
  const improveWithAi = useCallback(async () => {
    if (improvingLoader || isSending || !messageText.trim()) {
      showToast("Error", "No text found", "error");
      return;
    }
    setImprovingLoader(true);
    try {
      const res = await fetch("/api/gemini/improve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: messageText }),
      });

      const data = await res.json();
      if (data.error) {
        showToast("Error", data.error, "error");
        return;
      }
      setMessageText(data.answer);
    } catch (error) {
      showToast("Error", error.message, "error");
    } finally {
      setImprovingLoader(false);
    }
  }, [messageText, improvingLoader, isSending]);

  // Handle Sending Message
  const handleSendMessage = useCallback(
    async (e) => {
      e.preventDefault();
      if (!messageText.trim() && !imgUrl) {
        showToast("Error", "Text is required", "error");
        return;
      }
      if (isSending || improvingLoader) return;
      setIsSending(true);

      try {
        const res = await fetch("/api/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            recipientId: selectedConversation.userId,
            message: messageText,
            img: imgUrl,
          }),
        });

        const data = await res.json();
        if (data.error) {
          showToast("Error", data.error, "error");
          return;
        }

        setMessages((prev) => [...prev, data]);

        setConversations((prevConvs) =>
          prevConvs.map((conversation) =>
            conversation._id === data.conversationId
              ? {
                  ...conversation,
                  lastMessage: {
                    text: data.text,
                    sender: data.sender,
                    img: data.img,
                    seen: false,
                  },
                }
              : conversation
          )
        );

        setMessageText("");
        setImgUrl("");
      } catch (error) {
        showToast("Error", error.message, "error");
      } finally {
        setIsSending(false);
      }
    },
    [messageText, imgUrl, isSending, improvingLoader, selectedConversation]
  );

  const handleGifPicker = async () => {
    if (fetchingGif) return;
    if (!searchText.trim()) {
      showToast("Error", "Query is missing", "error");
      return;
    }
    setFetchingGif(true);
    try {
      const encodedQuery = encodeURIComponent(searchText.trim());
      const res = await fetch(`/api/messages/gifs/${encodedQuery}`);
      if (!res.ok) throw new Error("Failed to fetch GIFs"); // Ensure request succeeded
      const data = await res.json();
      if (data.error) {
        showToast("Error", data.error, "error");
        return;
      }
      setGifs(data.gifs || []);
      // console.log(gifs);
      setSearchText("");
    } catch (error) {
      showToast("Error", error, "error");
    } finally {
      setFetchingGif(false);
      setSearchText("");
    }
  };

  return (
    <Flex gap={3} alignItems={"center"} w="full">
      {/* Message Input Field */}
      <Flex flex={90}>
        <form onSubmit={handleSendMessage} style={{ flex: 95 }}>
          <InputGroup>
            <Input
              w={"full"}
              placeholder="Type a message"
              value={messageText}
              onChange={(e) => {
                setMessageText(e.target.value);
                handleTyping();
              }}
            />
            <InputLeftElement pt={1} pb={1}>
              <MdGif size={30} cursor="pointer" onClick={handleGifPicker} />
              <Box w="1px" h="full" m="2px" bgColor="gray.600"></Box>
            </InputLeftElement>
            <InputRightElement onClick={handleSendMessage} cursor={"pointer"}>
              <IoSendSharp />
            </InputRightElement>
          </InputGroup>
        </form>
      </Flex>

      {/* Improve with AI Button */}
      <Flex flex={3} alignItems="center">
        <Button
          bgColor="white"
          _hover={{ bg: "gray.200" }}
          _active={{ bg: "gray.300" }}
          transition="all 0.2s ease-in-out"
          size="xs"
          borderRadius={100}
          onClick={improveWithAi}
          isDisabled={improvingLoader}
        >
          {improvingLoader ? (
            <Spinner size="sm" color="black" />
          ) : (
            <IoSparkles color="black" />
          )}
        </Button>
      </Flex>

      {/* Image Upload Button */}
      <Flex flex={3} cursor="pointer">
        <BsFillImageFill size={22} onClick={() => imageRef.current.click()} />
        <Input type="file" hidden ref={imageRef} onChange={handleImageChange} />
      </Flex>

      {/* Image Preview Modal */}
      <Modal isOpen={!!imgUrl} onClose={() => setImgUrl("")}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Preview</ModalHeader>
          <ModalCloseButton />
          <ModalBody
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
          >
            <Image src={imgUrl} maxW="100%" maxH="400px" objectFit="contain" />
            <Button
              w="full"
              colorScheme="blue"
              onClick={handleSendMessage}
              mt={4}
              isLoading={isSending}
            >
              Send
            </Button>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Flex>
  );
};
