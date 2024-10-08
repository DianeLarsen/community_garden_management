"use client";
import { createContext, useState, useEffect } from "react";
import { addMonths, isSameMonth, isBefore, isToday } from "date-fns";
import { parseCookies } from "nookies";
import { useRouter, usePathname } from "next/navigation";

export const BasicContext = createContext();

export const BasicProvider = ({ children }) => {
  const router = useRouter();
  const [plot, setPlot] = useState(null);
  const [error, setError] = useState("");
  const [garden, setGarden] = useState(null);
  const [gardenId, setGardenId] = useState(null);
  const [gardenPlots, setGardenPlots] = useState([]);
  const [gardens, setGardens] = useState([]);
  const [history, setHistory] = useState([]);
  const [gardenGroups, setGardenGroups] = useState([]);
  const [gardenEvents, setGardenEvents] = useState([]);
  const [gardenPlotReservations, setGardenPlotReservations] = useState([]);
  const [allGroups, setAllGroups] = useState([]);
  const [allPlots, setAllPlots] = useState([]);
  const [groups, setGroups] = useState([]);
  const [userGroups, setUserGroups] = useState([]);
  const [userPlots, setUserPlots] = useState([]);
  const [userInvites, setUserInvites] = useState([]);
  const [userEvents, setUserEvents] = useState([]);
  const [userGardens, setUserGardens] = useState([]);
  const [banner, setBanner] = useState({ message: "", type: "", link: "" });
  const [isAdmin, setIsAdmin] = useState(false);
  const [token, setToken] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [message, setMessage] = useState("");
  const [group, setGroup] = useState("");
  const [events, setEvents] = useState([]);
  const [allEvents, setAllEvents] = useState([]);
  const [allInvites, setAllInvites] = useState([]); 
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [selectedGarden, setSelectedGarden] = useState("");
  const [availablePlots, setAvailablePlots] = useState("all");
  const [distance, setDistance] = useState(5);

  const [filteredEvents, setFilteredEvents] = useState([]);
  const [users, setUsers] = useState([]);
  const [invites, setInvites] = useState([]);

  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const pathname = usePathname();
  const publicPaths = [
    "/",
    "/about",
    "/register",
    "/verify",
    "/password-reset-request",
  ];
  const isPublicPath = publicPaths.includes(pathname);
  const gardenPaths = ["/gardens", "/admin", "/events", "/groups"];
  const isGardenPaths = gardenPaths.includes(pathname);

  const [user, setUser] = useState({
    email: "",
    username: "",
    street_address: "",
    city: "",
    state: "",
    role: "",
    zip: null,
    phone: "",
    profile_photo: null,
  });

  useEffect(() => {
    const checkToken = () => {
      const tokenCookie = parseCookies().token;
      const localToken = localStorage.getItem("token");

      if (localToken || tokenCookie) {
        setToken(localToken || tokenCookie);
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
        setTimeout(() => {
          if (!localToken && !tokenCookie) {
            if (isPublicPath) return;
            router.push("/");
          }
        }, 2000);
      }
    };

    checkToken();
  }, [router]);

  // fetch garden details and info
  useEffect(() => {
    const fetchGardenData = async () => {
      try {
        const response = await fetch(`/api/gardens/${gardenId}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        // console.log(data)

        if (response.ok) {


          // console.log(data)
          setGarden(data.garden)
          setGardenGroups(data.groups);
          setGardenEvents(data.events);
          setGardenPlotReservations(data.reservations);
          setGardenPlots(data.plots);
        } else {
          showBanner(
            data.error || data.banner.text,
            data.code || "error",
            data.redirect || ""
          );
          setMessage(data.error);
        }
      } catch (error) {
        setMessage("Error fetching profile data");
      }
    };
    if (isAuthenticated && token && gardenId) {
      fetchGardenData();
    }
  }, [isAuthenticated, token, gardenId]);

  // profile data
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await fetch("/api/profile", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        // console.log(data)

        if (response.ok) {
          setUser(data.profile);

          if (data.profile.role === "admin") {
            setIsAdmin(true);
          } else {
            setIsAdmin(false);
          }
          setUserGroups(data.groups);
          setUserEvents(data.events);
          setUserGardens(data.gardens);
          setUserInvites(data.invites);
          setUserPlots(data.plots);
        } else {
          showBanner(
            data.error || data.banner.text,
            data.code || "error",
            data.redirect || ""
          );
          setMessage(data.error);
        }
      } catch (error) {
        setMessage("Error fetching profile data");
      }
    };
    if (isAuthenticated && token) {
      fetchProfileData();
    }
  }, [isAuthenticated, token]);

  useEffect(() => {
    const fetchAllEvents = async () => {
      try {
        const response = await fetch("/api/events");
        const data = await response.json();
        if (response.ok) {
          setAllEvents(data);
        } else {
          setError(data.error);
        }
      } catch (err) {
        setError("Failed to fetch all events.");
      }
    };

    if (isAuthenticated) fetchAllEvents();
  }, [isAuthenticated]);

  useEffect(() => {
    const fetchInvitations = async () => {
      try {
        const response = await fetch('/api/invites');
        if (!response.ok) {
          throw new Error('Failed to fetch invitations');
        }
        const data = await response.json();
        setAllInvites(data.invites);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) fetchInvitations();
  }, []);

  useEffect(() => {
    const fetchAllPlots = async () => {
      try {
        const response = await fetch("/api/plots");
        const data = await response.json();
        if (response.ok) {
          setAllPlots(data);
        } else {
          setError(data.error);
        }
      } catch (err) {
        setError("Failed to fetch all events.");
      }
    };

    if (isAuthenticated) fetchAllPlots();
  }, [isAuthenticated]); 

  useEffect(() => {
    let timer;
    if (banner.type === "success") {
      timer = setTimeout(() => {
        setBanner({ message: "", type: "", link: null });
      }, 5000);
    }

    return () => clearTimeout(timer);
  }, [banner]);

  useEffect(() => {
    const handleRouteChange = () => {
      if (banner.type === "error") {
        setBanner({ message: "", type: "", link: null });
      }
    };
    if (router && router.events) {
      router.events.on("routeChangeStart", handleRouteChange);

      return () => {
        router.events.off("routeChangeStart", handleRouteChange);
      };
    }
  }, [banner, router]);

  const showBanner = (message, type, link = null) => {
    setBanner({ message, type, link });
  };

  const handleEventSearch = async (e) => {
    e.preventDefault();
    try {
      const url = `/api/events?searchTerm=${searchTerm}&userInfo=${userInfo}&limit=${limit}`;
      const response = await fetch(url);
      const data = await response.json();
      if (response.ok) {
        setEvents(data);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError("Failed to fetch events.");
    }
  };

  const fetchFilteredEvents = async () => {
    try {
      const response = await fetch(`/api/events?distance=${distance}`);
      const data = await response.json();

      const filtered = data.filter((event) => {
        const eventDate = new Date(event.date);
        const isEventInCurrentMonth = isSameMonth(eventDate, currentDate);
        const isPastEvent =
          isBefore(eventDate, new Date()) && !isToday(eventDate);
        const isWithinDistance = event.distance <= distance * 1609.34;

        if (user.role === "admin") return isEventInCurrentMonth;

        const isEventRelevant =
          ((selectedGroup === "" ||
            event.group_id === parseInt(selectedGroup)) &&
            (selectedGarden === "" ||
              event.garden_id === parseInt(selectedGarden)) &&
            (availablePlots === "all" ||
              (availablePlots === "yes" && event.available_plots > 0) ||
              (availablePlots === "no" && event.available_plots === 0))) ||
          event.user_id === user.id;

        const isUserAuthorized =
          event.is_public || event.group_id === user.group_id;

        return isEventInCurrentMonth && isEventRelevant && isUserAuthorized;
      });

      setFilteredEvents(filtered);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching events:", err);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user?.zip) {
      fetchFilteredEvents();
    }
  }, [
    currentDate,
    selectedGroup,
    selectedGarden,
    availablePlots,
    distance,
    user,
    isAuthenticated,
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
    events,
    allEvents,
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
    isDropdownVisible,
    setIsDropdownVisible,
    groups,
    users,
    gardens,
    allGroups,
    invites,
    setLoading,
    setGroups,
    userGroups,
    userEvents,
    userGardens,
    userInvites,
    userPlots,
    setGardenId,
    gardenGroups,
    gardenEvents,
    gardenPlotReservations,
    gardenPlots,
    allInvites
  };

  return (
    <BasicContext.Provider value={value}>{children}</BasicContext.Provider>
  );
};
