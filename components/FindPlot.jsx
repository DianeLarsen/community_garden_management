"use client";
import { useState } from 'react';

const FindPlot = () => {
  const [zipCode, setZipCode] = useState('');
  const [plots, setPlots] = useState([]);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await fetch(`/api/find-plots?zip=${zipCode}`);
      if (!response.ok) {
        throw new Error('Failed to fetch plots');
      }

      const data = await response.json();
      setPlots(data);
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div>
      <h2>Find a Plot</h2>
      <form onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Enter zip code"
          value={zipCode}
          onChange={(e) => setZipCode(e.target.value)}
          required
        />
        <button type="submit">Search</button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <ul>
        {plots.map(plot => (
          <li key={plot.id}>
            {plot.location} - {plot.size} - {plot.status}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FindPlot;
