import {
  Avatar,
  Box,
  Flex,
  Image,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Portal,
  Text,
} from "@chakra-ui/react";
import { useState } from "react";
import { BsThreeDots } from "react-icons/bs";
import { Link } from "react-router-dom";
import { Actions } from "./Actions";
import { CgMoreO } from "react-icons/cg";

export const UserPost = ({ likes, replies, postImg, postTitle }) => {
  const [liked, setLiked] = useState(false);
  return (
    <>
      <Link to={"/markzukerberg/post/1"}>
        <Flex gap={3} mb={4} py={5}>
          <Flex flexDirection={"column"} alignItems={"center"}>
            <Avatar
              size="md"
              name="Mark Zukerberg"
              src="/zuck-avatar.png"
            ></Avatar>
            <Box height={"full"} w={"1px"} bg={"gray.light"} my={2}></Box>
            <Box position={"relative"} w={"full"}>
              <Avatar
                size="xs"
                name="John Doe"
                src="https://bit.ly/prosper-baba'"
                position={"absolute"}
                top={"0px"}
                left="15px"
                padding={"2px"}
              ></Avatar>
              <Avatar
                size="xs"
                name="John Doe"
                src="https://bit.ly/dan-abramov"
                position={"absolute"}
                bottom={"0px"}
                right="-5px"
                padding={"2px"}
              ></Avatar>
              <Avatar
                size="xs"
                name="John Doe"
                src="https://bit.ly/ryan-florence"
                position={"absolute"}
                bottom={"0px"}
                left="4px"
                padding={"2px"}
              ></Avatar>
            </Box>
          </Flex>

          <Flex flex={1} flexDirection={"column"} gap={2} ml={3}>
            <Flex justifyContent={"space-between"} w={"full"}>
              <Flex w={"full"} alignItems={"center"}>
                <Text fontSize={"sm"} fontWeight={"bold"}>
                  markzukerberg
                </Text>
                <Image src="/verified.png" w="4" h={4} ml={2} mt={1}></Image>
              </Flex>
              <Flex gap={4} alignItems={"center"}>
                <Text fontSize="sm" color={"gray.light"}>
                  1d
                </Text>

                {/* <BsThreeDots /> */}

                <Box className="icon-container">
                  <Menu>
                    <MenuButton>
                      <CgMoreO size={24} cursor={"pointer"} />
                    </MenuButton>
                    <Portal>
                      <MenuList bg={"gray.dark"}>
                        <MenuItem bg={"gray.dark"}>Copy link</MenuItem>
                      </MenuList>
                    </Portal>
                  </Menu>
                </Box>
              </Flex>
            </Flex>

            <Text fontSize={"sm"}>{postTitle}</Text>
            {postImg && (
              <Box
                borderRadius={6}
                overflow={"hidden"}
                border={"1px solid"}
                borderColor={"gray.light"}
              >
                <Image src={postImg} w={"full"}></Image>
              </Box>
            )}

            <Flex gap={3} my={1}>
              <Actions liked={liked} setLiked={setLiked}></Actions>
            </Flex>
            <Flex gap={2} alignItems={"center"}>
              <Text fontSize={"sm"} color={"gray.light"}>
                ${replies}
              </Text>
              <Box w={1} h={1} bg={"gray.light"} borderRadius={"100%"}></Box>
              <Text fontSize={"sm"} color={"gray.light"}>
                ${likes}
              </Text>
            </Flex>
          </Flex>
        </Flex>
      </Link>
    </>
  );
};
