"use client";
import { createContext, useState, useEffect } from "react";
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
import { parseCookies } from "nookies";

export const BasicContext = createContext();

export const BasicProvider = ({ children }) => {
  const [plot, setPlot] = useState(null);
  const [garden, setGarden] = useState(null);
  const [history, setHistory] = useState([]);
  const [allGroups, setAllGroups] = useState([]);
  const [groups, setGroups] = useState([]);
  const [banner, setBanner] = useState({ message: "", type: "" });
  const [isAdmin, setIsAdmin] = useState(false);
  const [token, setToken] = useState("")
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [message, setMessage] = useState("");
  const [group, setGroup] = useState("");
  //   const [location, setLocation] = useState("");
  const [events, setEvents] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [selectedGarden, setSelectedGarden] = useState("");
  const [availablePlots, setAvailablePlots] = useState("all");
  const [distance, setDistance] = useState(5);
  const [filteredEvents, setFilteredEvents] = useState([]);
  // console.log(isAuthenticated)
  const [user, setUser] = useState({
    email: "",
    username: "",
    street_address: "",
    city: "",
    state: "",
    role: "",
    zip: "",
    phone: "",
    profilePhoto: null,
  });
  // console.log(user)
useEffect(() => {
  const tokenCookie = parseCookies().token;
  const localToken = localStorage.getItem("token");
  setToken(localToken || tokenCookie)
}, [])


  useEffect(() => {
    const fetchAllGroups = async () => {
      try {
        let url = `/api/groups`;

        const response = await fetch(url);
        const data = await response.json();
        if (response.ok) {
          setAllGroups(data);
        } else {
          setError(data.error);
        }
      } catch (err) {
        setError("Failed to fetch groups.");
      }
    };
    fetchAllGroups();
  }, []);
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        // const token = localStorage.getItem("token");
        const response = await fetch("/api/profile", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
       
        setUser(data.profile);

        if (data.profile.role === "admin") {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
        setGroups(data.groups);
      } catch (error) {
        setMessage("Error fetching profile data");
      }
    };
    if (isAuthenticated) {
      fetchProfileData();
    }
  }, [isAuthenticated, token]);
  const showBanner = (message, type) => {
    setBanner({ message, type });
    setTimeout(() => setBanner({ message: "", type: "" }), 30000); // Hide banner after 3 seconds
  };
  // const token = parseCookies().token;
  // const localToken = localStorage.getItem("token");
  useEffect(() => {
    // Check if the user is authenticated by looking for a token in localStorage

    if (token) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  }, [token]);
  const handleEventSearch = async () => {
    e.preventDefault();
    try {
      let url = `/api/events?searchTerm=${searchTerm}&userInfo=${userInfo}&limit=${limit}`;

      const response = await fetch(url);
      const data = await response.json();
      if (response.ok) {
        setEvents(data);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError("Failed to fetch groups.");
    }
  };

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch(`/api/events`);
        const data = await response.json();
        // Initial filtering logic
        const filtered = data.filter((event) => {
          const eventDate = new Date(event.date);
          const isEventInCurrentMonth = isSameMonth(eventDate, currentDate);
          const isPastEvent =
            isBefore(eventDate, new Date()) && !isToday(eventDate);
          //   console.log("distance", distance * 1609.34 >= event.distance);
          const isWithinDistance = event.distance <= distance * 1609.34; // Convert miles to meters

          if (user.role === "admin") return isEventInCurrentMonth;
          if (isPastEvent || !isWithinDistance) return false;
          //   console.log("selectedGroup", selectedGroup);
          const isEventRelevant =
            ((selectedGroup === "" ||
              event.group_id === parseInt(selectedGroup)) &&
              (selectedGarden === "" ||
                event.garden_id === parseInt(selectedGarden)) &&
              (availablePlots === "all" ||
                (availablePlots === "yes" && event.available_plots > 0) ||
                (availablePlots === "no" && event.available_plots === 0))) ||
            event.user_id === user.id;

          return isEventInCurrentMonth && isEventRelevant;
        });

        setFilteredEvents(filtered);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching events:", err);
      }
    };
    if (isAuthenticated) {
      fetchEvents();
    }
  }, [
    currentDate,
    selectedGroup,
    selectedGarden,
    availablePlots,
    distance,
    user,
    isAuthenticated
  ]);

  const handlePrevMonth = () => {
    setCurrentDate(addMonths(currentDate, -1));
  };

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const value = {
    plot,
    garden,
    token,
    history,
    groups,
    user,
    setUser,
    showBanner,
    isAuthenticated,
    setBanner,
    setIsAuthenticated,
    banner,
    isAdmin,
    groups,
    message,
    setMessage,
    handleEventSearch,
    group,
    setGroup,
    // location,
    // setLocation,
    events,
    handlePrevMonth,
    handleNextMonth,
    currentDate,
    loading,
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
  };

  return (
    <BasicContext.Provider value={value}>{children}</BasicContext.Provider>
  );
};
