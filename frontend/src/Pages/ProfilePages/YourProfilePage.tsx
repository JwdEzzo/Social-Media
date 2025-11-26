import ProfilePage from "@/Pages/ProfilePages/ProfilePage";

function YourProfilePage() {
  return <ProfilePage isOwnProfile={true} />;
}

export default YourProfilePage;

//
//
//

export function YourProfilePageRouted() {
  return <YourProfilePage />;
}
