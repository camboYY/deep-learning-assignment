"use client";

import { useRouter } from "next/navigation";

export function CreateEmployeeButton() {
  const router = useRouter();

  const handleCreateUser = () => {
    router.push("/employees");
  };

  return (
    <button
      onClick={handleCreateUser}
      className="bg-blue-300 cursor-pointer hover:bg-blue-400 text-white font-semibold px-4 py-2 rounded-lg shadow transition"
    >
      Create Employee
    </button>
  );
}
