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
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  Spinner,
  useDisclosure,
  Text,
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
import { useSocket } from "../../context/SocketContext.jsx";
import { MdGif } from "react-icons/md";
import { SearchIcon } from "@chakra-ui/icons";
import { CloseButton } from "@chakra-ui/react";
import { replyingToMessageAtom } from "../atoms/replyingToMessageAtom.js";
import { loggedInUserAtom } from "../atoms/loggedInUserAtom.js";

export const MessageInput = ({ setMessages }) => {
  const [messageText, setMessageText] = useState("");
  const loggedInUser = useRecoilValue(loggedInUserAtom);
  const selectedConversation = useRecoilValue(selectedConversationAtom);
  const [conversations, setConversations] = useRecoilState(conversationsAtom);
  const [replyingToMessage, setReplyingToMessage] = useRecoilState(
    replyingToMessageAtom
  );
  const showToast = useShowToast();
  const imageRef = useRef(null);
  const [imgUrl, setImgUrl] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const { socket } = useSocket();
  const [improvingLoader, setImprovingLoader] = useState(false);
  const typingTimeoutRef = useRef(null);
  const [fetchingGif, setFetchingGif] = useState(false);
  const [gifs, setGifs] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [selectedGif, setSelectedGif] = useState(null);

  const { isOpen, onOpen, onClose, onToggle } = useDisclosure();
  const triggerRef = useRef(null);
  const popoverRef = useRef(null);
  const inputRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImgUrl(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      showToast("Invalid file type", "Please select an image file.", "error");
      setImgUrl(null);
    }
  };

  useEffect(() => {
    setMessageText("");
    setImgUrl("");
    setSelectedGif(null);
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
  }, [messageText, improvingLoader, isSending, showToast]);

  const handleSendMessage = useCallback(
    async (e) => {
      e.preventDefault();
      if (isSending || improvingLoader) return;

      const gifUrl = selectedGif
        ? selectedGif.media_formats?.gif?.url ||
          selectedGif.media_formats?.mp4?.url ||
          selectedGif.media_formats?.webp?.url ||
          ""
        : "";

      const trimmedText = messageText.trim();
      let isLinkMessage = false;
      let finalMessage = trimmedText;

      // Detect if user is sending a link using the custom rule
      if (trimmedText.startsWith("@@@")) {
        const possibleLink = trimmedText.slice(3).trim();
        if (possibleLink.length === 0) {
          showToast("Error", "Link cannot be empty after 3@", "error");
          return;
        }
        const hasProtocol = /^(https?:\/\/)/i.test(possibleLink);
        finalMessage = hasProtocol ? possibleLink : `https://${possibleLink}`;
        isLinkMessage = true;
      }

      const selectedCount = [!!messageText.trim(), !!imgUrl, !!gifUrl].filter(
        Boolean
      ).length;

      if (selectedCount === 0) {
        showToast("Error", "Please add some content to send", "error");
        return;
      }

      if (selectedCount > 1) {
        showToast("Error", "Only one input is allowed at a time", "error");
        setImgUrl("");
        setMessageText("");
        setSelectedGif(null);
        return;
      }

      setIsSending(true);

      try {
        const res = await fetch("/api/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            recipientId: selectedConversation.userId,
            message: finalMessage,
            // message: messageText,
            img: imgUrl,
            gif: gifUrl,
            replySnapshot: replyingToMessage,
            isLink: isLinkMessage,
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
                    gif: data.gif,
                    seen: false,
                  },
                }
              : conversation
          )
        );

        setMessageText("");
        setImgUrl("");
        setSelectedGif(null);
        onClose();

        // Delay focus to ensure state updates first
        setTimeout(() => {
          if (inputRef.current) {
            inputRef.current.focus();
          }
        }, 100);
      } catch (error) {
        showToast("Error", error.message, "error");
      } finally {
        setIsSending(false);
        if (replyingToMessage.sender) {
          setReplyingToMessage({
            sender_id: "",
            text: "",
            img: "",
            gif: "",
            isLink: false,
          });
        }
      }
    },
    [
      messageText,
      imgUrl,
      isSending,
      improvingLoader,
      selectedConversation,
      showToast,
      setMessages,
      setConversations,
      onClose,
      selectedGif,
    ]
  );

  const handleSearchGIF = async (e) => {
    if (e) e.preventDefault();
    if (fetchingGif) return;
    if (!searchText.trim()) {
      showToast("Error", "Please enter a search term", "error");
      return;
    }
    setFetchingGif(true);
    try {
      const encodedQuery = encodeURIComponent(searchText.trim());
      const res = await fetch(`/api/messages/gifs/${encodedQuery}`);
      const data = await res.json();
      if (data.error) {
        showToast("Error", data.error, "error");
        return;
      }
      if (!data.results?.length) {
        showToast("Info", "No GIFs found for your search", "info");
      }
      setGifs(data.results || []);
      setSearchText("");
      setSelectedGif(null);
    } catch (error) {
      showToast("Error", error, "error");
    } finally {
      setFetchingGif(false);
    }
  };

  const handleGifPicker = (e) => {
    e.stopPropagation(); // Prevent event bubbling
    e.preventDefault();
    if (isOpen) {
      onClose();
    } else {
      onOpen();
    }
    setGifs([]);
    setSearchText("");
    setSelectedGif(null);
  };

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        isOpen &&
        popoverRef.current &&
        !popoverRef.current.contains(event.target) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target)
      ) {
        onClose();
        setGifs([]);
        setSearchText("");
        setSelectedGif(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  return (
    <Flex gap={3} alignItems={"flex-end"} w="full">
      <Flex flex={90} direction="column">
        {replyingToMessage.sender && (
          <Box position="relative" w="full">
            <CloseButton
              size="sm"
              position="absolute"
              top={1}
              right={1}
              zIndex={1}
              onClick={() =>
                setReplyingToMessage({
                  sender_id: "",
                  text: "",
                  img: "",
                  gif: "",
                  isLink: false,
                })
              }
            />
            <Flex
              bgColor={"gray.900"}
              w="full"
              borderRadius={5}
              minH={"45px"}
              maxH="100px"
              mb={1}
              overflow="hidden"
            >
              <Flex flex={1} bgColor="green.500" borderLeftRadius={20} />
              <Flex flex={99} w="full" borderRadius={5}>
                {replyingToMessage.text && (
                  <Flex w="full" direction="column">
                    <Text
                      fontSize="sm"
                      color="orange.200"
                      p={2}
                      pl={3}
                      pb={0}
                      m={0}
                    >
                      {replyingToMessage.sender === loggedInUser._id
                        ? "You"
                        : "Other"}
                    </Text>
                    <Text
                      m={0}
                      pl={3}
                      pt={1}
                      pb={2}
                      fontSize={"xs"}
                      wordBreak="break-word"
                      overflowWrap="break-word"
                      color="gray.400"
                      w="90%"
                    >
                      {replyingToMessage.isLink ? (
                        <a
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            color: "#63b3ed",
                            textDecoration: "underline",
                          }}
                        >
                          {replyingToMessage.text}
                        </a>
                      ) : replyingToMessage.text.length > 250 ? (
                        replyingToMessage.text.slice(0, 250) + "..."
                      ) : (
                        replyingToMessage.text
                      )}
                    </Text>
                  </Flex>
                )}
                {replyingToMessage.img && (
                  <Flex justifyContent="space-between" w="full">
                    <Flex alignItems="center" direction="column" h="full">
                      <Flex p={2}>
                        <Text fontSize="sm" color="orange.200" p={0} m={0}>
                          {replyingToMessage.sender === loggedInUser._id
                            ? "You"
                            : "Other"}
                        </Text>
                      </Flex>
                      <Flex p={2}>
                        <BsFillImageFill size={16} />
                      </Flex>
                    </Flex>
                    <Image
                      src={replyingToMessage.img}
                      h="full"
                      objectFit="contain"
                      borderRadius={5}
                    />
                  </Flex>
                )}
                {replyingToMessage.gif && (
                  <Flex w="full" justifyContent="space-between">
                    <Flex alignItems="center" direction="column" h="full">
                      <Flex p={2}>
                        <Text fontSize="sm" color="orange.200" p={0} m={0}>
                          {replyingToMessage.sender === loggedInUser._id
                            ? "You"
                            : "Other"}
                        </Text>
                      </Flex>
                      <Flex p={2} pt={1}>
                        <MdGif size={30} />
                      </Flex>
                    </Flex>
                    <Flex justifyContent="flex-end">
                      <Image
                        src={replyingToMessage.gif}
                        h="full"
                        objectFit="contain"
                        borderRadius={5}
                      />
                    </Flex>
                  </Flex>
                )}
              </Flex>
            </Flex>
          </Box>
        )}

        <form onSubmit={handleSendMessage} style={{ flex: 95, width: "100%" }}>
          <InputGroup>
            <Input
              ref={inputRef}
              w={"full"}
              placeholder="Type a message"
              value={messageText}
              onChange={(e) => {
                setMessageText(e.target.value);
                handleTyping();
              }}
              isDisabled={isSending}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e);
                }
              }}
            />
            <InputRightElement onClick={handleSendMessage} cursor={"pointer"}>
              <IoSendSharp />
            </InputRightElement>

            <InputLeftElement pt={1} pb={1} ref={triggerRef}>
              <Popover
                isOpen={isOpen}
                onClose={onClose}
                placement="top-start"
                closeOnBlur={true}
                initialFocusRef={triggerRef}
              >
                <PopoverTrigger>
                  <Box>
                    <Box onClick={handleGifPicker} cursor="pointer">
                      <MdGif size={30} />
                    </Box>
                  </Box>
                </PopoverTrigger>
                <PopoverContent width="380px" ref={popoverRef} bgColor="black">
                  <PopoverBody>
                    <Flex
                      direction="column"
                      borderRadius={10}
                      w="full"
                      gap={2}
                      mt={2}
                    >
                      <Flex
                        w="full"
                        alignItems="center"
                        justifyContent="center"
                        borderRadius={10}
                      >
                        <Flex alignItems="center" w="full">
                          <InputGroup flex={1}>
                            <Input
                              placeholder="Search GIFs"
                              value={searchText}
                              onChange={(e) => {
                                setSearchText(e.target.value);
                                setGifs([]);
                              }}
                              spellCheck={false}
                              w="full"
                              fontSize="sm"
                              borderRadius={100}
                              h={"32px"}
                              onKeyDown={(e) => {
                                if (
                                  e.key === "Enter" &&
                                  searchText.length > 0
                                ) {
                                  e.preventDefault();
                                  handleSearchGIF(e);
                                }
                              }}
                            />
                            <InputRightElement h="full">
                              <Button
                                size="md"
                                h="full"
                                isLoading={fetchingGif}
                                borderRightRadius={100}
                                onClick={(e) => {
                                  if (searchText.length > 0) {
                                    e.preventDefault();
                                    handleSearchGIF(e);
                                  }
                                }}
                              >
                                <SearchIcon />
                              </Button>
                            </InputRightElement>
                          </InputGroup>
                        </Flex>
                      </Flex>
                      <Flex w="full" h="250px" borderRadius={10}>
                        {!fetchingGif && selectedGif && (
                          <Flex
                            w="full"
                            h="full"
                            direction="column"
                            alignItems="center"
                            borderRadius={10}
                          >
                            <Box
                              w="full"
                              h="80%"
                              display="flex"
                              justifyContent="center"
                              alignItems="top"
                            >
                              <Image
                                src={
                                  selectedGif.media_formats.gif?.url ||
                                  selectedGif.media_formats.mp4?.url ||
                                  selectedGif.media_formats.webp?.url
                                }
                                alt={selectedGif.content_description || "GIF"}
                                maxW="full"
                                maxH="100%"
                                objectFit="cover"
                                borderRadius="md"
                                loading="lazy"
                              />
                            </Box>
                            <Flex
                              w="full"
                              h="20%"
                              borderRadius={10}
                              gap={1}
                              alignItems="center"
                            >
                              <Button
                                size="sm"
                                flex={1}
                                onClick={() => setSelectedGif(null)}
                              >
                                Back
                              </Button>
                              <Button
                                flex={1}
                                size="sm"
                                bgColor="green.500"
                                colorScheme="green"
                                isLoading={isSending}
                                isDisabled={isSending}
                                onClick={(e) => {
                                  handleSendMessage(e);
                                }}
                              >
                                Send
                              </Button>
                            </Flex>
                          </Flex>
                        )}
                        {!fetchingGif && !selectedGif && gifs.length > 0 && (
                          <Flex
                            flexWrap="wrap"
                            w="full"
                            h="250px"
                            justifyContent="center"
                            alignItems="center"
                            borderRadius={10}
                            p={2}
                            overflowY="auto"
                            className="custom-scrollbar"
                          >
                            {gifs.map((gif) => (
                              <Box
                                key={gif.id}
                                p={1}
                                borderRadius="md"
                                cursor="pointer"
                                w="100px"
                                h="100px"
                                overflow="hidden"
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                                onClick={() => {
                                  setSelectedGif(gif);
                                }}
                              >
                                <Image
                                  src={
                                    gif.media_formats.tinygif?.url ||
                                    gif.media_formats.nanogif?.url
                                  }
                                  alt={gif.content_description || "GIF"}
                                  w="100px"
                                  h="100px"
                                  objectFit="cover"
                                  borderRadius="md"
                                  loading="lazy"
                                />
                              </Box>
                            ))}
                          </Flex>
                        )}
                      </Flex>
                    </Flex>
                  </PopoverBody>
                </PopoverContent>
              </Popover>
              <Box w="1px" h="full" m="2px" bgColor="gray.600"></Box>
            </InputLeftElement>
          </InputGroup>
        </form>
      </Flex>

      <Flex alignItems="bottom" gap={2}>
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

        <Flex flex={3} cursor="pointer" alignItems="center">
          <BsFillImageFill size={22} onClick={() => imageRef.current.click()} />
          <Input
            type="file"
            hidden
            ref={imageRef}
            onChange={handleImageChange}
          />
        </Flex>
      </Flex>

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
