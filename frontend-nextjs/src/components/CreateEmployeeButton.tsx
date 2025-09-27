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
      className="bg-green-500 cursor-pointer hover:bg-green-600 text-white font-semibold px-4 py-2 rounded-lg shadow transition"
    >
      Create Employee
    </button>
  );
}
