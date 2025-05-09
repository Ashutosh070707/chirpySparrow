import {
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  Flex,
  Spinner,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import { FiMoreVertical, FiTrash } from "react-icons/fi";
import { FaEdit, FaReply } from "react-icons/fa";
import { useShowToast } from "../../hooks/useShowToast";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import {
  conversationsAtom,
  selectedConversationAtom,
} from "../atoms/messagesAtom";
import { useState } from "react";
import { userPostsAtom } from "../atoms/userPostsAtom";
import { EditPostModal } from "./EditPostModal";
import { replyingToMessageAtom } from "../atoms/replyingToMessageAtom";
import { loggedInUserAtom } from "../atoms/loggedInUserAtom";

export const DeleteConversation = ({ conversation }) => {
  const showToast = useShowToast();
  const setConversations = useSetRecoilState(conversationsAtom);
  const [selectedConversation, setSelectedConversation] = useRecoilState(
    selectedConversationAtom
  );
  const [deleting, setDeleting] = useState(false);

  const handleDeleteConversation = async () => {
    if (deleting) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/messages/${conversation._id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.error) {
        showToast("Error", data.error, "error");
        return;
      }
      setConversations((prevConversations) =>
        prevConversations.filter((c) => c._id !== conversation._id)
      );

      // Clear the selected conversation if it was the one deleted
      if (selectedConversation?._id === conversation._id) {
        setSelectedConversation({
          _id: "",
          userId: "",
          username: "",
          userProfilePic: "",
          name: "",
        });
      }
      showToast("Success", "Conversation deleted successfully", "success");
    } catch (error) {
      showToast("Error", error.message, "error");
    } finally {
      setDeleting(false);
    }
  };
  return (
    <Flex alignItems="center">
      {deleting ? (
        <Flex justifyContent="center" alignItems="center">
          <Spinner size="xs" />
        </Flex>
      ) : (
        <Menu placement="bottom-end">
          <MenuButton
            as={IconButton}
            icon={<FiMoreVertical size={16} />}
            variant="ghost"
            borderRadius="full"
            _hover={{ bg: "transparent" }}
            _active={{ bg: "transparent" }}
            _expanded={{ bg: "transparent" }}
          />
          <MenuList
            w="160px"
            minW="160px"
            p={2}
            borderRadius="lg"
            bg="gray.900"
            boxShadow="lg"
            border="1px solid"
            borderColor="gray.700"
          >
            <MenuItem
              onClick={handleDeleteConversation}
              borderRadius="md"
              px={3}
              py={2}
              bg="gray.900"
              _hover={{ bg: "red.600", color: "white" }}
            >
              <Flex align="center" gap={2}>
                <FiTrash color="white" size={16} />
                <Text fontSize="sm" color="white">
                  Delete
                </Text>
              </Flex>
            </MenuItem>
          </MenuList>
        </Menu>
      )}
    </Flex>
  );
};

