import "./App.css";
import { ThemeProvider } from "./components/ThemeProvider";
import ProfilePage from "@/Pages/ProfilePages/ProfilePage";
import { store } from "./store/store";
import { Provider } from "react-redux";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import SignUp from "@/Pages/AuthPages/SignUp";
import Login from "@/Pages/AuthPages/Login";
import { ProtectedRoute } from "./auth/ProtectedRoute";
import EditCredentials from "@/Pages/ProfilePages/EditCredentials";
import EditProfile from "./Pages/ProfilePages/EditProfile";
import HomePage from "./Pages/HomePage/HomePage";
import FollowerList from "./Pages/FollowPages/FollowerList";
import FollowingList from "./Pages/FollowPages/FollowingList";
import SetProfile from "./Pages/ProfilePages/SetProfile";
import EditPost from "./Pages/PostPages/EditPost";

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
              path="/userprofile/:username"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />

            {/* Protected Routes */}
            <Route
              path="/userprofile/:username"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/userprofile/:username"
              element={
                <ProtectedRoute>
                  <ProfilePage />
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
              path="/userprofile/:username/followers"
              element={
                <ProtectedRoute>
                  <FollowerList />
                </ProtectedRoute>
              }
            />

            <Route
              path="/userprofile/:username/following"
              element={
                <ProtectedRoute>
                  <FollowingList />
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
