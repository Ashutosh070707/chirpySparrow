import {
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  Flex,
  Spinner,
} from "@chakra-ui/react";
import { FiMoreVertical } from "react-icons/fi";
import { FiTrash } from "react-icons/fi";
import { useShowToast } from "../../hooks/useShowToast";
import { useRecoilState, useSetRecoilState } from "recoil";
import {
  conversationsAtom,
  selectedConversationAtom,
} from "../atoms/messagesAtom";
import { useState } from "react";
import { userPostsAtom } from "../atoms/userPostsAtom";

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
    <Flex>
      {deleting && (
        <Flex justifyContent="center">
          <Spinner size="md"></Spinner>
        </Flex>
      )}
      {!deleting && (
        <Menu>
          <MenuButton
            as={IconButton}
            icon={<FiMoreVertical size={18} />}
            variant="ghost"
            aria-label="Options"
            borderRadius="full"
            _hover={{ bgColor: "transparent" }} // Remove background on hover
            _active={{ bgColor: "transparent" }} // Remove background on click
            _focus={{ bgColor: "transparent" }} // Remove background on focus
          />
          <MenuList w="100px" minW="120px">
            <MenuItem onClick={handleDeleteConversation}>
              <Flex gap={2}>
                <FiTrash color="red" size={20} />
                Delete
              </Flex>
            </MenuItem>
          </MenuList>
        </Menu>
      )}
    </Flex>
  );
};

export const DeleteMessage = ({
  message,
  setMessages,
  selectedConversation,
}) => {
  const showToast = useShowToast();
  const [deleting, setDeleting] = useState(false);
  const [conversations, setConversations] = useRecoilState(conversationsAtom);
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
    <Flex>
      {deleting && (
        <Flex justifyContent="center" alignItems="center">
          <Spinner size="xs"></Spinner>
        </Flex>
      )}
      {!deleting && (
        <Menu>
          <MenuButton
            as={IconButton}
            icon={<FiMoreVertical size={14} />}
            variant="ghost"
            aria-label="Options"
            borderRadius="full"
            _hover={{ bgColor: "transparent" }} // Remove background on hover
            _active={{ bgColor: "transparent" }} // Remove background on click
            _focus={{ bgColor: "transparent" }} // Remove background on focus
          />
          <MenuList w="150px" minW="120px">
            <MenuItem onClick={handleDeleteMessage}>
              <Flex gap={2}>
                <FiTrash color="red" size={20} />
                Delete
              </Flex>
            </MenuItem>
          </MenuList>
        </Menu>
      )}
    </Flex>
  );
};

export const DeletePost = ({ post }) => {
  const showToast = useShowToast();
  const setPosts = useSetRecoilState(userPostsAtom);

  const [deleting, setDeleting] = useState(false);
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
      showToast("Eror", error, "error");
    } finally {
      setDeleting(false);
    }
  };
  return (
    <Flex>
      {deleting && (
        <Flex justifyContent="center">
          <Spinner size="md"></Spinner>
        </Flex>
      )}
      {!deleting && (
        <Menu>
          <MenuButton
            as={IconButton}
            icon={<FiMoreVertical size={20} />}
            variant="ghost"
            aria-label="Options"
            borderRadius="full"
            _hover={{ bgColor: "transparent" }} // Remove background on hover
            _active={{ bgColor: "transparent" }} // Remove background on click
            _focus={{ bgColor: "transparent" }} // Remove background on focus
          />
          <MenuList w="150px" minW="120px">
            <MenuItem onClick={handleDeletePost}>
              <Flex gap={2}>
                <FiTrash color="red" size={20} />
                Delete
              </Flex>
            </MenuItem>
          </MenuList>
        </Menu>
      )}
    </Flex>
  );
};
