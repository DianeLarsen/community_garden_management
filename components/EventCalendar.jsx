"use client";
import { useState, useEffect, useContext } from "react";
import { BasicContext } from "@/context/BasicContext";
import Link from "next/link";
import {
  addMonths,
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  isSameDay,
  isSameMonth,
  isBefore,
  isToday,
  loading,
} from "date-fns";

import { useRouter } from "next/navigation";

const EventCalendar = () => {
  const {
    events,
    error,
    message,
    user,
    handleNextMonth,
    handlePrevMonth,
    currentDate,
    availablePlots,
    setAvailablePlots,
    selectedGarden,
    setSelectedGarden,
    selectedGroup,
    setSelectedGroup,
    distance,
    setDistance,
    filteredEvents,
    setFilteredEvents,
    loading,
  } = useContext(BasicContext);
  const router = useRouter();
  const [groups, setGroups] = useState([]);
  const [gardens, setGardens] = useState([]);

  useEffect(() => {
    // Fetch all groups the user is in
    const fetchGroups = async () => {
      try {
        const response = await fetch(`/api/groups`);
        const data = await response.json();
        setGroups(data);
      } catch (err) {
        console.error("Error fetching groups:", err);
      }
    };

    fetchGroups();
  }, []);


  useEffect(() => {
    // Fetch gardens based on distance
    const fetchGardens = async () => {
      try {
        const response = await fetch(`/api/gardens?distance=${distance}`);
        const data = await response.json();
        setGardens(data);
      } catch (err) {
        console.error("Error fetching gardens:", err);
      }
    };

    fetchGardens();
  }, [distance]);

  const handleDistanceChange = (e) => {
    setDistance(e.target.value);
    router.refresh();
  };

  const handleGroupChange = (e) => {
    setSelectedGroup(e.target.value);
  };

  const handleGardenChange = (e) => {
    setSelectedGarden(e.target.value);
  };

  const handleAvailablePlotsChange = (e) => {
    setAvailablePlots(e.target.value);
  };

  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate),
  });
  const startDay = getDay(startOfMonth(currentDate));
  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {error ||
        (events.error && (
          <p className="text-red-500">{error || events.error}</p>
        ))}
      {message ||
        (events.message && (
          <p className="text-yellow-500">{message || events.message}</p>
        ))}

      <div className="filters flex flex-wrap gap-4 mb-4">
        <label>
          Distance:
          <select
            value={distance}
            onChange={handleDistanceChange}
            className="ml-2 p-1 border rounded"
          >
            <option value="5">5 miles</option>
            <option value="10">10 miles</option>
            <option value="20">20 miles</option>
            <option value="50">50 miles</option>
            <option value="100">100 miles</option>
          </select>
        </label>

        <label>
          Group:
          <select
            value={selectedGroup}
            onChange={handleGroupChange}
            className="ml-2 p-1 border rounded"
          >
            <option value="">All</option>
            {groups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          Garden:
          <select
            value={selectedGarden}
            onChange={handleGardenChange}
            className="ml-2 p-1 border rounded"
          >
            <option value="">All</option>
            {gardens.map((garden) => (
              <option key={garden.id} value={garden.id}>
                {garden.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          Available Plots:
          <select
            value={availablePlots}
            onChange={handleAvailablePlotsChange}
            className="ml-2 p-1 border rounded"
          >
            <option value="all">All</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </label>
      </div>

      <div className="calendar-nav flex justify-between items-center mb-4">
        <button onClick={handlePrevMonth} className="p-2 bg-gray-200 rounded">
          Previous Month
        </button>
        <h2 className="text-xl font-bold">
          {format(currentDate, "MMMM yyyy")}
        </h2>
        <button onClick={handleNextMonth} className="p-2 bg-gray-200 rounded">
          Next Month
        </button>
      </div>

      <div className="calendar-grid grid grid-cols-7 gap-2">
        {Array.from({ length: startDay }).map((_, index) => (
          <div key={index} className="calendar-day empty"></div>
        ))}
        {daysInMonth.map((day) => (
          <div
            key={day}
            className={`calendar-day p-2 border rounded bg-white ${
              isBefore(day, new Date()) && !isToday(day) ? "bg-gray-200" : ""
            }`}
          >
            <div className="date font-bold mb-2">{format(day, "d")}</div>
            <div className="events">
              {filteredEvents
                .filter((event) => isSameDay(new Date(event.date), day))
                .map((event) => (
                  <Link
                    href={`/events/${event.id}`}
                    key={event.id}
                    className={`event block mb-2 p-1 rounded ${
                      isBefore(new Date(event.date), new Date())
                        ? "text-gray-500 line-through"
                        : ""
                    }`}
                  >
                    <h3 className="font-semibold">{event.name}</h3>
                    <p className="text-sm">
                      {new Date(event.date).toLocaleDateString()}
                    </p>
                  </Link>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EventCalendar;
