"use client";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-r from-blue-800 via-blue-600 to-blue-400 text-white">
      <div className="bg-black/40 p-10 rounded-2xl shadow-2xl text-center max-w-xl">
        <h1 className="text-4xl font-bold mb-6">
          Welcome to BBU HR Attendance Record
        </h1>
        <p className="text-lg mb-8">
          Manage employee attendance with ease and efficiency.
        </p>
        <a
          href="/face"
          className="inline-block px-6 py-3 bg-white  text-black font-semibold rounded-lg shadow-md hover:bg-gray-100 transition"
        >
          Explore US
        </a>
      </div>
    </main>
  );
}
