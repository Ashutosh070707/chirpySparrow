import {
  Box,
  Button,
  Flex,
  Image,
  Link,
  Text,
  useColorMode,
} from "@chakra-ui/react";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { loggedInUserAtom } from "../atoms/loggedInUserAtom";
// Using Link with as={RouterLink} is a way to integrate the Chakra UI Link component with React Router’s Link component (RouterLink).
import { Link as RouterLink } from "react-router-dom";
import { AiFillHome } from "react-icons/ai";
import { RxAvatar } from "react-icons/rx";
import { FiLogOut } from "react-icons/fi";
import { useLogout } from "../../hooks/useLogout";
import { authScreenAtom } from "../atoms/authAtom";
import { BsFillChatQuoteFill } from "react-icons/bs";
import { MdOutlineSettings } from "react-icons/md";

export const Header = () => {
  const { colorMode, toggleColorMode } = useColorMode(); // hook - coming from chakra UI.
  const user = useRecoilValue(loggedInUserAtom);
  const logout = useLogout();
  const setAuthScreen = useSetRecoilState(authScreenAtom);
  return (
    <>
      {user ? (
        <Flex justifyContent={"space-between"} mt={8} mb={6}>
          <Link as={RouterLink} to="/">
            <AiFillHome size={24} />
          </Link>

          <Image
            cursor={"pointer"}
            alt="logo"
            w={6}
            src={colorMode === "dark" ? "/light-logo.svg" : "/dark-logo.svg"}
            onClick={toggleColorMode}
          />

          <Flex alignItems={"center"} gap={4}>
            <Link as={RouterLink} to={`/${user.username}`}>
              <RxAvatar size={24} />
            </Link>
            <Link as={RouterLink} to={"/chat"}>
              <BsFillChatQuoteFill size={20} />
            </Link>
            <Link as={RouterLink} to={"/settings"}>
              <MdOutlineSettings size={20} />
            </Link>
            <Button size={"xs"} onClick={logout}>
              <FiLogOut size={20} />
            </Button>
          </Flex>
        </Flex>
      ) : (
        <Flex justifyContent={"center"} alignItems={"center"} mt={8} mb={6}>
          <Flex alignItems="center" gap={15}>
            <Image
              src="/chirpySparrow.png"
              w="60px"
              h="60px"
              borderRadius={10}
            ></Image>
            <Text
              fontSize="4xl"
              fontWeight="bold"
              fontFamily={"Comic Sans MS, Comic Sans, cursive"}
            >
              ChirpySparrow
            </Text>
          </Flex>
        </Flex>
      )}
    </>
  );
};

// Previous code:

// <Flex justifyContent={"space-between"} mt={8} mb={12}>
//   {user && (
//     <Link as={RouterLink} to="/">
//       <AiFillHome size={24}></AiFillHome>
//     </Link>
//   )}
//   {!user && (
//     <Link
//       as={RouterLink}
//       to={"/auth"}
//       onClick={() => setAuthScreen("login")}
//     >
//       Login
//     </Link>
//   )}

//   <Image
//     cursor={"pointer"}
//     alt="logo"
//     w={6}
//     src={colorMode == "dark" ? "/light-logo.svg" : "/dark-logo.svg"}
//     onClick={toggleColorMode}
//   ></Image>

//   {user && (
//     <Flex alignItems={"center"} gap={4}>
//       <Link as={RouterLink} to={`/${user.username}`}>
//         <RxAvatar size={24}></RxAvatar>
//       </Link>
//       <Link as={RouterLink} to={"/chat"}>
//         <BsFillChatQuoteFill size={20} />
//       </Link>
//       <Link as={RouterLink} to={"/settings"}>
//         <MdOutlineSettings size={20} />
//       </Link>
//       <Button size={"xs"} onClick={() => logout()}>
//         {" "}
//         <FiLogOut size={20} />{" "}
//       </Button>
//     </Flex>
//   )}
//   {!user && (
//     <Link
//       as={RouterLink}
//       to={"/auth"}
//       onClick={() => setAuthScreen("signup")}
//     >
//       Sign up
//     </Link>
//   )}
// </Flex>
