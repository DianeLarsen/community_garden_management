"use client";
import { useState, useContext } from 'react';
import { BasicContext } from "@/context/BasicContext";
import { useRouter, useSearchParams } from "next/navigation";

const PasswordResetForm = () => {
  const { showBanner } = useContext(BasicContext);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      showBanner("Passwords do not match", "error");
      return;
    }

    try {
      const response = await fetch('/api/community-garden/password-reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, password }),
      });

      const result = await response.json();

      if (response.ok) {
        showBanner("Password reset successful!", "success");
        router.push('/login');
      } else {
        showBanner(result.error, "error");
      }
    } catch (error) {
      console.error('Password reset error:', error);
      showBanner("An unexpected error occurred. Please try again later.", "error");
    }
  };

  return (
    <div className="flex items-center justify-center max-h-screen p-8 bg-gray-100">
      <div className="p-8 bg-white rounded shadow-md w-full max-w-md">
        <h1 className="text-3xl mb-4">Reset Password</h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block mb-2 text-sm font-medium text-gray-700">New Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2 text-sm font-medium text-gray-700">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>
          <button type="submit" className="w-full py-2 px-4 bg-blue-600 text-white rounded">
            Reset Password
          </button>
        </form>
      </div>
    </div>
  );
};

export default PasswordResetForm;
