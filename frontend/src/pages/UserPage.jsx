import { useParams } from "react-router-dom";
import { UserHeader } from "../components/UserHeader";
import { useEffect, useState } from "react";

import { Box, Flex, Spinner, Text } from "@chakra-ui/react";
import { Post } from "../components/Post";
import { useGetUserProfile } from "../../hooks/useGetUserProfile";
import { useRecoilState, useRecoilValue } from "recoil";
import { useShowToast } from "../../hooks/useShowToast";
import { userPostsAtom } from "../atoms/userPostsAtom";
import { loggedInUserAtom } from "../atoms/loggedInUserAtom";

export const UserPage = () => {
  const { username } = useParams();
  const { searchedUser, loading } = useGetUserProfile(username);

  const showToast = useShowToast();
  const [userPosts, setUserPosts] = useRecoilState(userPostsAtom);
  const [fetchingPost, setFetchingPost] = useState(false);

  useEffect(() => {
    const getUserPosts = async () => {
      if (!searchedUser) {
        setFetchingPost(false);
        return;
      }
      setFetchingPost(true);
      try {
        const res = await fetch(`/api/posts/user/${searchedUser.username}`);
        const data = await res.json();
        if (data.error) {
          showToast("Error", data.error, "error");
          return;
        }
        setUserPosts(data);
      } catch (error) {
        showToast("Error", error, "error");
        setUserPosts([]);
      } finally {
        setFetchingPost(false);
      }
    };

    if (!loading && searchedUser) {
      getUserPosts();
    }
  }, [searchedUser, showToast, setUserPosts]);

  if (loading) {
    return (
      <Flex justifyContent={"center"} alignItems="center" w="full" h="100vh">
        <Spinner size="xl" />
      </Flex>
    );
  }
  if (!searchedUser && !loading) {
    return (
      <Flex w="full" h="100vh" justifyContent="center" alignItems="center">
        <Text fontSize="2xl">"User not found"</Text>
      </Flex>
    );
  }

  return (
    <Flex
      w="full"
      justifyContent="center"
      alignItems="center"
      direction="column"
    >
      <Box
        w={{ base: "40%", sm: "80%", md: "60%", lg: "60%", xl: "42%" }}
        mt="2%"
      >
        <UserHeader searchedUser={searchedUser} />
      </Box>
      <Box
        m="2%"
        w={{ base: "40%", sm: "80%", md: "60%", lg: "60%", xl: "42%" }}
      >
        <Box w="full" h="1px" border="1px solid white" mt="3%" mb="2%"></Box>
        <Flex w="full" justifyContent={"center"}>
          <Text fontWeight="bold" fontSize={"md"}>
            Posts
          </Text>
        </Flex>
        <Box w="full" h="1px" border="1px solid white" mt="2%" mb="3%"></Box>
      </Box>
      <Flex
        justifyContent={"center"}
        w={{ base: "40%", sm: "80%", md: "60%", lg: "60%", xl: "42%" }}
        direction="column"
      >
        {fetchingPost && (
          <Flex>
            <Spinner size="lg"></Spinner>
          </Flex>
        )}

        {!fetchingPost && userPosts.length === 0 && (
          <Flex justifyContent="center" alignItems="center" w="full">
            <Text
              fontSize={{
                base: "2xl",
                sm: "lg",
                md: "xl",
                lg: "2xl",
                xl: "2xl",
              }}
              color="gray.400"
            >
              "Ready to make your first post"
            </Text>
          </Flex>
        )}

        {!fetchingPost &&
          userPosts.length > 0 &&
          userPosts.map((post) => (
            <Box key={post._id}>
              <Post post={post} postedBy={post.postedBy}></Post>
            </Box>
          ))}
      </Flex>
    </Flex>
  );
};

/////////////////////////////////////////////////////////////////////////////  Lazy loading feature - not working properly

// import { useParams } from "react-router-dom";
// import { UserHeader } from "../components/UserHeader";
// import { useEffect, useState, useRef, useCallback } from "react";
// import { Box, Flex, Spinner, Text } from "@chakra-ui/react";
// import { Post } from "../components/Post";
// import { useGetUserProfile } from "../../hooks/useGetUserProfile";
// import { useRecoilState } from "recoil";
// import { useShowToast } from "../../hooks/useShowToast";
// import { userPostsAtom } from "../atoms/userPostsAtom";

