import { SearchIcon } from "@chakra-ui/icons";
import {
  Avatar,
  Box,
  Button,
  Flex,
  Input,
  InputGroup,
  InputRightElement,
  Skeleton,
  Text,
  useBreakpointValue,
} from "@chakra-ui/react";
import React, { useEffect, useRef, useState } from "react";
import { SkeletonCircle } from "@chakra-ui/react";
import { Conversation } from "../components/Conversation.jsx";
import { GiConversation } from "react-icons/gi";
import { MessageContainer } from "../components/MessageContainer.jsx";
import { useRecoilState, useRecoilValue } from "recoil";

import {
  conversationsAtom,
  selectedConversationAtom,
} from "../atoms/messagesAtom.js";
import { useSocket } from "../../context/SocketContext.jsx";
import { useShowToast } from "../../hooks/useShowToast";
import { loggedInUserAtom } from "../atoms/loggedInUserAtom.js";
import { debounce } from "lodash";
import { DeleteConversation } from "../components/DeleteButton.jsx";

export const ChatPage = () => {
  const showToast = useShowToast();
  const [conversations, setConversations] = useRecoilState(conversationsAtom);
  const [selectedConversation, setSelectedConversation] = useRecoilState(
    selectedConversationAtom
  );
  const [searchText, setSearchText] = useState("");
  const [searchingUser, setSearchingUser] = useState(false);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const { socket, onlineUsers } = useSocket();

  const loggedInUser = useRecoilValue(loggedInUserAtom);
  const [searchedUsers, setSearchedUsers] = useState([]);
  const prevSearchText = useRef("");
  const [backButton, setBackButton] = useState(false);

  const screenSize = useBreakpointValue({
    base: "sm",
    sm: "sm",
    md: "md",
    lg: "lg",
    xl: "xl",
  });

  /////////////////////////////////////////////////////////////////////////////  searchuser - functionality
  const handleSearchUser = async () => {
    if (!searchText.trim()) return;
    setSearchingUser(true);
    try {
      const res = await fetch(`/api/users/searching/${searchText.trim()}`, {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({ username: searchText }),
      });
      const data = await res.json();
      if (data.error) {
        showToast("Error", data.error, "error");
        return;
      }
      setSearchedUsers(data);
    } catch (error) {
      showToast("Error", error.message, "error");
    } finally {
      setSearchingUser(false);
    }
  };
  // Debounce the search function
  const debouncedSearch = debounce(handleSearchUser, 400);

  useEffect(() => {
    if (!searchText.trim()) {
      prevSearchText.current = ""; // Clear previous search text when input is empty
      return;
    }

    // Only trigger the search if the search text has changed
    if (searchText !== prevSearchText.current) {
      debouncedSearch();
      prevSearchText.current = searchText; // Update prevSearchText
    }

    // Cleanup to cancel pending debounced calls on unmount or searchText change
    return () => debouncedSearch.cancel();
  }, [searchText, debouncedSearch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchText.length > 0) {
      handleSearchUser();
    }
    setSearchText("");
    prevSearchText.current = ""; // Reset after search submission
  };

  ////////////////////////////////////////////////////////////////  fetchingConversations and adding conversations array functionality
  useEffect(() => {
    const getConversations = async () => {
      setSelectedConversation({
        _id: "",
        userId: "",
        username: "",
        userProfilePic: "",
        name: "",
      });
      try {
        const res = await fetch("/api/messages/conversations");
        const data = await res.json();
        if (data.error) {
          showToast("Error", data.error, "error");
          return;
        }
        setConversations(data);
      } catch (error) {
        showToast("Error", error.message, "error");
      } finally {
        setLoadingConversations(false);
      }
    };
    getConversations();
  }, [showToast, setConversations]);

  const handleConversationSearch = async (user) => {
    try {
      const messagingYourself = user._id === loggedInUser._id;
      if (messagingYourself) {
        showToast("Error", "You cannot message yourself", "error");
        return;
      }
      // if loggedInUser is already in a conversation with the searched user
      const consersationAlreadyExists = conversations.find(
        (conversation) => conversation.participants[0]._id === user._id
      );
      if (consersationAlreadyExists) {
        setSelectedConversation({
          _id: consersationAlreadyExists._id,
          name: user.name,
          userId: user._id,
          username: user.username,
          userProfilePic: user.profilePic,
        });
        return;
      }

      const mockConversation = {
        mock: true,
        lastMessage: {
          text: "",
          sender: "",
          img: "",
          seen: false,
        },
        _id: Date.now(),
        participants: [
          {
            _id: user._id,
            username: user.username,
            name: user.name,
            profilePic: user.profilePic,
          },
        ],
      };
      setConversations((prevConvs) => [...prevConvs, mockConversation]);
    } catch (error) {
      showToast("Error", error.message, "error");
    }
  };

  ///////////////////////////////////////////////////////////////////////   socket.io functionality
  useEffect(() => {
    const handleMessagesSeen = ({ conversationId }) => {
      setConversations((prev) => {
        return prev.map((conversation) =>
          conversation._id === conversationId
            ? {
                ...conversation,
                lastMessage: { ...conversation.lastMessage, seen: true },
              }
            : conversation
        );
      });
    };

    socket?.on("messagesSeen", handleMessagesSeen);

    return () => {
      socket?.off("messagesSeen", handleMessagesSeen); // Cleanup listener on unmount
    };
  }, [socket, setConversations]);

  useEffect(() => {
    socket?.on("conversationUpdated", ({ conversationId, lastMessage }) => {
      setConversations((prev) => {
        const updatedConversations = prev.map((conversation) => {
          if (conversation._id === conversationId) {
            return {
              ...conversation,
              lastMessage: lastMessage,
            };
          }
          return conversation;
        });
        return updatedConversations;
      });
    });

    return () => {
      socket?.off("conversationUpdated");
    };
  }, [socket, setConversations]);

  useEffect(() => {
    socket?.on(
      "messageDeleted",
      ({ messageId, selectedConversationId, updatedLastMessage }) => {
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
    );

    return () => socket?.off("messageDeleted");
  }, [socket, selectedConversation]);

  return (
    <Flex
      w="full"
      h="100vh"
      maxH="100vh"
      overflow="hidden"
      justifyContent={"center"}
      alignItems="center"
    >
      <Flex
        w={{ base: "100%", sm: "100%", md: "100%", lg: "90%", xl: "90%" }}
        h={{ base: "100%", sm: "100%", md: "100%", lg: "90%", xl: "90%" }}
        gap={2}
        borderRadius={{ base: 0, sm: 0, md: 0, lg: 10, xl: 10 }}
        border={
          screenSize == "lg" || screenSize == "xl" ? "1px solid white" : "none"
        }
        p={2}
      >
        {(screenSize == "xs" || screenSize == "sm" || screenSize == "md") && (
          <Flex w="full" h="full">
            {!backButton && (
              <Flex w="full" gap={3} p={3} flexDirection={"column"} h="full">
                <Text
                  fontWeight="bold"
                  w="full"
                  fontSize={{ base: "md", sm: "lg" }}
                >
                  Your Conversations
                </Text>

                <Flex w="full">
                  <form
                    style={{ width: "100%" }}
                    onSubmit={
                      searchText.length > 0
                        ? handleSubmit
                        : (e) => e.preventDefault()
                    }
                  >
                    <Flex alignItems="center" gap={2} w="full">
                      <InputGroup>
                        <Input
                          placeholder="Search here"
                          value={searchText}
                          onChange={(e) => {
                            setSearchText(e.target.value);
                            setSearchedUsers([]);
                          }}
                          spellCheck={false}
                          w="full"
                        ></Input>
                        <InputRightElement h="full">
                          <Button
                            size={{ base: "sm", sm: "md" }}
                            borderLeftRadius={0}
                            h="full"
                            type="submit"
                            isLoading={searchingUser}
                          >
                            <SearchIcon></SearchIcon>
                          </Button>
                        </InputRightElement>
                      </InputGroup>
                    </Flex>
                  </form>
                </Flex>

                {searchedUsers.length > 0 && (
                  <Flex
                    w="full"
                    direction="column"
                    h="25%"
                    overflowY="auto"
                    gap={1}
                    borderRadius={10}
                    className="custom-scrollbar"
                  >
                    {searchedUsers.map((user) => (
                      <Flex
                        justifyContent="flex-start"
                        key={user._id}
                        alignItems="center"
                        cursor="pointer"
                        onClick={() => {
                          handleConversationSearch(user);
                          setSearchedUsers([]);
                          setSearchText("");
                        }}
                        _hover={{
                          cursor: "pointer",
                          bg: "gray.900",
                          color: "white",
                        }}
                        borderRadius={10}
                        p={2}
                      >
                        <Avatar
                          name={user.name}
                          src={
                            user.profilePic ||
                            "https://example.com/default-avatar.png"
                          }
                          boxSize={{
                            base: "40px",
                            sm: "50px",
                          }}
                        />

                        <Flex
                          ml={2}
                          alignItems={"center"}
                          overflow="hidden"
                          w="full"
                        >
                          <Text fontSize="sm" fontWeight="bold" isTruncated>
                            {user.name}
                          </Text>
                        </Flex>
                      </Flex>
                    ))}
                  </Flex>
                )}

                <Flex
                  w="full"
                  direction="column"
                  h="90%"
                  maxH={"90%"}
                  overflowY={"auto"}
                  className="custom-scrollbar"
                  overflowX="hidden"
                >
                  {loadingConversations &&
                    [0, 1, 2, 3, 4, 5, 6, 7].map((_, i) => (
                      <Flex
                        key={i}
                        gap={4}
                        alignItems={"center"}
                        p={"1"}
                        borderRadius={"md"}
                      >
                        <Box>
                          <SkeletonCircle size={"10"} />
                        </Box>
                        <Flex w={"full"} flexDirection={"column"} gap={3}>
                          <Skeleton h={"10px"} w="80px" />
                          <Skeleton h={"10px"} w="90%" />
                        </Flex>
                      </Flex>
                    ))}

                  <Flex direction="column" gap={1} w="full">
                    {!loadingConversations &&
                      conversations.map((conversation) => {
                        return (
                          <Flex
                            justifyContent={"flex-start"}
                            alignItems="center"
                            key={conversation._id}
                            gap={2}
                            w="full"
                          >
                            <Flex w="full">
                              <Flex w="90%">
                                <Conversation
                                  key={conversation._id}
                                  isOnline={onlineUsers.includes(
                                    conversation.participants[0]._id
                                  )}
                                  conversation={conversation}
                                  setBackButton={setBackButton}
                                />
                              </Flex>
                              {!conversation.mock && (
                                <Flex
                                  justifyContent="center"
                                  alignItems="center"
                                  w="10%"
                                >
                                  <DeleteConversation
                                    conversation={conversation}
                                  />
                                </Flex>
                              )}
                            </Flex>
                          </Flex>
                        );
                      })}
                  </Flex>
                </Flex>
              </Flex>
            )}

            {backButton && (
              <Flex
                w="full"
                borderRadius={10}
                direction="column"
                p={2}
                h="full"
              >
                <MessageContainer
                  setBackButton={setBackButton}
                  style={{ height: "100%" }}
                />
              </Flex>
            )}
          </Flex>
        )}

        {(screenSize == "lg" || screenSize == "xl" || screenSize == "xxl") && (
          <Flex w="full">
            <Flex
              w="33%"
              gap={3}
              p={4}
              flexDirection={"column"}
              borderRadius={10}
              h="full"
            >
              <Text fontWeight="bold" w="full" fontSize="lg">
                Your Conversations
              </Text>

              <Flex w="full">
                <form
                  style={{ width: "100%" }}
                  onSubmit={
                    searchText.length > 0
                      ? handleSubmit
                      : (e) => e.preventDefault()
                  }
                >
                  {/* <Flex alignItems="center" gap={2} w="full">
                    <Input
                      placeholder="Search here"
                      value={searchText}
                      onChange={(e) => {
                        setSearchText(e.target.value);
                        setSearchedUsers([]);
                      }}
                      spellCheck={false}
                      w="full"
                    ></Input>
                    <Button
                      size="md"
                      borderRadius={100}
                      w={10}
                      h={10}
                      type="submit"
                      isLoading={searchingUser}
                    >
                      <SearchIcon></SearchIcon>
                    </Button>
                  </Flex> */}
                  <Flex alignItems="center" gap={2} w="full">
                    <InputGroup>
                      <Input
                        placeholder="Search here"
                        value={searchText}
                        onChange={(e) => {
                          setSearchText(e.target.value);
                          setSearchedUsers([]);
                        }}
                        spellCheck={false}
                        w="full"
                      ></Input>
                      <InputRightElement h="full">
                        <Button
                          size={{ base: "sm", sm: "md" }}
                          borderLeftRadius={0}
                          h="full"
                          type="submit"
                          isLoading={searchingUser}
                        >
                          <SearchIcon></SearchIcon>
                        </Button>
                      </InputRightElement>
                    </InputGroup>
                  </Flex>
                </form>
              </Flex>

              {searchedUsers.length > 0 && (
                <Flex
                  w="full"
                  direction="column"
                  h="20%"
                  maxH="20%"
                  overflowY="auto"
                  className="custom-scrollbar"
                  gap={2}
                  borderRadius={10}
                  p={1}
                >
                  {searchedUsers.map((user) => (
                    <Flex
                      justifyContent="flex-start"
                      key={user._id}
                      alignItems="center"
                      cursor="pointer"
                      onClick={() => {
                        handleConversationSearch(user);
                        setSearchedUsers([]);
                        setSearchText("");
                      }}
                      _hover={{
                        cursor: "pointer",
                        bg: "gray.900",
                        color: "white",
                      }}
                      borderRadius={10}
                      pl={2}
                      pr={2}
                      pt={1}
                      pb={1}
                    >
                      <Avatar
                        name={user.name}
                        src={
                          user.profilePic ||
                          "https://example.com/default-avatar.png"
                        }
                        size="sm"
                      />

                      <Flex direction="column" ml={3} alignItems={"center"}>
                        <Text fontSize="sm" fontWeight="bold">
                          {user.name}
                        </Text>
                      </Flex>
                    </Flex>
                  ))}
                </Flex>
              )}

              <Flex
                w="full"
                direction="column"
                h="90%"
                maxH={"90%"}
                overflowY={"auto"}
                className="custom-scrollbar"
                overflowX="hidden"
              >
                {loadingConversations &&
                  [0, 1, 2, 3, 4, 5, 6, 7].map((_, i) => (
                    <Flex
                      key={i}
                      gap={4}
                      alignItems={"center"}
                      p={"1"}
                      borderRadius={"md"}
                    >
                      <Box>
                        <SkeletonCircle size={"10"} />
                      </Box>
                      <Flex w={"full"} flexDirection={"column"} gap={3}>
                        <Skeleton h={"10px"} w="80px" />
                        <Skeleton h={"10px"} w="90%" />
                      </Flex>
                    </Flex>
                  ))}

                <Flex direction="column" gap={1} w="full">
                  {!loadingConversations &&
                    conversations.map((conversation) => {
                      return (
                        <Flex
                          justifyContent={"flex-start"}
                          alignItems="center"
                          key={conversation._id}
                          gap={2}
                          w="full"
                        >
                          <Flex w="full">
                            <Flex w="90%">
                              <Conversation
                                key={conversation._id}
                                isOnline={onlineUsers.includes(
                                  conversation.participants[0]._id
                                )}
                                conversation={conversation}
                                setBackButton={setBackButton}
                              />
                            </Flex>
                            {!conversation.mock && (
                              <Flex
                                justifyContent="center"
                                alignItems="center"
                                w="10%"
                              >
                                <DeleteConversation
                                  conversation={conversation}
                                />
                              </Flex>
                            )}
                          </Flex>
                        </Flex>
                      );
                    })}
                </Flex>
              </Flex>
            </Flex>
            <Flex w="2%" justifyContent="center">
              <Box w="3px" h="full" bgColor={"gray"} borderRadius={10}></Box>
            </Flex>

            <Flex w="65%" borderRadius={10} direction="column" p={2} h="full">
              {!selectedConversation._id && (
                <Flex
                  borderRadius={"md"}
                  flexDirection={"column"}
                  alignItems={"center"}
                  justifyContent={"center"}
                  height="full"
                  w="full"
                >
                  <GiConversation size={80} />
                  <Text>Select a conversation to start messaging</Text>
                </Flex>
              )}

              {selectedConversation._id && (
                <MessageContainer setBackButton={setBackButton} />
              )}
            </Flex>
          </Flex>
        )}
      </Flex>
    </Flex>
  );
};
