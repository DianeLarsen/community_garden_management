"use client";
import { useParams } from "next/navigation";
import { useEffect, useState, useContext } from "react";
import GardenMap from "@/components/GardenMap";
import PlotCreate from "@/components/PlotCreate";
import PlotsList from "@/components/PlotsList";
import { BasicContext } from "@/context/BasicContext";
import GroupList from "@/components/GroupList";

const GardenDetails = () => {
  const { id } = useParams();
  const [garden, setGarden] = useState(null);
  const [plots, setPlots] = useState([]);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const { user, groups } = useContext(BasicContext);
  const [newPlot, setNewPlot] = useState({
    location: "",
    length: "",
    width: "",
    user_id: "",
    group_id: "",
  });
  console.log(user);

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

  const handleReservePlot = async (plotId) => {
    // Implement the reservation logic here
  };

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  if (!garden) {
    return <p>Loading...</p>;
  }
  return (
    <div className="container mx-auto p-4">
      <div className="mb-6 p-4 bg-white shadow-md rounded">
        <h1 className="text-2xl font-bold mb-4">{garden[0].name}</h1>
        <p>{garden[0].description}</p>
        {garden[0].links && (
          <p>
            Website:{" "}
            <a
              href={garden[0].links[0]}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 underline"
            >
              {garden[0].links[0]}
            </a>
          </p>
        )}
        {garden[0].contacts && garden[0].contacts.length > 0 && (
          <div className="mt-4">
            <h2 className="text-xl font-bold mb-2">Contacts</h2>
            {garden[0].contacts.map((contact, index) => (
              <p key={index}>
                {contact.name}: {contact.email}
              </p>
            ))}
          </div>
        )}
        {garden.address && <p>Address: {garden[0].address}</p>}
      </div>

      <div className="mb-6 p-4 bg-white shadow-md rounded">
        <h2 className="text-xl font-bold mb-4">
          Your Groups Using This Garden
        </h2>
        {groups[0]?.message ? (
          <p>No groups associated with this garden.</p>
        ) : (
        <GroupList groups={groups} error={error}/>
        )}
      </div>

      <div className="mb-6 p-4 bg-white shadow-md rounded">
        <h2 className="text-xl font-bold mb-4">Map and Directions</h2>
        {garden && <GardenMap garden={garden} />}
      </div>

      {user?.role == "admin" && (
        <div className="mb-6 p-4 bg-white shadow-md rounded">
          <h2 className="text-xl font-bold mb-4">Manage Plots</h2>
          <PlotCreate
            newPlot={newPlot}
            setNewPlot={setNewPlot}
            fetchPlots={fetchPlots}
            gardenId={id}
            groups={groups}
            role={user?.role}
          />
        </div>
      )}

      <div className="mb-6 p-4 bg-white shadow-md rounded">
        <h3 className="text-lg font-bold mb-4">Existing Plots</h3>

        <PlotsList
          setError={setError}
          gardenId={id}
          message={"No Plots associated with this garden."}
        />
      </div>
    </div>
  );
};

export default GardenDetails;
