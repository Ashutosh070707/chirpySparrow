// import {
//   Button,
//   Flex,
//   Image,
//   Input,
//   InputGroup,
//   InputRightElement,
//   Modal,
//   ModalBody,
//   ModalCloseButton,
//   ModalContent,
//   ModalHeader,
//   ModalOverlay,
//   Spinner,
//   useDisclosure,
// } from "@chakra-ui/react";
// import { useEffect, useRef, useState } from "react";
// import { IoSendSharp } from "react-icons/io5";
// import { useRecoilState, useRecoilValue } from "recoil";
// import {
//   conversationsAtom,
//   selectedConversationAtom,
// } from "../atoms/messagesAtom";
// import { useShowToast } from "../../hooks/useShowToast";
// import { BsFillImageFill } from "react-icons/bs";
// import { usePreviewImg } from "../../hooks/usePreviewImg";
// import { useSocket } from "../../context/SocketContext.jsx";
// import { IoSparkles } from "react-icons/io5";

// export const MessageInput = ({ setMessages }) => {
//   const [messageText, setMessageText] = useState("");
//   const selectedConversation = useRecoilValue(selectedConversationAtom);
//   const [conversations, setConversations] = useRecoilState(conversationsAtom);
//   const showToast = useShowToast();
//   const imageRef = useRef(null);
//   const { onClose } = useDisclosure();
//   const { handleImageChange, imgUrl, setImgUrl } = usePreviewImg();
//   const [isSending, setIsSending] = useState(false);
//   const [typingTimeout, setTypingTimeout] = useState(null);
//   const { socket } = useSocket();
//   const [improvingLoader, setImprovingLoader] = useState(false);

//   const improveWithAi = async () => {
//     if (improvingLoader || isSending) return;
//     if (messageText === "") {
//       showToast("Error", "No text found", "error");
//       return;
//     }
//     setImprovingLoader(true);
//     try {
//       const res = await fetch("/api/gemini/improve", {
//         method: "POST",
//         headers: {
//           "content-type": "application/json",
//         },
//         body: JSON.stringify({
//           question: messageText,
//         }),
//       });

//       const data = await res.json();
//       if (data.error) {
//         showToast("Error", data.error, "error");
//         return;
//       }
//       setMessageText(data.answer);
//     } catch (error) {
//       showToast("Error", error, "error");
//     } finally {
//       setImprovingLoader(false);
//     }
//   };

//   useEffect(() => {
//     setMessageText("");
//   }, [selectedConversation]);

//   const handleTyping = () => {
//     socket.emit("typing", {
//       conversationId: selectedConversation._id,
//       userId: selectedConversation.userId,
//     });

//     if (typingTimeout) clearTimeout(typingTimeout);

//     const timeout = setTimeout(() => {
//       socket.emit("stopTyping", {
//         conversationId: selectedConversation._id,
//         userId: selectedConversation.userId,
//       });
//     }, 2000); // Stop typing indicator after 1 second of no input

//     setTypingTimeout(timeout);
//   };

//   useEffect(() => {
//     return () => {
//       if (typingTimeout) clearTimeout(typingTimeout);
//     };
//   }, [typingTimeout]);

//   const handleSendMessage = async (e) => {
//     e.preventDefault();
//     if (!messageText && !imgUrl) return;
//     if (isSending || improvingLoader) return;
//     setIsSending(true);
//     try {
//       const res = await fetch("/api/messages", {
//         method: "POST",
//         headers: {
//           "content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           recipientId: selectedConversation.userId,
//           message: messageText,
//           img: imgUrl,
//         }),
//       });

//       const data = await res.json();
//       if (data.error) {
//         showToast("Error", data.error, "error");
//         return;
//       }
//       setMessages((messages) => [...messages, data]);

//       setConversations((prevConvs) => {
//         const updatedConversations = prevConvs.map((conversation) => {
//           if (conversation._id === data.conversationId) {
//             return {
//               ...conversation,
//               lastMessage: {
//                 text: data.text,
//                 sender: data.sender,
//                 img: data.img,
//                 seen: false,
//               },
//             };
//           }
//           return conversation;
//         });
//         return updatedConversations;
//       });

//       setMessageText("");
//       setImgUrl("");
//     } catch (error) {
//       showToast("Error", error.message, "error");
//     } finally {
//       setIsSending(false);
//     }
//   };
//   return (
//     <Flex gap={3} alignItems={"center"} w="full">
//       <Flex flex={90}>
//         <form
//           onSubmit={(e) => {
//             handleSendMessage(e);
//           }}
//           style={{ flex: 95 }}
//         >
//           <InputGroup>
//             <Input
//               w={"full"}
//               placeholder="Type a message"
//               value={messageText}
//               onChange={(e) => {
//                 setMessageText(e.target.value);
//                 handleTyping();
//               }}
//             ></Input>
//             <InputRightElement onClick={handleSendMessage} cursor={"pointer"}>
//               <IoSendSharp />
//             </InputRightElement>
//           </InputGroup>
//         </form>
//       </Flex>
//       <Flex flex={4} alignItems="center">
//         <Button
//           bgGradient="linear(to-r, pink.400, purple.500, blue.500)"
//           _hover={{
//             bgGradient: "linear(to-r, pink.300, purple.400, blue.400)",
//             transform: "scale(1.1)",
//           }}
//           _active={{ transform: "scale(0.95)" }}
//           boxShadow="0px 0px 10px rgba(255, 0, 255, 0.5)"
//           transition="all 0.2s ease-in-out"
//           size="xs"
//           borderRadius={100}
//           onClick={improveWithAi}
//           disabled={improvingLoader}
//         >
//           {improvingLoader ? (
//             <Spinner size="sm" color="white" />
//           ) : (
//             <IoSparkles color="white" />
//           )}
//         </Button>
//       </Flex>
//       <Flex flex={3}>
//         <Flex flex={5} cursor="pointer">
//           <BsFillImageFill
//             size={22}
//             onClick={() => imageRef.current.click()}
//           ></BsFillImageFill>
//           <Input
//             type={"file"}
//             hidden
//             ref={imageRef}
//             onChange={handleImageChange}
//           ></Input>
//         </Flex>