// export const UserPage = () => {
//   const { username } = useParams();
//   const { searchedUser, loading } = useGetUserProfile(username);
//   const showToast = useShowToast();
//   const [userPosts, setUserPosts] = useRecoilState(userPostsAtom);
//   const [initialLoading, setInitialLoading] = useState(true);
//   const [page, setPage] = useState(1);
//   const [loadingPosts, setLoadingPosts] = useState(false);
//   const [hasMore, setHasMore] = useState(true);
//   const observer = useRef();
//   const POSTS_PER_PAGE = 2; // Number of posts per page

//   const lastPostElementRef = useCallback(
//     (node) => {
//       if (loadingPosts) return;
//       if (observer.current) observer.current.disconnect();

//       observer.current = new IntersectionObserver((entries) => {
//         if (entries[0].isIntersecting && hasMore) {
//           setPage((prevPage) => prevPage + 1);
//         }
//       });

//       if (node) observer.current.observe(node);
//     },
//     [loadingPosts, hasMore]
//   );

//   const fetchUserPosts = async (pageNum) => {
//     if (pageNum === 1) setInitialLoading(true);
//     else setLoadingPosts(true);

//     try {
//       const res = await fetch(
//         `/api/posts/user/${username}?page=${pageNum}&limit=${POSTS_PER_PAGE}`
//       );
//       const data = await res.json();

//       if (data.error) {
//         showToast("Error", data.error, "error");
//         return;
//       }

//       if (data.length < POSTS_PER_PAGE) {
//         setHasMore(false);
//       }

//       if (pageNum === 1) {
//         setUserPosts(data);
//       } else {
//         setUserPosts((prev) => [...prev, ...data]);
//       }
//     } catch (error) {
//       showToast("Error", error.message, "error");
//     } finally {
//       setInitialLoading(false);
//       setLoadingPosts(false);
//     }
//   };

//   useEffect(() => {
//     setUserPosts([]);
//     setPage(1);
//     setHasMore(true);
//     setInitialLoading(true);
//   }, [username, setUserPosts]);

//   useEffect(() => {
//     if (searchedUser) {
//       fetchUserPosts(page);
//     }
//   }, [searchedUser, page]);

//   if (loading) {
//     return (
//       <Flex justifyContent={"center"} alignItems="center" w="full" h="100vh">
//         <Spinner size="xl" />
//       </Flex>
//     );
//   }

//   if (!searchedUser && !loading) {
//     return (
//       <Flex w="full" h="100vh" justifyContent="center" alignItems="center">
//         <Text fontSize="2xl">User not found</Text>
//       </Flex>
//     );
//   }

//   return (
//     <Flex
//       w="full"
//       justifyContent="center"
//       alignItems="center"
//       direction="column"
//     >
//       <Box w={{ base: "40%", sm: "80%", md: "60%", lg: "60%", xl: "42%" }}>
//         <UserHeader searchedUser={searchedUser} />
//       </Box>
//       <Box
//         m="2%"
//         w={{ base: "40%", sm: "80%", md: "60%", lg: "60%", xl: "42%" }}
//       >
//         <Box w="full" h="1px" border="1px solid white" mt="3%" mb="2%"></Box>
//         <Flex w="full" justifyContent={"center"}>
//           <Text fontWeight="bold" fontSize={"md"}>
//             Posts
//           </Text>
//         </Flex>
//         <Box w="full" h="1px" border="1px solid white" mt="2%" mb="3%"></Box>
//       </Box>
//       <Flex
//         justifyContent={"center"}
//         w={{ base: "40%", sm: "80%", md: "60%", lg: "60%", xl: "42%" }}
//         direction="column"
//       >
//         {userPosts.length === 0 && !initialLoading && (
//           <Flex justifyContent="center" alignItems="center" w="full">
//             <Text fontSize="2xl">"Ready to make your first post"</Text>
//           </Flex>
//         )}

//         {userPosts.length > 0 &&
//           userPosts.map((post, index) => {
//             if (userPosts.length === index + 1) {
//               return (
//                 <Box ref={lastPostElementRef} key={post._id}>
//                   <Post post={post} postedBy={post.postedBy} />
//                 </Box>
//               );
//             } else {
//               return (
//                 <Box key={post._id}>
//                   <Post post={post} postedBy={post.postedBy} />
//                 </Box>
//               );
//             }
//           })}

//         {initialLoading && (
//           <Flex justifyContent="center" alignItems="center" mt={4}>
//             <Spinner size="xl" />
//           </Flex>
//         )}

//         {loadingPosts && !initialLoading && hasMore && (
//           <Flex justifyContent="center" alignItems="center" mt={4}>
//             <Spinner
//               size={{ base: "md", sm: "sm", md: "md", lg: "md", xl: "md" }}
//             />
//           </Flex>
//         )}
//       </Flex>
//     </Flex>
//   );
// };
