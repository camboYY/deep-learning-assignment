"use client";

import {
  AttendanceResponse,
  useGetAllAttendanceQuery,
} from "@/store/attendanceApi";
import Image from "next/image";
import { useMemo, useState } from "react";
import { toast } from "react-hot-toast";

export const AttendanceTable: React.FC = () => {
  const [search, setSearch] = useState("");
  const [filterLocation, setFilterLocation] = useState("All");
  const [page, setPage] = useState(0);

  // hooks must be at top
  const { data, isLoading, error, refetch } = useGetAllAttendanceQuery({
    page,
    size: 10,
  });

  const attendanceData: AttendanceResponse[] = data?.content || [];

  // Extract unique locations for filter dropdown
  const locations = useMemo(
    () => [
      "All",
      ...Array.from(new Set(attendanceData.map((e) => e.location || ""))),
    ],
    [attendanceData]
  );

  // Filter data based on search and selected location
  const filteredData = useMemo(
    () =>
      attendanceData.filter((emp) => {
        const matchesSearch =
          emp.employeeName.toLowerCase().includes(search.toLowerCase()) ||
          (emp.note?.toLowerCase().includes(search.toLowerCase()) ?? false);
        const matchesLocation =
          filterLocation === "All" || emp.location === filterLocation;
        return matchesSearch && matchesLocation;
      }),
    [attendanceData, search, filterLocation]
  );

  // Handle errors
  if (error) {
    toast.error("Failed to load attendance data");
    console.error(error);
  }

  if (isLoading) return <p>Loading...</p>;

  const converDate = (iso: string) => {
    const date = new Date(iso);
    const readable = date.toLocaleString(); // e.g., "9/25/2025, 9:47:44 AM"
    return readable;
  };

  return (
    <div className="p-4">
      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
        <input
          type="text"
          placeholder="Search by name or note..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-3 py-2 border rounded-md w-full sm:w-64 focus:outline-none focus:ring focus:ring-blue-300"
        />

        <select
          value={filterLocation}
          onChange={(e) => setFilterLocation(e.target.value)}
          className="px-3 py-2 border rounded-md w-full sm:w-48 focus:outline-none focus:ring focus:ring-blue-300"
        >
          {locations.map((loc) => (
            <option key={loc} value={loc}>
              {loc}
            </option>
          ))}
        </select>
      </div>

      {/* Attendance Table */}
      <div className="overflow-x-auto shadow rounded-lg">
        <table className="min-w-full text-sm text-left border">
          <thead className="bg-gray-100 text-black">
            <tr>
              <th className="px-4 py-2">Employee</th>
              <th className="px-4 py-2">Clock In & Out</th>
              <th className="px-4 py-2">Overtime</th>
              <th className="px-4 py-2">Picture</th>
              <th className="px-4 py-2">Location</th>
              <th className="px-4 py-2">Note</th>
            </tr>
          </thead>
          <tbody>
            {filteredData?.map((emp) => (
              <tr key={emp.id} className="border-b">
                <td className="px-4 py-2">{emp.employeeName}</td>
                <td className="px-4 py-2">
                  {converDate(emp.checkIn)} →
                  {(emp.checkOut && converDate(emp.checkOut)) ?? " -"}
                </td>
                <td className="px-4 py-2">{emp.overTime ?? "-"}</td>
                <td className="px-4 py-2">
                  {emp.picture && (
                    <Image
                      width={50}
                      height={50}
                      src={emp.picture}
                      alt={emp.employeeName}
                      className="h-8 w-8 rounded-full"
                    />
                  )}
                </td>
                <td className="px-4 py-2 text-blue-600 underline">
                  {emp.location ?? "-"}
                </td>
                <td className="px-4 py-2">{emp.note ?? "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex gap-2">
        <button
          disabled={page === 0}
          onClick={() => setPage((p) => Math.max(p - 1, 0))}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Previous
        </button>
        <button
          disabled={(data?.content.length ?? 0) < 10}
          onClick={() => setPage((p) => p + 1)}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};
