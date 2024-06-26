"use client"
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import GardenMap from '@/components/GardenMap';
import NotFound from '@/components/NotFound';

const GardenPage = () => {

  const { id } = useParams();
  const [garden, setGarden] = useState(null);
  const [error, setError] = useState('');

console.log(garden)

  useEffect(() => {
    const fetchGarden = async () => {
      try {
        const response = await fetch(`/api/gardens/${id}`);
        if (!response.ok) {
          throw new Error('Error fetching garden details');
        }
        const data = await response.json();

        setGarden(data);
      } catch (error) {
        setError(error.message);
      }
    };

    if (id) {
      fetchGarden();
    }
  }, [id]);

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  if (!garden) {
    return <p>Loading...</p>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{garden.name}</h1>
      <p>{garden.description}</p>
      <h2 className="text-xl font-bold mt-4 mb-2">Map and Directions</h2>
      {garden.lat && garden.lon  ? <GardenMap lat={garden.lat} lon={garden.lon} /> : <NotFound />}
    </div>
  );
};

export default GardenPage;
