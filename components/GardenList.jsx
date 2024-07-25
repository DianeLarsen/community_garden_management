"use client";
import { useState, useEffect, useContext } from "react";
import { BasicContext } from "@/context/BasicContext";
import { useRouter } from "next/navigation";

const GardenList = () => {
  const [gardens, setGardens] = useState([]);
  const [error, setError] = useState('');
  const router = useRouter();
  const {
    user,
    } = useContext(BasicContext);
  useEffect(() => {
    const fetchGardens = async () => {
      try {
        const response = await fetch('/api/gardens');
        const data = await response.json();
        if (response.ok) {
          setGardens(data);
        } else {
          setError(data.error);
        }
      } catch (err) {
        setError('Failed to fetch gardens.');
      }
    };
    setError('Failed to fetch gardens.');
    if (user.zip){ fetchGardens();} else {setError('Update Profile with zip to see Gadens near you!.');}
  }, []);

  const handleGardenClick = (id) => {
    router.push(`/gardens/${id}`);
  };

  if (error) {
    return <div className="text-red-500 font-bold mt-4">{error}</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Community Gardens Near You</h1>
      <ul className="list-none p-0">
        {gardens.map(garden => (
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
