"use client";

import { useEffect, useState, useContext } from "react";
import Link from "next/link";
import useSWR from "swr";
import { BasicContext } from "@/context/BasicContext";
import { differenceInDays } from "date-fns";

const fetcher = (url) => fetch(url).then((res) => res.json());

const AdminPage = () => {
  const maxDistance = 1000;
  const limit = 1000;
  const { token } = useContext(BasicContext);
  const [currentPage, setCurrentPage] = useState(1);
  const [reservedPlots, setReservedPlots] = useState([]);
  const [totalPlots, setTotalPlots] = useState(0);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedDays, setSelectedDays] = useState(10);
  const [selectedGarden, setSelectedGarden] = useState("");
  const [error, setError] = useState("");
  const plotsPerPage = 10;

  const { data: users, error: usersError, isLoading: usersLoading } = useSWR(token ? "/api/users" : null, fetcher);
  const { data: events, error: eventsError, isLoading: eventsLoading } = useSWR(token ? "/api/events" : null, fetcher);
  const { data: gardens, error: gardensError, isLoading: gardensLoading } = useSWR(token ? `/api/gardens?maxDistance=${maxDistance}&limit=${limit}` : null, fetcher);
  const { data: allGroups, error: groupsError, isLoading: groupsLoading } = useSWR(token ? "/api/groups" : null, fetcher);
  
  const { data: plotsData, error: reservedPlotsError, isLoading: reservedPlotsLoading } = useSWR(
    token
      ? `/api/reserved-plots?page=${currentPage}&limit=${plotsPerPage}&groupId=${selectedGroup}&userId=${selectedUser}&days=${selectedDays}&gardenId=${selectedGarden}`
      : null,
    fetcher
  );

  useEffect(() => {
    if (plotsData) {
      setReservedPlots(plotsData.plots);
      setTotalPlots(plotsData.total);
    }
  }, [plotsData]);

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
      const response = await fetch("/api/users", {
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

      // Refetch users data after updating role
      mutate(["/api/users", token]);
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
        {usersLoading || usersError || !users ? (
          <p>Loading...</p>
        ) : (
          <table className="w-full shadow-md rounded-lg overflow-hidden">
            <thead className="">
              <tr>
                <th className="hidden md:table-cell py-2 px-4">ID</th>
                <th className="py-2 px-4">Email</th>
                <th className="py-2 px-4">Role</th>
                <th className="hidden lg:table-cell py-2 px-4">Verified</th>
                <th className="py-2 px-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {users?.users?.map((user) => (
                <tr key={user.id} className="border-t">
                  <td className="hidden md:table-cell py-2 px-4">{user.id}</td>
                  <td className="py-2 px-4">{user.email}</td>
                  <td className="py-2 px-4">{user.role}</td>
                  <td className="hidden lg:table-cell py-2 px-4">{user.verified ? "Yes" : "No"}</td>
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
          {eventsLoading || eventsError || !events ? (
            <p>Loading...</p>
          ) : (
            events.map((event) => (
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
          {groupsLoading || groupsError || !allGroups ? (
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
          {gardensLoading || gardensError || !gardens ? (
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
                {users?.users?.map((user) => (
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
  
          {reservedPlotsLoading ? (
            <p>Loading...</p>
          ) : reservedPlotsError ? (
            <p className="text-red-500 mb-4">Error: {reservedPlotsError}</p>
          ) : plotsData?.message || plotsData?.error ? (
            <p className="text-red-500 mb-4">
              Error: {plotsData?.message || plotsData?.error}
            </p>
          ) : (
            <section className="mb-8">
              <table className="w-full bg-white shadow-md rounded-lg overflow-hidden">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="py-2 px-4">Plot Name</th>
                    <th className="hidden md:table-cell py-2 px-4">Reserved By</th>
                    <th className="hidden lg:table-cell py-2 px-4">Group</th>
                    <th className="hidden xl:table-cell py-2 px-4">Reservation Start</th>
                    <th className="hidden xl:table-cell py-2 px-4">Duration (weeks)</th>
                  </tr>
                </thead>
                <tbody>
                  {reservedPlots && reservedPlots.length > 0 ? (
                    reservedPlots.map((plot) => (
                      <tr key={plot.id} className="border-t">
                        <td className="py-2 px-4">{plot.name}</td>
                        <td className="hidden md:table-cell py-2 px-4">
                          {plot.user_id
                            ? users?.users.find(
                                (user) => user.id === plot.user_id
                              )?.email
                            : "N/A"}
                        </td>
                        <td className="hidden lg:table-cell py-2 px-4">
                          {plot.group_id
                            ? allGroups.find((group) => group.id === plot.group_id)
                                ?.name
                            : "N/A"}
                        </td>
                        <td className="hidden xl:table-cell py-2 px-4">
                          {new Date(plot.reserved_at).toLocaleString()}
                        </td>
                        <td className="hidden xl:table-cell py-2 px-4">
                          {calculateRemainingTime(plot.end_date)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center py-4">
                        No reserved plots found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              <div className="flex justify-between mt-4">
                <button
                  onClick={handlePrevPage}
                  className="p-2  rounded"
                  disabled={currentPage === 1}
                >
                  Previous
                </button>
                <span>
                  Page {currentPage} of {Math.ceil(totalPlots / plotsPerPage)}
                </span>
                <button
                  onClick={handleNextPage}
                  className="p-2  rounded"
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
  
