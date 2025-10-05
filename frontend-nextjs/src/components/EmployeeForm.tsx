"use client";
import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import {
  EmployeeDTO,
  EmployeeRequest,
  useCreateEmployeeMutation,
  useUpdateEmployeeMutation,
} from "@/store/employeeApi";
import { useEnrollFaceMutation } from "@/store/faceApi"; // ✅ Import the correct hook

interface Props {
  employee?: EmployeeDTO;
  onSuccess?: () => void;
}

type FormState = {
  name: string;
  dob: string; // yyyy-mm-dd
  gender: "MALE" | "FEMALE";
  department: string;
  userIdStr: string;
  files: File[];
};

export const EmployeeForm: React.FC<Props> = ({ employee, onSuccess }) => {
  const [form, setForm] = useState<FormState>({
    name: employee?.name ?? "",
    dob: employee?.dob ?? "",
    gender: (employee?.gender as "MALE" | "FEMALE") ?? "MALE",
    department: employee?.department ?? "",
    userIdStr: employee?.userId != null ? String(employee.userId) : "",
    files: [],
  });

  const [createEmployee, { isLoading: creating }] = useCreateEmployeeMutation();
  const [updateEmployee, { isLoading: updating }] = useUpdateEmployeeMutation();
  const [enrollFace] = useEnrollFaceMutation(); // ✅ The real mutation function

  useEffect(() => {
    if (!employee) return;
    setForm({
      name: employee.name ?? "",
      dob: employee.dob ?? "",
      gender: (employee.gender as "MALE" | "FEMALE") ?? "MALE",
      department: employee.department ?? "",
      userIdStr: employee.userId != null ? String(employee.userId) : "",
      files: [],
    });
  }, [employee]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if (name === "userId") {
      setForm((p) => ({ ...p, userIdStr: value }));
    } else {
      setForm((p) => ({ ...p, [name]: value }));
    }
  };

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    setForm((p) => ({ ...p, files }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    const userId = form.userIdStr.trim() === "" ? undefined : Number(form.userIdStr);
  
    if (userId != null && Number.isNaN(userId)) {
      toast.error("User ID must be a number");
      return;
    }
  
    const base: EmployeeRequest = {
      name: form.name,
      dob: form.dob,
      gender: form.gender,
      department: form.department || undefined,
      imageUrl: "",
      userId: userId ?? 0,
    };
  
    try {
      // Send FormData with real files
  
      if (employee?.id) {
        await updateEmployee({ id: employee.id, data: base }).unwrap();
        toast.success("Employee updated!");
      } else {

        if (form.files.length > 0) {
          const enrollForm = new FormData();
          enrollForm.append("id", String(userId ?? 0));
          enrollForm.append("deny_if_exists", "true");
          enrollForm.append("prevent_duplicate_face", "true");
          enrollForm.append("threshold", "0.7");
          enrollForm.append("enforce_same_person", "true");
          enrollForm.append("intra_threshold", "0.55");
    
          form.files.forEach((file) => {
            enrollForm.append("imageBase64", file); // Field must match backend
          });
    
          const r = await enrollFace(enrollForm).unwrap();

          if(r.status == "scheduled") {
            await createEmployee(base).unwrap();
            toast.success("Employee created!");
          }else {
            toast.error(`${r.message}`);
            throw new Error(`${r.message}`);

          }
          
        }

        
      }
  
      onSuccess?.();
    } catch (err: any) {

      console.error("Submit error:", err);
      toast.error(err?.data?.detail || err?.data?.message || "Failed to save employee");
    }
  };
  

  const loading = creating || updating;

  return (
    <form
      onSubmit={handleSubmit}
      className="p-4 bg-gray-100 text-black rounded shadow space-y-3"
    >
      <label className="block text-sm font-medium">Name</label>
      <input
        name="name"
        value={form.name}
        onChange={handleChange}
        placeholder="Name"
        className="border p-2 w-full"
      />

      <label className="block text-sm font-medium">Date of Birth</label>
      <input
        name="dob"
        type="date"
        value={form.dob}
        onChange={handleChange}
        className="border p-2 w-full"
      />

      <label className="block text-sm font-medium">Gender</label>
      <select
        name="gender"
        value={form.gender}
        onChange={handleChange}
        className="border p-2 w-full"
      >
        <option value="MALE">MALE</option>
        <option value="FEMALE">FEMALE</option>
      </select>

      <label className="block text-sm font-medium">Photos (multiple)</label>
      <input
        name="images"
        type="file"
        accept="image/*"
        multiple
        onChange={handleFiles}
        className="border p-2 w-full"
      />
      {form.files.length > 0 && (
        <p className="text-xs text-gray-600">
          Selected {form.files.length} file(s)
        </p>
      )}

      <label className="block text-sm font-medium">Department</label>
      <input
        name="department"
        value={form.department}
        onChange={handleChange}
        placeholder="Department"
        className="border p-2 w-full"
      />

      <label className="block text-sm font-medium">User ID</label>
      <input
        name="userId"
        type="number"
        value={form.userIdStr}
        onChange={handleChange}
        placeholder="User ID"
        className="border p-2 w-full"
        inputMode="numeric"
      />

      <button
        disabled={loading}
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-60"
      >
        {loading ? "Saving..." : employee ? "Update" : "Create"}
      </button>
    </form>
  );
};
