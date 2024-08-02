"use client";
import { useState, useEffect, useContext } from "react";
import { BasicContext } from "@/context/BasicContext";
import { useRouter } from "next/navigation";
import useReloadOnLoading from "@/hooks/useReloadOnLoading";

const GardenList = () => {
  const [gardens, setGardens] = useState([]);
  const [error, setError] = useState("");
  const router = useRouter();
  const { user, loading, setLoading, showBanner } = useContext(BasicContext);

  const [isUserLoaded, setIsUserLoaded] = useState(false);

  // Call the custom hook unconditionally
  useReloadOnLoading(loading, isUserLoaded);

  useEffect(() => {
    if (user.id) {
      setLoading(false);
      setIsUserLoaded(true);
    } else {
      setLoading(true);
      setIsUserLoaded(false);
    }
     // Set loading to true when user state changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    if (user.zip) {
      if (gardens.length > 0) {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, gardens, isUserLoaded]);

  useEffect(() => {
    const fetchGardens = async () => {
      try {
        const response = await fetch("/api/gardens");
        const data = await response.json();

        if (response.ok) {
          setGardens(data);
          setLoading(false); // Set loading to false when data is fetched successfully
        } else {
          setError(data.error);
          setLoading(false); // Set loading to false on error
        }
      } catch (err) {
        setError("Failed to fetch gardens.");
        setLoading(false); // Set loading to false on error
      }
    };

    fetchGardens();
  }, [loading]);

  const handleGardenClick = (id) => {
    router.push(`/gardens/${id}`);
  };

  if (error) {
    return <div className="text-red-500 font-bold mt-4">{error}</div>;
  }
  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Community Gardens Near You</h1>
      <ul className="list-none p-0">
        {gardens.map((garden) => (
          <li
            key={garden.id}
            className="bg-gray-100 mb-4 p-4 rounded shadow-md cursor-pointer"
            onClick={() => handleGardenClick(garden.id)}
          >
            <div className="font-semibold">Name: {garden.name}</div>
            <div>Description: {garden.description}</div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default GardenList;
