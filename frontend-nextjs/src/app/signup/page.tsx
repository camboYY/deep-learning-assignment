"use client";

import { useSignupMutation } from "@/store/authApi";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SignupForm() {
  const [signup, { isLoading, error }] = useSignupMutation();
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      const user = await signup({ username, password }).unwrap();

      // Optional: auto-login after signup
      // localStorage.setItem("authToken", user.token); // if backend returns token
      // router.push("/dashboard");

      alert("Signup successful! Please login.");
      router.push("/login");
    } catch (err: any) {
      console.error("Signup failed", err);
      alert("Signup failed. Try again.");
    }
  };

  return (
    <div className="max-w-[30%] mx-auto mt-12 justify-center align-middle rounded bg-white bg-opacity-50 shadow text-black">
      <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4 p-6 ">
        <h2 className="text-xl font-bold">Sign Up</h2>

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="border p-2 rounded w-full"
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2 rounded w-full"
          required
        />

        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="border p-2 rounded w-full"
          required
        />

        <button
          type="submit"
          disabled={isLoading}
          className="bg-blue-500 text-white px-4 py-2 rounded w-full"
        >
          {isLoading ? "Signing up..." : "Sign Up"}
        </button>

        {error && (
          <p className="text-red-500 text-sm mt-2">Signup failed. Try again.</p>
        )}
      </form>
    </div>
  );
}
