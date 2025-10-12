"use client";

import {
  EmployeeDTO,
  useDeleteEmployeeMutation,
  useGetEmployeesQuery,
} from "@/store/employeeApi";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { EmployeeForm } from "./EmployeeForm";

export const EmployeeTable: React.FC = () => {
  const router = useRouter();
  const [page, setPage] = useState(0);
  const [searchName, setSearchName] = useState("");
  const [editing, setEditing] = useState<EmployeeDTO | null>(null);
  const [creating, setCreating] = useState(false);

  const { data, isLoading, refetch } = useGetEmployeesQuery({
    page,
    size: 5,
    name: searchName,
  });
  const [deleteEmployee] = useDeleteEmployeeMutation();

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure?")) return;
    try {
      await deleteEmployee(id).unwrap();
      toast.success("Employee deleted!");
      refetch();
    } catch {
      toast.error("Failed to delete");
    }
  };

  // Reset to first page whenever search changes
  useEffect(() => {
    setPage(0);
  }, [searchName]);

  if (isLoading) return <p>Loading...</p>;

  return (
    <div className="space-y-4 bg-gray-100 text-black rounded-lg p-4">
      {/* Create button */}
      {!editing && !creating && (
        <button
          onClick={() => setCreating(true)}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Create Employee
        </button>
      )}

      {/* Employee form for editing or creating */}
      {(editing || creating) && (
        <EmployeeForm
          employee={editing || undefined}
          onSuccess={() => {
            setEditing(null);
            setCreating(false);
            refetch();
          }}
        />
      )}

      {/* Search input */}
      <div className="flex items-center justify-between">
        <input
          type="text"
          placeholder="Search by name..."
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
          className="px-3 py-2 border rounded w-full md:w-1/3"
        />
        <button
          onClick={() => router.push("/home")}
          className="px-4 py-2 cursor-pointer bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Back to dashboard
        </button>
      </div>

      <table className="w-full border-collapse border">
        <thead>
          <tr>
            <th className="border p-2">ID</th>
            <th className="border p-2">Name</th>
            <th className="border p-2">DOB</th>
            <th className="border p-2">Gender</th>
            <th className="border p-2">Department</th>
            <th className="border p-2">User ID</th>
            <th className="border p-2">Image</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {data?.content.map((emp) => (
            <tr key={emp.id}>
              <td className="border p-2">{emp.id}</td>
              <td className="border p-2">{emp.name}</td>
              <td className="border p-2">{emp.dob}</td>
              <td className="border p-2">{emp.gender}</td>
              <td className="border p-2">{emp.department}</td>
              <td className="border p-2">{emp.userId}</td>
              <td className="border p-2">
                <img
                  className="w-20 h-20 rounded-full"
                  src={emp.imageUrl}
                  alt="Image"
                />
              </td>
              <td className="border p-2 space-x-2">
                <button
                  className="bg-blue-600 text-white px-2 py-1 rounded"
                  onClick={() => setEditing(emp)}
                >
                  Edit
                </button>
                <button
                  className="bg-red-600 text-white px-2 py-1 rounded"
                  onClick={() => handleDelete(emp.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-4 space-x-2">
        <button
          disabled={page === 0}
          onClick={() => setPage(page - 1)}
          className="px-3 py-1 border rounded"
        >
          Previous
        </button>
        <button
          disabled={(data?.content.length ?? 0) < 5}
          onClick={() => setPage(page + 1)}
          className="px-3 py-1 border rounded"
        >
          Next
        </button>
      </div>
    </div>
  );
};
