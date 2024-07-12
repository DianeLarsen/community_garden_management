"use client";
import { createContext, useState, useEffect } from "react";

export const BasicContext = createContext();

export const BasicProvider = ({ children }) => {
  const [plot, setPlot] = useState(null);
  const [garden, setGarden] = useState(null);
  const [history, setHistory] = useState([]);
  const [groups, setGroups] = useState([]);
  const [banner, setBanner] = useState({ message: "", type: "" });
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [message, setMessage] = useState("");
  const [group, setGroup] = useState('');
  const [location, setLocation] = useState('');
  const [events, setEvents] = useState([]);
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

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("/api/profile", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        // console.log(data);
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

    fetchProfileData();
  }, []);
  const showBanner = (message, type) => {
    setBanner({ message, type });
    setTimeout(() => setBanner({ message: "", type: "" }), 30000); // Hide banner after 3 seconds
  };
  useEffect(() => {
    // Check if the user is authenticated by looking for a token in localStorage
    const token = localStorage.getItem("token");
    if (token) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  }, []);
  const handleEventSearch = async() => {
    e.preventDefault()
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
      setError('Failed to fetch groups.');
    }
  };

  useEffect(() => {
    const fetchEvents = async () => {

      try {
        const response = await fetch(`/api/events?location=${location}&garden=${garden}&group=${group}`);
        const data = await response.json();
        setEvents(data);

      } catch (error) {
        console.error('Error fetching events:', error);

      }
    };
    fetchEvents();
  }, [location, garden, group]);

  const value = {
    plot,
    garden,
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
    location,
    events
  };

  return (
    <BasicContext.Provider value={value}>{children}</BasicContext.Provider>
  );
};