//         <Modal
//           w="70vw"
//           h="60vh"
//           maxW="70vw" // Adjust the maximum width of the modal
//           maxH="60vh" // Adjust the maximum height of the modal
//           overflowX="auto"
//           overflowY="auto"
//           className="custom-scrollbar"
//           isOpen={imgUrl}
//           onClose={() => {
//             onClose();
//             setImgUrl("");
//           }}
//         >
//           <ModalOverlay></ModalOverlay>
//           <ModalContent
//             display="flex"
//             flexDirection="column"
//             alignItems="center"
//             justifyContent="center"
//             p={2}
//             border="1px solid pink"
//           >
//             <ModalHeader></ModalHeader>
//             <ModalCloseButton></ModalCloseButton>
//             <ModalBody
//               display="flex"
//               flexDirection="column"
//               alignItems="center"
//               justifyContent="center"
//               w="full"
//               h="full"
//             >
//               <Flex
//                 direction="column"
//                 alignItems="center"
//                 justifyContent="center"
//                 w="full"
//                 h="full"
//                 gap={4}
//               >
//                 <Flex
//                   justifyContent="center"
//                   alignItems="center"
//                   w="full"
//                   maxH="70vh"
//                   overflowY="auto"
//                   overflowX="auto"
//                   className="custom-scrollbar"
//                 >
//                   <Image
//                     src={imgUrl}
//                     maxW="100%"
//                     maxH="100%"
//                     objectFit="contain"
//                   ></Image>
//                 </Flex>
//                 <Flex flex={20} justifyContent={"center"} w="full">
//                   {!isSending ? (
//                     <Button
//                       w="full"
//                       bg="blue.600"
//                       color="white"
//                       cursor="pointer"
//                       onClick={handleSendMessage}
//                     >
//                       Send
//                     </Button>
//                   ) : (
//                     <Flex
//                       justifyContent="center"
//                       alignItems="center"
//                       w="full"
//                       borderRadius={10}
//                       bgColor={"gray.600"}
//                       p={2}
//                     >
//                       <Spinner size="lg" />
//                     </Flex>
//                   )}
//                 </Flex>
//               </Flex>
//             </ModalBody>
//           </ModalContent>
//         </Modal>
//       </Flex>
//     </Flex>
//   );
// };

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
import { debounce } from "lodash";

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

  useEffect(() => {
    setMessageText("");
  }, [selectedConversation]);

  // Debounced Typing Indicator
  const handleTyping = useCallback(
    debounce(() => {
      socket.emit("typing", {
        conversationId: selectedConversation._id,
        userId: selectedConversation.userId,
      });

      typingTimeoutRef.current = setTimeout(() => {
        socket.emit("stopTyping", {
          conversationId: selectedConversation._id,
          userId: selectedConversation.userId,
        });
      }, 2000);
    }, 500),
    [socket, selectedConversation]
  );

  useEffect(() => {
    return () => clearTimeout(typingTimeoutRef.current);
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
      if (!messageText.trim() && !imgUrl) return;
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
            <InputRightElement onClick={handleSendMessage} cursor={"pointer"}>
              <IoSendSharp />
            </InputRightElement>
          </InputGroup>
        </form>
      </Flex>

      {/* Improve with AI Button */}
      <Flex flex={4} alignItems="center">
        <Button
          aria-label="Improve with AI"
          bgGradient="linear(to-r, pink.400, purple.500, blue.500)"
          _hover={{
            bgGradient: "linear(to-r, pink.300, purple.400, blue.400)",
            transform: "scale(1.1)",
          }}
          _active={{ transform: "scale(0.95)" }}
          boxShadow="0px 0px 10px rgba(255, 0, 255, 0.5)"
          transition="all 0.2s ease-in-out"
          size="xs"
          borderRadius={100}
          onClick={improveWithAi}
          disabled={improvingLoader}
        >
          {improvingLoader ? (
            <Spinner size="sm" color="white" />
          ) : (
            <IoSparkles color="white" />
          )}
        </Button>
      </Flex>

      {/* Image Upload Button */}
      <Flex flex={3}>
        <Flex flex={5} cursor="pointer">
          <BsFillImageFill size={22} onClick={() => imageRef.current.click()} />
          <Input
            type="file"
            hidden
            ref={imageRef}
            onChange={handleImageChange}
          />
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
              <Image
                src={imgUrl}
                maxW="100%"
                maxH="400px"
                objectFit="contain"
              />
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
    </Flex>
  );
};
