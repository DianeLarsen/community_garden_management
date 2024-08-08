"use client";
import { useState, useEffect, useContext } from "react";
import { BasicContext } from "@/context/BasicContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  isSameDay,
  isBefore,
  isToday,
  isWithinInterval,
} from "date-fns";

const EventCalendar = () => {
  const {
    user,
    handleNextMonth,
    handlePrevMonth,
    currentDate,
    selectedGroup,
    setSelectedGroup,
    distance,
    setDistance,
    allEvents,
    userEvents,
    userInvites,
    loading,
    setLoading,
    showBanner,
    token,
    allGroups,
    userGroups,
  } = useContext(BasicContext);

  const router = useRouter();
  const [view, setView] = useState("calendar");
  const [eventView, setEventView] = useState("myEvents");
  const [isUserLoaded, setIsUserLoaded] = useState(false);
  const [filteredEvents, setFilteredEvents] = useState([]);

  useEffect(() => {
    if (user.id) {
      setIsUserLoaded(true);
    } else {
      setLoading(true);
      setIsUserLoaded(false);
    }
  }, [user, setLoading, token, router]);

  useEffect(() => {
    if (user.zip && isUserLoaded) {
      setLoading(false);
    } else if (isUserLoaded) {
      showBanner(
        "Please update profile page with required information",
        "error",
        "/profile"
      );
      router.push("/profile");
    }
  }, [user, isUserLoaded, showBanner, router, setLoading]);

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

  const handleDistanceChange = (e) => {
    setDistance(e.target.value);
    if (eventView === "filtered") {
      filterEvents();
    }
  };

  const handleGroupChange = (e) => {
    setSelectedGroup(e.target.value);
    if (eventView === "filtered") {
      filterEvents();
    }
  };

  const handleEventViewChange = (e) => {
    setEventView(e.target.value);
    if (e.target.value === "myEvents" || e.target.value === "all") {
      setDistance("100"); // Reset distance for myEvents and allEvents
    }
    if (e.target.value === "filtered") {
      filterEvents();
    }
  };

  const filterEvents = () => {
    const filtered = allEvents.filter((event) => {
      const withinDistance =
        !distance || event.distance <= parseInt(distance, 10);
      const withinGroup =
        !selectedGroup || event.group_id === parseInt(selectedGroup, 10);
      const withinMonth = isWithinInterval(new Date(event.start_date), {
        start: startOfMonth(currentDate),
        end: endOfMonth(currentDate),
      });
      return withinDistance && withinGroup && withinMonth;
    });
    setFilteredEvents(filtered);
  };

  useEffect(() => {
    if (eventView === "filtered") {
      filterEvents();
    }
  }, [eventView, distance, selectedGroup, allEvents, currentDate]);

  const formatTime = (date) => {
    date = new Date(date);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const period = hours >= 12 ? "PM" : "AM";
    const formattedHours = hours % 12 || 12;
    const formattedMinutes =
      minutes === 0 ? "" : `:${minutes.toString().padStart(2, "0")}`;
    return `${formattedHours}${formattedMinutes} ${period}`;
  };

  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate),
  });
  const startDay = getDay(startOfMonth(currentDate));

  const getEventsToDisplay = () => {
    switch (eventView) {
      case "myEvents":
        return userEvents.filter((event) =>
          isWithinInterval(new Date(event.start_date), {
            start: startOfMonth(currentDate),
            end: endOfMonth(currentDate),
          })
        );
      case "filtered":
        return filteredEvents;
      case "all":
        return allEvents.filter((event) =>
          isWithinInterval(new Date(event.start_date), {
            start: startOfMonth(currentDate),
            end: endOfMonth(currentDate),
          })
        );
      default:
        return filteredEvents;
    }
  };

  const eventsToDisplay = getEventsToDisplay();

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-w-[85%] min-h-96">
      <div className="filters flex flex-wrap gap-4 mb-4">
        <label>
          Distance:
          <select
            value={distance}
            onChange={handleDistanceChange}
            className="ml-2 p-1 border rounded border-gray-300"
            disabled={eventView === "myEvents" || eventView === "all"}
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
            {userGroups &&
              userGroups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
          </select>
        </label>

        <label>
          Show Events:
          <select
            value={eventView}
            onChange={handleEventViewChange}
            className="ml-2 p-1 border rounded border-gray-300"
          >
            <option value="myEvents">My Events</option>
            <option value="filtered">Filtered Events</option>
            <option value="all">All Events</option>
          </select>
        </label>

        <button
          onClick={() => setView(view === "calendar" ? "list" : "calendar")}
          className="ml-auto p-2 bg-gray-200 rounded border border-gray-300"
        >
          {view === "calendar" ? "List View" : "Calendar View"}
        </button>
      </div>

      <div className="calendar-nav flex justify-between items-center mb-4">
        <button
          onClick={handlePrevMonth}
          className="p-2 bg-gray-200 rounded border border-gray-300"
        >
          Previous Month
        </button>
        <h2 className="text-xl font-bold">
          {format(currentDate, "MMMM yyyy")}
        </h2>
        <button
          onClick={handleNextMonth}
          className="p-2 bg-gray-200 rounded border border-gray-300"
        >
          Next Month
        </button>
      </div>

      {view === "calendar" ? (
        <div className="calendar-grid grid grid-cols-7 gap-2 ">
          {Array.from({ length: startDay }).map((_, index) => (
            <div key={index} className="calendar-day empty"></div>
          ))}
          {daysInMonth.map((day) => (
            <div
              key={day}
              className={`calendar-day p-2 border rounded border-gray-300 ${
                isToday(day)
                  ? "bg-green-100"
                  : isBefore(day, new Date())
                  ? "bg-gray-200"
                  : "bg-white"
              } sm:h-32 md:h-40 lg:h-44`}
            >
              <div className="date font-bold mb-1 text-xs sm:text-sm md:text-base lg:text-lg">
                {format(day, "d")}
              </div>
              <div className="events text-xs sm:text-sm md:text-base lg:text-lg">
                {eventsToDisplay &&
                  eventsToDisplay
                    .filter(
                      (event) =>
                        isSameDay(new Date(event.start_date), day) &&
                        (event.is_public ||
                          userGroups.some(
                            (group) => group.id === event.group_id
                          ))
                    )
                    .map((event) => {
                      const inviteStatus = userInvites.find(
                        (invite) => invite.event_id === event.id
                      );
                      let statusText = "";
                      if (inviteStatus) {
                        if (inviteStatus.status === "requested") {
                          statusText = " (pending)";
                        } else if (inviteStatus.status === "invited") {
                          statusText = " (requires attention)";
                        }
                      }
                      const distanceText = `${event.distance.toFixed(1)} miles`;
                      const adminText =
                        event.user_id === user.id ? " (admin)" : "";
                      return (
                        <Link
                          href={`/events/${event.id}`}
                          key={event.id}
                          className={`event block mb-2 p-1 rounded ${
                            userEvents &&
                            userEvents.some(
                              (userEvent) => userEvent.id === event.id
                            )
                            ? "bg-blue-100"
                            : ""
                        } ${
                          isBefore(new Date(event.start_date), new Date())
                            ? "text-gray-500 line-through"
                            : ""
                        }`}
                      >
                        <h3 className="font-semibold text-xs sm:text-xs md:text-sm lg:text-base">
                          {event.name} {statusText} - {distanceText}
                          {adminText}
                        </h3>
                        <p className="text-xs sm:text-xs md:text-xs lg:text-sm">
                          {formatTime(event.start_date)} to{" "}
                          {formatTime(event.end_date)}
                        </p>
                      </Link>
                    );
                  })}
            </div>
          </div>
        ))}
      </div>
    ) : (
      <ul className="list-disc pl-5">
        {!eventsToDisplay || eventsToDisplay.length === 0 ? (
          <p>
            No events listed within {distance} miles, {selectedGroup}
          </p>
        ) : (
          eventsToDisplay
            .filter(
              (event) =>
                event.is_public ||
                (allGroups &&
                  allGroups.some((group) => group.id === event.group_id))
            )
            .map((event) => {
              const inviteStatus = userInvites.find(
                (invite) => invite.event_id === event.id
              );
              let statusText = "";
              if (inviteStatus) {
                if (inviteStatus.status === "requested") {
                  statusText = " (pending)";
                } else if (inviteStatus.status === "invited") {
                  statusText = " (requires attention)";
                }
              }
              const distanceText = `${Math.round(event.distance)} miles`;
              const adminText =
                event.user_id === user.id ? " (admin)" : "";
              return (
                <li key={event.id} className="mb-2">
                  <Link
                    href={`/events/${event.id}`}
                    className={`text-blue-500 hover:underline ${
                      userEvents &&
                      userEvents.some(
                        (userEvent) => userEvent.id === event.id
                      )
                        ? "font-bold"
                        : ""
                    }`}
                  >
                    {event.name} {statusText} - {distanceText} {adminText} -{" "}
                    {new Date(event.start_date).toLocaleDateString()}
                  </Link>
                </li>
              );
            })
        )}
      </ul>
    )}
  </div>
);
};

export default EventCalendar;

