"use client";
import { useState, useEffect, useContext } from "react";
import Link from "next/link";
import { BasicContext } from "@/context/BasicContext";
import { differenceInDays } from "date-fns";

const PlotsList = ({
  gardenId = "",
  groupId = "",
  status = "available",
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
  console.log(plots);
  useEffect(() => {
    if (!user.id && !plots) {
      setLoading(true);
    }
  }, [user?.id, plots]);

  useEffect(() => {
    const fetchPlots = async () => {
      setLoading(true);
      let url = `/api/plots?`;
      if (groupInfo) {
        url += `&groupId=${groupId}`;
      }
      if (gardenId) {
        url += `&gardenId=${gardenId}`;
      }
      if (userInfo) {
        url += `&userInfo=${userInfo}`;
      }

      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error("Error fetching plots");
        }
        const data = await response.json();
        console.log(status);
        if (data.message) {
          setReturnMessage(data.message);
          setLoading(false);
        }
        if (userInfo) {
          const userPlots = data.filter((plot) => plot.user_id === user.id);
          setPlots(userPlots);
        } else {
          if (status) {
            const statusPlots = data.filter((plot) => plot.status === status);
            setPlots(statusPlots);
          } else {
            setPlots(data);
          }
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
    if (gardenId || user.id) {
      fetchPlots();
    }
  }, [gardenId, groupId, user?.id]);

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

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto bg-white p-6 rounded-md shadow-md mt-6">
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

      {!plots[0]?.message && plots.length > 0 ? (
        <>
          <table className="w-full table-auto border-collapse">
            <thead>
              <tr>
                <th className="border px-2 py-2">Plot Size(ft.)</th>
                <th className="border px-2 py-2">
                  Status (total = {plots.length})
                </th>
                <th className="border px-2 py-2">Actions</th>
                {status != "available" && (
                  <>
                    {" "}
                    <th className="border px-2 py-2">Start Date</th>
                    <th className="border px-2 py-2">End Date</th>
                    <th className="border px-2 py-2">Days Left</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {plots.map((plot) => (
                <tr key={plot.id}>
                  <td className="border px-4 py-2 text-center">
                    {plot.length}X{plot.width}
                  </td>
                  <td className="border px-4 py-2 text-center ml-4">
                    {plot.status === "reserved" && plot.group_id ? (
                      <>
                        Reserved<sup>{plot.group_id}</sup>
                      </>
                    ) : (
                      plot.status
                    )}
                  </td>
                  <td className="border px-4 py-2 text-center">
                    {plot.status === "available" && (
                      <Link
                        href={`/plots/${plot.id}`}
                        className="text-blue-600 ml-4"
                      >
                        Reserve
                      </Link>
                    )}
                    {(plot.user_id === user.id ||
                      user?.role === "admin" ||
                      (user.groups && user.groups.includes(plot.group_id))) && (
                      <button
                        onClick={() => handleRemovePlot(plot.id)}
                        className="text-red-600 ml-4"
                      >
                        Remove
                      </button>
                    )}
                    {user?.role === "admin" && (
                      <>
                        <button
                          onClick={() => handleEditPlot(plot)}
                          className="text-green-600 ml-4"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeletePlot(plot.id)}
                          className="text-red-600 ml-4"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </td>
                  {status != "available" && (
                    <>
                      {" "}
                      <td className="border px-4 py-2 text-center ml-4">
                        {formatDate(plot.start_date)}
                      </td>
                      <td className="border px-4 py-2 text-center ml-4">
                        {formatDate(plot.end_date)}
                      </td>
                      <td className="border px-4 py-2 text-center ml-4">
                        {calculateRemainingTime(plot.end_date)}
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
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

export default PlotsList;
