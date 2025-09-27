"use client";

import { useLogoutMutation } from "@/store/authApi";
import { useRouter } from "next/navigation";

export function LogoutButton() {
  const [logout] = useLogoutMutation();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  return (
    <button
      onClick={handleLogout}
      className="bg-red-500 cursor-pointer hover:bg-red-600 text-white font-semibold px-4 py-2 rounded-lg shadow transition"
    >
      Logout
    </button>
  );
}
