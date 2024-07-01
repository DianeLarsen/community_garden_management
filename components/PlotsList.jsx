"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const PlotsList = () => {
  const [plots, setPlots] = useState([]);
  const [error, setError] = useState('');
  const router = useRouter();
console.log(plots)
  useEffect(() => {
    const fetchPlots = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('You must be logged in to view plots.');
        return;
      }

      try {
        const response = await fetch(`/api/plots?token=${token}`, {
          method: 'GET',
        });

        const data = await response.json();
        if (response.ok) {
          setPlots(data);
        } else {
          if (data.error === 'Unauthorized') {
            setError('Session expired. Please log in again.');
            localStorage.removeItem('token');
            router.push('/login'); // Redirect to login page
          } else {
            setError(data.error);
          }
        }
      } catch (err) {
        setError('Failed to fetch plots.');
      }
    };

    fetchPlots();
  }, [router]);

  if (error) {
    return <div className="text-red-500 font-bold mt-4">{error}</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Your Plots</h1>
      {plots.message == 'No plots found for the given criteria' ? (
        <div className="text-center text-gray-600">
          <p>You currently have no plots.</p>
          <p>Search for available plots below.</p>
        </div>
      ) : (
        <ul className="list-none p-0">
          {plots.map(plot => (
            <li key={plot.id} className="bg-gray-100 mb-4 p-4 rounded shadow-md">
              <div className="font-semibold">Location: {plot.location}</div>
              <div>Size: {plot.size}</div>
              <div>Status: {plot.status}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PlotsList;
