"use client";
import { useState, useEffect, useContext } from 'react';
import { BasicContext } from '@/context/BasicContext';
import { useRouter } from "next/navigation";
import Link from 'next/link';

const CreateEvent = ({ gardenId }) => {
  const { user, groups } = useContext(BasicContext);
  // const [gardens, setGardens] = useState([]);
  const [plots, setPlots] = useState([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [duration, setDuration] = useState({ value: '', unit: 'hours' });
  const [error, setError] = useState('');
  const [plotId, setPlotId] = useState('');
  const [groupId, setGroupId] = useState('');
  const [selectedGardenId, setSelectedGardenId] = useState(gardenId || '');
  const [isPublic, setIsPublic] = useState(false);
  const router = useRouter();
console.log(plots)
  // useEffect(() => {
  //   const fetchGardens = async () => {
  //     try {
  //       const response = await fetch('/api/gardens');
  //       const data = await response.json();
  //       setGardens(data);
  //     } catch (err) {
  //       console.error('Error fetching gardens:', err);
  //     }
  //   };

  //   fetchGardens();
  // }, []);

  useEffect(() => {
    const fetchPlots = async () => {
      try {
        let url = `/api/plots?user_id=${user.id}&userInfo=true`;
        if (groupId) {
          url += `&groupId=${groupId}`;
        }
        if (selectedGardenId) {
          url += `&gardenId=${selectedGardenId}`;
        }
        const response = await fetch(url);
        const data = await response.json();
        setPlots(data);
      } catch (err) {
        console.error('Error fetching plots:', err);
      }
    };

    fetchPlots();
  }, [user?.id, groupId, selectedGardenId]);

  const calculateEndDate = () => {
    const start = new Date(startDate);
    switch (duration.unit) {
      case 'hours':
        return new Date(start.getTime() + duration.value * 60 * 60 * 1000);
      case 'days':
        return new Date(start.getTime() + duration.value * 24 * 60 * 60 * 1000);
      case 'weeks':
        return new Date(start.getTime() + duration.value * 7 * 24 * 60 * 60 * 1000);
      default:
        return start;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endDate = calculateEndDate();

    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          description,
          start_date: startDate,
          end_date: endDate.toISOString(),
          garden_id: selectedGardenId,
          plot_id: plotId,
          user_id: user.id,
          group_id: groupId,
          is_public: isPublic,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        alert('Event created successfully!');
        router.push(`/events/${data.id}`);
      } else {
        setError(data.error || 'Failed to create event.');
      }
    } catch (error) {
      console.error('Error creating event:', error);
      setError('An unexpected error occurred.');
    }
  };

  if (error) {
    return <div className="text-red-500 font-bold mt-4">{error}</div>;
  }

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-md shadow-md">
      <h1 className="text-2xl font-bold mb-6">Create Event</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Event Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Event Name"
            required
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Event Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Event Description"
            required
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Start Date and Time
          </label>
          <input
            type="datetime-local"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Duration
          </label>
          <div className="flex space-x-2">
            <input
              type="number"
              value={duration.value}
              onChange={(e) =>
                setDuration({ ...duration, value: e.target.value })
              }
              required
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            />
            <select
              value={duration.unit}
              onChange={(e) =>
                setDuration({ ...duration, unit: e.target.value })
              }
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="hours">Hours</option>
              <option value="days">Days</option>
              <option value="weeks">Weeks</option>
            </select>
          </div>
        </div>
        {/* <div>
          <label className="block text-sm font-medium text-gray-700">
            Garden
          </label>
          {gardenId ? (
            <p className="mt-1">{gardens.find(g => g.id === gardenId)?.name || 'Unknown Garden'}</p>
          ) : (
            <select
              value={selectedGardenId}
              onChange={(e) => setSelectedGardenId(e.target.value)}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
              required
            >
              <option value="">Select Garden</option>
              {filteredGardens.map(garden => (
                <option key={garden.id} value={garden.id}>{garden.name}</option>
              ))}
            </select>
          )}
          {!gardenId && (
            <p className="text-sm text-gray-500 mt-2">
              Note: Use the <Link href="/gardens" className="text-blue-500 underline">garden page</Link> to choose a garden.
            </p>
          )}
        </div> */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Group
          </label>
          <select
            value={groupId}
            onChange={(e) => setGroupId(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
          >
            <option value="">Select Group</option>
            {groups.message ? (
              <option value="">No groups found</option>
            ) : (
              groups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))
            )}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Plot
          </label>
          <select
            value={plotId}
            onChange={(e) => setPlotId(e.target.value)}
            required
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
          >
            <option value="">Select Plot</option>
            {plots?.message ? (
              <option value="">No reserved plots found</option>
            ) : plots.length > 0 ? (
              plots.map((plot) => (
                <option key={plot.id} value={plot.id}>
                  {plot.garden_name} - {plot.length}X{plot.width}
                </option>
              ))
            ) : (
              <option>What is going on? </option>
            )}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Public Event
          </label>
          <input
            type="checkbox"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
            className="mt-1"
          />
        </div>
        <div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
          >
            Create Event
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateEvent;

