"use client";
import { AttendanceTable } from "@/components";

export default function AttendancePage() {
  return (
    <main className="p-6">
      <h2 className="text-xl font-semibold mb-4">Employee Attendance</h2>
      <AttendanceTable />
    </main>
  );
}
