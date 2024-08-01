"use client";
import { useState, useContext } from "react";
import { BasicContext } from "@/context/BasicContext";

const ChangePassword = ({ handleChangePasswordToggle }) => {
  const { showBanner } = useContext(BasicContext);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      showBanner("New passwords do not match", "error");
      return;
    }

    setLoading(true);
    const token = localStorage.getItem("token");

    try {
      const response = await fetch("/api/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        showBanner("Password changed successfully", "success");
        handleChangePasswordToggle(); // Close the change password form on success
      } else {
        showBanner(data.error || "An error occurred", "error");
      }
    } catch (error) {
      showBanner("An unexpected error occurred. Please try again later.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative max-w-3xl mx-auto p-4 bg-white shadow-md rounded mt-8">
      <button
        type="button"
        className="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
        onClick={handleChangePasswordToggle}
      >
        X
      </button>
      <form onSubmit={handleChangePassword}>
        <h3 className="text-xl mb-4">Change Password</h3>
        <div className="mb-4">
          <label className="block mb-2 text-sm font-medium text-gray-700">Current Password</label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block mb-2 text-sm font-medium text-gray-700">New Password</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block mb-2 text-sm font-medium text-gray-700">Confirm New Password</label>
          <input
            type="password"
            value={confirmNewPassword}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full py-2 px-4 bg-blue-600 text-white rounded"
          disabled={loading}
        >
          {loading ? "Changing..." : "Change Password"}
        </button>
      </form>
    </div>
  );
};

export default ChangePassword;
