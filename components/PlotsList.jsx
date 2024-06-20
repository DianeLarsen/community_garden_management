"use client";
import { useState, useEffect } from "react";

const PlotsList = () => {
  const [plots, setPlots] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPlots = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('You must be logged in to view plots.');
        return;
      }

      try {
        const response = await fetch(`/api/plots?token=${token}`);
        const data = await response.json();
        if (response.ok) {
          setPlots(data);
        } else {
          setError(data.error);
        }
      } catch (err) {
        setError('Failed to fetch plots.');
      }
    };

    fetchPlots();
  }, []);

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      <h1>Your Plots</h1>
      <ul>
        {plots.map(plot => (
          <li key={plot.id}>{plot.location} - {plot.size} - {plot.status}</li>
        ))}
      </ul>
    </div>
  );
};

export default PlotsList;
