"use client";
import { useState, useEffect, useContext } from "react";
import { useRouter, useParams } from "next/navigation";
import { BasicContext } from "@/context/BasicContext";

const EditEvent = () => {
  const { id } = useParams();
  const { user, groups, token } = useContext(BasicContext);
  const [event, setEvent] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [plotId, setPlotId] = useState("");
  const [groupId, setGroupId] = useState("N/A");
  const [message, setMessage] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [plots, setPlots] = useState([]);
  const [plotDetails, setPlotDetails] = useState(null);
  const [error, setError] = useState("");
  const router = useRouter();

  const formatDateTimeLocal = (date) => {
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(d.getDate()).padStart(2, "0")}T${String(d.getHours()).padStart(
      2,
      "0"
    )}:${String(d.getMinutes()).padStart(2, "0")}`;
  };

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        const response = await fetch(`/api/events/${id}`);
        const data = await response.json();
        setEvent(data.event);
        setName(data.event.name);
        setDescription(data.event.description);
        setStartDate(formatDateTimeLocal(data.event.start_date));
        setEndDate(formatDateTimeLocal(data.event.end_date));
        setPlotId(data.event.plot_id || "N/A");
        setGroupId(data.event.group_id || "N/A");
        setIsPublic(data.event.is_public);
      } catch (error) {
        console.error("Error fetching event details:", error);
      }
    };

    fetchEventDetails();
  }, [id]);

  useEffect(() => {
    const fetchPlots = async () => {
      try {
        let url = `/api/plots?user_id=${user.id}&userInfo=${user.role !== 'admin'}`;
        if (groupId !== "N/A") {
          url += `&groupId=${groupId}`;
        }
        const response = await fetch(url);
        const data = await response.json();
        if (data.message) {
          setMessage(data.message);
        }
        setPlots(data);
      } catch (err) {
        console.error("Error fetching plots:", err);
      }
    };
    if (user.id) {
      fetchPlots();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.id, groupId]);

  useEffect(() => {
    const fetchPlotDetails = async () => {
      if (plotId && plotId !== "N/A") {
        try {
          const response = await fetch(`/api/plot-details/${plotId}`);
          const data = await response.json();
          setPlotDetails(data);
        } catch (error) {
          console.error("Error fetching plot details:", error);
        }
      }
    };

    fetchPlotDetails();
  }, [plotId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/events/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          description,
          start_date: startDate,
          end_date: endDate,
          plot_id: plotId,
          group_id: groupId,
          is_public: isPublic,
        }),
      });

      if (response.ok) {
        alert("Event updated successfully!");
        router.push(`/events/${id}`);
      } else {
        const errorData = await response.json();
        alert(`Failed to update event: ${errorData.error}`);
      }
    } catch (error) {
      console.error("Error updating event:", error);
    }
  };

  if (!event && !plots) {
    return <div className="text-center mt-10">Loading...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-md shadow-md">
      <h1 className="text-2xl font-bold mb-6">Edit Event</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Event Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Event Name"
            required
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Event Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Event Description"
            required
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Start Date and Time
          </label>
          <input
            type="datetime-local"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            End Date and Time
          </label>
          <input
            type="datetime-local"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            required
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Current Group
          </label>
          <p className="mt-1">
            {groupId !== "N/A" && event ? `${event.group_name}` : "N/A"}
          </p>
          <label className="block text-sm font-medium text-gray-700">
            Change Group
          </label>
          <select
            value={groupId || ""}
            onChange={(e) => setGroupId(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
          >
            <option value="">Select Group</option>
            {groups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Public Event
          </label>
          <input
            type="checkbox"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
            className="mt-1"
          />
        </div>
        <div>
  <label className="block text-sm font-medium text-gray-700">
    Current Plot
  </label>
  <p className="mt-1">
    {plotId !== "N/A" && event ? `${event.plot_name}` : "N/A"}
  </p>
  <label className="block text-sm font-medium text-gray-700 mt-4">
    Change Plot
  </label>
  <select
    value={plotId || ""}
    onChange={(e) => setPlotId(e.target.value)}
    required={!event?.plot_id} // Only required if there is no plot associated with the event
    className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
  >
    <option value="">Select Plot</option>
    {plots.length > 0 &&
      plots.map((plot) => (
        <option key={plot.id} value={plot.id}>
          {plot.garden_name} - {plot.length}X{plot.width}
        </option>
      ))}
  </select>
</div>

        {plotDetails && (
          <div className="mt-4 p-4 bg-gray-100 rounded-md">
            <h2 className="text-lg font-bold mb-2">
              Plot Reservation Information
            </h2>
            <p>Reserved by: {plotDetails.reserved_by}</p>
            <p>
              Reservation start:{" "}
              {new Date(plotDetails.reservation_start).toLocaleString()}
            </p>
            <p>
              Reservation end:{" "}
              {new Date(plotDetails.reservation_end).toLocaleString()}
            </p>
          </div>
        )}
        <div>
        {message && <p>{message}</p>}
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
          >
            Update Event
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditEvent;
