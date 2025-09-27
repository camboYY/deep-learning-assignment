"use client";

import { UserForm } from "@/components";
import { useGetUsersQuery, UserDTO } from "@/store/userApi";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function UsersPage() {
  const router = useRouter();
  const { data: users, isLoading, error } = useGetUsersQuery();
  const [selectedUser, setSelectedUser] = useState<UserDTO | undefined>(
    undefined
  );

  if (isLoading) return <p className="p-4">Loading...</p>;
  if (error) return <p className="p-4 text-red-500">Failed to load users.</p>;

  return (
    <div className="min-h-screen p-6 text-black bg-gray-50">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User List */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow p-4">
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <h2 className="text-xl font-bold mb-4">Users</h2>
            <button
              onClick={() => router.push("/home")}
              className="px-4 py-2 bg-blue-500 cursor-pointer hover:bg-blue-600 text-white rounded mb-4"
            >
              Back to Dashboard
            </button>
          </div>
          <table className="table-auto w-full border border-gray-200">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 border">ID</th>
                <th className="px-4 py-2 border">Name</th>
                <th className="px-4 py-2 border">Username</th>
                <th className="px-4 py-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users?.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 border">{u.id}</td>
                  <td className="px-4 py-2 border">{u.name}</td>
                  <td className="px-4 py-2 border">{u.username}</td>
                  <td className="px-4 py-2 border space-x-2">
                    <button
                      onClick={() => setSelectedUser(u)}
                      className="px-2 py-1 bg-yellow-400 rounded text-sm"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* User Form */}
        <div>
          <UserForm
            user={selectedUser}
            onSuccess={() => {
              setSelectedUser(undefined);
            }}
          />
        </div>
      </div>
    </div>
  );
}
