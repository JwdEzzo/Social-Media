import "./App.css";
import { ThemeProvider } from "./components/ThemeProvider";
import { store } from "./store/store";
import { Provider } from "react-redux";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import SignUp from "@/Pages/AuthPages/SignUp";
import Login from "@/Pages/AuthPages/Login";
import { ProtectedRoute } from "./auth/ProtectedRoute";
import EditCredentials from "@/Pages/ProfilePages/EditCredentials";
import EditProfile from "./Pages/ProfilePages/EditProfile";
import HomePage from "./Pages/HomePage/HomePage";
import SetProfile from "./Pages/ProfilePages/SetProfile";
import EditPost from "./Pages/PostPages/EditPost";
import SearchPostPage from "@/Pages/SearchPages/SearchPostPage";
import { UserProfilePageRouted } from "@/Pages/ProfilePages/UserProfilePage";
import { YourProfilePageRouted } from "@/Pages/ProfilePages/YourProfilePage";
import SearchUsersPage from "./Pages/SearchPages/SearchUsersPage";
import { YourFollowerListRouted } from "./Pages/FollowPages/Followers/YourFollowerList";
import { UserFollowerListRouted } from "./Pages/FollowPages/Followers/UserFollowerList";
import { UserFollowingListRouted } from "./Pages/FollowPages/Followings/UserFollowingList";
import { YourFollowingListRouted } from "./Pages/FollowPages/Followings/YourFollowingList";

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Provider store={store}>
        <BrowserRouter>
          <Routes>
            {/* Unprotected Routes */}
            <Route path="/" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />

            <Route
              path="/search/posts"
              element={
                <ProtectedRoute>
                  <SearchPostPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/search/users"
              element={
                <ProtectedRoute>
                  <SearchUsersPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/searcheduserprofile/:searchedUsername"
              element={<UserProfilePageRouted />}
            />

            {/* Protected Routes */}
            <Route
              path="/userprofile/:username"
              element={
                <ProtectedRoute>
                  <YourProfilePageRouted />
                </ProtectedRoute>
              }
            />

            <Route
              path="/userprofile/:username/edit-credentials"
              element={
                <ProtectedRoute>
                  <EditCredentials />
                </ProtectedRoute>
              }
            />
            <Route
              path="/userprofile/:username/edit-profile"
              element={
                <ProtectedRoute>
                  <EditProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/userprofile/:username/set-profile"
              element={
                <ProtectedRoute>
                  <SetProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/home/:username"
              element={
                <ProtectedRoute>
                  <HomePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/userprofile/:username/yourfollowers"
              element={
                <ProtectedRoute>
                  <YourFollowerListRouted />
                </ProtectedRoute>
              }
            />

            <Route
              path="/userprofile/:username/userfollowers"
              element={
                <ProtectedRoute>
                  <UserFollowerListRouted />
                </ProtectedRoute>
              }
            />

            <Route
              path="/userprofile/:username/yourfollowings"
              element={
                <ProtectedRoute>
                  <YourFollowingListRouted />
                </ProtectedRoute>
              }
            />
            <Route
              path="/userprofile/:username/userfollowings"
              element={
                <ProtectedRoute>
                  <UserFollowingListRouted />
                </ProtectedRoute>
              }
            />

            <Route
              path="/userprofile/:username/post/edit/:postId"
              element={
                <ProtectedRoute>
                  <EditPost />
                </ProtectedRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </Provider>
    </ThemeProvider>
  );
}

export default App;
