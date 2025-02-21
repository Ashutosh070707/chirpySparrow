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
import { Link as RouterLink } from "react-router-dom";
import { AiFillHome } from "react-icons/ai";
import { RxAvatar } from "react-icons/rx";
import { FiLogOut } from "react-icons/fi";
import { FaSearch } from "react-icons/fa";
import { HiPlus } from "react-icons/hi";
import { useLogout } from "../../hooks/useLogout";
import { BsFillChatQuoteFill } from "react-icons/bs";
import { MdOutlineSettings } from "react-icons/md";
import { FaInstagram } from "react-icons/fa";
import { unreadMessageCountAtom } from "../atoms/unreadMessageCountAtom";
import { conversationsAtom } from "../atoms/messagesAtom";
import { useEffect } from "react";
import { useSocket } from "../../context/SocketContext";

export const Sidebar = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const loggedInUser = useRecoilValue(loggedInUserAtom);
  // const [unreadMessageCount, setUnreadMessageCountAtom] = useRecoilState(
  //   unreadMessageCountAtom
  // );
  // const [conversations, setConversations] = useRecoilState(conversationsAtom);
  const { socket } = useSocket();
  const logout = useLogout();
  const showText = useBreakpointValue({
    base: false,
    sm: false,
    md: false,
    lg: true,
    xl: true,
  });

  // useEffect(() => {
  //   if (!conversations.length) return;

  //   socket.on("newMessage", (message) => {
  //     setUnreadMessageCountAtom((prev) => prev + 1);
  //   });

  //   return () => socket.off("newMessage");
  // }, [socket, conversations, setUnreadMessageCountAtom]);

  return (
    <Flex
      direction={"column"}
      position="sticky"
      top="0"
      left="0"
      bg={colorMode === "dark" ? "gray.800" : "white"}
      w="full"
      h="100vh"
    >
      <Flex direction="column" alignItems={"center"} justifyContent="center">
        <Box alignItems="center" mt={"40px"} mb={"50px"}>
          <Link
            as={RouterLink}
            to="/"
            textDecoration="none"
            _hover={{ textDecoration: "none" }}
          >
            {!showText && <FaInstagram size={30} />}
            {showText && (
              <Text
                fontSize={{
                  base: "2xl",
                  sm: "md",
                  md: "lg",
                  lg: "xl",
                  xl: "2xl",
                }}
                fontWeight="bold"
              >
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
              <AiFillHome size={26}></AiFillHome>
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
              <FaSearch size={26} />
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
              <Box border="3px solid white" borderRadius={10}>
                <HiPlus size={23} />
              </Box>
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
            // onClick={() => setUnreadMessageCountAtom(0)}
          >
            <Flex gap={4}>
              <Flex position="relative">
                <BsFillChatQuoteFill size={26} />
                {/* {unreadMessageCount > 0 && (
                  <Badge
                    color="white"
                    bgColor="red.500"
                    borderRadius="full"
                    position="absolute"
                    bottom="60%"
                    left="65%"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    fontSize="xs"
                  >
                    {unreadMessageCount > 0 && (
                      <Text m={"1px"}>
                        {unreadMessageCount > 50 ? "50+" : unreadMessageCount}
                      </Text>
                    )}
                  </Badge>
                )} */}
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
              <RxAvatar size={26}></RxAvatar>
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
              <MdOutlineSettings size={26} />
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
              <FiLogOut size={26} />
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
