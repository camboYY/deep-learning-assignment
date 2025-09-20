"use client";

import { mockCurrentAttendance } from "@/data";
import { useGetAllAttendanceQuery } from "@/store/attendanceApi";
import { CheckCircle, Clock, Timer, XCircle } from "lucide-react";
import { SummaryCard } from "./SummaryCard";

export function SummaryCards() {
  const { data: attendance = [], isLoading } = useGetAllAttendanceQuery({
    page: 0,
    size: 10,
  });

  // Calculate stats dynamically
  const counts = {
    onTime: mockCurrentAttendance.filter((a) => a.status === "On Time").length,
    late: mockCurrentAttendance.filter((a) => a.status === "Late").length,
    absent: mockCurrentAttendance.filter((a) => a.status === "Absent").length,
    overtime: mockCurrentAttendance.filter((a) => a.status === "Overtime")
      .length,
  };

  const stats = [
    {
      title: "On Time",
      value: isLoading ? "..." : counts.onTime,
      icon: <CheckCircle />,
      color: "bg-green-500",
    },
    {
      title: "Late",
      value: isLoading ? "..." : counts.late,
      icon: <Clock />,
      color: "bg-yellow-500",
    },
    {
      title: "Absent",
      value: isLoading ? "..." : counts.absent,
      icon: <XCircle />,
      color: "bg-red-500",
    },
    {
      title: "Overtime",
      value: isLoading ? "..." : counts.overtime,
      icon: <Timer />,
      color: "bg-blue-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((s) => (
        <SummaryCard
          key={s.title}
          title={s.title}
          value={s.value}
          icon={s.icon}
          color={s.color}
        />
      ))}
    </div>
  );
}
