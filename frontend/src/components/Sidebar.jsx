import {
  Box,
  Container,
  Flex,
  Image,
  Link,
  Text,
  useColorMode,
} from "@chakra-ui/react";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { loggedInUserAtom } from "../atoms/loggedInUserAtom";
import { Navigate, Link as RouterLink } from "react-router-dom";
import { AiFillHome } from "react-icons/ai";
import { RxAvatar } from "react-icons/rx";
import { FiLogOut } from "react-icons/fi";
import { FaSearch } from "react-icons/fa";
import { HiPlus } from "react-icons/hi";
import { useLogout } from "../../hooks/useLogout";
import { authScreenAtom } from "../atoms/authAtom";
import { BsFillChatQuoteFill, BsPlus } from "react-icons/bs";
import { MdOutlineSettings } from "react-icons/md";
import { useNavigate } from "react-router-dom";

export const Sidebar = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const loggedInUser = useRecoilValue(loggedInUserAtom);
  const logout = useLogout();

  return (
    <Flex
      direction={"column"}
      position="fixed"
      left="0"
      height={{ base: "auto", md: "100vh" }} // Adjust height for different screen sizes
      maxH="100vh" // Prevent sidebar from growing beyond viewport height
      overflowY="auto" // Add vertical scrollbar if content overflows
      bg={colorMode === "dark" ? "gray.800" : "white"}
      width="16%"
      pb="5%"
    >
      <Flex direction="column" alignItems={"center"} justifyContent="center">
        <Box alignItems="center" mt={"40px"} mb={"50px"}>
          <Link
            as={RouterLink}
            to="/"
            textDecoration="none"
            _hover={{ textDecoration: "none" }}
          >
            <Text
              fontSize={{ base: "2xl", sm: "md", md: "xl" }}
              fontWeight="bold"
              fontFamily={"Comic Sans MS, Comic Sans, cursive"}
            >
              ChirpySparrow
            </Text>
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
              <Text fontSize={{ base: "lg", sm: "sm", md: "xl" }}>Home</Text>
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
              <Text fontSize={{ base: "lg", sm: "sm", md: "xl" }}>Search</Text>
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
              <Text fontSize={{ base: "lg", sm: "sm", md: "xl" }}>Create</Text>
            </Flex>
          </Link>

          <Link
            as={RouterLink}
            to={"/chat"}
            textDecoration="none"
            _hover={{ textDecoration: "none" }}
          >
            <Flex gap={4}>
              <BsFillChatQuoteFill size={26} />
              <Text fontSize={{ base: "lg", sm: "sm", md: "xl" }}>Message</Text>
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
              <Text fontSize={{ base: "lg", sm: "sm", md: "xl" }}>Profile</Text>
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
              <Text fontSize={{ base: "lg", sm: "sm", md: "xl" }}>
                Settings
              </Text>
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
              <Text fontSize={{ base: "lg", sm: "sm", md: "xl" }}>Logout</Text>
            </Flex>
          </Link>
        </Flex>
      </Flex>
    </Flex>
  );
};
