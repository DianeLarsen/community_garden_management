"use client";
import { useParams } from "next/navigation";
import { useEffect, useState, useContext } from "react";
import GardenMap from "@/components/GardenMap";
import PlotCreate from "@/components/PlotCreate";
import PlotsList from "@/components/PlotsList";
import { BasicContext } from "@/context/BasicContext";
import GroupList from "@/components/GroupList";
import CreateEvent from "@/components/CreateEvent";

const GardenDetails = () => {
  const { id } = useParams();

  const [error, setError] = useState("");
  const [directionAddress, setDirectionAddress] = useState("");
  const { user, groups, setGardenId, gardenGroups, gardenEvents, gardenPlotReservations, gardenPlots, garden } = useContext(BasicContext);
  console.log(garden)
  const [showDirections, setShowDirections] = useState(false);
  const [newPlot, setNewPlot] = useState({
    location: "",
    length: "",
    width: "",
    user_id: "",
    group_id: "",
  });

  useEffect(() => {
    setGardenId(id)
  }, [id]);



  const handleAddressChange = (e) => {
    setDirectionAddress(e.target.value);
  };

  const handleGetDirections = (e) => {
    e.preventDefault();
    // Logic to fetch directions using the directionAddress
  };

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  if (!garden) {
    return <p>Loading...</p>;
  }

  const handleShowDirections = () => {
    setShowDirections((prev) => !prev);
  };

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
        {garden[0].address && <p>Address: {garden[0].address}</p>}
      </div>

      <div className="mb-6 p-4 bg-white shadow-md rounded">
        <h2 className="text-xl font-bold mb-4">
          Your Groups Using This Garden
        </h2>
        {(gardenGroups.length === 0 || (gardenGroups.reserved_plots === 0 || !gardenGroups.reserved_plots)) ? (
          <p>No groups associated with this garden.</p>
        ) : (
          <GroupList groups={groups} error={error} />
        )}
      </div>

      <div className="mb-6 p-6 bg-white shadow-md rounded">
        <h2 className="text-xl font-bold mb-4">Map and Directions</h2>
        <form
          className="mb-4 flex items-center gap-2"
          onSubmit={handleGetDirections}
        >
          <input
            type="text"
            className={`border p-2 rounded ${
              directionAddress ? "w-3/4" : "w-full"
            }`}
            placeholder="Enter your address"
            value={directionAddress}
            onChange={handleAddressChange}
          />
          {directionAddress && (
            <button
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition duration-300"
              onClick={handleShowDirections}
            >
              Show Trip length Info
            </button>
          )}
        </form>
        {garden && (
          <GardenMap
            garden={garden}
            user={user}
            directionAddress={directionAddress}
            showDirections={showDirections}
          />
        )}
      </div>

      {user?.role == "admin" && (
        <div className="mb-6 p-4 bg-white shadow-md rounded">
          <h2 className="text-xl font-bold mb-4">Manage Plots</h2>
          <PlotCreate
            newPlot={newPlot}
            setNewPlot={setNewPlot}
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
          plots={gardenPlots}
          gardenId={id}
          message={"No Plots associated with this garden."}
        />
      </div>
      <CreateEvent gardenId={id} />
    </div>
  );
};

export default GardenDetails;
