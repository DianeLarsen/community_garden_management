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
  const [loading, setLoading] = useState(false); // Set initial loading state to false
  const { user, gardenPlots } = useContext(BasicContext);
  const [groupLegend, setGroupLegend] = useState({});
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

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
    if (startDate) {
      url += `&start_date=${startDate}`;
    }
    if (endDate) {
      url += `&end_date=${endDate}`;
    }

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
        setPlots(data);
      }

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

  const handleEditSubmit = async (e) => {};

  const formatDate = (date) => {
    const options = { month: "short", day: "numeric" };
    const formattedDate = new Date(date).toLocaleDateString("en-US", options);

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

  return (
    <div className="max-w-6xl mx-auto bg-white p-6 rounded-md shadow-md mt-6">
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Start Date</label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">End Date</label>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
        />
      </div>
      <button
        onClick={() => fetchPlots()}
        className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
      >
        Search Plots
      </button>
      {loading ? (
        <div>Loading...</div>
      ) : !plots[0]?.message && plots.length > 0 ? (
        <>
          <table className="w-full table-auto border-collapse">
            <thead>
              <tr>
                <th className="border px-2 py-2">Plot Size(ft.)</th>
                <th className="border px-2 py-2">Garden Name</th>
                <th className="border px-2 py-2">Status</th>
                <th className="border px-2 py-2">Actions</th> 	
              </tr>
            </thead>
            <tbody>
              {plots.map((plot) => (
                <tr key={plot.id}>
                  <td className="border px-4 py-2 text-center">
                    {plot.length}X{plot.width}
                  </td>
                  <td className="border px-4 py-2 text-center">
                    {plot.garden_name}
                  </td>
                  <td className="border px-4 py-2 text-center">
                    {plot.end_date ? calculateRemainingTime(plot.end_date) : "Available"}
                  </td>
                  <td className="border px-4 py-2 text-center">
                    {!plot.end_date && (
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
