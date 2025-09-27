"use client";
import {
  EmployeeDTO,
  EmployeeRequest,
  useCreateEmployeeMutation,
  useUpdateEmployeeMutation,
} from "@/store/employeeApi";
import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

interface Props {
  employee?: EmployeeDTO;
  onSuccess?: () => void;
}

export const EmployeeForm: React.FC<Props> = ({ employee, onSuccess }) => {
  const [form, setForm] = useState<EmployeeRequest>({
    name: employee?.name || "",
    dob: employee?.dob || "",
    gender: employee?.gender || "MALE",
    imageUrl: employee?.imageUrl || "",
    department: employee?.department || "",
    userId: employee?.userId || 0,
  });

  const [createEmployee, { isLoading: creating }] = useCreateEmployeeMutation();
  const [updateEmployee, { isLoading: updating }] = useUpdateEmployeeMutation();

  useEffect(() => {
    if (employee) setForm({ ...form, ...employee });
  }, [employee]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (employee?.id) {
        await updateEmployee({ id: employee.id, data: form }).unwrap();
        toast.success("Employee updated!");
      } else {
        await createEmployee(form).unwrap();
        toast.success("Employee created!");
      }
      onSuccess?.();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to save employee");
    }
  };

  const loading = creating || updating;

  return (
    <form
      onSubmit={handleSubmit}
      className="p-4 bg-gray-100 text-black rounded shadow space-y-3"
    >
      <input
        name="name"
        value={form.name}
        onChange={handleChange}
        placeholder="Name"
        className="border p-2 w-full"
      />
      <input
        name="dob"
        type="date"
        value={form.dob}
        onChange={handleChange}
        className="border p-2 w-full"
      />
      <select
        name="gender"
        value={form.gender}
        onChange={handleChange}
        className="border p-2 w-full"
      >
        <option value="MALE">MALE</option>
        <option value="FEMALE">FEMALE</option>
      </select>
      <input
        name="imageUrl"
        value={form.imageUrl}
        onChange={handleChange}
        placeholder="Image URL"
        className="border p-2 w-full"
      />
      <input
        name="department"
        value={form.department}
        onChange={handleChange}
        placeholder="Department"
        className="border p-2 w-full"
      />
      <input
        name="userId"
        type="number"
        value={form.userId}
        onChange={handleChange}
        placeholder="User ID"
        className="border p-2 w-full"
      />
      <button
        disabled={loading}
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
      >
        {loading ? "Saving..." : employee ? "Update" : "Create"}
      </button>
    </form>
  );
};