export const DeleteMessage = ({ message, selectedConversation, place }) => {
  const showToast = useShowToast();
  const [deleting, setDeleting] = useState(false);
  const [conversations, setConversations] = useRecoilState(conversationsAtom);
  const setReplyingToMessage = useSetRecoilState(replyingToMessageAtom);
  const loggedInUser = useRecoilValue(loggedInUserAtom);

  const handleDeleteMessage = async () => {
    if (deleting) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/messages/delete/message`, {
        method: "DELETE",
        headers: {
          "content-Type": "application/json",
        },
        body: JSON.stringify({
          messageId: message._id,
          selectedConversationId: selectedConversation._id,
          recipientId: selectedConversation.userId,
        }),
      });
      const data = await res.json();
      if (data.error) {
        showToast("Error", data.error, "error");
        return;
      }

      showToast("Success", "Message deleted successfully", "success");
    } catch (error) {
      showToast("Error", error.message, "error");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Flex alignItems="center" justifyContent="center">
      {deleting ? (
        <Flex justifyContent="center" alignItems="center">
          <Spinner size="xs" />
        </Flex>
      ) : (
        <Menu placement={place}>
          <MenuButton
            size="xxs"
            as={IconButton}
            icon={<FiMoreVertical size={16} />}
            variant="ghost"
            aria-label="Options"
            borderRadius="full"
            _hover={{ bg: "transparent" }}
            _active={{ bg: "transparent" }}
            _expanded={{ bg: "transparent" }}
          />
          <MenuList
            w="160px"
            minW="160px"
            p={2}
            borderRadius="lg"
            bg="gray.900"
            boxShadow="lg"
            border="1px solid"
            borderColor="gray.700"
          >
            {message.sender === loggedInUser._id && (
              <MenuItem
                onClick={handleDeleteMessage}
                borderRadius="md"
                px={3}
                py={2}
                bg="gray.900"
                _hover={{ bg: "red.600", color: "white" }}
                transition="all 0.2s ease"
              >
                <Flex align="center" gap={2}>
                  <FiTrash color="white" size={16} />
                  <Text fontSize="sm" color="white">
                    Delete
                  </Text>
                </Flex>
              </MenuItem>
            )}
            <MenuItem
              onClick={() => {
                setReplyingToMessage({
                  sender: message.sender,
                  text: message.text,
                  img: message.img,
                  gif: message.gif,
                });
              }}
              borderRadius="md"
              px={3}
              py={2}
              bg="gray.900"
              _hover={{ bg: "blue.600", color: "white" }}
              transition="all 0.2s ease"
            >
              <Flex align="center" gap={2}>
                <FaReply color="white" size={16} />
                <Text fontSize="sm" color="white">
                  Reply
                </Text>
              </Flex>
            </MenuItem>
          </MenuList>
        </Menu>
      )}
    </Flex>
  );
};

export const PostActions = ({ post }) => {
  const showToast = useShowToast();
  const setPosts = useSetRecoilState(userPostsAtom);
  const [deleting, setDeleting] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleDeletePost = async (e) => {
    if (deleting) return;
    setDeleting(true);
    try {
      if (!window.confirm("Are you sure you want to delete this post?")) return;

      const res = await fetch(`/api/posts/delete/${post._id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.error) {
        showToast("Error", data.error, "error");
        return;
      }
      showToast("Success", "Post deleted successfully", "success");
      setPosts((prevPosts) => prevPosts.filter((p) => p._id !== post._id));
    } catch (error) {
      showToast("Error", error, "error");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Flex alignItems="center">
      {deleting ? (
        <Flex justifyContent="center" alignItems="center">
          <Spinner size="xs" />
        </Flex>
      ) : (
        <Menu placement="bottom-end">
          <MenuButton
            as={IconButton}
            icon={<FiMoreVertical size={16} />}
            variant="ghost"
            aria-label="Options"
            borderRadius="full"
            _hover={{ bg: "transparent" }}
            _active={{ bg: "transparent" }}
            _expanded={{ bg: "transparent" }}
          />
          <MenuList
            w="160px"
            minW="160px"
            p={2}
            borderRadius="lg"
            bg="gray.900"
            boxShadow="lg"
            border="1px solid"
            borderColor="gray.700"
          >
            <MenuItem
              onClick={handleDeletePost}
              borderRadius="md"
              px={3}
              py={2}
              bg="gray.900"
              _hover={{ bg: "red.600", color: "white" }}
            >
              <Flex align="center" gap={2}>
                <FiTrash color="white" size={16} />
                <Text fontSize="sm" color="white">
                  Delete
                </Text>
              </Flex>
            </MenuItem>
            <MenuItem
              onClick={onOpen}
              borderRadius="md"
              px={3}
              py={2}
              bg="gray.900"
              _hover={{ bg: "green.600", color: "white" }}
            >
              <Flex align="center" gap={2}>
                <FaEdit color="white" size={16} />
                <Text fontSize="sm" color="white">
                  Edit
                </Text>
              </Flex>
            </MenuItem>
          </MenuList>
        </Menu>
      )}
      {/* Render the Edit Modal */}
      <EditPostModal post={post} isOpen={isOpen} onClose={onClose} />
    </Flex>
  );
};
