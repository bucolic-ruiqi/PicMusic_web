import Header from "@/components/Header";
import { getUserById } from "@/lib/userRepo";
import { CURRENT_USER_ID } from "@/lib/config";
import ProfileClient from "@/components/ProfileClient";

export default async function ProfilePage() {
  const user = await getUserById(CURRENT_USER_ID);
  const initial = {
    userId: CURRENT_USER_ID,
    username: user?.username || "旅人",
    email: user?.email || "",
  };

  return (
    <div>
      <Header hideAvatar />
      <main className="mx-auto max-w-5xl px-4 pb-24 pt-2 sm:px-6">
        <ProfileClient initial={initial} />
      </main>
    </div>
  );
}
