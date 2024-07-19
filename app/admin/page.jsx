"use client";

import { useEffect, useState, useContext } from "react";
import Link from "next/link";
import useSWR from "swr";
import { BasicContext } from "@/context/BasicContext";

const fetcher = (url) =>
  fetch(url).then((res) => res.json());

const AdminPage = () => {
  const maxDistance = 1000
  const limit = 1000
  const [error, setError] = useState("");
  const { token } = useContext(BasicContext);

  const { data: users, error: usersError, isLoading: usersLoading } = useSWR(
    token ? ["/api/users"] : null,
    fetcher
  );
  const { data: events, error: eventsError, isLoading: eventsLoading } = useSWR(
    token ? ["/api/events"] : null,
    fetcher
  );
  const { data: gardens, error: gardensError, isLoading: gardensLoading } = useSWR(
    token ? [`/api/gardens?maxDistance=${maxDistance}&limit=${limit}`] : null,
    fetcher
  );
  const { data: allGroups, error: groupsError, isLoading: groupsLoading } = useSWR(
    token ? ["/api/groups"] : null,
    fetcher
  );

  const handleRoleChange = async (id, newRole) => {
    try {
      const response = await fetch("/api/community-garden/users", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id, role: newRole }),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Network response was not ok: ${text}`);
      }

      const data = await response.json();
      mutate(["/api/users", token]);
    } catch (error) {
      console.error("Error updating user role:", error);
      setError(error.message);
    }
  };



  return (
    <div className="max-w-7xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Page</h1>
      {error && <p className="text-red-500 mb-4">Error: {error}</p>}

      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Users</h2>
       { (usersLoading || usersError || !users) ? <p>Loading...</p> : 
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
            {users.users.map((user) => (
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
        </table>}
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Events</h2>
        <ul className="list-disc pl-5">
          {(eventsLoading || eventsError || !events) ? <p>Loading...</p> : events.map((event) => (
            <li key={event.id} className="text-gray-700 mb-2">
              <Link
                href={`/events/${event.id}`}
                className="text-blue-500 hover:underline"
              >
                {event.name}
                {event.pending_invitations > 0 && <span className="ml-2 text-red-500">!</span>}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Groups</h2>
        <ul className="list-disc pl-5">
          {(groupsLoading || groupsError || !allGroups) ? <p>Loading...</p> : allGroups.map((group) => (
            <li key={group.id} className="text-gray-700 mb-2">
              <Link
                href={`/groups/${group.id}`}
                className="text-blue-500 hover:underline"
              >
                {group.name}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Gardens</h2>
        <ul className="list-disc pl-5">
          {(gardensLoading || gardensError || !gardens) ? <p>Loading...</p> : gardens.map((garden) => (
            <li key={garden.id} className="text-gray-700 mb-2">
              <Link
                href={`/gardens/${garden.id}`}
                className="text-blue-500 hover:underline"
              >
                {garden.name}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};

export default AdminPage;
