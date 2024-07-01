import { useEffect, useState } from 'react';

const GardenPlots = ({ gardenId }) => {
  const [plots, setPlots] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPlots = async () => {
      try {
        const response = await fetch(`/api/plots?gardenId=${gardenId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        if (!response.ok) {
          throw new Error("Error fetching plots");
        }

        const data = await response.json();
        const availablePlots = data.filter(plot => plot.status === 'available');
        setPlots(availablePlots);
      } catch (error) {
        setError(error.message);
      }
    };

    fetchPlots();
  }, [gardenId]);

  return (
    <div className="mt-4">
      {error && <p className="text-red-500">{error}</p>}
      <table className="w-full table-auto border-collapse">
        <thead>
          <tr>
            <th className="border px-4 py-2">Plot Size</th>
            <th className="border px-4 py-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {plots.map((plot) => (
            <tr key={plot.id}>
              <td className="border px-4 py-2">{plot.size}</td>
              <td className="border px-4 py-2">{plot.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default GardenPlots;
