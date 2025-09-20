"use client";
import { useLoginMutation } from "@/store/authApi";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginForm() {
  const [login, { isLoading, error }] = useLoginMutation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await login({ username, password }).unwrap();

      localStorage.setItem("authToken", response.token);
      localStorage.setItem(
        "tokenExpiry",
        String(Date.now() + response.expiresIn * 1000)
      );

      router.replace("/home"); // use replace to avoid going back to login
    } catch (err) {
      console.error("Login failed", err);
    }
  };

  return (
    <div className="max-w-[30%] mx-auto mt-12 justify-center align-middle bg-white bg-opacity-50 rounded text-black">
      <form onSubmit={handleSubmit} className="space-y-4  p-8 ">
        <h2 className="text-2xl font-bold mb-4">Login</h2>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="border p-2 rounded w-full"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2 rounded w-full"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="bg-blue-500 text-white px-4 py-2 rounded w-full"
        >
          {isLoading ? "Logging in..." : "Login"}
        </button>
        {error && <p className="text-red-500">Login failed. Try again.</p>}

        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">
            Don't have an account?{" "}
            <Link href="/signup" className="text-blue-500 hover:underline">
              Sign Up
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}
