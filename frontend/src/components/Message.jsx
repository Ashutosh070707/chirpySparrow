import { Box, Flex, Image, Skeleton, Text } from "@chakra-ui/react";
import { BsCheck2All } from "react-icons/bs";
import { useState } from "react";
import { DeleteMessage } from "./DeleteButton";
import { useRecoilState, useRecoilValue } from "recoil";
import { selectedConversationAtom } from "../atoms/messagesAtom";
import { loggedInUserAtom } from "../atoms/loggedInUserAtom";
import { MdGif } from "react-icons/md";
import { BsFillImageFill } from "react-icons/bs";

export const Message = ({ message, ownMessage, setMessages }) => {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [selectedConversation, setSelectedConversation] = useRecoilState(
    selectedConversationAtom
  );
  const loggedInUser = useRecoilValue(loggedInUserAtom);

  return (
    <Flex w="full">
      {ownMessage ? (
        <Flex justifyContent="flex-end" w="100%">
          <Flex justifyContent="flex-end" maxW="70%" alignItems="center">
            <Flex>
              {message.text && (
                <Flex
                  bg="green.900"
                  w="full"
                  p={1}
                  borderRadius="md"
                  justifyContent="flex-end"
                  direction="column"
                >
                  {message.replySnapshot.sender && (
                    <Flex
                      bgColor={"gray.800"}
                      w="full"
                      borderRadius={5}
                      minH={"45px"}
                      maxH="90px"
                      mb={1}
                      overflow="hidden"
                    >
                      <Flex
                        flex={1}
                        bgColor="green.500"
                        borderLeftRadius={20}
                      />
                      <Flex flex={99} w="full" borderRadius={5}>
                        {message.replySnapshot.text && (
                          <Flex w="full" direction="column">
                            <Text
                              fontSize="sm"
                              color="orange.200"
                              p={2}
                              pl={3}
                              pb={0}
                              m={0}
                            >
                              {message.replySnapshot.sender === loggedInUser._id
                                ? "You"
                                : "Other"}
                            </Text>
                            <Text
                              m={0}
                              pl={3}
                              pt={1}
                              pb={2}
                              fontSize={"xs"}
                              wordBreak="break-word"
                              overflowWrap="break-word"
                              color="gray.400"
                              w="90%"
                            >
                              {message.replySnapshot.text.length > 220
                                ? message.replySnapshot.text.slice(0, 220) +
                                  "..."
                                : message.replySnapshot.text}
                            </Text>
                          </Flex>
                        )}
                        {message.replySnapshot.img && (
                          <Flex justifyContent="space-between" w="full">
                            <Flex
                              alignItems="center"
                              direction="column"
                              h="full"
                            >
                              <Flex p={2}>
                                <Text
                                  fontSize="sm"
                                  color="orange.200"
                                  p={0}
                                  m={0}
                                >
                                  {message.replySnapshot.sender ===
                                  loggedInUser._id
                                    ? "You"
                                    : "Other"}
                                </Text>
                              </Flex>
                              <Flex p={2}>
                                <BsFillImageFill size={16} />
                              </Flex>
                            </Flex>
                            <Image
                              src={message.replySnapshot.img}
                              h="full"
                              objectFit="contain"
                              borderRadius={5}
                            />
                          </Flex>
                        )}
                        {message.replySnapshot.gif && (
                          <Flex w="full" justifyContent="space-between">
                            <Flex
                              alignItems="center"
                              direction="column"
                              h="full"
                            >
                              <Flex p={2}>
                                <Text
                                  fontSize="sm"
                                  color="orange.200"
                                  p={0}
                                  m={0}
                                >
                                  {message.replySnapshot.sender ===
                                  loggedInUser._id
                                    ? "You"
                                    : "Other"}
                                </Text>
                              </Flex>
                              <Flex p={2} pt={1}>
                                <MdGif size={30} />
                              </Flex>
                            </Flex>
                            <Flex justifyContent="flex-end">
                              <Image
                                src={message.replySnapshot.gif}
                                h="full"
                                objectFit="contain"
                                borderRadius={5}
                              />
                            </Flex>
                          </Flex>
                        )}
                      </Flex>
                    </Flex>
                  )}
                  <Flex p={1} justifyContent="space-between">
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
                  <Flex
                    bg={message.replySnapshot.sender ? "green.900" : "none"}
                    w="full"
                    borderRadius="md"
                    justifyContent="flex-end"
                    p={message.replySnapshot.sender ? 1 : 0}
                    direction="column"
                  >
                    {message.replySnapshot.sender && (
                      <Flex
                        bgColor={"gray.800"}
                        w="full"
                        borderRadius={5}
                        minH={"45px"}
                        maxH="90px"
                        mb={1}
                        overflow="hidden"
                      >
                        <Flex
                          flex={1}
                          bgColor="green.500"
                          borderLeftRadius={20}
                        />
                        <Flex flex={99} w="full" borderRadius={5}>
                          {message.replySnapshot.text && (
                            <Flex w="full" direction="column">
                              <Text
                                fontSize="sm"
                                color="orange.200"
                                p={2}
                                pl={3}
                                pb={0}
                                m={0}
                              >
                                {message.replySnapshot.sender ===
                                loggedInUser._id
                                  ? "You"
                                  : "Other"}
                              </Text>
                              <Text
                                m={0}
                                pl={3}
                                pt={1}
                                pb={2}
                                fontSize={"xs"}
                                wordBreak="break-word"
                                overflowWrap="break-word"
                                color="gray.400"
                                w="90%"
                              >
                                {message.replySnapshot.text.length > 190
                                  ? message.replySnapshot.text.slice(0, 190) +
                                    "..."
                                  : message.replySnapshot.text}
                              </Text>
                            </Flex>
                          )}
                          {message.replySnapshot.img && (
                            <Flex justifyContent="space-between" w="full">
                              <Flex
                                alignItems="center"
                                direction="column"
                                h="full"
                              >
                                <Flex p={2}>
                                  <Text
                                    fontSize="sm"
                                    color="orange.200"
                                    p={0}
                                    m={0}
                                  >
                                    {message.replySnapshot.sender ===
                                    loggedInUser._id
                                      ? "You"
                                      : "Other"}
                                  </Text>
                                </Flex>
                                <Flex p={2}>
                                  <BsFillImageFill size={16} />
                                </Flex>
                              </Flex>
                              <Image
                                src={message.replySnapshot.img}
                                h="full"
                                objectFit="contain"
                                borderRadius={5}
                              />
                            </Flex>
                          )}
                          {message.replySnapshot.gif && (
                            <Flex w="full" justifyContent="space-between">
                              <Flex
                                alignItems="center"
                                direction="column"
                                h="full"
                              >
                                <Flex p={2}>
                                  <Text
                                    fontSize="sm"
                                    color="orange.200"
                                    p={0}
                                    m={0}
                                  >
                                    {message.replySnapshot.sender ===
                                    loggedInUser._id
                                      ? "You"
                                      : "Other"}
                                  </Text>
                                </Flex>
                                <Flex p={2} pt={1}>
                                  <MdGif size={30} />
                                </Flex>
                              </Flex>
                              <Flex justifyContent="flex-end">
                                <Image
                                  src={message.replySnapshot.gif}
                                  h="full"
                                  objectFit="contain"
                                  borderRadius={5}
                                />
                              </Flex>
                            </Flex>
                          )}
                        </Flex>
                      </Flex>
                    )}
                    <Flex justifyContent="space-between">
                      <Flex
                        justifyContent="center"
                        alignItems="center"
                        flex={95}
                      >
                        <Image
                          src={message.img}
                          w="full"
                          maxHeight="200px"
                          objectFit="contain"
                          borderRadius="md"
                        />
                      </Flex>
                      <Flex flex={5} justifyContent="flex-end">
                        <Box
                          alignSelf="flex-end"
                          ml={"2px"}
                          color={message.seen ? "blue.400" : ""}
                          fontWeight="bold"
                        >
                          <BsCheck2All size={16} />
                        </Box>
                      </Flex>
                    </Flex>
                  </Flex>
                </Flex>
              )}
              {message.gif && (
                <Flex w="full" justifyContent="flex-end" borderRadius={10}>
                  <Flex
                    bg={message.replySnapshot.sender ? "green.900" : "none"}
                    w="full"
                    borderRadius="md"
                    justifyContent="flex-end"
                    p={message.replySnapshot.sender ? 1 : 0}
                    direction="column"
                  >
                    {message.replySnapshot.sender && (
                      <Flex
                        bgColor={"gray.800"}
                        w="full"
                        borderRadius={5}
                        minH={"45px"}
                        maxH="90px"
                        mb={1}
                        overflow="hidden"
                      >
                        <Flex
                          flex={1}
                          bgColor="green.500"
                          borderLeftRadius={20}
                        />
                        <Flex flex={99} w="full" borderRadius={5}>
                          {message.replySnapshot.text && (
                            <Flex w="full" direction="column">
                              <Text
                                fontSize="sm"
                                color="orange.200"
                                p={2}
                                pl={3}
                                pb={0}
                                m={0}
                              >
                                {message.replySnapshot.sender ===
                                loggedInUser._id
                                  ? "You"
                                  : "Other"}
                              </Text>
                              <Text
                                m={0}
                                pl={3}
                                pt={1}
                                pb={2}
                                fontSize={"xs"}
                                wordBreak="break-word"
                                overflowWrap="break-word"
                                color="gray.400"
                                w="90%"
                              >
                                {message.replySnapshot.text.length > 190
                                  ? message.replySnapshot.text.slice(0, 190) +
                                    "..."
                                  : message.replySnapshot.text}
                              </Text>
                            </Flex>
                          )}
                          {message.replySnapshot.img && (
                            <Flex justifyContent="space-between" w="full">
                              <Flex
                                alignItems="center"
                                direction="column"
                                h="full"
                              >
                                <Flex p={2}>
                                  <Text
                                    fontSize="sm"
                                    color="orange.200"
                                    p={0}
                                    m={0}
                                  >
                                    {message.replySnapshot.sender ===
                                    loggedInUser._id
                                      ? "You"
                                      : "Other"}
                                  </Text>
                                </Flex>
                                <Flex p={2}>
                                  <BsFillImageFill size={16} />
                                </Flex>
                              </Flex>
                              <Image
                                src={message.replySnapshot.img}
                                h="full"
                                objectFit="contain"
                                borderRadius={5}
                              />
                            </Flex>
                          )}
                          {message.replySnapshot.gif && (
                            <Flex w="full" justifyContent="space-between">
                              <Flex
                                alignItems="center"
                                direction="column"
                                h="full"
                              >
                                <Flex p={2}>
                                  <Text
                                    fontSize="sm"
                                    color="orange.200"
                                    p={0}
                                    m={0}
                                  >
                                    {message.replySnapshot.sender ===
                                    loggedInUser._id
                                      ? "You"
                                      : "Other"}
                                  </Text>
                                </Flex>
                                <Flex p={2} pt={1}>
                                  <MdGif size={30} />
                                </Flex>
                              </Flex>
                              <Flex justifyContent="flex-end">
                                <Image
                                  src={message.replySnapshot.gif}
                                  h="full"
                                  objectFit="contain"
                                  borderRadius={5}
                                />
                              </Flex>
                            </Flex>
                          )}
                        </Flex>
                      </Flex>
                    )}
                    <Flex justifyContent="space-between">
                      <Flex
                        justifyContent="center"
                        alignItems="center"
                        flex={95}
                      >
                        <Image
                          src={message.gif}
                          alt={"GIF"}
                          maxH="200px"
                          objectFit="cover"
                          borderRadius="md"
                          loading="lazy"
                        />
                      </Flex>
                      <Flex flex={5} justifyContent="flex-end">
                        <Box
                          alignSelf="flex-end"
                          ml={"2px"}
                          color={message.seen ? "blue.400" : ""}
                          fontWeight="bold"
                        >
                          <BsCheck2All size={16} />
                        </Box>
                      </Flex>
                    </Flex>
                  </Flex>
                </Flex>
              )}
            </Flex>
            <Flex justifyContent="center" alignItems="center">
              <DeleteMessage
                place="bottom-end"
                message={message}
                setMessages={setMessages}
                selectedConversation={selectedConversation}
              />
            </Flex>
          </Flex>
        </Flex>
      ) : (
        <Flex justifyContent="flex-start" w="100%">
          <Flex justifyContent="flex-start" maxW="70%" alignItems="center">
            <Flex justifyContent="center" alignItems="center">
              <DeleteMessage
                place="right-end"
                message={message}
                setMessages={setMessages}
                selectedConversation={selectedConversation}
              />
            </Flex>
            <Flex>
              {message.text && (
                <Flex
                  bg="gray.900"
                  w="full"
                  p={1}
                  borderRadius="md"
                  justifyContent="flex-start"
                  direction="column"
                >
                  {message.replySnapshot.sender && (
                    <Flex
                      bgColor={"gray.800"}
                      w="full"
                      borderRadius={5}
                      minH={"45px"}
                      maxH="90px"
                      mb={1}
                      overflow="hidden"
                    >
                      <Flex
                        flex={1}
                        bgColor="green.500"
                        borderLeftRadius={"md"}
                      />
                      <Flex flex={99} w="full" borderRadius={5}>
                        {message.replySnapshot.text && (
                          <Flex w="full" direction="column">
                            <Text
                              fontSize="xs"
                              color="orange.200"
                              p={2}
                              pl={3}
                              pb={0}
                              m={0}
                            >
                              {message.replySnapshot.sender === loggedInUser._id
                                ? "You"
                                : "Other"}
                            </Text>
                            <Text
                              m={0}
                              pl={3}
                              pt={1}
                              pb={2}
                              fontSize={"xs"}
                              wordBreak="break-word"
                              overflowWrap="break-word"
                              color="gray.400"
                              w="90%"
                            >
                              {message.replySnapshot.text.length > 220
                                ? message.replySnapshot.text.slice(0, 220) +
                                  "..."
                                : message.replySnapshot.text}
                            </Text>
                          </Flex>
                        )}
                        {message.replySnapshot.img && (
                          <Flex justifyContent="space-between" w="full">
                            <Flex
                              alignItems="center"
                              direction="column"
                              h="full"
                            >
                              <Flex p={2}>
                                <Text
                                  fontSize="sm"
                                  color="orange.200"
                                  p={0}
                                  m={0}
                                >
                                  {message.replySnapshot.sender ===
                                  loggedInUser._id
                                    ? "You"
                                    : "Other"}
                                </Text>
                              </Flex>
                              <Flex p={2}>
                                <BsFillImageFill size={16} />
                              </Flex>
                            </Flex>
                            <Image
                              src={message.replySnapshot.img}
                              h="full"
                              objectFit="contain"
                              borderRadius={5}
                            />
                          </Flex>
                        )}
                        {message.replySnapshot.gif && (
                          <Flex w="full" justifyContent="space-between">
                            <Flex
                              alignItems="center"
                              direction="column"
                              h="full"
                            >
                              <Flex p={2}>
                                <Text
                                  fontSize="sm"
                                  color="orange.200"
                                  p={0}
                                  m={0}
                                >
                                  {message.replySnapshot.sender ===
                                  loggedInUser._id
                                    ? "You"
                                    : "Other"}
                                </Text>
                              </Flex>
                              <Flex p={2} pt={1}>
                                <MdGif size={30} />
                              </Flex>
                            </Flex>
                            <Flex justifyContent="flex-end">
                              <Image
                                src={message.replySnapshot.gif}
                                h="full"
                                objectFit="contain"
                                borderRadius={5}
                              />
                            </Flex>
                          </Flex>
                        )}
                      </Flex>
                    </Flex>
                  )}
                  <Flex p={1} justifyContent="space-between">
                    <Text
                      wordBreak="break-word"
                      overflowWrap="break-word"
                      fontSize="sm"
                    >
                      {message.text}
                    </Text>
                  </Flex>
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
                  <Flex
                    bg={message.replySnapshot.sender ? "gray.900" : "none"}
                    w="full"
                    borderRadius="md"
                    justifyContent="flex-start"
                    p={message.replySnapshot.sender ? 1 : 0}
                    direction="column"
                  >
                    {message.replySnapshot.sender && (
                      <Flex
                        bgColor={"gray.800"}
                        w="full"
                        borderRadius={5}
                        minH={"45px"}
                        maxH="90px"
                        mb={1}
                        overflow="hidden"
                      >
                        <Flex
                          flex={1}
                          bgColor="green.500"
                          borderLeftRadius={20}
                        />
                        <Flex flex={99} w="full" borderRadius={5}>
                          {message.replySnapshot.text && (
                            <Flex w="full" direction="column">
                              <Text
                                fontSize="xs"
                                color="orange.200"
                                p={2}
                                pl={3}
                                pb={0}
                                m={0}
                              >
                                {message.replySnapshot.sender ===
                                loggedInUser._id
                                  ? "You"
                                  : "Other"}
                              </Text>
                              <Text
                                m={0}
                                pl={3}
                                pt={1}
                                pb={2}
                                fontSize={"xs"}
                                wordBreak="break-word"
                                overflowWrap="break-word"
                                color="gray.400"
                                w="90%"
                              >
                                {message.replySnapshot.text.length > 190
                                  ? message.replySnapshot.text.slice(0, 190) +
                                    "..."
                                  : message.replySnapshot.text}
                              </Text>
                            </Flex>
                          )}
                          {message.replySnapshot.img && (
                            <Flex justifyContent="space-between" w="full">
                              <Flex
                                alignItems="center"
                                direction="column"
                                h="full"
                              >
                                <Flex p={2}>
                                  <Text
                                    fontSize="sm"
                                    color="orange.200"
                                    p={0}
                                    m={0}
                                  >
                                    {message.replySnapshot.sender ===
                                    loggedInUser._id
                                      ? "You"
                                      : "Other"}
                                  </Text>
                                </Flex>
                                <Flex p={2}>
                                  <BsFillImageFill size={16} />
                                </Flex>
                              </Flex>
                              <Image
                                src={message.replySnapshot.img}
                                h="full"
                                objectFit="contain"
                                borderRadius={5}
                              />
                            </Flex>
                          )}
                          {message.replySnapshot.gif && (
                            <Flex w="full" justifyContent="space-between">
                              <Flex
                                alignItems="center"
                                direction="column"
                                h="full"
                              >
                                <Flex p={2}>
                                  <Text
                                    fontSize="sm"
                                    color="orange.200"
                                    p={0}
                                    m={0}
                                  >
                                    {message.replySnapshot.sender ===
                                    loggedInUser._id
                                      ? "You"
                                      : "Other"}
                                  </Text>
                                </Flex>
                                <Flex p={2} pt={1}>
                                  <MdGif size={30} />
                                </Flex>
                              </Flex>
                              <Flex justifyContent="flex-end">
                                <Image
                                  src={message.replySnapshot.gif}
                                  h="full"
                                  objectFit="contain"
                                  borderRadius={5}
                                />
                              </Flex>
                            </Flex>
                          )}
                        </Flex>
                      </Flex>
                    )}

                    <Flex justifyContent="center" alignItems="center" flex={95}>
                      <Image
                        src={message.img}
                        w="full"
                        maxHeight="200px"
                        objectFit="contain"
                        borderRadius={"md"}
                      />
                    </Flex>
                  </Flex>
                </Flex>
              )}
              {message.gif && (
                <Flex w="full" justifyContent="flex-start" borderRadius={10}>
                  <Flex
                    bg={message.replySnapshot.sender ? "gray.900" : "none"}
                    w="full"
                    borderRadius="md"
                    justifyContent="flex-end"
                    p={message.replySnapshot.sender ? 1 : 0}
                    direction="column"
                  >
                    {message.replySnapshot.sender && (
                      <Flex
                        bgColor={"gray.800"}
                        w="full"
                        borderRadius={5}
                        minH={"45px"}
                        maxH="90px"
                        mb={1}
                        overflow="hidden"
                      >
                        <Flex
                          flex={1}
                          bgColor="green.500"
                          borderLeftRadius={20}
                        />
                        <Flex flex={99} w="full" borderRadius={5}>
                          {message.replySnapshot.text && (
                            <Flex w="full" direction="column">
                              <Text
                                fontSize="xs"
                                color="orange.200"
                                p={2}
                                pl={3}
                                pb={0}
                                m={0}
                              >
                                {message.replySnapshot.sender ===
                                loggedInUser._id
                                  ? "You"
                                  : "Other"}
                              </Text>
                              <Text
                                m={0}
                                pl={3}
                                pt={1}
                                pb={2}
                                fontSize={"xs"}
                                wordBreak="break-word"
                                overflowWrap="break-word"
                                color="gray.400"
                                w="90%"
                              >
                                {message.replySnapshot.text.length > 190
                                  ? message.replySnapshot.text.slice(0, 190) +
                                    "..."
                                  : message.replySnapshot.text}
                              </Text>
                            </Flex>
                          )}
                          {message.replySnapshot.img && (
                            <Flex justifyContent="space-between" w="full">
                              <Flex
                                alignItems="center"
                                direction="column"
                                h="full"
                              >
                                <Flex p={2}>
                                  <Text
                                    fontSize="sm"
                                    color="orange.200"
                                    p={0}
                                    m={0}
                                  >
                                    {message.replySnapshot.sender ===
                                    loggedInUser._id
                                      ? "You"
                                      : "Other"}
                                  </Text>
                                </Flex>
                                <Flex p={2}>
                                  <BsFillImageFill size={16} />
                                </Flex>
                              </Flex>
                              <Image
                                src={message.replySnapshot.img}
                                h="full"
                                objectFit="contain"
                                borderRadius={5}
                              />
                            </Flex>
                          )}
                          {message.replySnapshot.gif && (
                            <Flex w="full" justifyContent="space-between">
                              <Flex
                                alignItems="center"
                                direction="column"
                                h="full"
                              >
                                <Flex p={2}>
                                  <Text
                                    fontSize="sm"
                                    color="orange.200"
                                    p={0}
                                    m={0}
                                  >
                                    {message.replySnapshot.sender ===
                                    loggedInUser._id
                                      ? "You"
                                      : "Other"}
                                  </Text>
                                </Flex>
                                <Flex p={2} pt={1}>
                                  <MdGif size={30} />
                                </Flex>
                              </Flex>
                              <Flex justifyContent="flex-end">
                                <Image
                                  src={message.replySnapshot.gif}
                                  h="full"
                                  objectFit="contain"
                                  borderRadius={5}
                                />
                              </Flex>
                            </Flex>
                          )}
                        </Flex>
                      </Flex>
                    )}

                    <Flex justifyContent="center" alignItems="center" flex={95}>
                      <Image
                        src={message.gif}
                        alt={"GIF"}
                        maxH="200px"
                        objectFit="cover"
                        borderRadius="md"
                        loading="lazy"
                      />
                    </Flex>
                  </Flex>
                </Flex>
              )}
            </Flex>
          </Flex>
        </Flex>
      )}
    </Flex>
  );
};
