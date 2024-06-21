"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

const GardenList = () => {
  const [gardens, setGardens] = useState([]);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("");

  useEffect(() => {
    const fetchGardens = async () => {
      try {
        const response = await fetch("/api/gardens");
        const data = await response.json();
        if (response.ok) {
          setGardens(data);
        } else {
          setError(data.error);
        }
      } catch (err) {
        setError("Failed to fetch gardens.");
      }
    };

    fetchGardens();
  }, []);

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
  };

  const filteredGardens = gardens.filter(garden =>
    garden.location.toLowerCase().includes(filter.toLowerCase())
  );

  if (error) {
    return <div className="text-red-500 font-bold mt-4">{error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Community Gardens</h1>
      <input
        type="text"
        value={filter}
        onChange={handleFilterChange}
        placeholder="Filter by location"
        className="border p-2 rounded mb-4 w-full"
      />
      <ul className="list-none p-0">
        {filteredGardens.map(garden => (
          <li key={garden.id} className="bg-gray-100 mb-4 p-4 rounded shadow-md">
            <div className="font-semibold">Name: {garden.name}</div>
            <div>Location: {garden.location}</div>
            <div>Status: {garden.connected ? "Connected" : "Not Connected"}</div>
            <Link href={`/garden/${garden.id}`} className="text-blue-500 underline mt-2 inline-block">
              View Details
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default GardenList;
