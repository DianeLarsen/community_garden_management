"use client";
import { useState, useEffect, useContext } from "react";
import Link from "next/link";
import { BasicContext } from "@/context/BasicContext";

const EventsList = () => {
  const { user, token } = useContext(BasicContext);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserEvents = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/user-events', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();

        setEvents(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching user events:", error);
        setLoading(false);
      }
    };

    fetchUserEvents();
  }, [token]);

  return (
    <div className="max-w-4xl mx-auto bg-white p-6 rounded-md shadow-md mt-6">
      <h2 className="text-xl font-bold mb-4">Events</h2>
      {loading ? (
        <p>Loading...</p>
      ) : events.length > 0 ? (
        <ul className="list-disc pl-5">
          {events.map((event) => (
            <li key={event.id} className="text-gray-700 mb-2">
              <Link href={`/events/${event.id}`} className="text-blue-500 hover:underline">
                {event.name}
              </Link> - {event.status}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500">No events found</p>
      )}
    </div>
  );
};

export default EventsList;
