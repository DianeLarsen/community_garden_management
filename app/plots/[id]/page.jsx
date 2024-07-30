"use client";
import { useParams } from "next/navigation";
import { useEffect, useState, useContext } from "react";
import Link from "next/link";
import PlotReservation from "@/components/PlotReservation";
import { BasicContext } from "@/context/BasicContext";

const PlotDetails = () => {
  const { id } = useParams();
  const [plot, setPlot] = useState(null);
  const [garden, setGarden] = useState(null);
  const [history, setHistory] = useState([]);
  const [events, setEvents] = useState([]);
  const { user, showBanner, isAdmin, userGroups } = useContext(BasicContext);
  const [error, setError] = useState("");

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
