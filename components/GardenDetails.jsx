"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";

const GardenDetails = () => {
  const router = useRouter();
  const { id } = router.query;
  const [garden, setGarden] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;

    const fetchGarden = async () => {
      try {
        const response = await fetch(`/api/gardens/${id}`);
        const data = await response.json();
        if (response.ok) {
          setGarden(data);
        } else {
          setError(data.error);
        }
      } catch (err) {
        setError("Failed to fetch garden details.");
      }
    };

    fetchGarden();
  }, [id]);

  if (error) {
    return <div className="text-red-500 font-bold mt-4">{error}</div>;
  }

  if (!garden) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{garden.name}</h1>
      <div className="mb-4">
        <strong>Location:</strong> {garden.location}
      </div>
      <div className="mb-4">
        <strong>Description:</strong> {garden.description}
      </div>
      <div className="mb-4">
        <strong>Status:</strong> {garden.connected ? "Connected" : "Not Connected"}
      </div>
      <div className="mb-4">
        <strong>Contact:</strong> {garden.contact}
      </div>
    </div>
  );
};

export default GardenDetails;
