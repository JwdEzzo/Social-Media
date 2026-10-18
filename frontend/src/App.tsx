import "./App.css";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { store } from "./store/store";
import { Provider } from "react-redux";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "@/Pages/AuthPages/Login";
import { ProtectedRoute } from "./auth/ProtectedRoute";
import EditCredentials from "@/Pages/ProfilePages/EditCredentials";
import EditProfile from "./Pages/ProfilePages/EditProfile";
import HomePage from "./Pages/HomePage/HomePage";
import SetProfile from "./Pages/ProfilePages/SetProfile";
import EditPost from "./Pages/PostPages/EditPost";
import { UserProfilePageRouted } from "@/Pages/ProfilePages/UserProfilePage";
import { YourProfilePageRouted } from "@/Pages/ProfilePages/YourProfilePage";
import { YourFollowerListRouted } from "./Pages/FollowPages/Followers/YourFollowerList";
import { UserFollowerListRouted } from "./Pages/FollowPages/Followers/UserFollowerList";
import { UserFollowingListRouted } from "./Pages/FollowPages/Followings/UserFollowingList";
import { YourFollowingListRouted } from "./Pages/FollowPages/Followings/YourFollowingList";
import NotificationPage from "@/Pages/NotificationPages/NotificationPage";
import SignUp from "./Pages/AuthPages/SignUp";
import Layout from "@/components/sidebar/layout";
import SearchPage from "./Pages/SearchPages/SearchPage";

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Provider store={store}>
        <BrowserRouter>
          <Routes>
            {/* Unprotected Routes */}
            <Route path="/" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />

            {/* Everything below renders inside the sidebar layout */}
            <Route element={<Layout />}>
              {/* Public, but still shows the sidebar */}
              <Route
                path="/searcheduserprofile/:searchedUsername"
                element={<UserProfilePageRouted />}
              />

              {/* Protected Routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/search" element={<SearchPage />} />

                <Route path="/notifications" element={<NotificationPage />} />

                <Route
                  path="/userprofile/:username"
                  element={<YourProfilePageRouted />}
                />

                <Route
                  path="/userprofile/:username/edit-credentials"
                  element={<EditCredentials />}
                />
                <Route
                  path="/userprofile/:username/edit-profile"
                  element={<EditProfile />}
                />
                <Route
                  path="/userprofile/:username/set-profile"
                  element={<SetProfile />}
                />
                <Route path="/home/:username" element={<HomePage />} />
                <Route
                  path="/userprofile/:username/yourfollowers"
                  element={<YourFollowerListRouted />}
                />

                <Route
                  path="/userprofile/:username/userfollowers"
                  element={<UserFollowerListRouted />}
                />

                <Route
                  path="/userprofile/:username/yourfollowings"
                  element={<YourFollowingListRouted />}
                />
                <Route
                  path="/userprofile/:username/userfollowings"
                  element={<UserFollowingListRouted />}
                />

                <Route
                  path="/userprofile/:username/post/edit/:postId"
                  element={<EditPost />}
                />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </Provider>
    </ThemeProvider>
  );
}

export default App;
