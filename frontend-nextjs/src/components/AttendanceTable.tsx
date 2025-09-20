"use client";

import { mockAttendance } from "@/data";
import { useGetAllAttendanceQuery } from "@/store/attendanceApi";
import Image from "next/image";
import { useState } from "react";

export function AttendanceTable() {
  const { data = mockAttendance, isLoading } = useGetAllAttendanceQuery({
    page: 0,
    size: 10,
  });
  const [search, setSearch] = useState("");
  const [filterLocation, setFilterLocation] = useState("All");

  if (isLoading) return <p>Loading...</p>;

  // Extract unique locations for filter dropdown
  const locations = [
    "All",
    ...Array.from(new Set(mockAttendance.map((e) => e.location))),
  ];

  // Filter data based on search and selected location
  const filteredData = mockAttendance.filter((emp) => {
    const matchesSearch =
      emp.name.toLowerCase().includes(search.toLowerCase()) ||
      emp.note.toLowerCase().includes(search.toLowerCase());
    const matchesLocation =
      filterLocation === "All" || emp.location === filterLocation;
    return matchesSearch && matchesLocation;
  });

  if (isLoading) return <p>Loading...</p>;

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
                <td className="px-4 py-2">{emp.name}</td>
                <td className="px-4 py-2">
                  {emp.clockIn} → {emp.clockOut}
                </td>
                <td className="px-4 py-2">{emp.overtime || "-"}</td>
                <td className="px-4 py-2">
                  <Image
                    width={50}
                    height={50}
                    src={emp.picture}
                    alt={emp.name}
                    className="h-8 w-8 rounded-full"
                  />
                </td>
                <td className="px-4 py-2 text-blue-600 underline">
                  {emp.location}
                </td>
                <td className="px-4 py-2">{emp.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
