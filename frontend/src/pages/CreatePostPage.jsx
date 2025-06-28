import {
  Box,
  Button,
  CloseButton,
  Flex,
  FormControl,
  Image,
  Input,
  Text,
  Textarea,
  useBreakpointValue,
} from "@chakra-ui/react";
import { useShowToast } from "../../hooks/useShowToast";
import { useRecoilValue } from "recoil";
import { useRef, useState } from "react";
import React from "react";
import { loggedInUserAtom } from "../atoms/loggedInUserAtom";
import { BiImageAdd } from "react-icons/bi";
import { BsStars } from "react-icons/bs";

const MAX_CHAR = 500;

export const CreatePostPage = () => {
  const showToast = useShowToast();
  const loggedInUser = useRecoilValue(loggedInUserAtom);
  const [postText, setPostText] = useState("");
  const [remainingChar, setRemainingChar] = useState(MAX_CHAR);
  const imageRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [improvingLoader, setImprovingLoader] = useState(false);
  const iconSize = useBreakpointValue({ base: 25, md: 28 });
  const [imgUrl, setImgUrl] = useState(null);

  const handleTextChange = (e) => {
    const inputText = e.target.value;
    if (inputText.length > MAX_CHAR) {
      const truncatedText = inputText.slice(0, MAX_CHAR);
      setPostText(truncatedText);
      setRemainingChar(0);
    } else {
      setPostText(inputText);
      setRemainingChar(MAX_CHAR - inputText.length);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImgUrl(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      showToast("Invalid file type", "Please select an image file.", "error");
      setImgUrl(null);
    }
  };

  const handleCreatePost = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/posts/create", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          postedBy: loggedInUser._id,
          text: postText,
          img: imgUrl,
        }),
      });

      const data = await res.json();
      if (data.error) {
        showToast("Error", data.error, "error");
        return;
      }
      showToast("Success", "Post created successfully", "success");
      setPostText("");
      setImgUrl("");
      setRemainingChar(MAX_CHAR);
    } catch (error) {
      showToast("Error", error, "error");
    } finally {
      setLoading(false);
    }
  };

  const improveWithAi = async () => {
    if (improvingLoader) return;
    if (postText === "") {
      showToast("Error", "No text found", "error");
      return;
    }
    setImprovingLoader(true);
    try {
      const res = await fetch("/api/gemini/improve", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          question: postText,
        }),
      });

      const data = await res.json();
      if (data.error) {
        showToast("Error", data.error, "error");
        return;
      }
      console.log(data);
      setPostText(data.answer);
    } catch (error) {
      showToast("Error", error, "error");
    } finally {
      setImprovingLoader(false);
    }
  };

  return (
    <Flex w="full" justifyContent="center" h="full">
      <Flex
        w={{ base: "92%", sm: "90%", md: "70%", lg: "70%", xl: "60%" }}
        direction="column"
        borderRadius={10}
        mt={{ base: "6%", sm: "10%", md: "10%", lg: "6%", xl: "6%" }}
        gap={4}
      >
        <Flex justifyContent="center" alignItems="center" mb="1%">
          <Text
            fontSize={{
              base: "2xl",
              sm: "3xl",
              md: "3xl",
              lg: "4xl",
              xl: "4xl",
            }}
            fontWeight={"bold"}
          >
            Create Post
          </Text>
        </Flex>
        <FormControl>
          <Textarea
            fontSize={{ base: "sm", sm: "md" }}
            h="250px"
            placeholder="Post content goes here..."
            onChange={handleTextChange}
            value={postText}
            overflowWrap="break-word"
          ></Textarea>
          <Text
            fontSize={{ base: "xs", sm: "sm" }}
            fontWeight="bold"
            textAlign="right"
            m={"1"}
            color={"gray.300"}
          >
            {remainingChar}/{MAX_CHAR}
          </Text>
          <Flex w="full" alignItems="center" gap={3}>
            <Button
              size={{ base: "xs", sm: "sm" }}
              borderRadius={100}
              onClick={improveWithAi}
              disabled={improvingLoader}
              border="1px solid gray"
              _hover={{
                background: "none",
                backgroundColor: "transparent",
              }}
            >
              {improvingLoader && (
                <Flex gap={1} alignItems="center">
                  <BsStars />
                  <Text>Improving</Text>
                  <Flex justifyContent="center" mt={1}>
                    <div className="bouncing-loader">
                      <div></div>
                      <div></div>
                      <div></div>
                    </div>
                  </Flex>
                </Flex>
              )}
              {!improvingLoader && (
                <Flex gap={1} alignItems="center">
                  <BsStars />
                  <Text>Improve</Text>
                </Flex>
              )}
            </Button>
            <Input
              type="file"
              hidden
              ref={imageRef}
              onChange={handleImageChange}
            ></Input>

            <BiImageAdd
              cursor="pointer"
              size={iconSize}
              onClick={() => imageRef.current.click()}
            />
          </Flex>
        </FormControl>

        <Flex justifyContent="center" borderRadius={5}>
          {imgUrl && (
            <Flex w={"full"} justifyContent={"center"}>
              <Box position="relative" w="full" maxH="300px">
                <Box borderRadius={6} overflow={"hidden"}>
                  <Image
                    src={imgUrl}
                    w={"full"}
                    maxH={"300px"}
                    objectFit={"contain"}
                    borderRadius={6}
                  ></Image>
                </Box>
                <CloseButton
                  onClick={() => setImgUrl("")}
                  position="absolute"
                  top={1}
                  right={2}
                  bg="gray.800"
                  _hover={{ bg: "gray.600" }}
                />
              </Box>
            </Flex>
          )}
        </Flex>
        <Flex justifyContent="center">
          <Button
            size={{ base: "sm", sm: "md" }}
            w="full"
            bg="blue.600"
            onClick={handleCreatePost}
            isLoading={loading}
          >
            Post
          </Button>
        </Flex>
      </Flex>
    </Flex>
  );
};
