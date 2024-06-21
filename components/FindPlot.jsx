"use client";
import { useState } from 'react';

const FindPlot = () => {
  const [plots, setPlots] = useState([]);
  const [zipCode, setZipCode] = useState("");
  const [maxDistance, setMaxDistance] = useState(5); // Default to 5 miles
  const [limit, setLimit] = useState(10); // Default to 10
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const fetchPlots = async () => {
    try {
      const response = await fetch(`/api/plots?zipCode=${zipCode}&maxDistance=${maxDistance}&limit=${limit}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error("Error fetching plots");
      }

      const data = await response.json();
      if (data.message) {
        setMessage(data.message);
        setPlots([]);
      } else {
        setMessage('');
        setPlots(data);
      }
    } catch (error) {
      setError(error.message);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    fetchPlots();
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Available Plots</h1>
      {error && <p className="text-red-500">{error}</p>}
      {message && <p className="text-yellow-500">{message}</p>}
      <form onSubmit={handleSearch} className="mb-4">
        <div className="flex items-center gap-2">
          <div className="flex flex-col">
            <label className="mb-1">Zip Code:</label>
            <input
              type="text"
              value={zipCode}
              onChange={(e) => setZipCode(e.target.value)}
              placeholder="Enter Zip Code"
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
            <th className="border px-4 py-2">Location</th>
            <th className="border px-4 py-2">Size</th>
            <th className="border px-4 py-2">Status</th>
            <th className="border px-4 py-2">Distance (miles)</th>
          </tr>
        </thead>
        <tbody>
          {plots.map((plot) => (
            <tr key={plot.id}>
              <td className="border px-4 py-2">{plot.location}</td>
              <td className="border px-4 py-2">{plot.size}</td>
              <td className="border px-4 py-2">{plot.status}</td>
              <td className="border px-4 py-2">{(plot.distance / 1609.34).toFixed(2)}</td> {/* Convert meters to miles */}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default FindPlot;
