import { Flex, Image, Text, useColorMode } from "@chakra-ui/react";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { loggedInUserAtom } from "../atoms/loggedInUserAtom";
import { FaDove } from "react-icons/fa";

export const LoginSignupHeader = () => {
  const { colorMode, toggleColorMode } = useColorMode(); // hook - coming from chakra UI.
  const user = useRecoilValue(loggedInUserAtom);
  return (
    <>
      <Flex justifyContent={"center"} alignItems={"center"} mt={8} mb={6}>
        <Flex alignItems="center" gap={15}>
          {/* <Image
            src="/chirpySparrow.png"
            w="60px"
            h="60px"
            borderRadius={10}
          ></Image> */}
          <FaDove size={32} color="orange" />
          <Text
            fontSize="4xl"
            fontWeight="bold"
            fontFamily={"Comic Sans MS, Comic Sans, cursive"}
          >
            ChirpySparrow
          </Text>
          <FaDove
            size={32}
            color="orange"
            style={{ transform: "scaleX(-1)" }}
          />
        </Flex>
      </Flex>
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
