import { useSearchUsersByUsernameQuery } from "@/api/users/userApi";
import { ModeToggle } from "@/components/ModeToggle";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import AppSidebar from "@/Pages/HomePage/AppSidebar";

function SearchUsersPage() {
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("q") || "";
  const navigate = useNavigate();

  const {
    data: users,
    isLoading: isSearchedUserLoading,
    isError: isSearchedUserError,
    refetch: refetchUsers,
  } = useSearchUsersByUsernameQuery(searchQuery, {
    skip: !searchQuery,
  });

  function handleUserClick(username: string) {
    navigate(`/searcheduserprofile/${username}`);
  }
  // Loading state
  if (isSearchedUserLoading) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">
                Searching for "{searchQuery}"...
              </p>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  // Error state
  if (isSearchedUserError) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
              <h2 className="text-xl font-bold text-red-500 mb-4">
                Error Loading Search Results
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Failed to search for "{searchQuery}"
              </p>
              <Button onClick={() => refetchUsers()}>
                <RotateCcw className="mr-2 h-4 w-4" /> Try Again
              </Button>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {/* Navbar */}
        <header className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b dark:border-gray-700">
          <div className="flex items-center justify-between p-4">
            <SidebarTrigger className="h-8 w-8" />
            <h1 className="text-4xl tracking-tight font-[GreatVibes] bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
              Social Media
            </h1>
            <ModeToggle />
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 py-10 bg-gray-50 dark:bg-gray-900 transition-colors">
          <div className="max-w-2xl mx-auto px-4">
            {/* Search Header */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Search Results
              </h2>
            </div>

            {/* User Results */}
            {users && users.length > 0 ? (
              <div className="space-y-3">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-gray-200 dark:border-gray-700"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          src={user.profilePictureUrl}
                          alt={user.username}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {user.username}
                          </p>
                          {user.bioText && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1">
                              {user.bioText}
                            </p>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => handleUserClick(user.username)}
                      >
                        View Profile
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
                <p className="text-gray-600 dark:text-gray-400 text-lg">
                  No users found matching "{searchQuery}"
                </p>
                <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">
                  Try searching with a different username
                </p>
              </div>
            )}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default SearchUsersPage;
