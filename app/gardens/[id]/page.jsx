"use client";
import { useParams, Link } from "next/navigation";
import { useEffect, useState } from "react";
import GardenMap from "@/components/GardenMap";

const GardenDetails = () => {
  const { id } = useParams();
  const [garden, setGarden] = useState(null);
  const [plots, setPlots] = useState([]);
  const [groups, setGroups] = useState([]);
  const [error, setError] = useState("");
  const [newPlot, setNewPlot] = useState({ size: "", status: "", user_id: "" });

  useEffect(() => {
    const fetchGarden = async () => {
      try {
        const response = await fetch(`/api/gardens/${id}`);
        if (!response.ok) {
          throw new Error("Error fetching garden details");
        }
        const data = await response.json();
        setGarden(data);
        fetchPlots(id);
        fetchGroups(id);
      } catch (error) {
        setError(error.message);
      }
    };

    if (id) {
      fetchGarden();
    }
  }, [id]);

  const fetchPlots = async (gardenId) => {
    try {
      const response = await fetch(`/api/plots?gardenId=${gardenId}`);
      if (!response.ok) {
        throw new Error("Error fetching plots");
      }
      const data = await response.json();
      setPlots(data.length > 0 ? [...data] : [data]);
    } catch (error) {
      setError(error.message);
    }
  };

  const fetchGroups = async (gardenId) => {
    try {
      const response = await fetch(`/api/groups?gardenId=${gardenId}`);
      if (!response.ok) {
        throw new Error("Error fetching groups");
      }
      const data = await response.json();
      setGroups(data.length > 0 ? [...data] : [data]);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewPlot((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddPlot = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/plots?gardenId=${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newPlot),
      });

      if (!response.ok) {
        throw new Error("Error adding plot");
      }

      fetchPlots(id);
      setNewPlot({ size: "", status: "", user_id: "" });
    } catch (error) {
      setError(error.message);
    }
  };

  const handleDeletePlot = async (plotId) => {
    try {
      const response = await fetch(`/api/gardens/${id}/plots/${plotId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Error deleting plot");
      }

      fetchPlots(id);
    } catch (error) {
      setError(error.message);
    }
  };

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  if (!garden) {
    return <p>Loading...</p>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{garden[0].name}</h1>
      <p>{garden[0].description}</p>
      {garden[0].links && (
        <p>
          Website:{" "}
          <Link href={garden[0].website} target="_blank" rel="noopener noreferrer" className="text-blue-500">
            {garden[0].links}
          </Link>
        </p>
      )}
      {garden[0].contact && <p>Contact: {garden[0].contact}</p>}
      {garden[0].address && <p>Address: {garden[0].address}</p>}
      <h2 className="text-xl font-bold mt-4 mb-2">Groups Using This Garden</h2>
      {groups[0]?.message ? (
         <p>No groups associated with this garden.</p>

      ) : (
        <ul>
        {groups.map((group) => (
          <li key={group.id}>
            <h3 className="text-lg font-bold">{group.name}</h3>
            <p>{group.description}</p>
          </li>
        ))}
      </ul>
      )}

      <h2 className="text-xl font-bold mt-4 mb-2">Map and Directions</h2>
      {garden && <GardenMap garden={garden} />}

      <h2 className="text-xl font-bold mt-4 mb-2">Manage Plots</h2>
      <form onSubmit={handleAddPlot} className="mb-4">
        <div className="mb-2">
          <label className="block text-sm font-medium text-gray-700">Size</label>
          <input
            type="text"
            name="size"
            value={newPlot.size}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        <div className="mb-2">
          <label className="block text-sm font-medium text-gray-700">Status</label>
          <input
            type="text"
            name="status"
            value={newPlot.status}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        <div className="mb-2">
          <label className="block text-sm font-medium text-gray-700">User ID</label>
          <input
            type="text"
            name="user_id"
            value={newPlot.user_id}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        <button
          type="submit"
          className="w-full py-2 px-4 bg-blue-600 text-white rounded"
        >
          Add Plot
        </button>
      </form>

      <h3 className="text-lg font-bold mb-2">Existing Plots</h3>
      {plots[0]?.message ? (<p>No plots available.</p>
        
      ) : (
        <ul>
          {plots.map((plot) => (
            <li key={plot.id} className="mb-2 flex justify-between items-center">
              <div>
                <p>Size: {plot.size}</p>
                <p>Status: {plot.status}</p>
                <p>User ID: {plot.user_id}</p>
              </div>
              <button onClick={() => handleDeletePlot(plot.id)} className="text-red-600">
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default GardenDetails;
