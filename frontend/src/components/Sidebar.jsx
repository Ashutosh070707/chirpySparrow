import {
  Badge,
  Box,
  Flex,
  Link,
  Text,
  useBreakpointValue,
  useColorMode,
} from "@chakra-ui/react";
import { useRecoilState, useRecoilValue } from "recoil";
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
import { FaInstagram } from "react-icons/fa";
import { useEffect } from "react";
import { useSocket } from "../../context/SocketContext";
import { newMessagesCountAtom } from "../atoms/newMessagesCountAtom";
import { useShowToast } from "../../hooks/useShowToast";

export const Sidebar = () => {
  const location = useLocation(); // ✅ Get current route
  const { colorMode, toggleColorMode } = useColorMode();
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

  const iconSize = useBreakpointValue({ base: 25, md: 30 });
  const createIcon = useBreakpointValue({ base: 20, sm: 23 });

  useEffect(() => {
    if (!socket || !loggedInUser) return;

    if (location.pathname === "/chat") {
      // ✅ User is on the chat page, inform the backend
      socket.emit("userInChatPage", loggedInUser._id);
    }

    return () => {
      if (socket) {
        socket.emit("userLeftChatPage", loggedInUser._id);
      }
    };
  }, [socket, location.pathname, loggedInUser]);

  useEffect(() => {
    const getNewMessageCount = async () => {
      try {
        const res = await fetch(`/api/users/getNewMessageCount`);
        const data = await res.json();
        if (data.error) {
          showToast("Error", data.error, "error");
          return;
        }
        setNewMessagesCount(data.count);
      } catch (error) {
        showToast("Error", "Failed to fetch newMessageCount", "error");
      }
    };

    getNewMessageCount();
  }, []);

  const handleNewMessageCount = async () => {
    try {
      const res = await fetch(`/api/users/updateMessageCount`, {
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
      showToast("Error", "Failed to fetch handleNewMessageCount", "error");
    }
  };

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (newCount) => {
      setNewMessagesCount(newCount);
    };

    socket.on("updateMessageCount", handleNewMessage);

    return () => {
      socket.off("updateMessageCount", handleNewMessage);
    };
  }, [socket, setNewMessagesCount]);

  return (
    <Flex
      direction={"column"}
      position="sticky"
      top="0"
      left="0"
      bg={colorMode === "dark" ? "gray.800" : "white"}
      w="full"
      minH="100vh"
      maxH="100vh"
      borderRight="1px"
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
            {!showText && <FaInstagram size={iconSize} />}
            {showText && (
              <Text fontSize="xl" fontWeight="bold">
                ChirpySparrow
              </Text>
            )}
          </Link>
        </Box>
        <Flex direction={"column"} alignItems={"flex-start"} gap={10}>
          <Link
            as={RouterLink}
            to="/"
            textDecoration="none"
            _hover={{ textDecoration: "none" }}
          >
            <Flex gap={4}>
              <AiFillHome size={iconSize}></AiFillHome>
              {showText && (
                <Text fontSize={{ base: "lg", md: "lg", lg: "lg", xl: "xl" }}>
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
          >
            <Flex gap={4}>
              <FaSearch size={iconSize} />
              {showText && (
                <Text fontSize={{ base: "lg", md: "lg", lg: "lg", xl: "xl" }}>
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
                <Text fontSize={{ base: "lg", md: "lg", lg: "lg", xl: "xl" }}>
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
            onClick={handleNewMessageCount}
          >
            <Flex gap={4} alignItems="center">
              <Flex position="relative">
                <BsFillChatQuoteFill size={iconSize} />
                {newMessagesCount > 0 && (
                  <Badge
                    color="white"
                    bgColor="red.500"
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
                <Text fontSize={{ base: "lg", md: "lg", lg: "lg", xl: "xl" }}>
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
          >
            <Flex gap={4}>
              <RxAvatar size={iconSize}></RxAvatar>
              {showText && (
                <Text fontSize={{ base: "lg", md: "lg", lg: "lg", xl: "xl" }}>
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
          >
            <Flex gap={4}>
              <MdOutlineSettings size={iconSize} />
              {showText && (
                <Text fontSize={{ base: "lg", md: "lg", lg: "lg", xl: "xl" }}>
                  Settings
                </Text>
              )}
            </Flex>
          </Link>

          <Link
            as={RouterLink}
            to={"/auth"}
            onClick={() => logout()}
            textDecoration="none"
            _hover={{ textDecoration: "none" }}
          >
            <Flex gap={4}>
              <FiLogOut size={iconSize} />
              {showText && (
                <Text fontSize={{ base: "lg", md: "lg", lg: "lg", xl: "xl" }}>
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
