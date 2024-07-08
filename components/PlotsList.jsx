"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
const PlotsList = ({ user = "", setError = [], message = "", gardenId = "", groupId = ""}) => {
  const [plots, setPlots] = useState([]);
  const [userInfo, setUserInfo] = useState(false);

  useEffect(() => {
    if (user) {
      setUserInfo(true);
    } else {
      setUserInfo(false);
    }
  }, [user]);


  useEffect(() => {
  const fetchPlots = async () => {
    try {
      const response = await fetch(
        `/api/plots?gardenId=${gardenId}&groupId=${groupId}&userInfo=${userInfo}`
      );
      if (!response.ok) {
        throw new Error("Error fetching plots");
      }
      const data = await response.json();
      setPlots(data.length > 0 ? [...data] : [data]);
    } catch (error) {
      setError(error.message);
    }
  };
  fetchPlots()
}, [gardenId, groupId, userInfo]);
const handleDeletePlot = async (plotId) => {
  try {
    const response = await fetch(`/api/gardens/${id}/plots/${plotId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Error deleting plot");
    }


  } catch (error) {
    setError(error.message);
  }
};

  return (
    <div className="p-6">
      <ul className="list-none p-0">
        {plots[0]?.message || plots.length === 0 ? (
          <p>{message}</p>
        ) : (
          plots.map((plot) => (
            <li
              key={plot.id}
              className="mb-2 flex justify-between items-center"
            >
              <div>
                <p>Size: {plot.size}</p>
                <p>Status: {plot.status}</p>
                <p>User ID: {plot.user_id}</p>
              </div>
              {user?.isAdmin && (
                <button
                  onClick={() => handleDeletePlot(plot.id)}
                  className="text-red-600"
                >
                  Delete
                </button>
              )}
              {plot.status === "available" && (
                <Link
                  href={`/plots/reserve/${plot.id}`}
                  className="text-blue-600 ml-4"
                >
                  Reserve
                </Link>
              )}
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export default PlotsList;
