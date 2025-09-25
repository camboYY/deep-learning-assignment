"use client";

import {
  useCreateUserMutation,
  UserDTO,
  UserRequest,
  useUpdateUserMutation,
} from "@/store/userApi";
import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

interface UserFormProps {
  user?: UserDTO; // optional for editing
  onSuccess?: () => void; // callback after create/update
}

export const UserForm: React.FC<UserFormProps> = ({ user, onSuccess }) => {
  const [form, setForm] = useState<UserRequest>({
    name: user?.name || "",
    username: user?.username || "",
    email: user?.email || "",
    password: "",
    phoneNumber: user?.phoneNumber || "",
    roles: user?.roles || [],
  });

  const [createUser, { isLoading: creating, error: createError }] =
    useCreateUserMutation();
  const [updateUser, { isLoading: updating, error: updateError }] =
    useUpdateUserMutation();

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || "",
        username: user.username,
        email: user.email || "",
        password: "",
        phoneNumber: user.phoneNumber || "",
        roles: user.roles || [],
      });
    }
  }, [user]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (user?.id) {
        await updateUser({ id: user.id, data: form }).unwrap();
        toast.success("User updated successfully!");
      } else {
        await createUser(form).unwrap();
        toast.success("User created successfully!");
      }
      onSuccess?.();
      setForm({
        name: "",
        username: "",
        email: "",
        password: "",
        phoneNumber: "",
        roles: [],
      });
    } catch (err) {
      console.error("Error:", err);
      toast.error(err?.data?.message || "Failed to save user");
    }
  };

  const loading = creating || updating;
  const error = createError || updateError;

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">
        {user ? "Edit User" : "Create User"}
      </h2>
      {error && <p className="text-red-500 mb-2">{JSON.stringify(error)}</p>}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-sm font-medium">Name</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border rounded text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Username *</label>
          <input
            type="text"
            name="username"
            value={form.username}
            onChange={handleChange}
            required
            className="mt-1 block w-full px-3 py-2 border rounded text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border rounded text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Phone</label>
          <input
            type="text"
            name="phoneNumber"
            value={form.phoneNumber}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border rounded text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">
            Password {user ? "(leave blank to keep)" : "*"}
          </label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border rounded text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Roles</label>
          <select
            multiple
            name="roles"
            value={form.roles}
            onChange={(e) => {
              const options = Array.from(e.target.selectedOptions).map(
                (o) => o.value
              );
              setForm((prev) => ({ ...prev, roles: options }));
            }}
            className="mt-1 block w-full px-3 py-2 border rounded text-sm"
          >
            {[
              "ROLE_USER",
              "ROLE_ADMIN",
              "ROLE_MODERATOR",
              "ROLE_TEACHER",
              "ROLE_STUDENT",
              "ROLE_PARENT",
            ].map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          {loading ? "Saving..." : user ? "Update" : "Create"}
        </button>
      </form>
    </div>
  );
};
