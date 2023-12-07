"use client";

import { useRouter } from "next/navigation";

// import { MoreHorizontal } from "lucide-react";

// import UserAvatar from "@/components/UserAvatar";
// import useUserInfo from "@/hooks/useUserInfo";

export default function ProfileButton() {
  // const { username, handle } = useUserInfo();
  const router = useRouter();

  return (
    <div className="flex items-center gap-2">
      {/* <div className="w-40 max-lg:hidden">
        <p className="text-sm font-bold">{username ?? "..."}</p>
        <p className="text-sm text-gray-500">{`@${handle}`}</p>
      </div> */}
      <button
        className="h-fit rounded-full p-2.5 text-white bg-green-600 border-2 border-green-700 transition-colors duration-300 hover:bg-green-800"
        // go to home page without any query params to allow the user to change their username and handle
        // see src/components/NameDialog.tsx for more details
        onClick={() => router.push("/")}
      >
        <span>切換使用者</span>        
      </button>
      {/* <UserAvatar /> */}
    </div>
  );
}
