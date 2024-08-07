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
  plots = []
}) => {
  const [filteredPlots, setFilteredPlots] = useState([]);
  const [returnMessage, setReturnMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useContext(BasicContext);
  const [groupLegend, setGroupLegend] = useState({});
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
console.log(filteredPlots)
  useEffect(() => {
    setLoading(true);
    const result = filterPlots(plots, { groupId, gardenId, userInfo, startDate, endDate });
    setFilteredPlots(result);
    setLoading(false);

    const legend = {};
    result.forEach((plot) => {
      if (plot.group_id && !legend[plot.group_id]) {
        legend[plot.group_id] = plot.group_name;
      }
    });
    setGroupLegend(legend);
  }, [groupId, gardenId, userInfo, startDate, endDate, plots]);

  const calculateRemainingTime = (endDate) => {
    const now = new Date();
    const end = new Date(endDate);
    const totalDays = differenceInDays(end, now);

    if (totalDays <= 0) return "Expired";

    const weeks = Math.floor(totalDays / 7);
    const days = totalDays % 7;

    if (weeks > 0) {
      return `${weeks} wk${weeks !== 1 ? "s" : ""} / ${days} day${days !== 1 ? "s" : ""}`;
    } else {
      return `${days} day${days !== 1 ? "s" : ""}`;
    }
  };
  const filterPlots = (plots, { groupId, gardenId, userInfo, startDate, endDate }) => {
    return plots.filter((plot) => {
      if (groupId && plot.group_id !== groupId) return false;
      if (gardenId && plot.garden_id !== gardenId) return false;
      if (userInfo && plot.user_info !== userInfo) return false;
      if (startDate && new Date(plot.start_date) < new Date(startDate)) return false;
      if (endDate && new Date(plot.end_date) > new Date(endDate)) return false;
      return true;
    });
  };
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
      {loading ? (
        <div>Loading...</div>
      ) : filteredPlots.length > 0 ? (
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
              {filteredPlots.map((plot) => (
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
