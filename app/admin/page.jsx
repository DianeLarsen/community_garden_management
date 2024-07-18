"use client";

import { useEffect, useState, useContext } from "react";
import { BasicContext } from "@/context/BasicContext";

const AdminPage = () => {
  const [error, setError] = useState("");
  const {
    users,
    events,
    gardens,
    allGroups
  } = useContext(BasicContext);

  const handleRoleChange = async (id, newRole) => {
    try {
      const response = await fetch("/api/community-garden/users", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, role: newRole }),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Network response was not ok: ${text}`);
      }

      const data = await response.json();
      setUsers(users.map((user) => (user.id === id ? data.user : user)));
    } catch (error) {
      console.error("Error updating user role:", error);
      setError(error.message);
    }
  };

  if (!users && !groups && !gardens && !events) {
    return <p>Loading...</p>
  }

  return (
    <div className="max-w-7xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Page</h1>
      {error && <p className="text-red-500 mb-4">Error: {error}</p>}
      
      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Users</h2>
        <table className="w-full bg-white shadow-md rounded-lg overflow-hidden">
          <thead className="bg-gray-200">
            <tr>
              <th className="py-2 px-4">ID</th>
              <th className="py-2 px-4">Email</th>
              <th className="py-2 px-4">Role</th>
              <th className="py-2 px-4">Verified</th>
              <th className="py-2 px-4">Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-t">
                <td className="py-2 px-4">{user.id}</td>
                <td className="py-2 px-4">{user.email}</td>
                <td className="py-2 px-4">{user.role}</td>
                <td className="py-2 px-4">{user.verified ? "Yes" : "No"}</td>
                <td className="py-2 px-4">
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                    className="p-2 border rounded-md"
                  >
                    <option value="member">Member</option>
                    <option value="admin">Admin</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Events</h2>
        <ul className="list-disc pl-5">
          {events.map(event => (
            <li key={event.id} className="text-gray-700 mb-2">
              {event.name}
            </li>
          ))}
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Groups</h2>
        <ul className="list-disc pl-5">
          {allGroups.map(group => (
            <li key={group.id} className="text-gray-700 mb-2">
              {group.name}
            </li>
          ))}
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Gardens</h2>
        <ul className="list-disc pl-5">
          {gardens.map(garden => (
            <li key={garden.id} className="text-gray-700 mb-2">
              {garden.name}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};

export default AdminPage;
