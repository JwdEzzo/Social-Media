import ProfilePage from "@/Pages/ProfilePages/ProfilePage";

function UserProfilePage() {
  return <ProfilePage isOwnProfile={false} />;
}

export default UserProfilePage;

//
//
//

export function UserProfilePageRouted() {
  return <UserProfilePage />;
}
