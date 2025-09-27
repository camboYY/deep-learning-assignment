"use client";

import { mockCurrentAttendance } from "@/data";
import { useGetAllAttendanceQuery } from "../store/attendanceApi";

export const AttendanceDashboard = () => {
  const {
    data = mockCurrentAttendance,
    isLoading,
    error,
  } = useGetAllAttendanceQuery({
    page: 0,
    size: 10,
  });

  if (isLoading)
    return <div className="text-gray-500">Loading attendance...</div>;
  if (error)
    return <div className="text-red-500">Failed to load attendance.</div>;

  // --- Compute counts by status ---
  const counts = mockCurrentAttendance.reduce(
    (acc, record) => {
      switch (record.status) {
        case "On Time":
          acc.onTime += 1;
          break;
        case "Late":
          acc.late += 1;
          break;
        case "Absent":
          acc.absent += 1;
          break;
        case "Overtime":
          acc.overtime += 1;
          break;
      }
      return acc;
    },
    { onTime: 0, late: 0, absent: 0, overtime: 0 }
  );

  // --- Summary card configuration ---
  const summaryGroups = [
    {
      title: "Present Summary",
      items: [
        { label: "On time", value: counts.onTime },
        { label: "Late clock-in", value: counts.late },
        { label: "Overtime", value: counts.overtime },
      ],
    },
    {
      title: "Not Present Summary",
      items: [
        { label: "Absent", value: counts.absent },
        { label: "No clock-in", value: 0 }, // placeholder
        { label: "No clock-out", value: 0 }, // placeholder
      ],
    },
    {
      title: "Away Summary",
      items: [
        { label: "Day off", value: 0 },
        { label: "Time off", value: 0 },
      ],
    },
  ];

  return (
    <div className="p-0 space-y-6">
      <div className="grid grid-cols-3 gap-6 text-black">
        {summaryGroups.map((group) => (
          <div key={group.title} className="bg-white rounded-lg shadow p-4">
            <h3 className="font-semibold text-gray-700">{group.title}</h3>
            <div className="flex justify-between mt-2">
              {group.items.map((item) => (
                <div key={item.label}>
                  <p className="text-gray-400 text-xs">{item.label}</p>
                  <p className="text-lg font-bold">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
