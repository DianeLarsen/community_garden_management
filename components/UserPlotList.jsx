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
  eventUserId = "",
}) => {
  const [plots, setPlots] = useState([]);
  const [returnMessage, setReturnMessage] = useState("");

  const [editingPlot, setEditingPlot] = useState(null);
  const [editForm, setEditForm] = useState({
    length: "",
    width: "",
    group_id: "",
  });
  const { user, userPlots, showBanner, loading, setLoading } = useContext(BasicContext);

  const [groupLegend, setGroupLegend] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const plotsPerPage = 10;
  const [renewingPlot, setRenewingPlot] = useState(null);
  const [renewWeeks, setRenewWeeks] = useState(1);


  useEffect(() => {
    if (user && user.id && userPlots) {
      setLoading(false);
    } else {
      setLoading(true);
    }
  }, [user, user.id, userPlots]);

  useEffect(() => {
    setLoading(true);
    if (userPlots.message) {
      setReturnMessage(userPlots.message);
      setLoading(false);
    } else {
      let filteredUserPlots;

      filteredUserPlots = userPlots.filter((plot) => plot.user_id === user.id);

      filteredUserPlots &&
        filteredUserPlots.sort(
          (a, b) => new Date(a.end_date) - new Date(b.end_date)
        );
      setPlots(filteredUserPlots);
    }

    // Build group legend
    const legend = {};
    userPlots.forEach((plot) => {
      if (plot.group_id && !legend[plot.group_id]) {
        legend[plot.group_id] = plot.group_name;
      }
    });
    setGroupLegend(legend);

    setLoading(false);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, userPlots]);

  const handleRemovePlot = async (plotId) => {
    const confirmRemoval = window.confirm(
      "Are you sure you want to cancel the reservation for this plot?"
    );

    if (!confirmRemoval) {
      return; // If the user clicks "Cancel", do nothing
    }

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
      console.error(error.message);
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
      console.error(error.message);
    }
  };

  const handleRenewPlot = async (plotId, extensionWeeks) => {
    try {
      const plotToRenew = plots.find((plot) => plot.id === plotId);

      if (!plotToRenew || !plotToRenew.reserved_until) {
        throw new Error("Plot or end date not found.");
      }

      const parsedEndDate = new Date(plotToRenew.reserved_until);
      if (isNaN(parsedEndDate.getTime())) {
        throw new Error("Invalid end date.");
      }

      const newEndDate = addWeeks(parsedEndDate, extensionWeeks).toISOString();

      const response = await fetch(`/api/plots/${plotId}/extend`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ new_end_date: newEndDate }),
      });

      if (!response.ok) {
        showBanner("Error renewing plot reservation", "error");
      }

      setPlots(
        plots.map((plot) =>
          plot.id === plotId ? { ...plot, reserved_until: newEndDate } : plot
        )
      );
      showBanner(
        `You have extended your plot reservation by ${extensionWeeks} weeks!`,
        "success"
      );
      setRenewingPlot(null);
    } catch (error) {
      console.error(error.message);
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
    if (currentPage < Math.ceil(plots.length / plotsPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const paginatedPlots = plots.slice(
    (currentPage - 1) * plotsPerPage,
    currentPage * plotsPerPage
  );

  const getBackgroundColor = (endDate) => {
    const now = new Date();
    const end = new Date(endDate);
    if (end > now) {
      return "bg-green-100";
    } else if (end <= now) {
      return "bg-red-100";
    }
    return "";
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto  p-6 rounded-md shadow-md mt-6">
      {editingPlot && (
        <form
          onSubmit={handleEditSubmit}
          className="mb-4 p-4  shadow-md rounded"
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

      {!plots[0]?.message && paginatedPlots.length > 0 ? (
        <>
          <table className="w-full table-auto border-collapse">
            <thead>
              <tr>
                {/* Only show these two columns on small screens */}
                <th className="border px-2 py-2 min-w-[150px] max-w-[35%]">
                  Garden Name
                </th>
                <th className="border px-2 py-2 min-w-[100px] max-w-[15%]">
                  End Date
                </th>

                {/* Show these columns on medium screens and above */}
                <th className="border px-2 py-2 min-w-[50px] max-w-[15%] hidden md:table-cell">
                  Plot Size(ft.)
                </th>
                <th className="border px-2 py-2 min-w-[100px] max-w-[15%] hidden lg:table-cell">
                  Days Left
                </th>
                <th className="border px-2 py-2 min-w-[150px] max-w-[20%] hidden xl:table-cell">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedPlots.map((plot) => (
                <tr key={plot.id} className={getBackgroundColor(plot.end_date)}>
                  {/* Always show these two columns */}
                  <td className="border px-4 py-2 text-center">
                    <Link href={`/plots/${plot.id}`} className="text-blue-600">
                      {plot.garden_name}
                    </Link>
                  </td>
                  <td className="border px-4 py-2 text-center">
                    {formatDate(plot.reserved_until)}
                  </td>

                  {/* Conditionally render these columns based on screen size */}
                  <td className="border px-4 py-2 text-center hidden md:table-cell">
                    {plot.length}X{plot.width}
                  </td>
                  <td className="border px-4 py-2 text-center hidden lg:table-cell">
                    {calculateRemainingTime(plot.reserved_until)}
                  </td>
                  <td className="border px-4 py-2 text-center hidden xl:table-cell">
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
                      <div className="flex flex-wrap justify-center">
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
                          onClick={() => setRenewingPlot(plot.id)}
                          className="text-blue-600 ml-4"
                        >
                          Renew
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
              Page {currentPage} of {Math.ceil(plots.length / plotsPerPage)}
            </span>
            <button
              onClick={handleNextPage}
              className="p-2 bg-gray-200 rounded"
              disabled={currentPage === Math.ceil(plots.length / plotsPerPage)}
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

      {renewingPlot && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-md shadow-md">
            <h2 className="text-xl font-bold mb-4">Extend Plot</h2>
            <input
              type="number"
              value={renewWeeks}
              onChange={(e) => setRenewWeeks(e.target.value)}
              placeholder="Enter weeks (max 4)"
              min="1"
              max="4"
              className="w-full p-2 border border-gray-300 rounded-md mb-4"
            />
            <div className="flex space-x-4">
              <button
                onClick={() => handleRenewPlot(renewingPlot, renewWeeks)}
                className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
              >
                Extend (weeks)
              </button>
              <button
                onClick={() => setRenewingPlot(null)}
                className="bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserPlotsList;
