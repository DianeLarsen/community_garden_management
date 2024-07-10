"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import GardenMap from "./GardenMap";
import PlotsList from "./PlotsList";

const FindPlot = () => {
  const [gardens, setGardens] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [maxDistance, setMaxDistance] = useState(5); // Default to 5 miles
  const [limit, setLimit] = useState(10); // Default to 10
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [selectedGarden, setSelectedGarden] = useState(null);
  const [plots, setPlots] = useState([]); // State for storing plots
  const [loading, setLoading] = useState(true); // State for loading
  const [groups, setGroups] = useState([]);
  const [user, setUser] = useState({});
  const [userInfo, setUserInfo] = useState(false)
console.log(user)
  const fetchGardens = async () => {
    try {
      const response = await fetch(
        `/api/gardens?searchTerm=${searchTerm}&maxDistance=${maxDistance}&limit=${limit}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Error fetching gardens");
      }

      const data = await response.json();
      if (data.message) {
        setMessage(data.message);
        setGardens([]);
      } else {
        setMessage("");
        setGardens(data);
      }
    } catch (error) {
      setError(error.message);
    }
  };

  const fetchPlots = async (gardenId) => {
    try {
      const response = await fetch(`/api/plots?gardenId=${gardenId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Error fetching plots");
      }

      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        const availablePlots = data.filter(
          (plot) => plot.status === "available"
        );
        setPlots(availablePlots);
      } else {
        setPlots([]); // Set an empty array if no plots are found
      }
    } catch (error) {
      setError(error.message);
    }
  };

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("/api/profile", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        setUser(data.profile);

        setGroups(data.groups);
        setLoading(false);
      } catch (error) {
        setMessage("Error fetching profile data");
      } 
    };

    fetchProfileData();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    fetchGardens();
  };

  const handleRowClick = (garden) => {
    setSelectedGarden(garden);
    fetchPlots(garden.id);
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Find a Community Garden</h1>
      {error && <p className="text-red-500">{error}</p>}
      {message && <p className="text-yellow-500">{message}</p>}
      <form onSubmit={handleSearch} className="mb-4">
        <div className="flex items-center gap-2">
          <div className="flex flex-col">
            <label className="mb-1">Search Term:</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Enter Zip Code, Address, or City"
              className="border p-2 rounded"
              required
            />
          </div>
          <div className="flex flex-col">
            <label className="mb-1">Max Distance (miles):</label>
            <input
              type="number"
              value={maxDistance}
              onChange={(e) => setMaxDistance(e.target.value)}
              placeholder="Max Distance (miles)"
              className="border p-2 rounded"
            />
          </div>
          <div className="flex flex-col">
            <label className="mb-1">Limit:</label>
            <input
              type="number"
              value={limit}
              onChange={(e) => setLimit(e.target.value)}
              placeholder="Limit"
              className="border p-2 rounded"
            />
          </div>
          <button
            type="submit"
            className="bg-blue-500 text-white p-2 rounded mt-4"
          >
            Search
          </button>
        </div>
      </form>
      <table className="w-full table-auto border-collapse">
        <thead>
          <tr>
            <th className="border px-4 py-2">Name of Garden</th>
            <th className="border px-4 py-2">Available Plots</th>
            <th className="border px-4 py-2">Distance (miles)</th>
          </tr>
        </thead>
        <tbody>
          {gardens.map((garden) => (
            <tr key={garden.id} onClick={() => handleRowClick(garden)}>
              <td className="border px-4 py-2">
                <Link href={`/gardens/${garden.id}`}>{garden.name}</Link>
              </td>
              <td className="border px-4 py-2">{garden.available_plots}</td>
              <td className="border px-4 py-2">
                {(garden.distance / 1609.34).toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {selectedGarden && (
        <div>
          <h2 className="text-xl font-bold mt-4 mb-2">
            Available Plots at {selectedGarden.name}
          </h2>
          <PlotsList gardenId={selectedGarden.id} user={user} userInfo={false} status="available"/>

          <h2 className="text-xl font-bold mt-4 mb-2 text-blue-600">
            <Link href={`/gardens/${selectedGarden.id}`}>
              Map and Directions to {selectedGarden.name}
            </Link>
          </h2>
        </div>
      )}
    </div>
  );
};

export default FindPlot;
