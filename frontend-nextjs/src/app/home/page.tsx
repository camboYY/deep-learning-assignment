import {
  AttendanceDashboard,
  AttendanceTable,
  CreateEmployeeButton,
  CreateUserButton,
  LogoutButton,
  PrivateRoute,
  SummaryCards,
} from "@/components";

export default function page() {
  return (
    <PrivateRoute>
      <main className="p-6 space-y-6 bg-white-50">
        <div className="flex justify-between">
          <h1 className="text-2xl font-bold">Attendance Dashboard</h1>
          <div>
            <CreateEmployeeButton />
            <CreateUserButton />
            <LogoutButton />
          </div>
        </div>
        {/* Top Summary Cards */}

        <AttendanceDashboard />

        {/* Top Summary Cards  */}
        <SummaryCards />

        <AttendanceTable />
      </main>
    </PrivateRoute>
  );
}
