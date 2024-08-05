"use client";
import { useState, useEffect, useContext } from "react";
import { BasicContext } from "@/context/BasicContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  addMonths,
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  isSameDay,
  isBefore,
  isToday,
} from "date-fns";
// import useReloadOnLoading from "@/hooks/useReloadOnLoading";

const EventCalendar = () => {
  const {
    events,
    error,
    message,
    user,
    handleNextMonth,
    handlePrevMonth,
    currentDate,
    selectedGarden,
    setSelectedGarden,
    selectedGroup,
    setSelectedGroup,
    distance,
    setDistance,
    filteredEvents,
    setFilteredEvents,
    loading,
    setLoading,
    showBanner,
    groups,
    isAuthenticated,
    token
  } = useContext(BasicContext);
  
  const router = useRouter();
  const [allGroups, setAllGroups] = useState([]);
  const [gardens, setGardens] = useState([]);
  const [view, setView] = useState("calendar");
  const [showAllEvents, setShowAllEvents] = useState(false);
  const [isUserLoaded, setIsUserLoaded] = useState(false);
  
  // useReloadOnLoading(loading, isUserLoaded);
  
  useEffect(() => {

    if (user.id) {
      setIsUserLoaded(true);
    } else if (!user.id) {
      setLoading(true);
      setIsUserLoaded(false);
    }else {
    if (!token){
      router.push("/")
    }}
  }, [user, setLoading, token]);

  useEffect(() => {
    if (user.zip) {
      if (allGroups.length > 0 && gardens.length > 0) {
        setLoading(false);
      }
    } else if (isUserLoaded) {
      showBanner(
        "Please update profile page with required information",
        "error",
        "/profile"
      );
      router.push("/profile");
    }
  }, [user, allGroups, gardens, isUserLoaded, showBanner, router, setLoading]);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await fetch(`/api/groups`);
        const data = await response.json();
        setAllGroups(data);
      } catch (err) {
        console.error("Error fetching groups:", err);
      }
    };

    if (user.zip) fetchGroups();
  }, [user.zip]);

  useEffect(() => {
    const fetchGardens = async () => {
      try {
        const response = await fetch(`/api/gardens?distance=${distance}`);
        const data = await response.json();
        if (data.error) {
          showBanner(data.error, "error");
        }
        setGardens(data);
      } catch (err) {
        console.error("Error fetching gardens:", err);
      }
    };

    if (user.zip) fetchGardens();
  }, [distance, user.zip, showBanner]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 900) {
        setView("list");
      } else {
        setView("calendar");
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch(`/api/events`);
        const data = await response.json();
        // console.log(data);
        setFilteredEvents(data);
      } catch (err) {
        console.error("Error fetching events:", err);
      }
    };

    if (isAuthenticated && user.zip) fetchEvents();
  }, [
    currentDate,
    selectedGroup,
    selectedGarden,
    distance,
    showAllEvents,
    isAuthenticated,
    user,
    setFilteredEvents,
  ]);

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

  const handleToggleShowAllEvents = () => {
    setShowAllEvents(!showAllEvents);
  };

  const formatTime = (date) => {
    date = new Date(date);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const period = hours >= 12 ? "PM" : "AM";
    const formattedHours = hours % 12 || 12;
    const formattedMinutes = minutes === 0 ? "" : `:${minutes.toString().padStart(2, "0")}`;
    return `${formattedHours}${formattedMinutes} ${period}`;
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
    <div className="min-w-[85%] min-h-96">
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
            className="ml-2 p-1 border rounded border-gray-300"
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
            className="ml-2 p-1 border rounded border-gray-300"
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
            className="ml-2 p-1 border rounded border-gray-300"
          >
            <option value="">All</option>
            {gardens.map((garden) => (
              <option key={garden.id} value={garden.id}>
                {garden.name}
              </option>
            ))}
          </select>
        </label>

        <button
          onClick={() => setView(view === "calendar" ? "list" : "calendar")}
          className="ml-auto p-2 bg-gray-200 rounded border border-gray-300"
        >
          Toggle View
        </button>
        <button
          onClick={handleToggleShowAllEvents}
          className="ml-auto p-2 bg-gray-200 rounded border border-gray-300"
        >
          {showAllEvents ? "Show Filtered Events" : "Show All Events"}
        </button>
      </div>

      <div className="calendar-nav flex justify-between items-center mb-4">
        <button onClick={handlePrevMonth} className="p-2 bg-gray-200 rounded border border-gray-300">
          Previous Month
        </button>
        <h2 className="text-xl font-bold">
          {format(currentDate, "MMMM yyyy")}
        </h2>
        <button onClick={handleNextMonth} className="p-2 bg-gray-200 rounded border border-gray-300">
          Next Month
        </button>
      </div>

      {view === "calendar" ? (
        <div className="calendar-grid grid grid-cols-7 gap-2">
          {Array.from({ length: startDay }).map((_, index) => (
            <div key={index} className="calendar-day empty"></div>
          ))}
          {daysInMonth.map((day) => (
            <div
              key={day}
              className={`calendar-day p-2 border rounded border-gray-300 ${
                isToday(day) ? 'bg-green-100' : isBefore(day, new Date()) ? 'bg-gray-200' : 'bg-white'
              } h-24 sm:h-24 md:h-32 lg:h-40`}
            >
              <div className="date font-bold mb-1 text-xs sm:text-sm md:text-base lg:text-lg">
                {format(day, "d")}
              </div>
              <div className="events text-xs sm:text-sm md:text-base lg:text-lg">
                {filteredEvents
                  .filter(
                    (event) =>
                      isSameDay(new Date(event.start_date), day) &&
                      (event.is_public ||
                        groups.some((group) => group.id === event.group_id))
                  )
                  .map((event) => (
                    <Link
                      href={`/events/${event.id}`}
                      key={event.id}
                      className={`event block mb-2 p-1 rounded ${
                        isBefore(new Date(event.start_date), new Date())
                          ? "text-gray-500 line-through"
                          : ""
                      }`}
                    >
                      <h3 className="font-semibold text-xs sm:text-xs md:text-sm lg:text-base">
                        {event.name}
                      </h3>
                      <p className="text-xs sm:text-xs md:text-xs lg:text-sm">
                        {formatTime(event.start_date)} to {formatTime(event.end_date)}
                      </p>
                    </Link>
                  ))}
              </div>
            </div>
          ))}
        </div>
  
      ) : (
        <ul className="list-disc pl-5">
          {filteredEvents.length === 0 ? (
            <p>
              No events listed within {distance} miles, {selectedGroup}
            </p>
          ) : (
            filteredEvents
              .filter(
                (event) =>
                  event.is_public ||
                  allGroups.some((group) => group.id === event.group_id)
              )
              .map((event) => (
                <li key={event.id} className="mb-2">
                  <Link
                    href={`/events/${event.id}`}
                    className="text-blue-500 hover:underline"
                  >
                    {event.name} -{" "}
                    {new Date(event.start_date).toLocaleDateString()}
                  </Link>
                </li>
              ))
          )}
        </ul>
      )}
    </div>
  );
};

export default EventCalendar;
