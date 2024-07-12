"use client";
import { useState, useEffect, useContext } from "react";
import { BasicContext } from "@/context/BasicContext";
import Link from "next/link";

const EventCalendar = () => {
  const { events, error, message } = useContext(BasicContext);
console.log(events)
  if (!events) {
    return <div>Loading...</div>;
  }

  return (
    <div>
        {error && <p className="text-red-500">{error}</p>}
        {message && <p className="text-yellow-500">{message}</p>}
      {(!events.error && events )&& events.map((event) => (
        <div key={event.id} className="event">
          <Link href={`/events/${event.id}`}>
            <h3>{event.name}</h3>
            <p>{new Date(event.date).toLocaleDateString()}</p>
          </Link>
        </div>
      ))}
    </div>
  );
};

export default EventCalendar;
