// import { Box, Flex, Spinner, Text } from "@chakra-ui/react";
// import React, { useEffect, useState } from "react";

// import { Post } from "../components/Post.jsx";
// import { useRecoilState } from "recoil";
// import { feedPostsAtom } from "../atoms/feedPostsAtom.js";
// import { useShowToast } from "../../hooks/useShowToast.js";

// export const HomePage = () => {
//   const [feedPosts, setFeedPosts] = useRecoilState(feedPostsAtom);
//   const [loading, setLoading] = useState(true);
//   const showToast = useShowToast();

//   useEffect(() => {
//     const getFeedPosts = async () => {
//       setFeedPosts([]);
//       try {
//         const res = await fetch("/api/posts/feed");
//         const data = await res.json();
//         if (data.error) {
//           showToast("Error", data.error, "error");
//           return;
//         }
//         console.log(data);
//         setFeedPosts(data);
//       } catch (error) {
//         showToast("Error", error, "error");
//       } finally {
//         setLoading(false);
//       }
//     };
//     getFeedPosts();
//   }, [showToast, loading]);

//   return (
//     <Flex
//       justifyContent={"center"}
//       w={"full"}
//       alignItems="center"
//       minHeight="100vh"
//     >
//       <Box w={"40%"} alignItems="center" mt="2%">
//         <Box>
//           {loading && (
//             <Flex justifyContent="center" alignItems="center">
//               <Spinner size="xl"></Spinner>
//             </Flex>
//           )}

//           {!loading && feedPosts.length === 0 && (
//             <Flex justifyContent={"center"} alignItems="center">
//               <Text fontSize="2xl">"Follow some users to see the feed"</Text>
//             </Flex>
//           )}

//           {!loading &&
//             feedPosts.length !== 0 &&
//             feedPosts.map((post) => (
//               <Box key={post._id}>
//                 <Post post={post} postedBy={post.postedBy}></Post>
//               </Box>
//             ))}
//         </Box>
//       </Box>
//     </Flex>
//   );
// };

import { Box, Flex, Spinner, Text } from "@chakra-ui/react";
import React, { useEffect, useRef, useState } from "react";
import { Post } from "../components/Post.jsx";
import { useRecoilState } from "recoil";
import { useShowToast } from "../../hooks/useShowToast.js";
import { feedPostsAtom } from "../atoms/feedPostsAtom.js";
import { debounce } from "lodash"; // Import debounce

export const HomePage = () => {
  const [feedPosts, setFeedPosts] = useRecoilState(feedPostsAtom);
  const [loading, setLoading] = useState(true);
  const showToast = useShowToast();

  const getFeedPosts = async (pageNumber) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/posts/feed`);
      const data = await res.json();
      if (data.error) {
        showToast("Error", data.error, "error");
        return;
      }

      setFeedPosts(data);
    } catch (error) {
      showToast("Error", error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getFeedPosts();
  }, []);

  return (
    <Flex
      justifyContent={"center"}
      w={"full"}
      alignItems="center"
      minHeight="100vh"
    >
      <Box w={"40%"} alignItems="center" mt="2%">
        <Box>
          {feedPosts.length === 0 && !loading && (
            <Flex justifyContent={"center"} alignItems="center">
              <Text fontSize="2xl">"Follow some users to see the feed"</Text>
            </Flex>
          )}

          {!loading &&
            feedPosts.length > 0 &&
            feedPosts.map((post, index) => (
              <Box key={post._id}>
                <Post post={post} postedBy={post.postedBy} />
              </Box>
            ))}

          {loading && (
            <Flex justifyContent="center" alignItems="center" mt={4}>
              <Spinner size="xl" />
            </Flex>
          )}
        </Box>
      </Box>
    </Flex>
  );
};
