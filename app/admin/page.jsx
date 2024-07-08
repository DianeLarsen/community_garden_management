"use client";

import { useEffect, useState } from "react";

const AdminPage = () => {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchUsers() {
      try {
        const response = await fetch("/api/community-garden/users");
        if (!response.ok) {
          const text = await response.text();
          throw new Error(`Network response was not ok: ${text}`);
        }
        const data = await response.json();
        setUsers(data.users);
      } catch (error) {
        console.error("Error fetching users:", error);
        setError(error.message);
      }
    }

    fetchUsers();
  }, []);

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

  return (
    <div>
      <h1>Admin Page</h1>
      {error && <p>Error: {error}</p>}
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Email</th>
            <th>Role</th>
            <th>Verified</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.email}</td>
              <td>{user.role}</td>
              <td>{user.verified ? "Yes" : "No"}</td>
              <td>
                <select
                  value={user.role}
                  onChange={(e) => handleRoleChange(user.id, e.target.value)}
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
    </div>
  );
};

export default AdminPage;
