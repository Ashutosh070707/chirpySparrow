import {
  Badge,
  Box,
  Flex,
  Link,
  Text,
  useBreakpointValue,
  // useColorMode,
} from "@chakra-ui/react";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { loggedInUserAtom } from "../atoms/loggedInUserAtom";
import { Link as RouterLink, useLocation } from "react-router-dom";
import { AiFillHome } from "react-icons/ai";
import { RxAvatar } from "react-icons/rx";
import { FiLogOut } from "react-icons/fi";
import { FaSearch } from "react-icons/fa";
import { HiPlus } from "react-icons/hi";
import { useLogout } from "../../hooks/useLogout";
import { BsFillChatQuoteFill } from "react-icons/bs";
import { MdOutlineSettings } from "react-icons/md";
import { useEffect } from "react";
import { useSocket } from "../../context/SocketContext";
import { newMessagesCountAtom } from "../atoms/newMessagesCountAtom";
import { useShowToast } from "../../hooks/useShowToast";
import { selectedConversationAtom } from "../atoms/messagesAtom";
import { FaDove } from "react-icons/fa";

export const Sidebar = () => {
  const location = useLocation();
  const setSelectedConversation = useSetRecoilState(selectedConversationAtom);
  // const { colorMode, toggleColorMode } = useColorMode();
  const loggedInUser = useRecoilValue(loggedInUserAtom);
  const [newMessagesCount, setNewMessagesCount] =
    useRecoilState(newMessagesCountAtom);
  const { socket } = useSocket();
  const logout = useLogout();
  const showToast = useShowToast();
  const showText = useBreakpointValue({
    base: false,
    sm: false,
    md: false,
    lg: true,
    xl: true,
  });

  const createIcon = useBreakpointValue({ base: 20, lg: 21 });

  useEffect(() => {
    if (!socket || !loggedInUser) return;

    if (location.pathname === "/chat") {
      socket.emit("userInChatPage", loggedInUser._id); // user enters chatPage
    }
    // Reset selected conversation (sidebar UI reset)
    setSelectedConversation({
      _id: "",
      userId: "",
      username: "",
      userProfilePic: "",
      name: "",
    });

    return () => {
      if (socket) {
        socket.emit("userLeftChatPage", loggedInUser._id); // user leaves chatPage
        socket.emit("userLeftConversation", loggedInUser._id); // user leaves active conversation
      }
    };
  }, [socket, location.pathname, loggedInUser]);

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (newCount) => {
      setNewMessagesCount(newCount);
    };

    socket.on("updateNewMessagesCount", handleNewMessage); // listening updateNewMessagesCount event from backend.

    return () => {
      socket.off("updateNewMessagesCount", handleNewMessage);
    };
  }, [socket, setNewMessagesCount]);

  useEffect(() => {
    const getNewMessagesCount = async () => {
      try {
        const res = await fetch(`/api/users/getNewMessagesCount`);
        const data = await res.json();
        if (data.error) {
          showToast("Error", data.error, "error");
          return;
        }
        setNewMessagesCount(data.count);
      } catch (error) {
        showToast("Error", "Failed to fetch newMessagesCount", "error");
      }
    };

    getNewMessagesCount();
  }, []);

  const handleNewMessagesCount = async () => {
    try {
      const res = await fetch(`/api/users/setNewMessagesCount`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      if (data.error) {
        showToast("Error", data.error, "error");
        return;
      }
      setNewMessagesCount(0);
    } catch (error) {
      showToast("Error", "Failed to fetch handleNewMessagesCount", "error");
    }
  };

  const handleLogout = async () => {
    if (!window.confirm("Are you sure you want to logout?")) return;
    await logout();
    showToast("Success", "You have been logged out", "success");
  };

  return (
    <Flex
      direction={"column"}
      position="sticky"
      top="0"
      left="0"
      bgColor="black"
      w="full"
      minH="100vh"
      maxH="100vh"
      borderRight="1px"
      borderColor="gray"
      className="custom-scrollbar"
      pt={6}
      pb={20}
    >
      <Flex direction="column" alignItems={"center"} justifyContent="center">
        <Box alignItems="center" pb={12}>
          <Link
            as={RouterLink}
            to="/"
            textDecoration="none"
            _hover={{ textDecoration: "none" }}
          >
            {!showText && <FaDove size={25} color="orange" />}
            {showText && (
              <Flex gap={1.5}>
                <FaDove size={24} color="orange" />
                <Text
                  fontSize={{ base: "md", md: "md", lg: "md", xl: "lg" }}
                  fontWeight={"bold"}
                  fontFamily={"Comic Sans MS, Comic Sans, cursive"}
                >
                  ChirpySparrow
                </Text>
                <FaDove
                  size={24}
                  color="orange"
                  style={{ transform: "scaleX(-1)" }}
                />
              </Flex>
            )}
          </Link>
        </Box>
        <Flex
          direction={"column"}
          alignItems={"center"}
          gap={10}
          w="90%"
          p={"3%"}
        >
          <Link
            as={RouterLink}
            to="/"
            textDecoration="none"
            _hover={{ textDecoration: "none" }}
            w="full"
            alignItems="center"
            pl="20%"
            display="flex"
          >
            <Flex gap={4}>
              <AiFillHome size={25}></AiFillHome>
              {showText && (
                <Text fontSize={{ base: "lg", md: "lg", lg: "lg", xl: "lg" }}>
                  Home
                </Text>
              )}
            </Flex>
          </Link>
          <Link
            as={RouterLink}
            to={"/search"}
            textDecoration="none"
            _hover={{ textDecoration: "none" }}
            alignItems="center"
            display="flex"
            pl="20%"
            w="full"
          >
            <Flex gap={4}>
              <FaSearch size={25} />
              {showText && (
                <Text fontSize={{ base: "lg", md: "lg", lg: "lg", xl: "lg" }}>
                  Search
                </Text>
              )}
            </Flex>
          </Link>
          <Link
            as={RouterLink}
            to={"/create"}
            textDecoration="none"
            _hover={{ textDecoration: "none" }}
            alignItems="center"
            display="flex"
            pl="20%"
            w="full"
          >
            <Flex gap={4}>
              <Flex
                border="3px solid white"
                borderRadius={10}
                justifyContent="center"
                alignItems="center"
              >
                <HiPlus size={createIcon} />
              </Flex>
              {showText && (
                <Text fontSize={{ base: "lg", md: "lg", lg: "lg", xl: "lg" }}>
                  Create
                </Text>
              )}
            </Flex>
          </Link>

          <Link
            as={RouterLink}
            to={"/chat"}
            textDecoration="none"
            _hover={{ textDecoration: "none" }}
            onClick={handleNewMessagesCount}
            alignItems="center"
            display="flex"
            pl="20%"
            w="full"
          >
            <Flex gap={4} alignItems="center">
              <Flex position="relative">
                <BsFillChatQuoteFill size={25} />
                {newMessagesCount > 0 && (
                  <Badge
                    color="white"
                    bgColor="red"
                    borderRadius="full"
                    position="absolute"
                    top="-4px"
                    right="-4px"
                    minW="20px"
                    h="18px"
                    maxW="25px"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    fontSize="10px"
                    fontWeight="bold"
                    p="2px"
                  >
                    {newMessagesCount > 50 ? "50+" : newMessagesCount}
                  </Badge>
                )}
              </Flex>

              {showText && (
                <Text fontSize={{ base: "lg", md: "lg", lg: "lg", xl: "lg" }}>
                  Message
                </Text>
              )}
            </Flex>
          </Link>
          <Link
            as={RouterLink}
            to={`/${loggedInUser.username}`}
            textDecoration="none"
            _hover={{ textDecoration: "none" }}
            alignItems="center"
            display="flex"
            pl="20%"
            w="full"
          >
            <Flex gap={4}>
              <RxAvatar size={25}></RxAvatar>
              {showText && (
                <Text fontSize={{ base: "lg", md: "lg", lg: "lg", xl: "lg" }}>
                  Profile
                </Text>
              )}
            </Flex>
          </Link>

          <Link
            as={RouterLink}
            to={"/settings"}
            textDecoration="none"
            _hover={{ textDecoration: "none" }}
            alignItems="center"
            display="flex"
            pl="20%"
            w="full"
          >
            <Flex gap={4}>
              <MdOutlineSettings size={25} />
              {showText && (
                <Text fontSize={{ base: "lg", md: "lg", lg: "lg", xl: "lg" }}>
                  Settings
                </Text>
              )}
            </Flex>
          </Link>

          <Link
            as={RouterLink}
            to={"/auth"}
            onClick={handleLogout}
            textDecoration="none"
            _hover={{ textDecoration: "none" }}
            alignItems="center"
            display="flex"
            pl="20%"
            w="full"
          >
            <Flex gap={4}>
              <FiLogOut color="red" size={25} />
              {showText && (
                <Text
                  color="red"
                  fontSize={{ base: "lg", md: "lg", lg: "lg", xl: "lg" }}
                >
                  Logout
                </Text>
              )}
            </Flex>
          </Link>
        </Flex>
      </Flex>
    </Flex>
  );
};
