import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  Textarea,
  Input,
  Image,
  Flex,
  Text,
  Box,
  Tooltip,
  keyframes,
} from "@chakra-ui/react";
import { useState, useRef, useEffect } from "react";
import { useSetRecoilState } from "recoil";
import { BsStars } from "react-icons/bs";
import { useBreakpointValue } from "@chakra-ui/react";
import { userPostsAtom } from "../atoms/userPostsAtom";
import { useShowToast } from "../../hooks/useShowToast";

const MAX_CHAR = 500;
const bounceAnimation = keyframes`
  0%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-5px); }
`;

export const EditPostModal = ({ post, isOpen, onClose }) => {
  const showToast = useShowToast();
  const setPosts = useSetRecoilState(userPostsAtom);
  const [remainingChar, setRemainingChar] = useState(
    MAX_CHAR - post.text.length
  );
  const [newText, setNewText] = useState(post.text);
  const [newImg, setNewImg] = useState(post.img);
  const [editing, setEditing] = useState(false);
  const imageRef = useRef(null);
  const [improvingLoader, setImprovingLoader] = useState(false);
  const [imageChanged, setImageChanged] = useState(false);
  const modalWidth = useBreakpointValue({
    base: "90%", // Small screens (mobile)
    sm: "80%",
    md: "50%",
    lg: "40%",
    xl: "30%", // Large screens (desktop)
  });
  const modalHeight = useBreakpointValue({
    base: "90%", // Small screens (mobile)
    sm: "90%",
  });
  const iconSize = useBreakpointValue({ base: 10, sm: 14 });

  // 🔹 **Reset state when modal opens**
  useEffect(() => {
    if (isOpen) {
      setNewText(post.text);
      setNewImg(post.img);
      setRemainingChar(MAX_CHAR - post.text.length);
    }
  }, [isOpen, post]);

  const handleTextChange = (e) => {
    const inputText = e.target.value;
    if (inputText.length > MAX_CHAR) {
      const truncatedText = inputText.slice(0, MAX_CHAR);
      setNewText(truncatedText);
      setRemainingChar(0);
    } else {
      setNewText(inputText);
      setRemainingChar(MAX_CHAR - inputText.length);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewImg(reader.result); // Update the new image state
      };
      reader.readAsDataURL(file);
      setImageChanged(true);
    } else {
      showToast("Invalid file type", "Please select an image file.", "error");
      setNewImg(null);
      setImageChanged(false);
    }
  };

  const handleRemoveImage = () => {
    setImageChanged(true);
    setNewImg(null);
    if (imageRef.current) {
      imageRef.current.value = ""; // Reset file input to allow re-selection
    }
  };

  const handleUpdatePost = async () => {
    if (!newText.trim()) {
      showToast("Error", "Post content is required.", "error");
      return;
    }
    setEditing(true);
    try {
      const res = await fetch(`/api/posts/update/${post._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          newText,
          newImg,
          imageChanged: imageChanged,
        }),
      });

      const data = await res.json();
      if (data.error) {
        showToast("Error", data.error, "error");
        return;
      }

      showToast("Success", "Post updated successfully!", "success");

      setPosts((prevPosts) =>
        prevPosts.map((p) =>
          p._id === data.post._id ? { ...p, ...data.post } : p
        )
      );
      setNewText("");
      setNewImg("");
      setRemainingChar(MAX_CHAR);
      onClose();
    } catch (error) {
      showToast("Error", error.message, "error");
    } finally {
      setEditing(false);
    }
  };

  const improveWithAi = async () => {
    if (improvingLoader) return;
    if (newText === "") {
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
          question: newText,
        }),
      });

      const data = await res.json();
      if (data.error) {
        showToast("Error", data.error, "error");
        return;
      }
      setNewText(data.answer);
    } catch (error) {
      showToast("Error", error, "error");
    } finally {
      setImprovingLoader(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent maxW={modalWidth} maxH={modalHeight} p={1}>
        <ModalHeader fontSize={{ base: "xl", sm: "2xl" }}>
          Edit Post
        </ModalHeader>
        <ModalCloseButton mt={2} />
        <ModalBody overflowY="auto" className="custom-scrollbar">
          <Flex direction="column" w="full">
            <Textarea
              fontSize={{ base: "sm", sm: "md" }}
              h="160px"
              placeholder="Update your post..."
              value={newText}
              onChange={handleTextChange}
              overflowWrap="break-word"
            />
            <Flex
              w="full"
              justifyContent="space-between"
              alignItems="center"
              pt={1}
              pl={1}
            >
              <Tooltip label="Improve" fontSize="sm" placement="right">
                <Box
                  as="button"
                  onClick={improveWithAi}
                  borderRadius="full"
                  bgColor="white"
                  w={{ base: 6, sm: 7 }}
                  h={{ base: 6, sm: 7 }}
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  cursor="pointer"
                  shadow="md"
                  _hover={{ bg: "gray.200" }}
                  _active={{ bg: "gray.300" }}
                >
                  {!improvingLoader && (
                    <BsStars size={iconSize} color="black" />
                  )}
                  {improvingLoader && (
                    <Flex gap={1} alignItems="center" m={1}>
                      {[1, 2, 3].map((dot) => (
                        <Flex
                          key={dot}
                          w={{ base: "3px", sm: "4px" }}
                          h={{ base: "3px", sm: "4px" }}
                          bgColor="black"
                          borderRadius="full"
                          animation={`${bounceAnimation} 1.4s ease-in-out ${
                            dot * 0.12
                          }s infinite`}
                        />
                      ))}
                    </Flex>
                  )}
                </Box>
              </Tooltip>

              <Text
                fontSize={{ base: "xs", sm: "sm" }}
                fontWeight="bold"
                textAlign="right"
                m={"1"}
                color={"gray.300"}
              >
                {remainingChar}/{MAX_CHAR}
              </Text>
            </Flex>
            <Flex direction="column" alignItems="center" mt={4} w="full">
              {newImg && (
                <Image
                  src={newImg}
                  maxH="200px"
                  objectFit="contain"
                  w="full"
                  borderRadius={6}
                />
              )}

              <Flex w="full" gap={1} justifyContent="space-between">
                <Input
                  type="file"
                  ref={imageRef}
                  hidden
                  onChange={handleImageChange}
                />
                {newImg && (
                  <Button mt={2} size="sm" w="full" onClick={handleRemoveImage}>
                    Remove
                  </Button>
                )}
                <Button
                  w="full"
                  mt={2}
                  size="sm"
                  onClick={() => imageRef.current.click()}
                >
                  {newImg ? "Change" : "Add Image"}
                </Button>
              </Flex>
            </Flex>
          </Flex>
        </ModalBody>
        <ModalFooter>
          <Flex w="full">
            <Flex justifyContent="flex-end" w="full" gap={2}>
              <Button
                size={{ base: "xs", sm: "sm" }}
                colorScheme="red"
                bgColor="red"
                color="white"
                onClick={onClose}
                isDisabled={editing}
              >
                Cancel
              </Button>
              <Button
                size={{ base: "xs", sm: "sm" }}
                onClick={handleUpdatePost}
                colorScheme="green"
                bgColor="green"
                color="white"
                isLoading={editing}
              >
                Edit
              </Button>
            </Flex>
          </Flex>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
