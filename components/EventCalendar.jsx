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
} from "date-fns";

const EventCalendar = () => {
  const {
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
    allEvents,
    userEvents,
    userInvites,
    loading,
    setLoading,
    showBanner,
    groups,
    token,
    allGroups,
    userGroups,
    userGardens,
  } = useContext(BasicContext);

  const router = useRouter();
  const [view, setView] = useState("calendar");
  const [eventView, setEventView] = useState("myEvents"); // Added state for event view
  const [isUserLoaded, setIsUserLoaded] = useState(false);

  useEffect(() => {
    if (user.id) {
      setIsUserLoaded(true);
    } else if (!user.id) {
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
    router.refresh();
  };

  const handleGroupChange = (e) => {
    setSelectedGroup(e.target.value);
  };

  const handleGardenChange = (e) => {
    setSelectedGarden(e.target.value);
  };

  const handleEventViewChange = (e) => {
    setEventView(e.target.value);
  };

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
        return userEvents;
      case "filtered":
        return filteredEvents;
      case "all":
        return allEvents;
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
            {groups &&
              groups.map((group) => (
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
            {userGardens &&
              userGardens.map((garden) => (
                <option key={garden.id} value={garden.id}>
                  {garden.name}
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
        <div className="calendar-grid grid grid-cols-7 gap-2">
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
              } h-24 sm:h-24 md:h-32 lg:h-40`}
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
                            {event.name} {statusText}
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
                      {event.name} {statusText} -{" "}
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
