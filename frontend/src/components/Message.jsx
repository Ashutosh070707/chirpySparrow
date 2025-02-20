import { Box, Flex, Image, Skeleton, Text } from "@chakra-ui/react";
import { BsCheck2All } from "react-icons/bs";
import { useState } from "react";
import { DeleteMessage } from "./DeleteButton";
import { useRecoilState } from "recoil";
import { selectedConversationAtom } from "../atoms/messagesAtom";

export const Message = ({ message, ownMessage, setMessages }) => {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [selectedConversation, setSelectedConversation] = useRecoilState(
    selectedConversationAtom
  );

  return (
    <Flex w="full">
      {ownMessage ? (
        <Flex justifyContent="flex-end" w="100%">
          {message.text && (
            <Flex bg="green.800" maxW="60%" p={2} borderRadius="md">
              <Text
                color="white"
                wordBreak="break-word"
                overflowWrap="break-word"
              >
                {message.text}
              </Text>
              <Box
                alignSelf="flex-end"
                ml={1}
                color={message.seen ? "blue.400" : ""}
                fontWeight="bold"
              >
                <BsCheck2All size={16} />
              </Box>
            </Flex>
          )}
          {message.img && !imgLoaded && (
            <Flex w="40%" h="40%">
              <Image
                src={message.img}
                hidden
                onLoad={() => setImgLoaded(true)}
                alt="image"
                borderRadius={4}
              />
              <Skeleton w="40%" h="40%" borderRadius={4} />
            </Flex>
          )}
          {message.img && imgLoaded && (
            <Flex maxW="40%" borderRadius={10} justifyContent="flex-end">
              <Image
                src={message.img}
                maxWidth="100%"
                maxHeight="200px"
                objectFit="contain"
                borderRadius={10}
              />
              <Box
                alignSelf="flex-end"
                ml={1}
                color={message.seen ? "blue.400" : ""}
                fontWeight="bold"
              >
                <BsCheck2All size={16} />
              </Box>
            </Flex>
          )}
          <Flex justifyContent="center" alignItems="center" ml={1} mr={2}>
            <DeleteMessage
              message={message}
              setMessages={setMessages}
              selectedConversation={selectedConversation}
            />
          </Flex>
        </Flex>
      ) : (
        <Flex w="full" justifyContent="flex-start">
          {message.text && (
            <Text
              maxW="60%"
              bg="gray.400"
              p={2}
              color="black"
              borderRadius="md"
              overflowWrap="break-word"
            >
              {message.text}
            </Text>
          )}
          {message.img && !imgLoaded && (
            <Flex w="40%" h="40%">
              <Image
                src={message.img}
                hidden
                onLoad={() => setImgLoaded(true)}
                alt="image"
                borderRadius={4}
              />
              <Skeleton w="40%" h="40%" borderRadius={4} />
            </Flex>
          )}
          {message.img && imgLoaded && (
            <Flex maxW="40%" borderRadius={10} justifyContent="flex-start">
              <Image
                src={message.img}
                maxWidth="100%"
                maxHeight="200px"
                objectFit="contain"
                borderRadius={10}
              />
              <Box
                alignSelf="flex-end"
                ml={1}
                color={message.seen ? "blue.400" : ""}
                fontWeight="bold"
              >
                <BsCheck2All size={16} />
              </Box>
            </Flex>
          )}
        </Flex>
      )}
    </Flex>
  );
};
