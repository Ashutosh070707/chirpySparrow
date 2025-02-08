import {
  Button,
  Flex,
  Image,
  Input,
  InputGroup,
  InputRightElement,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Spinner,
  useDisclosure,
} from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import { IoSendSharp } from "react-icons/io5";
import { useRecoilState, useRecoilValue } from "recoil";
import {
  conversationsAtom,
  selectedConversationAtom,
} from "../atoms/messagesAtom";
import { useShowToast } from "../../hooks/useShowToast";
import { BsFillImageFill } from "react-icons/bs";
import { usePreviewImg } from "../../hooks/usePreviewImg";

export const MessageInput = ({ setMessages }) => {
  const [messageText, setMessageText] = useState("");
  const selectedConversation = useRecoilValue(selectedConversationAtom);
  const [conversations, setConversations] = useRecoilState(conversationsAtom);
  const showToast = useShowToast();
  const imageRef = useRef(null);
  const { onClose } = useDisclosure();
  const { handleImageChange, imgUrl, setImgUrl } = usePreviewImg();
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    setMessageText(""); // Clear the input text
  }, [selectedConversation]); // Trigger this effect when selectedConversation changes

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText && !imgUrl) return;
    if (isSending) return;
    setIsSending(true);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "content-Type": "application/json",
        },
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
      setMessages((messages) => [...messages, data]);

      setConversations((prevConvs) => {
        const updatedConversations = prevConvs.map((conversation) => {
          if (conversation._id === selectedConversation._id) {
            return {
              ...conversation,
              lastMessage: {
                text: messageText,
                sender: data.sender,
              },
            };
          }
          return conversation;
        });
        return updatedConversations;
      });
      setMessageText("");
      setImgUrl("");
    } catch (error) {
      showToast("Error", error.message, "error");
    } finally {
      setIsSending(false);
    }
  };
  return (
    <Flex gap={2} alignItems={"center"} w="full">
      <Flex flex={95}>
        <form
          onSubmit={(e) => {
            handleSendMessage(e);
          }}
          style={{ flex: 95 }}
        >
          <InputGroup>
            <Input
              w={"full"}
              placeholder="Type a message"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
            ></Input>
            <InputRightElement onClick={handleSendMessage} cursor={"pointer"}>
              <IoSendSharp />
            </InputRightElement>
          </InputGroup>
        </form>
      </Flex>
      <Flex flex={5}>
        <Flex flex={5} cursor="pointer">
          <BsFillImageFill
            size={22}
            onClick={() => imageRef.current.click()}
          ></BsFillImageFill>
          <Input
            type={"file"}
            hidden
            ref={imageRef}
            onChange={handleImageChange}
          ></Input>
        </Flex>

        <Modal
          w="70vw"
          h="60vh"
          maxW="70vw" // Adjust the maximum width of the modal
          maxH="60vh" // Adjust the maximum height of the modal
          overflowX="auto"
          overflowY="auto"
          css={{
            scrollbarWidth: "thin", // Makes scrollbar thinner
            scrollbarColor: "#888 transparent", // Thumb and track colors
            "&::-webkit-scrollbar": {
              width: "6px",
              height: "6px",
            },
            "&::-webkit-scrollbar-thumb": {
              background: "#888",
              borderRadius: "10px",
            },
            "&::-webkit-scrollbar-thumb:hover": {
              background: "#555",
            },
            "&::-webkit-scrollbar-track": {
              background: "transparent",
            },
          }}
          isOpen={imgUrl}
          onClose={() => {
            onClose();
            setImgUrl("");
          }}
        >
          <ModalOverlay></ModalOverlay>
          <ModalContent
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            p={2}
            border="1px solid pink"
          >
            <ModalHeader></ModalHeader>
            <ModalCloseButton></ModalCloseButton>
            <ModalBody
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              w="full"
              h="full"
            >
              <Flex
                direction="column"
                alignItems="center"
                justifyContent="center"
                w="full"
                h="full"
                gap={4}
              >
                <Flex
                  justifyContent="center"
                  alignItems="center"
                  w="full"
                  maxH="70vh"
                  overflowY="auto"
                  overflowX="auto"
                  css={{
                    scrollbarWidth: "thin", // Makes scrollbar thinner
                    scrollbarColor: "#888 transparent", // Thumb and track colors
                    "&::-webkit-scrollbar": {
                      width: "6px",
                      height: "6px",
                    },
                    "&::-webkit-scrollbar-thumb": {
                      background: "#888",
                      borderRadius: "10px",
                    },
                    "&::-webkit-scrollbar-thumb:hover": {
                      background: "#555",
                    },
                    "&::-webkit-scrollbar-track": {
                      background: "transparent",
                    },
                  }}
                >
                  <Image
                    src={imgUrl}
                    maxW="100%"
                    maxH="100%"
                    objectFit="contain"
                  ></Image>
                </Flex>
                <Flex flex={20} justifyContent={"center"} w="full">
                  {!isSending ? (
                    <Button
                      w="full"
                      bg="blue.600"
                      color="white"
                      cursor="pointer"
                      onClick={handleSendMessage}
                    >
                      Send
                    </Button>
                  ) : (
                    <Flex
                      justifyContent="center"
                      alignItems="center"
                      w="full"
                      borderRadius={10}
                      bgColor={"gray.600"}
                      p={2}
                    >
                      <Spinner size="lg" />
                    </Flex>
                  )}
                </Flex>
              </Flex>
            </ModalBody>
          </ModalContent>
        </Modal>
      </Flex>
    </Flex>
  );
};
