"use client";

import { useEffect, useState, useContext } from "react";
import Link from "next/link";
import useSWR from "swr";
import { BasicContext } from "@/context/BasicContext";
import useReloadOnLoading from "@/hooks/useReloadOnLoading";
import { differenceInDays } from "date-fns";

const AdminPage = () => {
  const maxDistance = 1000;
  const limit = 1000;
  const [error, setError] = useState("");
  const { 
    token, 
    loading, 
    users, 
    userEvents, 
    userGroups, 
    userGardens, 
    userInvites, 
    userPlots, 
    allGroups, 
    gardens, 
    setUserGroups, 
    setUserEvents, 
    setUserGardens, 
    setUserInvites, 
    setUserPlots, 
    setAllGroups, 
    setGardens 
  } = useContext(BasicContext);
  useReloadOnLoading(loading);
  const [currentPage, setCurrentPage] = useState(1);
  const [reservedPlots, setReservedPlots] = useState([]);
  const [totalPlots, setTotalPlots] = useState(0);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedDays, setSelectedDays] = useState(10);
  const [selectedGarden, setSelectedGarden] = useState("");
  const plotsPerPage = 10;

  useEffect(() => {
    const fetchReservedPlots = async () => {
      try {
        const response = await fetch(`/api/reserved-plots?page=${currentPage}&limit=${plotsPerPage}&groupId=${selectedGroup}&userId=${selectedUser}&days=${selectedDays}&gardenId=${selectedGarden}`);
        if (!response.ok) {
          throw new Error("Error fetching reserved plots");
        }
        const data = await response.json();
        setReservedPlots(data.plots);
        setTotalPlots(data.total);
      } catch (error) {
        setError(error.message);
      }
    };

    if (token) {
      fetchReservedPlots();
    }
  }, [currentPage, plotsPerPage, selectedGroup, selectedUser, selectedDays, selectedGarden, token]);

  const handleNextPage = () => {
    if (currentPage < Math.ceil(totalPlots / plotsPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

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
      // Update users context state
      setUsers((prevUsers) => 
        prevUsers.map(user => 
          user.id === id ? { ...user, role: newRole } : user
        )
      );
    } catch (error) {
      console.error("Error updating user role:", error);
      setError(error.message);
    }
  };

  const calculateRemainingTime = (endDate) => {
    const now = new Date();
    const end = new Date(endDate);
    const totalDays = differenceInDays(end, now);

    if (totalDays <= 0) return "Expired";

    const weeks = Math.floor(totalDays / 7);
    const days = totalDays % 7;

    if (weeks > 0) {
      return `${weeks} wk${weeks !== 1 ? "s" : ""} / ${days} day${
        days !== 1 ? "s" : ""
      }`;
    } else {
      return `${days} day${days !== 1 ? "s" : ""}`;
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Page</h1>
      {error && <p className="text-red-500 mb-4">Error: {error}</p>}

      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Users</h2>
        {loading || !users ? (
          <p>Loading...</p>
        ) : (
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
                      onChange={(e) =>
                        handleRoleChange(user.id, e.target.value)
                      }
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
        )}
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Events</h2>
        <ul className="list-disc pl-5">
          {loading || !userEvents ? (
            <p>Loading...</p>
          ) : (
            userEvents.map((event) => (
              <li key={event.id} className="text-gray-700 mb-2">
                <Link
                  href={`/events/${event.id}`}
                  className="text-blue-500 hover:underline"
                >
                  {event.name}
                  {event.pending_invitations > 0 && (
                    <span className="ml-2 text-red-500">!</span>
                  )}
                </Link>
              </li>
            ))
          )}
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Groups</h2>
        <ul className="list-disc pl-5">
          {loading || !allGroups ? (
            <p>Loading...</p>
          ) : (
            allGroups.map((group) => (
              <li key={group.id} className="text-gray-700 mb-2">
              <Link
                href={`/groups/${group.id}`}
                className="text-blue-500 hover:underline"
              >
                {group.name}
                {group.invitations.length > 0 && (
                  <span className="ml-2 text-red-500">!</span>
                )}
              </Link>
            </li>
          ))
        )}
      </ul>
    </section>

    <section className="mb-8">
      <h2 className="text-2xl font-bold mb-4">Gardens</h2>
      <ul className="list-disc pl-5">
        {loading || !gardens ? (
          <p>Loading...</p>
        ) : (
          gardens.map((garden) => (
            <li key={garden.id} className="text-gray-700 mb-2">
              <Link
                href={`/gardens/${garden.id}`}
                className="text-blue-500 hover:underline"
              >
                {garden.name}
              </Link>
            </li>
          ))
        )}
      </ul>
    </section>

    <section className="mb-8">
      <h2 className="text-2xl font-bold mb-4">Reserved Plots</h2>
      <div className="filters flex gap-4 mb-4">
        <label>
          Group:
          <select
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
            className="ml-2 p-1 border rounded"
          >
            <option value="">All</option>
            {allGroups?.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          User:
          <select
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            className="ml-2 p-1 border rounded"
          >
            <option value="">All</option>
            {users?.map((user) => (
              <option key={user.id} value={user.id}>
                {user.email}
              </option>
            ))}
          </select>
        </label>
        <label>
          Days:
          <input
            type="number"
            value={selectedDays}
            onChange={(e) => setSelectedDays(e.target.value)}
            className="ml-2 p-1 border rounded"
          />
        </label>
        <label>
          Garden:
          <select
            value={selectedGarden}
            onChange={(e) => setSelectedGarden(e.target.value)}
            className="ml-2 p-1 border rounded"
          >
            <option value="">All</option>
            {gardens?.map((garden) => (
              <option key={garden.id} value={garden.id}>
                {garden.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="text-red-500 mb-4">Error: {error}</p>
      ) : reservedPlots.length === 0 ? (
        <p className="text-red-500 mb-4">No reserved plots found</p>
      ) : (
        <section className="mb-8">
          <table className="w-full bg-white shadow-md rounded-lg overflow-hidden">
            <thead className="bg-gray-200">
              <tr>
                <th className="py-2 px-4">Plot Name</th>
                <th className="py-2 px-4">Reserved By</th>
                <th className="py-2 px-4">Group</th>
                <th className="py-2 px-4">Reservation Start</th>
                <th className="py-2 px-4">Duration (weeks)</th>
              </tr>
            </thead>
            <tbody>
              {reservedPlots.map((plot) => (
                <tr key={plot.id} className="border-t">
                  <td className="py-2 px-4">{plot.name}</td>
                  <td className="py-2 px-4">
                    {plot.user_id
                      ? users.find((user) => user.id === plot.user_id)?.email
                      : "N/A"}
                  </td>
                  <td className="py-2 px-4">
                    {plot.group_id
                      ? allGroups.find((group) => group.id === plot.group_id)
                          ?.name
                      : "N/A"}
                  </td>
                  <td className="py-2 px-4">
                    {new Date(plot.reserved_at).toLocaleString()}
                  </td>
                  <td className="py-2 px-4">
                    {calculateRemainingTime(plot.end_date)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex justify-between mt-4">
            <button
              onClick={handlePrevPage}
              className="p-2 bg-gray-200 rounded"
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <span>
              Page {currentPage} of {Math.ceil(totalPlots / plotsPerPage)}
            </span>
            <button
              onClick={handleNextPage}
              className="p-2 bg-gray-200 rounded"
              disabled={currentPage === Math.ceil(totalPlots / plotsPerPage)}
            >
              Next
            </button>
          </div>
        </section>
      )}
    </section>
  </div>
);
};

export default AdminPage;

