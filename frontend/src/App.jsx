import { Box, Flex } from "@chakra-ui/react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { UserPage } from "./pages/UserPage";
import { PostPage } from "./pages/PostPage";
import { HomePage } from "./pages/HomePage.jsx";
import { AuthPage } from "./pages/AuthPage.jsx";
import "./index.css";
import { useRecoilValue } from "recoil";
import { loggedInUserAtom } from "./atoms/loggedInUserAtom.js";
import { UpdateProfilePage } from "./pages/UpdateProfilePage.jsx";
import { ChatPage } from "./pages/ChatPage.jsx";
import { Sidebar } from "./components/Sidebar.jsx";
import { SettingsPage } from "./pages/SettingsPage.jsx";
import { FreezeAccount } from "./pages/FreezeAccountPage.jsx";
import { FollowersPage } from "./pages/FollowersPage.jsx";
import { FollowingPage } from "./pages/FollowingPage.jsx";
import { CreatePostPage } from "./pages/CreatePostPage.jsx";
import { SearchUserPage } from "./pages/SearchUserPage.jsx";

function App() {
  const loggedInUser = useRecoilValue(loggedInUserAtom);
  // const { pathname } = useLocation();

  return (
    <>
      <Box>
        <Flex direction="row" spacing={4}>
          <Box w={loggedInUser ? "16%" : "0"}>
            {loggedInUser && <Sidebar />}
          </Box>
          <Box w={loggedInUser ? "84%" : "full"} alignItems="center">
            <Routes>
              <Route
                path="/"
                element={loggedInUser ? <HomePage /> : <Navigate to="/auth" />}
              ></Route>
              <Route
                path="/auth"
                element={!loggedInUser ? <AuthPage /> : <Navigate to="/" />}
              ></Route>
              <Route
                path="/update"
                element={
                  loggedInUser ? <UpdateProfilePage /> : <Navigate to="/auth" />
                }
              ></Route>
              <Route
                path="/:username"
                element={loggedInUser ? <UserPage /> : <Navigate to="/auth" />}
              ></Route>
              <Route
                path="/search"
                element={
                  loggedInUser ? <SearchUserPage /> : <Navigate to="/auth" />
                }
              ></Route>
              <Route
                path="/create"
                element={
                  loggedInUser ? <CreatePostPage /> : <Navigate to={"/auth"} />
                }
              ></Route>

              <Route path="/:username/post/:pid" element={<PostPage />}></Route>
              <Route
                path="/chat"
                element={
                  loggedInUser ? <ChatPage /> : <Navigate to={"/auth"} />
                }
              ></Route>
              <Route
                path="/settings"
                element={
                  loggedInUser ? <SettingsPage /> : <Navigate to={"/auth"} />
                }
              ></Route>
              <Route
                path="/followers"
                element={
                  loggedInUser ? <FollowersPage /> : <Navigate to="/auth" />
                }
              ></Route>
              <Route
                path="/following"
                element={
                  loggedInUser ? <FollowingPage /> : <Navigate to="/auth" />
                }
              ></Route>
              <Route
                path="/freeze"
                element={
                  loggedInUser ? <FreezeAccount /> : <Navigate to={"/auth"} />
                }
              ></Route>
            </Routes>
          </Box>
        </Flex>
      </Box>
    </>
  );
}

export default App;
