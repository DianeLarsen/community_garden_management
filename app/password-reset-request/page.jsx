"use client";
import { useState, useContext } from 'react';
import { BasicContext } from "@/context/BasicContext";

const PasswordResetRequestForm = () => {
  const { showBanner } = useContext(BasicContext);
  const [email, setEmail] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/community-garden/password-reset-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (response.ok) {
        showBanner("Password reset email sent! Check your email.", "success");
      } else {
        showBanner(result.error, "error");
      }
    } catch (error) {
      console.error('Password reset request error:', error);
      showBanner("An unexpected error occurred. Please try again later.", "error");
    }
  };

  return (
    <div className="flex items-center justify-center max-h-screen p-8 bg-gray-100">
      <div className="p-8 bg-white rounded shadow-md w-full max-w-md">
        <h1 className="text-3xl mb-4">Reset Password</h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block mb-2 text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>
          <button type="submit" className="w-full py-2 px-4 bg-blue-600 text-white rounded">
            Send Reset Link
          </button>
        </form>
      </div>
    </div>
  );
};

export default PasswordResetRequestForm;
