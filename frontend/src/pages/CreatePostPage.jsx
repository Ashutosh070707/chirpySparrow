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
} from "@chakra-ui/react";
import { useShowToast } from "../../hooks/useShowToast";
import { useRecoilValue } from "recoil";
import { usePreviewImg } from "../../hooks/usePreviewImg";
import { useRef, useState } from "react";
import { loggedInUserAtom } from "../atoms/loggedInUserAtom";
import { BsFillImageFill } from "react-icons/bs";

const MAX_CHAR = 500;

export const CreatePostPage = () => {
  const showToast = useShowToast();
  const loggedInUser = useRecoilValue(loggedInUserAtom);
  const [postText, setPostText] = useState("");
  const [remainingChar, setRemainingChar] = useState(MAX_CHAR);
  const { handleImageChange, imgUrl, setImgUrl } = usePreviewImg();
  const imageRef = useRef(null);
  const [loading, setLoading] = useState(false);

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
  return (
    <Flex w="full" justifyContent="center">
      <Flex
        w={{ base: "50%", sm: "90%", md: "70%", lg: "60%", xl: "50%" }}
        direction="column"
        justifyContent="center"
        borderRadius={10}
        bg="gray.900"
        mt="6%"
        p="3%"
        gap={10}
      >
        <Flex justifyContent="center" alignItems="center" mb="2%">
          <Text
            fontSize={{
              base: "4xl",
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
            h="200px"
            placeholder="Post content goes here..."
            onChange={handleTextChange}
            value={postText}
          ></Textarea>
          <Text
            fontSize="sm"
            fontWeight="bold"
            textAlign="right"
            m={"1"}
            color={"gray.300"}
          >
            {remainingChar}/{MAX_CHAR}
          </Text>
          <Input
            type="file"
            hidden
            ref={imageRef}
            onChange={handleImageChange}
          ></Input>
          <Button
            color={"black"}
            bg={"gray.300"}
            _hover={{
              opacity: ".8",
            }}
            size={"sm"}
            onClick={() => imageRef.current.click()}
          >
            Add Image
          </Button>
        </FormControl>

        <Flex gap={4} justifyContent="center">
          {imgUrl && (
            <Flex mt={5} w={"full"} justifyContent={"center"}>
              <Box position="relative" w="full" h="300px">
                <Image
                  src={imgUrl}
                  alt="Selected img"
                  w="full"
                  h="100%"
                  objectFit="contain"
                />
                <CloseButton
                  onClick={() => setImgUrl("")}
                  position="absolute"
                  top="2"
                  right="6"
                  bg="gray.800"
                  _hover={{ bg: "gray.600" }}
                />
              </Box>
            </Flex>
          )}
        </Flex>
        <Flex justifyContent="center">
          <Button
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
