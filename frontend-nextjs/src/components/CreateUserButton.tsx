"use client";

import { useRouter } from "next/navigation";

export function CreateUserButton() {
  const router = useRouter();

  const handleCreateUser = () => {
    router.push("/users");
  };

  return (
    <button
      onClick={handleCreateUser}
      className="bg-blue-500 cursor-pointer hover:bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg shadow transition"
    >
      Create User
    </button>
  );
}
