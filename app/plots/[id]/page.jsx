"use client";
import { useParams } from "next/navigation";
import { useEffect, useState, useContext } from "react";
import Link from "next/link";
import PlotReservation from "@/components/PlotReservation";
import { BasicContext } from "@/context/BasicContext";
import { addWeeks } from "date-fns";

const PlotDetails = () => {
  const { id } = useParams();
  const [plot, setPlot] = useState(null);
  const [garden, setGarden] = useState(null);
  const [history, setHistory] = useState([]);
  const [events, setEvents] = useState([]);
  const { user, showBanner, isAdmin, userGroups } = useContext(BasicContext);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    length: "",
    width: "",
  });
  const [extending, setExtending] = useState(false);
  const [extendWeeks, setExtendWeeks] = useState(1);

  useEffect(() => {
    const fetchPlotDetails = async () => {
      try {
        const response = await fetch(`/api/plots/${id}`);
        if (!response.ok) {
          throw new Error("Error fetching plot details");
        }
        const data = await response.json();
        setPlot(data.plot);
        setGarden(data.garden);
        setHistory(data.history);
        setEvents(data.events);
      } catch (error) {
        setError(error.message);
      }
    };

    if (id) {
      fetchPlotDetails();
    }
  }, [id]);

  const handleReservePlot = async (reservationData) => {
    try {
      const response = await fetch(`/api/plots/${id}/reserve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reservationData),
      });

      if (!response.ok) {
        throw new Error("Error reserving plot");
      }

      const data = await response.json();
      setPlot(data.plot);
      setHistory(data.history);
      setEvents(data.events);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleEditPlot = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/plots/${id}/edit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(editForm),
      });

      if (!response.ok) {
        throw new Error("Error editing plot");
      }

      const data = await response.json();
      setPlot(data.plot);
      setEditing(false);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleExtendPlot = async () => {
    try {
      const newEndDate = addWeeks(new Date(plot.reserved_until), extendWeeks).toISOString();

      const response = await fetch(`/api/plots/${id}/extend`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ new_end_date: newEndDate }),
      });

      if (!response.ok) {
        throw new Error("Error extending plot reservation");
      }

      const data = await response.json();
      setPlot(data.plot);
      setExtending(false);
    } catch (error) {
      setError(error.message);
    }
  };

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  if (!plot || !garden) {
    return <p>Loading...</p>;
  }

  const canEditReservation = isAdmin || plot.user_id === user.id || userGroups.some(group => group.id === plot.group_id && group.role === 'admin');

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6 p-4 bg-white shadow-md rounded">
        <h1 className="text-2xl font-bold mb-4">Plot Details</h1>
        <p><strong>Size:</strong> {plot.length}X{plot.width}</p>
        {plot.reserved_by && (
          <p><strong>Reserved By:</strong> {plot.reserved_by}</p>
        )}
        <Link href={`/gardens/${garden.id}`} className="text-blue-500 underline">
          View Garden Details
        </Link>
      </div>

      <div className="mb-6 p-4 bg-white shadow-md rounded">
        <h2 className="text-xl font-bold mb-4">Plot History</h2>
        <ul>
          {history.map((entry, index) => (
            <li key={index} className="mb-2">
              <p>{entry.purpose}</p>
              <p><strong>Reserved From:</strong> {new Date(entry.reserved_at).toLocaleString()}</p>
              <p><strong>Reserved Until:</strong> {new Date(entry.reserved_until).toLocaleString()}</p>
            </li>
          ))}
        </ul>
      </div>

      {canEditReservation && (
        <PlotReservation
          plot={plot}
          user={user}
          groups={userGroups}
          handleReservePlot={handleReservePlot}
          showBanner={showBanner}
        />
      )}

      {canEditReservation && (
        <div className="mb-6 p-4 bg-white shadow-md rounded">
          <h2 className="text-xl font-bold mb-4">Edit Plot Details</h2>
          {editing ? (
            <form onSubmit={handleEditPlot} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Length
                </label>
                <input
                  type="text"
                  value={editForm.length}
                  onChange={(e) => setEditForm({ ...editForm, length: e.target.value })}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Width
                </label>
                <input
                  type="text"
                  value={editForm.width}
                  onChange={(e) => setEditForm({ ...editForm, width: e.target.value })}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <button
                type="submit"
                className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600"
              >
                Cancel
              </button>
            </form>
          ) : (
            <button
              onClick={() => {
                setEditForm({ length: plot.length, width: plot.width });
                setEditing(true);
              }}
              className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
            >
              Edit Plot Details
            </button>
          )}
        </div>
      )}

      {canEditReservation && (
        <div className="mb-6 p-4 bg-white shadow-md rounded">
          <h2 className="text-xl font-bold mb-4">Extend Plot Reservation</h2>
          {extending ? (
            <div className="space-y-4">
              <input
                type="number"
                value={extendWeeks}
                onChange={(e) => setExtendWeeks(e.target.value)}
                placeholder="Enter weeks (max 4)"
                min="1"
                max="4"
                className="w-full p-2 border border-gray-300 rounded-md"
              />
              <button
                onClick={handleExtendPlot}
                className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
              >
                Extend
              </button>
              <button
                onClick={() => setExtending(false)}
                className="bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setExtending(true)}
              className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
            >
              Extend Plot Reservation
            </button>
          )}
        </div>
      )}

      <div className="mb-6 p-4 bg-white shadow-md rounded">
        <h2 className="text-xl font-bold mb-4">Associated Events</h2>
        <ul>
        {events.map((event, index) => (
            <li key={index} className="mb-4">
              <p><strong>Event Name:</strong> {event.name}</p>
              <p><strong>Organizer:</strong> {event.organizer}</p>
              <p><strong>Start:</strong> {new Date(event.start_date).toLocaleString()}</p>
              <p><strong>End:</strong> {new Date(event.end_date).toLocaleString()}</p>
              <Link href={`/events/${event.id}`} className="text-blue-500 underline">
                View Event Details
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default PlotDetails;
