"use client";

import { ReactNode } from "react";

interface SummaryCardProps {
  title: string;
  value: number | string;
  icon?: ReactNode;
  color?: string; // Tailwind class for background
}

export function SummaryCard({
  title,
  value,
  icon,
  color = "bg-gray-100",
}: SummaryCardProps) {
  return (
    <div
      className={`flex items-center justify-between p-4 rounded-xl shadow ${color} text-white`}
    >
      <div>
        <h3 className="text-sm font-medium opacity-80">{title}</h3>
        <p className="text-2xl font-bold">{value}</p>
      </div>
      {icon && <div className="text-3xl opacity-80">{icon}</div>}
    </div>
  );
}
