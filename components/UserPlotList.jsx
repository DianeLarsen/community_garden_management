"use client";
import { useState, useEffect, useContext } from "react";
import Link from "next/link";
import { BasicContext } from "@/context/BasicContext";
import { differenceInDays, addWeeks } from "date-fns";

const UserPlotsList = ({
  gardenId = "",
  groupId = "",
  userInfo = false,
  groupInfo = false,
  message = "",
}) => {
  const [plots, setPlots] = useState([]);
  const [returnMessage, setReturnMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [editingPlot, setEditingPlot] = useState(null);
  const [editForm, setEditForm] = useState({
    length: "",
    width: "",
    group_id: "",
  });
  const { user } = useContext(BasicContext);
  const [groupLegend, setGroupLegend] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const plotsPerPage = 10;
  const [renewingPlot, setRenewingPlot] = useState(null);
  const [renewWeeks, setRenewWeeks] = useState(1);
  const [filter, setFilter] = useState("current");

  useEffect(() => {
    if (!user.id && !plots) {
      setLoading(true);
    }
  }, [user?.id, plots]);

  useEffect(() => {
    const fetchPlots = async () => {
      setLoading(true);
      const url = `/api/plots?userInfo=true`;

      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error("Error fetching plots");
        }
        const data = await response.json();

        if (data.message) {
          setReturnMessage(data.message);
          setLoading(false);
        } else {
          const userPlots = data.filter((plot) => plot.user_id === user.id);
          userPlots.sort((a, b) => new Date(a.end_date) - new Date(b.end_date));
          setPlots(userPlots);
        }

        // Build group legend
        const legend = {};
        data.forEach((plot) => {
          if (plot.group_id && !legend[plot.group_id]) {
            legend[plot.group_id] = plot.group_name;
          }
        });
        setGroupLegend(legend);

        setLoading(false);
      } catch (error) {
        console.log(error.message);
      }
    };

    if (user.id) {
      fetchPlots();
    }
  }, [user?.id]);

  const handleRemovePlot = async (plotId) => {
    try {
      const response = await fetch(`/api/plots/${plotId}/remove`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Error removing plot reservation");
      }
      setPlots(
        plots.map((plot) =>
          plot.id === plotId
            ? { ...plot, status: "available", user_id: null, group_id: null }
            : plot
        )
      );
    } catch (error) {
      console.log(error.message);
    }
  };

  const handleEditPlot = (plot) => {
    setEditingPlot(plot);
    setEditForm({
      length: plot.length,
      width: plot.width,
      group_id: plot.group_id,
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/plots/${editingPlot.id}/edit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(editForm),
      });

      if (!response.ok) {
        throw new Error("Error editing plot");
      }
      setPlots(
        plots.map((plot) =>
          plot.id === editingPlot.id ? { ...plot, ...editForm } : plot
        )
      );
      setEditingPlot(null);
    } catch (error) {
      console.log(error.message);
    }
  };

  const handleRenewPlot = (plot) => {
    setRenewingPlot(plot);
  };

  const handleRenewSubmit = async (e) => {
    e.preventDefault();
    try {
      const newEndDate = addWeeks(new Date(renewingPlot.end_date), renewWeeks).toISOString();

      const response = await fetch(`/api/plots/${renewingPlot.id}/extend`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ new_end_date: newEndDate }),
      });

      if (!response.ok) {
        throw new Error("Error renewing plot reservation");
      }

      setPlots(
        plots.map((plot) =>
          plot.id === renewingPlot.id ? { ...plot, end_date: newEndDate } : plot
        )
      );
      setRenewingPlot(null);
      setRenewWeeks(1);
    } catch (error) {
      console.log(error.message);
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

  const formatDate = (date) => {
    const options = { month: "short", day: "numeric" };
    const formattedDate = new Date(date).toLocaleDateString("en-US", options);

    // Add ordinal suffix
    const day = new Date(date).getDate();
    const suffix = (day) => {
      if (day > 3 && day < 21) return "th";
      switch (day % 10) {
        case 1:
          return "st";
        case 2:
          return "nd";
        case 3:
          return "rd";
        default:
          return "th";
      }
    };

    return formattedDate.replace(/\d+/, `${day}${suffix(day)}`);
  };

  const handleNextPage = () => {
    if (currentPage < Math.ceil(filteredPlots().length / plotsPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const getRowClassName = (plot) => {
    const now = new Date();
    const end = new Date(plot.end_date);
    return end >= now ? "bg-green-100" : "bg-yellow-100";
  };

  const filteredPlots = () => {
    const now = new Date();
    return plots.filter((plot) => {
      const end = new Date(plot.end_date);
      if (filter === "current") {
        return end >= now;
      } else if (filter === "future") {
        return end > now;
      }
      return true;
    });
  };

  const paginatedPlots = filteredPlots().slice(
    (currentPage - 1) * plotsPerPage,
    currentPage * plotsPerPage
  );

  if (loading) {
    return <div>Loading...</div>;
  }


  return (
    <div className="max-w-6xl mx-auto bg-white p-6 rounded-md shadow-md mt-6">
      <div className="mb-4 flex justify-between items-center">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Filter
          </label>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
          >
            <option value="current">Current</option>
            <option value="future">Future</option>
            <option value="all">All</option>
          </select>
        </div>
      </div>

      {editingPlot && (
        <form
          onSubmit={handleEditSubmit}
          className="mb-4 p-4 bg-gray-50 shadow-md rounded"
        >
          <h2 className="text-lg font-bold mb-4">Edit Plot</h2>
          <div className="mb-4">
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Length
            </label>
            <input
              type="text"
              name="length"
              value={editForm.length}
              onChange={(e) =>
                setEditForm({ ...editForm, length: e.target.value })
              }
className="w-full px-3 py-2 border rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Width
            </label>
            <input
              type="text"
              name="width"
              value={editForm.width}
              onChange={(e) =>
                setEditForm({ ...editForm, width: e.target.value })
              }
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Group
            </label>
            <input
              type="text"
              name="group_id"
              value={editForm.group_id}
              onChange={(e) =>
                setEditForm({ ...editForm, group_id: e.target.value })
              }
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-600 text-white rounded"
          >
            Save
          </button>
        </form>
      )}

      {renewingPlot && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-md shadow-md">
            <h2 className="text-xl font-bold mb-4">Extend Plot</h2>
            <form onSubmit={handleRenewSubmit}>
              <div className="mb-4">
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Extend by (weeks)
                </label>
                <input
                  type="number"
                  min="1"
                  max="4"
                  value={renewWeeks}
                  onChange={(e) => setRenewWeeks(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border rounded"
                  required
                />
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setRenewingPlot(null)}
                  className="px-4 py-2 bg-gray-500 text-white rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded"
                >
                  Extend
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {!plots[0]?.message && paginatedPlots.length > 0 ? (
        <>
          <table className="w-full table-auto border-collapse">
            <thead>
              <tr>
                <th className="border px-2 py-2">Plot Size(ft.)</th>
                <th className="border px-2 py-2">Garden Name</th>
                <th className="border px-2 py-2">Start Date</th>
                <th className="border px-2 py-2">End Date</th>
                <th className="border px-2 py-2">Days Left</th>
                <th className="border px-2 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedPlots.map((plot) => (
                <tr key={plot.id} className={getRowClassName(plot)}>
                  <td className="border px-4 py-2 text-center">
                    {plot.length}X{plot.width}
                  </td>
                  <td className="border px-4 py-2 text-center">
                    {plot.garden_name}
                  </td>
                  <td className="border px-4 py-2 text-center">
                    {formatDate(plot.start_date)}
                  </td>
                  <td className="border px-4 py-2 text-center">
                    {formatDate(plot.end_date)}
                  </td>
                  <td className="border px-4 py-2 text-center">
                    {calculateRemainingTime(plot.end_date)}
                  </td>
                  <td className="border px-4 py-2 text-center">
                    <Link
                      href={`/plots/${plot.id}`}
                      className="text-blue-600 ml-4"
                    >
                      View
                    </Link>
                    {(plot.user_id === user.id ||
                      user?.role === "admin" ||
                      (user.groups &&
                        user.groups.some(
                          (group) =>
                            group.id === plot.group_id && group.role === "admin"
                        ))) && (
                      <div className="flex justify-center">
                        <button
                          onClick={() => handleRemovePlot(plot.id)}
                          className="text-red-600 ml-4"
                        >
                          Remove
                        </button>
                        <button
                          onClick={() => handleEditPlot(plot)}
                          className="text-green-600 ml-4"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleRenewPlot(plot)}
                          className="text-blue-600 ml-4"
                        >
                          Extend
                        </button>
                      </div>
                    )}
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
              Page {currentPage} of {Math.ceil(filteredPlots().length / plotsPerPage)}
            </span>
            <button
              onClick={handleNextPage}
              className="p-2 bg-gray-200 rounded"
              disabled={currentPage === Math.ceil(filteredPlots().length / plotsPerPage)}
            >
              Next
            </button>
          </div>
          {groupInfo && (
            <div className="mt-4">
              <h3 className="text-lg font-bold">Group Legend</h3>
              <ul>
                {Object.entries(groupLegend).map(([groupId, groupName]) => (
                  <li key={groupId}>
                    <sup>{groupId}</sup>: {groupName}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      ) : (
        <div>{message}</div>
      )}
      <div>{returnMessage}</div>
    </div>
  );
};

export default UserPlotsList;