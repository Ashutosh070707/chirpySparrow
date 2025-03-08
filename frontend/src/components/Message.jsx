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
          <Flex justifyContent="flex-end" maxW="90%" alignItems="center">
            {message.text && (
              <Flex
                bg="green.800"
                w="full"
                p={2}
                borderRadius="md"
                justifyContent="flex-end"
              >
                <Text
                  color="white"
                  wordBreak="break-word"
                  overflowWrap="break-word"
                  fontSize="sm"
                >
                  {message.text}
                </Text>
                <Box
                  alignSelf="flex-end"
                  ml={"2px"}
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
              <Flex w="full" borderRadius={10} justifyContent="flex-end">
                <Image
                  src={message.img}
                  w="full"
                  maxHeight="200px"
                  objectFit="contain"
                  borderRadius={10}
                />
                <Box
                  alignSelf="flex-end"
                  ml={"2px"}
                  color={message.seen ? "blue.400" : ""}
                  fontWeight="bold"
                >
                  <BsCheck2All size={16} />
                </Box>
              </Flex>
            )}
            {message.gif && (
              <Flex w="full" justifyContent="flex-end" borderRadius={10}>
                <Image
                  src={message.gif}
                  alt={"GIF"}
                  maxH="200px"
                  objectFit="cover"
                  borderRadius="md"
                  loading="lazy"
                />
                <Box
                  alignSelf="flex-end"
                  ml={"2px"}
                  color={message.seen ? "blue.400" : ""}
                  fontWeight="bold"
                >
                  <BsCheck2All size={16} />
                </Box>
              </Flex>
            )}
            <Flex justifyContent="center" alignItems="center">
              <DeleteMessage
                message={message}
                setMessages={setMessages}
                selectedConversation={selectedConversation}
              />
            </Flex>
          </Flex>
        </Flex>
      ) : (
        <Flex justifyContent="flex-start" w="100%">
          <Flex justifyContent="flex-start" maxW="90%" alignItems="center">
            {message.text && (
              <Flex
                bg="gray.400"
                w="full"
                p={2}
                borderRadius="md"
                justifyContent="flex-end"
              >
                <Text
                  color="black"
                  wordBreak="break-word"
                  overflowWrap="break-word"
                  fontSize="sm"
                >
                  {message.text}
                </Text>
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
              <Flex w="full" borderRadius={10} justifyContent="flex-start">
                <Image
                  src={message.img}
                  w="full"
                  maxHeight="200px"
                  objectFit="contain"
                  borderRadius={10}
                />
              </Flex>
            )}
            {message.gif && (
              <Flex w="full" justifyContent="flex-start" borderRadius={10}>
                <Image
                  src={message.gif}
                  alt={"GIF"}
                  maxH="200px"
                  objectFit="cover"
                  borderRadius="md"
                  loading="lazy"
                />
              </Flex>
            )}
          </Flex>
        </Flex>
      )}
    </Flex>
  );
};
