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
  const [gardens, setGardens] = useState([]);
  const [history, setHistory] = useState([]);
  const [allGroups, setAllGroups] = useState([]);
  const [groups, setGroups] = useState([]);
  const [userGroups, setUserGroups] = useState([]);
  const [banner, setBanner] = useState({ message: "", type: "", link: "" });
  const [isAdmin, setIsAdmin] = useState(false);
  const [token, setToken] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [message, setMessage] = useState("");
  const [group, setGroup] = useState("");
  const [events, setEvents] = useState([]);
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
  const pathname = usePathname()
  const publicPaths = ["/", "/about", "/register", "/verify", "/password-reset-request"];
  const isPublicPath = publicPaths.includes(pathname);

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
        }, 2000); // Delay of 2000 milliseconds (2 seconds)
      }
    };

    checkToken();
  }, [router]);

  // Fetch all users
  useEffect(() => {
    const fetchAllUsers = async () => {
      try {
        const response = await fetch("/api/users");
        const data = await response.json();
        if (response.ok) {
          setUsers(data.users);
        } else {
          setError(data.error);
        }
      } catch (err) {
        setError("Failed to fetch users.");
      }
    };
    if (isAuthenticated) fetchAllUsers();
  }, [isAuthenticated]);

  // Fetch all groups
  useEffect(() => {
    const fetchAllGroups = async () => {
      try {
        const response = await fetch("/api/groups");
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
    if (isAuthenticated) fetchAllGroups();
  }, [isAuthenticated]);

  // Fetch all events
  useEffect(() => {
    const handleEventSearch = async () => {
      try {
        const response = await fetch("/api/events");
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
    if (isAuthenticated && user.zip) handleEventSearch();
  }, [isAuthenticated, user.zip]);

  // Fetch all gardens
  useEffect(() => {
    const maxDistance = 1000;
    const limit = 1000;
    const fetchAllGardens = async () => {
      try {
        const response = await fetch(
          `/api/gardens?maxDistance=${maxDistance}&limit=${limit}`
        );
        const data = await response.json();
        if (response.ok) {
          setGardens(data);
        } else {
          setError(data.error);
        }
      } catch (err) {
        setError("Failed to fetch gardens.");
      }
    };
    if (isAuthenticated) fetchAllGardens();
  }, [isAuthenticated]);

  // Fetch profile data
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

        if (response.ok) {
          setUser(data.profile);

          if (data.profile.role === "admin") {
            setIsAdmin(true);
          } else {
            setIsAdmin(false);
          }
          setUserGroups(data.groups);
          setInvites(data.invites);
        } else {
          setMessage(data.error);
        }
      } catch (error) {
        setMessage("Error fetching profile data");
      }
    };
    if (isAuthenticated) {
      fetchProfileData();
    }
  }, [isAuthenticated, token]);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        let url = `/api/groups?searchTerm=${searchTerm}&userInfo=${userInfo}&limit=${limit}`;

        const response = await fetch(url);
        const data = await response.json();
        console.log(data);
        if (response.ok) {
          setGroups(data);
        } else {
          setError(data.error);
        }
      } catch (err) {
        setError("Failed to fetch groups.");
      }
    };
  }, []);

  useEffect(() => {
    let timer;
    if (banner.type === "success") {
      timer = setTimeout(() => {
        setBanner({ message: "", type: "", link: null });
      }, 5000); // Clear after 5 seconds
    }

    return () => clearTimeout(timer);
  }, [banner]);

  // Clear error messages when the screen changes
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

  // Event search handler
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

  // Fetch events and filter them
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch("/api/events");
        const data = await response.json();

        const filtered = data.filter((event) => {
          const eventDate = new Date(event.date);
          const isEventInCurrentMonth = isSameMonth(eventDate, currentDate);
          const isPastEvent =
            isBefore(eventDate, new Date()) && !isToday(eventDate);
          const isWithinDistance = event.distance <= distance * 1609.34; // Convert miles to meters

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
    if (isAuthenticated && user.zip) {
      fetchEvents();
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
  };

  return (
    <BasicContext.Provider value={value}>{children}</BasicContext.Provider>
  );
};