import { Avatar, Box, Flex, Image, Skeleton, Text } from "@chakra-ui/react";
import { useRecoilValue } from "recoil";
import { selectedConversationAtom } from "../atoms/messagesAtom";
import { BsCheck2All } from "react-icons/bs";
import { useState } from "react";
import { loggedInUserAtom } from "../atoms/loggedInUserAtom";
import { DeleteMessage } from "./DeleteButton";

export const Message = ({ message, ownMessage, setMessages }) => {
  const loggedInUser = useRecoilValue(loggedInUserAtom);
  const selectedConversation = useRecoilValue(selectedConversationAtom);
  const [imgLoaded, setImgLoaded] = useState(false);
  return (
    <>
      {ownMessage ? (
        <Flex alignSelf={"flex-end"}>
          {message.text && (
            <Flex bg={"green.800"} maxW={"350px"} p={1} borderRadius={"md"}>
              <Text color={"white"}>{message.text}</Text>
              <Box
                alignSelf={"flex-end"}
                ml={1}
                color={message.seen ? "blue.400" : ""}
                fontWeight={"bold"}
              >
                <BsCheck2All size={16}></BsCheck2All>
              </Box>
            </Flex>
          )}
          {message.img && !imgLoaded && (
            <Flex w={"200px"} h="200px">
              <Image
                src={message.img}
                hidden
                onLoad={() => setImgLoaded(true)}
                alt="image"
                borderRadius={4}
              ></Image>
              <Skeleton w={"200px"} h="200px" borderRadius={4}></Skeleton>
            </Flex>
          )}
          {message.img && imgLoaded && (
            <Flex
              w={"200px"}
              maxW="200px"
              borderRadius={10}
              justifyContent={"flex-end"}
            >
              <Image
                src={message.img}
                maxHeight={"200px"}
                objectFit={"contain"}
                borderRadius={10}
              ></Image>
              <Box
                alignSelf={"flex-end"}
                ml={1}
                color={message.seen ? "blue.400" : ""}
                fontWeight={"bold"}
              >
                <BsCheck2All size={16}></BsCheck2All>
              </Box>
            </Flex>
          )}
          <Flex justifyContent="center" alignItems="center">
            <DeleteMessage message={message} setMessages={setMessages} />
          </Flex>
          {/* <Avatar
            name={loggedInUser.name}
            src={
              loggedInUser.profilePic ||
              "https://example.com/default-avatar.png"
            }
            size="sm"
          ></Avatar> */}
        </Flex>
      ) : (
        <Flex gap={2}>
          {/* <Avatar
            name={selectedConversation.name}
            src={selectedConversation.userProfilePic}
            size="sm"
          ></Avatar> */}
          {message.text && (
            <Text
              maxW={"350px"}
              bg={"gray.400"}
              p={2}
              color={"black"}
              borderRadius={"md"}
            >
              {message.text}
            </Text>
          )}
          {message.img && !imgLoaded && (
            <Flex w={"200px"} h="200px">
              <Image
                src={message.img}
                hidden
                onLoad={() => setImgLoaded(true)}
                alt="image"
                borderRadius={4}
              ></Image>
              <Skeleton w={"200px"} h="200px" borderRadius={4}></Skeleton>
            </Flex>
          )}
          {message.img && imgLoaded && (
            <Flex
              w={"200px"}
              maxW="200px"
              borderRadius={10}
              justifyContent={"flex-end"}
            >
              <Image
                src={message.img}
                maxHeight={"200px"}
                objectFit={"contain"}
                borderRadius={10}
              ></Image>
              <Box
                alignSelf={"flex-end"}
                ml={1}
                color={message.seen ? "blue.400" : ""}
                fontWeight={"bold"}
              >
                <BsCheck2All size={16}></BsCheck2All>
              </Box>
            </Flex>
          )}
        </Flex>
      )}
    </>
  );
};
