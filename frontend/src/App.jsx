//Description:
// This contains/renders sidebar + Other pages (when loggedInUser is not null) and AuthPage (when loggedInUser is null).
// Also contains all the routes and which page to show at that route of our application.

import { Box, Flex } from "@chakra-ui/react";
import { Navigate, Route, Routes } from "react-router-dom";
import { UserPage } from "./pages/UserPage";
import { PostPage } from "./pages/PostPage";
import { AuthPage } from "./pages/AuthPage.jsx";
import "./index.css";
import { useRecoilValue } from "recoil";
import { loggedInUserAtom } from "./atoms/loggedInUserAtom.js";
import { UpdateProfilePage } from "./pages/UpdateProfilePage.jsx";
import { ChatPage } from "./pages/ChatPage.jsx";
import { Sidebar } from "./components/Sidebar.jsx";
import { SettingsPage } from "./pages/SettingsPage.jsx";
import { FreezeAccountPage } from "./pages/FreezeAccountPage.jsx";
import { FollowersPage } from "./pages/FollowersPage.jsx";
import { FollowingPage } from "./pages/FollowingPage.jsx";
import { CreatePostPage } from "./pages/CreatePostPage.jsx";
import { SearchUserPage } from "./pages/SearchUserPage.jsx";
import { HomePage } from "./pages/HomePage.jsx";
import { DeleteAccountPage } from "./pages/DeleteAccountPage.jsx";

function App() {
  const loggedInUser = useRecoilValue(loggedInUserAtom);

  return (
    <>
      <Box h="100vh" overflow="hidden">
        <Flex>
          {loggedInUser && (
            <Box
              minW={{ base: "12%", sm: "10%", md: "10%", lg: "18%", xl: "16%" }}
              overflowY="auto"
              className="custom-scrollbar"
            >
              <Sidebar />
            </Box>
          )}
          <Box
            h="100vh"
            overflowY="auto"
            flex={1}
            className="custom-scrollbar"
            bg="black"
          >
            <Routes>
              <Route
                path="/"
                element={loggedInUser ? <HomePage /> : <Navigate to="/auth" />}
              />
              <Route
                path="/auth"
                element={!loggedInUser ? <AuthPage /> : <Navigate to="/" />}
              />
              <Route
                path="/update"
                element={
                  loggedInUser ? <UpdateProfilePage /> : <Navigate to="/auth" />
                }
              />
              <Route
                path="/:username"
                element={loggedInUser ? <UserPage /> : <Navigate to="/auth" />}
              />
              <Route
                path="/search"
                element={
                  loggedInUser ? <SearchUserPage /> : <Navigate to="/auth" />
                }
              />
              <Route
                path="/create"
                element={
                  loggedInUser ? <CreatePostPage /> : <Navigate to={"/auth"} />
                }
              />
              <Route
                path="/:username/post/:pid"
                element={
                  loggedInUser ? <PostPage /> : <Navigate to={"/auth"} />
                }
              />
              <Route
                path="/chat"
                element={
                  loggedInUser ? <ChatPage /> : <Navigate to={"/auth"} />
                }
              />
              <Route
                path="/settings"
                element={
                  loggedInUser ? <SettingsPage /> : <Navigate to={"/auth"} />
                }
              />
              <Route
                path="/followers"
                element={
                  loggedInUser ? <FollowersPage /> : <Navigate to="/auth" />
                }
              />
              <Route
                path="/following"
                element={
                  loggedInUser ? <FollowingPage /> : <Navigate to="/auth" />
                }
              />
              <Route
                path="/freeze"
                element={
                  loggedInUser ? (
                    <FreezeAccountPage />
                  ) : (
                    <Navigate to={"/auth"} />
                  )
                }
              />
              <Route
                path="/delete"
                element={
                  loggedInUser ? <DeleteAccountPage /> : <Navigate to="/auth" />
                }
              />
              <Route
                path="*"
                element={loggedInUser ? <HomePage /> : <Navigate to="/auth" />}
              />
            </Routes>
          </Box>
        </Flex>
      </Box>
    </>
  );
}

export default App;
