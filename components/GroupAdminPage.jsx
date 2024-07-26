"use client";
import { useState, useEffect, useContext } from "react";
import { BasicContext } from "@/context/BasicContext";
import { useParams } from "next/navigation";
import PlotsList from "./PlotsList";

const GroupAdminPage = () => {
  const { id } = useParams();
  const { user, token } = useContext(BasicContext);
  const [group, setGroup] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [acceptingMembers, setAcceptingMembers] = useState(false);
  const [gardens, setGardens] = useState([]);
  const [selectedGardenId, setSelectedGardenId] = useState("");
  const [plots, setPlots] = useState([]);
  const [selectedPlots, setSelectedPlots] = useState([]);
  const [reservedPlots, setReservedPlots] = useState([]);

  useEffect(() => {
    const fetchGroupDetails = async () => {
      try {
        const response = await fetch(`/api/groups/${id}`);
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch group details");
        }
        setGroup(data.group);
        setName(data.group.name);
        setDescription(data.group.description);
        setLocation(data.group.location);
        setAcceptingMembers(data.group.accepting_members);
        // setReservedPlots(data.plots || []);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchGroupDetails();
    }
  }, [id]);

  useEffect(() => {
    const fetchGardens = async () => {
      try {
        const response = await fetch("/api/gardens");
        const data = await response.json();
        setGardens(data);
      } catch (error) {
        console.error("Error fetching gardens:", error);
      }
    };

    fetchGardens();
  }, []);

  //   useEffect(() => {
  //     const fetchPlots = async () => {
  //       if (selectedGardenId) {
  //         try {
  //           const response = await fetch(`/api/plots?gardenId=${selectedGardenId}`);
  //           const data = await response.json();
  //           setPlots(data);
  //         } catch (error) {
  //           console.error('Error fetching plots:', error);
  //         }
  //       }
  //     };

  //     fetchPlots();
  //   }, [selectedGardenId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`/api/groups/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          description,
          location,
          accepting_members: acceptingMembers,
          selected_plots: selectedPlots,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to update group");
      }
      alert("Group updated successfully");
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlot = (plotId) => {
    setSelectedPlots((prevSelectedPlots) => {
      if (prevSelectedPlots.includes(plotId)) {
        return prevSelectedPlots.filter((id) => id !== plotId);
      } else {
        return [...prevSelectedPlots, plotId];
      }
    });
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Group Admin Page</h1>
      {error && <p className="text-red-500">{error}</p>}
      {group && (
        <>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Group Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Accepting Members
              </label>
              <input
                type="checkbox"
                checked={acceptingMembers}
                onChange={(e) => setAcceptingMembers(e.target.checked)}
                className="mt-1"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Select Garden
              </label>
              <select
                value={selectedGardenId}
                onChange={(e) => setSelectedGardenId(e.target.value)}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="">Select a garden</option>
                {gardens.map((garden) => (
                  <option key={garden.id} value={garden.id}>
                    {garden.name}
                  </option>
                ))}
              </select>
            </div>
            {selectedGardenId && (
              <div className="mb-4">
                <h3 className="text-lg font-bold mb-2">Select Plots</h3>
                <PlotsList
                  gardenId={selectedGardenId}
                  user={user}
                  userInfo={false}
                  status="available"
                  groupId={id}
                  groupInfo={false}
                />
              </div>
            )}
            <button
              type="submit"
              className="w-full py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Update Group
            </button>
          </form>
          <div className="mt-8">
            <h2 className="text-xl font-bold mb-4">Reserved Plots</h2>
            <PlotsList
              user={user}
              userInfo={false}
              groupId={id}
              groupInfo={true}
              status="reserved"
            />
          </div>
        </>
      )}
    </div>
  );
};

export default GroupAdminPage;
